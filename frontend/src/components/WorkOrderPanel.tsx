import { Card, CardHeader, CardContent, CardActions, Typography, TextField, Button, Box } from "@mui/material";
import { useMemo } from "react";
import ListAltIcon from "@mui/icons-material/ListAlt";
import type { Flight } from "../types/types";
import LivePreview from "./LivePreview";
import { parseWorkOrder } from "../services/client";

export default function WorkOrderPanel({ selectedFlight, workOrderInput, onChangeInput, onSubmit, submitting }: { selectedFlight: Flight | null; workOrderInput: string; onChangeInput: (v: string) => void; onSubmit: () => void; submitting: boolean; }) {
  const { error } = useMemo(() => parseWorkOrder(workOrderInput), [workOrderInput]);
  const isValid = !!workOrderInput.trim() && !error;
  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader title={<Box display="flex" alignItems="center" gap={1}><ListAltIcon fontSize="small" /> Work Order</Box>} />
      <CardContent>
        {selectedFlight ? (
          <>
            <Typography variant="subtitle2">{selectedFlight.flightNumber} — {selectedFlight.originAirport} → {selectedFlight.destinationAirport}</Typography>
            <TextField
              label="Command string"
              placeholder="e.g. CHK15|BAG25|CLEAN10|PBB90"
              fullWidth
              margin="normal"
              value={workOrderInput}
              onChange={(e) => onChangeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && isValid) onSubmit(); }}
            />
            <LivePreview value={workOrderInput} />
            <CardActions>
              <Button variant="contained" onClick={onSubmit} disabled={submitting || !isValid}>Submit</Button>
              <Button variant="outlined" onClick={() => onChangeInput("")}>Clear</Button>
            </CardActions>
          </>
        ) : (
          <Typography variant="body2">Select a flight to attach a work order.</Typography>
        )}
      </CardContent>
    </Card>
  );
}
