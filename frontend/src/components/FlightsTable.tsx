import { Card, CardHeader, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, TablePagination, TableSortLabel } from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import type { Flight, Page } from "../types/types";
import { formatIso } from "../services/client";

type Props = {
  data: Page<Flight>;
  selectedFlightId?: string;
  onSelect: (f: Flight) => void;
  loading: boolean;
  onChangePage: (page: number) => void;       // 1-based
  onChangePageSize: (size: number) => void;
  sortDir?: "asc" | "desc" | null;
  onToggleSortByFlight?: () => void;
};

export default function FlightsTable({ data, selectedFlightId, onSelect, loading, onChangePage, onChangePageSize, sortDir, onToggleSortByFlight }: Props) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader title={<Box display="flex" alignItems="center" gap={1}><FlightIcon fontSize="small" /> Flights ({data.total})</Box>} />
      <CardContent>
        {loading ? <CircularProgress /> : (
          <>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sortDirection={sortDir || false}>
                      <TableSortLabel
                        active={!!sortDir}
                        direction={sortDir || "asc"}
                        onClick={onToggleSortByFlight}
                      >
                        Flight #
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Arrival</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Last WO</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((f) => (
                    <TableRow key={f.id} hover selected={selectedFlightId === f.id} onClick={() => onSelect(f)} sx={{ cursor: "pointer" }}>
                      <TableCell>{f.flightNumber}</TableCell>
                      <TableCell>{f.scheduledArrivalTimeUtc}</TableCell>
                      <TableCell>{f.originAirport}</TableCell>
                      <TableCell>{f.destinationAirport}</TableCell>
                      <TableCell>{formatIso(f.lastWorkOrderAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={data.total}
              page={data.page - 1}
              rowsPerPage={data.pageSize}
              onPageChange={(_, p) => onChangePage(p + 1)}
              onRowsPerPageChange={(e) => onChangePageSize(parseInt(e.target.value, 10))}
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
