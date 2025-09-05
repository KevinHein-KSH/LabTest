import { useMemo } from "react";
import { Card, CardHeader, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, Typography, Divider, Stack, TablePagination } from "@mui/material";
import type { Flight, WorkOrder, Page } from "../types/types";
import { formatIso } from "../services/client";

type Props = {
  data: Page<WorkOrder>;
  flights: Flight[];
  justSubmitted: WorkOrder | null;
  onChangePage: (page: number) => void;
  onChangePageSize: (size: number) => void;
};

export default function WorkOrdersHistory({ data, flights, justSubmitted, onChangePage, onChangePageSize }: Props) {
  const older = useMemo(
    () => data.items.filter((w) => !justSubmitted || w.id !== justSubmitted.id),
    [data.items, justSubmitted]
  );

  return (
    <Card>
      <CardHeader title="Work Orders" />
      <CardContent>
        {data.total === 0 ? (
          <Typography>No work orders yet.</Typography>
        ) : (
          <Stack spacing={2}>
            {justSubmitted && (
              <Box>
                <Typography variant="overline" color="text.secondary">Recent</Typography>
                <Divider sx={{ mb: 1 }} />
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>When</TableCell>
                        <TableCell>Flight</TableCell>
                        <TableCell>Raw</TableCell>
                        <TableCell>Parsed</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow key={justSubmitted.id}>
                        <TableCell>{formatIso(justSubmitted.createdAt)}</TableCell>
                        <TableCell>{flights.find((f) => f.id === justSubmitted.flightId)?.flightNumber ?? "—"}</TableCell>
                        <TableCell>{justSubmitted.raw}</TableCell>
                        <TableCell>
                          {justSubmitted.parsed ? (
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {justSubmitted.parsed.chk !== undefined && justSubmitted.parsed.chk !== null && (
                                <Chip label={`Check-in ${justSubmitted.parsed.chk}m`} />
                              )}
                              {justSubmitted.parsed.bag !== undefined && justSubmitted.parsed.bag !== null && (
                                <Chip label={`Baggage ${justSubmitted.parsed.bag}m`} />
                              )}
                              {justSubmitted.parsed.clean !== undefined && justSubmitted.parsed.clean !== null && (
                                <Chip label={`Cleaning ${justSubmitted.parsed.clean}m`} />
                              )}
                              {justSubmitted.parsed.pbb !== undefined && justSubmitted.parsed.pbb !== null && (
                                <Chip label={`jet-bridge angle ${justSubmitted.parsed.pbb}°`} />
                              )}
                            </Box>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          {justSubmitted.updatedAt == null ? (
                            <Typography sx={{ color: "success.main" }}>Active</Typography>
                          ) : (
                            <Typography color="text.secondary">Inactive</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            <Box>
              {justSubmitted && (<><Typography variant="overline" color="text.secondary">Older</Typography><Divider sx={{ mb: 1 }} /></>)}
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>When</TableCell>
                      <TableCell>Flight</TableCell>
                      <TableCell>Raw</TableCell>
                      <TableCell>Parsed</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {older.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell>{formatIso(w.createdAt)}</TableCell>
                        <TableCell>{flights.find((f) => f.id === w.flightId)?.flightNumber ?? "—"}</TableCell>
                        <TableCell>{w.raw}</TableCell>
                        <TableCell>
                          {w.parsed ? (
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {w.parsed.chk !== undefined && w.parsed.chk !== null && (
                                <Chip label={`Check-in ${w.parsed.chk}m`} />
                              )}
                              {w.parsed.bag !== undefined && w.parsed.bag !== null && (
                                <Chip label={`Baggage ${w.parsed.bag}m`} />
                              )}
                              {w.parsed.clean !== undefined && w.parsed.clean !== null && (
                                <Chip label={`Cleaning ${w.parsed.clean}m`} />
                              )}
                              {w.parsed.pbb !== undefined && w.parsed.pbb !== null && (
                                <Chip label={`jet-bridge angle ${w.parsed.pbb}°`} />
                              )}
                            </Box>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          {w.updatedAt == null ? (
                            <Typography sx={{ color: "success.main" }}>Active</Typography>
                          ) : (
                            <Typography color="text.secondary">Inactive</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={data.total - (justSubmitted ? 1 : 0)}
                page={data.page - 1}
                rowsPerPage={data.pageSize}
                onPageChange={(_, p) => onChangePage(p + 1)}
                onRowsPerPageChange={(e) => onChangePageSize(parseInt(e.target.value, 10))}
                rowsPerPageOptions={[5, 10, 20, 50]}
              />
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
