import { useMemo } from "react";
import { Box, Chip, Typography } from "@mui/material";
import { parseWorkOrder } from "../services/client";

export default function LivePreview({ value }: { value: string }) {
  const { parsed, error } = useMemo(() => parseWorkOrder(value), [value]);
  if (!value.trim()) return null;
  return (
    <Box sx={{ p: 1, border: 1, borderRadius: 2, borderColor: "grey.700" }}>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : parsed ? (
        <Box>
          <Typography variant="body2" color="text.secondary">Preview</Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {parsed.chk !== undefined && <Chip label={`Check-in ${parsed.chk}m`} />} 
            {parsed.bag !== undefined && <Chip label={`Baggage ${parsed.bag}m`} />}
            {parsed.clean !== undefined && <Chip label={`Cleaning ${parsed.clean}m`} />}
            {parsed.pbb !== undefined && <Chip label={`jet-bridge angle ${parsed.pbb}°`} />}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}