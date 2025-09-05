import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import FlightsTable from "./components/FlightsTable";
import Toolbar from "./components/ToolBar";
import WorkOrderPanel from "./components/WorkOrderPanel";
import WorkOrdersHistory from "./components/WorkOrdersHistory";
import type { Flight, WorkOrder, Page } from "./types/types";
import { useFlights, useUploadFlights } from "./services/hooks/flights";
import { useWorkOrdersByFlight } from "./services/hooks/workorders";
import { submitWorkOrder } from "./services/workorders";

export default function App() {
  // Flights pagination/filter
  const [fltPage, setFltPage] = useState(1);
  const [fltPageSize, setFltPageSize] = useState(10);
  const [fltFilter, setFltFilter] = useState("");
  const [flightsPage, setFlightsPage] = useState<Page<Flight>>({ items: [], total: 0, page: 1, pageSize: 10 });

  // Selection + WO input
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [workOrderInput, setWorkOrderInput] = useState("");
  const [submittingWO, setSubmittingWO] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "error" | "success" | "info" | "warning" }>(
    { open: false, message: "", severity: "error" }
  );

  // Work orders pagination (per selected flight)
  const [woPage, setWoPage] = useState(1);
  const [woPageSize, setWoPageSize] = useState(10);
  const [workOrdersPage, setWorkOrdersPage] = useState<Page<WorkOrder>>({ items: [], total: 0, page: 1, pageSize: 10 });

  // UI state
  const [isUploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileError, setSelectedFileError] = useState<string | null>(null);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [justSubmitted, setJustSubmitted] = useState<WorkOrder | null>(null);

  // React Query for flights list
  const flightsQuery = useFlights(fltPage, fltPageSize, fltFilter);
  useEffect(() => {
    console.log("APP",flightsQuery.data);
    setLoadingFlights(flightsQuery.isLoading);
    if (flightsQuery.data) setFlightsPage(flightsQuery.data);
  }, [flightsQuery.isLoading, flightsQuery.data]);

  // Work orders data via backend
  const woQuery = useWorkOrdersByFlight(selectedFlight?.id, woPage, woPageSize);
  useEffect(() => {
    if (woQuery.data) {
      setWorkOrdersPage(woQuery.data.page);
      setJustSubmitted(woQuery.data.active ?? null);
    }
  }, [woQuery.data]);

  const flightsAll = useMemo(() => flightsPage.items, [flightsPage.items]);
  const [fltSortDir, setFltSortDir] = useState<"asc" | "desc" | null>(null);

  // Derive display page: overlay active WO and apply sorting by flight number
  const displayFlightsPage = useMemo(() => {
    let items = flightsPage.items;
    if (justSubmitted) {
      items = items.map((f) =>
        f.id === justSubmitted!.flightId ? { ...f, lastWorkOrderAt: justSubmitted!.createdAt } : f
      );
    }
    if (fltSortDir) {
      items = [...items].sort((a, b) => {
        const an = (a.flightNumber || "").toString().toLowerCase();
        const bn = (b.flightNumber || "").toString().toLowerCase();
        const cmp = an.localeCompare(bn, undefined, { numeric: true, sensitivity: "base" });
        return fltSortDir === "asc" ? cmp : -cmp;
      });
    }
    return { ...flightsPage, items };
  }, [flightsPage, justSubmitted, fltSortDir]);

  function toggleSortByFlight() {
    setFltSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
  }

  // React Query for upload (staged selection + click to upload)
  const upload = useUploadFlights();
  async function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setSelectedFileError(null);
    // validate file structure for required keys/columns
    if (file) {
      try {
        const { valid, error } = await validateUploadFile(file);
        if (!valid) setSelectedFileError(error || "Invalid file structure");
      } catch (err) {
        setSelectedFileError("Unable to read file.");
      }
    }
    // clear input value to allow re-selecting the same file next time
    e.currentTarget.value = "";
  }

  async function validateUploadFile(file: File): Promise<{ valid: boolean; error?: string }> {
    const required = [
      "flightnumber",
      "scheduledarrivaltimeutc",
      "originairport",
      "destinationairport",
    ];
    const name = file.name.toLowerCase();
    const text = await file.text();
    if (name.endsWith(".csv") || (!name.endsWith(".json") && text.includes(","))) {
      // CSV: check header includes required columns (case-insensitive)
      const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) || "";
      if (!firstLine) return { valid: false, error: "Invalid CSV: missing header" };
      const headers = firstLine
        .split(",")
        .map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
      const missing = required.filter((k) => !headers.includes(k));
      if (missing.length) return { valid: false, error: "Invalid file: Missing keys" };
      return { valid: true };
    }

    if (name.endsWith(".json")) {
      try {
        const json = JSON.parse(text);
        if (!Array.isArray(json)) return { valid: false, error: "Invalid JSON: expected an array" };
        // collect keys across items
        const keys = new Set<string>();
        for (const item of json) {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            for (const k of Object.keys(item)) keys.add(k.toLowerCase());
          }
        }
        const missing = required.filter((k) => !keys.has(k));
        if (missing.length) return { valid: false, error: "Invalid file: Missing keys" };
        return { valid: true };
      } catch {
        return { valid: false, error: "Invalid JSON syntax" };
      }
    }

    return { valid: false, error: "Unsupported file type (CSV/JSON)" };
  }

  async function handleUploadClick() {
    if (!selectedFile || selectedFileError) return;
    setUploading(true);
    try {
      await upload.mutateAsync(selectedFile);
      setSnackbar({ open: true, message: "Flights uploaded successfully", severity: "success" });
      setFltPage(1);
      setSelectedFlight(null);
      setWorkOrderInput("");
      setWorkOrdersPage({ items: [], total: 0, page: 1, pageSize: woPageSize });
      setSelectedFile(null);
      setSelectedFileError(null);
    } catch (err) {
      handleError(err, "Failed to upload flights");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmitWO() {
    if (!selectedFlight) return;
    setSubmittingWO(true);
    try {
      const wo = await submitWorkOrder(selectedFlight.id, workOrderInput);
      setJustSubmitted(wo);
      setWorkOrderInput("");
      setWoPage(1);
      await woQuery.refetch();
      setSnackbar({ open: true, message: "Work order submitted", severity: "success" });
    } catch (e) {
      handleError(e, "Failed to submit work order");
    } finally {
      setSubmittingWO(false);
    }
  }

  function handleError(e: unknown, fallback = "Request failed") {
    let msg = fallback;
    if (axios.isAxiosError(e)) {
      const data = e.response?.data as any;
      if (typeof data === "string") msg = data;
      else if (data?.message) msg = data.message;
      else if (e.message) msg = e.message;
    }
    setSnackbar({ open: true, message: msg, severity: "error" });
  }

  async function refreshAll() {
    try { await woQuery.refetch(); } catch (e) { handleError(e); }
  }

  return (
    <Box maxWidth="lg" mx="auto" p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">Flights & Work Orders</Typography>
      </Box>

      <Toolbar
        isUploading={isUploading || upload.isPending}
        onSelectFile={handleSelectFile}
        onUploadClick={handleUploadClick}
        selectedFileName={selectedFile?.name || null}
        fileError={selectedFileError}
        canUpload={!!selectedFile && !selectedFileError && !(isUploading || upload.isPending)}
        filter={fltFilter}
        onFilter={(v) => { setFltFilter(v); setFltPage(1); }}
        onRefresh={refreshAll}
      />

      <FlightsTable
        data={displayFlightsPage}
        selectedFlightId={selectedFlight?.id}
        onSelect={(f) => { setSelectedFlight(f); setWoPage(1); }}
        loading={loadingFlights}
        onChangePage={setFltPage}
        onChangePageSize={(s) => { setFltPageSize(s); setFltPage(1); }}
        sortDir={fltSortDir}
        onToggleSortByFlight={toggleSortByFlight}
      />

      <WorkOrderPanel
        selectedFlight={selectedFlight}
        workOrderInput={workOrderInput}
        onChangeInput={setWorkOrderInput}
        onSubmit={handleSubmitWO}
        submitting={submittingWO}
      />

      <WorkOrdersHistory
        data={workOrdersPage}
        flights={flightsAll}
        justSubmitted={justSubmitted}
        onChangePage={setWoPage}
        onChangePageSize={(s) => { setWoPageSize(s); setWoPage(1); }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
