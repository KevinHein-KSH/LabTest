import type { ParsedWorkOrder } from "../types/types";

// let __flights: Flight[] = [];
// let __workOrders: WorkOrder[] = [];

// const mockDelay = (ms = 250) => new Promise((res) => setTimeout(res, ms));
// const genId = () => Math.random().toString(36).slice(2, 10);

// export async function apiUploadFlights(file: File): Promise<{ inserted: number; flights: Flight[] }> {
//   await mockDelay();
//   const text = await file.text();
//   let parsed: any[] = [];

//   if (file.name.toLowerCase().endsWith(".json")) {
//     parsed = JSON.parse(text);
//     console.log("Parsed JSON:", parsed);
//   } else {
//     const lines = text.trim().split(/\r?\n/);
//     if (lines.length <= 1) return { inserted: 0, flights: [] };
//     const cols = lines[0].split(",").map((c) => c.trim().toLowerCase());
//     const idx = (k: string) => cols.findIndex((c) => c === k);
//     const iFN = idx("flightnumber");
//     const iSAT = idx("scheduledarrivaltimeutc");
//     const iO = idx("originairport");
//     const iD = idx("destinationairport");

//     parsed = lines.slice(1).filter(Boolean).map((r) => {
//       const cells = r.split(",");
//       return {
//         flightNumber: (cells[iFN] ?? "").trim(),
//         scheduledArrivalTimeUtc: (cells[iSAT] ?? "").trim(),
//         originAirport: (cells[iO] ?? "").trim(),
//         destinationAirport: (cells[iD] ?? "").trim(),
//       };
//     });
//   }

//   const flights: Flight[] = parsed.map((p) => ({
//     id: genId(),
//     flightNumber: String(p.flightNumber || ""),
//     scheduledArrivalTimeUtc: String(p.scheduledArrivalTimeUtc || ""),
//     originAirport: String(p.originAirport || ""),
//     destinationAirport: String(p.destinationAirport || ""),
//   }));
//   console.log("Parsed flights:", flights);
//   __flights = flights;
//   return { inserted: flights.length, flights };
// }

/** Flights listing with pagination + simple filter by flight number (contains) */
// export async function apiListFlights(params: {
//   page: number;       // 1-based
//   pageSize: number;
//   filter?: string;
// }): Promise<Page<Flight>> {
//   await mockDelay();
//   const q = (params.filter ?? "").trim().toLowerCase();
//   const filtered = q
//     ? __flights.filter((f) => f.flightNumber.toLowerCase().includes(q))
//     : __flights;

//   const total = filtered.length;
//   const start = (params.page - 1) * params.pageSize;
//   const items = filtered.slice(start, start + params.pageSize);
//   return { items, total, page: params.page, pageSize: params.pageSize };
// }

export function parseWorkOrder(raw: string): { parsed?: ParsedWorkOrder; error?: string } {
  if (!raw || !raw.trim()) return { error: "Command is empty" };
  const parts = raw.split("|").filter((p) => p !== "");
  const parsed: ParsedWorkOrder = {};

  for (const token of parts) {
    const t = token.trim().toUpperCase();
    if (t.startsWith("CHK")) {
      const n = Number(t.slice(3));
      if (!Number.isFinite(n) || n < 0) return { error: `Invalid CHK minutes: ${t}` };
      parsed.chk = n;
    } else if (t.startsWith("BAG")) {
      const n = Number(t.slice(3));
      if (!Number.isFinite(n) || n < 0) return { error: `Invalid BAG minutes: ${t}` };
      parsed.bag = n;
    } else if (t.startsWith("CLEAN")) {
      const n = Number(t.slice(5));
      if (!Number.isFinite(n) || n < 0) return { error: `Invalid CLEAN minutes: ${t}` };
      parsed.clean = n;
    } else if (t.startsWith("PBB")) {
      const n = Number(t.slice(3));
      if (![0, 90, 180, 270].includes(n)) return { error: `PBB angle must be 0, 90, 180, or 270: ${t}` };
      parsed.pbb = n as 0 | 90 | 180 | 270;
    } else {
      return { error: `Unknown Command: ${token}` };
    }
  }
  return { parsed };
}

// export async function apiSubmitWorkOrder(flightId: string, raw: string): Promise<WorkOrder> {
//   await mockDelay();
//   const r = parseWorkOrder(raw);
//   const wo: WorkOrder = {
//     id: genId(),
//     flightId,
//     raw,
//     parsed: r.parsed,
//     error: r.error,
//     createdAt: new Date().toISOString(),
//   };
//   __workOrders.unshift(wo);
//   const f = __flights.find((x) => x.id === flightId);
//   if (f) f.lastWorkOrderAt = wo.createdAt;
//   return wo;
// }

// /** Work orders history with pagination; if flightId omitted, return all */
// export async function apiListWorkOrders(params: {
//   page: number;       // 1-based
//   pageSize: number;
//   flightId?: string;
//   activeOnly?: boolean; // kept for future; mock returns all
// }): Promise<Page<WorkOrder>> {
//   await mockDelay();
//   const list = params.flightId ? __workOrders.filter((w) => w.flightId === params.flightId) : __workOrders;
//   const total = list.length;
//   const start = (params.page - 1) * params.pageSize;
//   const items = list.slice(start, start + params.pageSize);
//   return { items, total, page: params.page, pageSize: params.pageSize };
// }

export function formatIso(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
}
