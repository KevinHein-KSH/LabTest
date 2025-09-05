import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  CircularProgress,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function Toolbar({
  isUploading,
  onSelectFile,
  onUploadClick,
  selectedFileName,
  fileError,
  canUpload,
  filter,
  onFilter,
  onRefresh,
}: {
  isUploading: boolean;
  onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadClick: () => void;
  selectedFileName?: string | null;
  fileError?: string | null;
  canUpload: boolean;
  filter: string;
  onFilter: (v: string) => void;
  onRefresh: () => void;
}) {
  return (
    <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
      <Card sx={{ flex: 2 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <UploadIcon fontSize="small" /> Import Flights
            </Box>
          }
        />
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="outlined" component="label" disabled={isUploading}>
              Choose File
              <input
                hidden
                type="file"
                accept=".csv,.json,.txt"
                onChange={onSelectFile}
              />
            </Button>
            <TextField
              label="Selected File"
              value={selectedFileName || "No file selected"}
              size="small"
              InputProps={{ readOnly: true }}
              sx={{ minWidth: 260 }}
            />
            <Tooltip title={fileError ? fileError : ""} disableHoverListener={!fileError}>
              <span>
                <Button
                  variant="contained"
                  onClick={onUploadClick}
                  disabled={!canUpload}
                  startIcon={<UploadIcon />}
                >
                  Upload
                </Button>
              </span>
            </Tooltip>
            {isUploading && <CircularProgress size={20} />}
          </Box>
          {fileError && (
            <Box mt={0.5}>
              <Typography variant="caption" color="error.main">{fileError}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <SearchIcon fontSize="small" /> Filter
            </Box>
          }
        />
        <CardContent>
          <TextField
            label="Flight Number"
            variant="outlined"
            fullWidth
            value={filter}
            onChange={(e) => onFilter(e.target.value)}
          />
          <CardActions>
            <Button
              variant="outlined"
              onClick={onRefresh}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </CardActions>
        </CardContent>
      </Card>
    </Box>
  );
}
