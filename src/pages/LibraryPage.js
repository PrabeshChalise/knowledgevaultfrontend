import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../api";
import { useNavigate } from "react-router-dom";
import FeedbackSnackbar from "../components/FeedbackSnackbar";

const LibraryPage = () => {
  const [artefacts, setArtefacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const load = async (searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/artefacts", {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setArtefacts(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to load artefacts";
      setError(msg);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearchKey = (e) => {
    if (e.key === "Enter") {
      load(search);
    }
  };

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Artefact library</Typography>
        <TextField
          size="small"
          placeholder="Search title, description, tags"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKey}
          sx={{ width: 320 }}
        />
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Classification</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {artefacts.map((a) => (
              <TableRow key={a._id} hover>
                <TableCell>{a.title}</TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell>{a.classification}</TableCell>
                <TableCell>
                  {a.tags?.map((t) => (
                    <Chip key={t} label={t} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  {a.updatedAt
                    ? new Date(a.updatedAt).toLocaleDateString()
                    : ""}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/artefacts/${a._id}`)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {artefacts.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2">
                    No artefacts found. Try uploading one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <FeedbackSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity="error"
        message={error}
      />
    </Paper>
  );
};

export default LibraryPage;
