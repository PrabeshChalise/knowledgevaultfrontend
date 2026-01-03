import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import api from "../api";
import FeedbackSnackbar from "../components/FeedbackSnackbar";

const ArtefactDetailPage = () => {
  const { id } = useParams();
  const [artefact, setArtefact] = useState(null);
  const [changeNote, setChangeNote] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showMessage = (msg, severity = "success") => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/artefacts/${id}`);
      setArtefact(res.data);
    } catch (err) {
      showMessage(err.response?.data?.error || "Failed to load artefact", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddVersion = async (e) => {
    e.preventDefault();
    if (!file) {
      showMessage("Select a file", "error");
      return;
    }
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("changeNote", changeNote);
      await api.post(`/artefacts/${id}/versions`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setChangeNote("");
      showMessage("New version uploaded", "success");
      await load();
    } catch (err) {
      showMessage(err.response?.data?.error || "Upload failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    setActionLoading(true);
    try {
      await api.post("/governance/submit", { artefactId: id });
      showMessage("Submitted for review", "success");
      await load();
    } catch (err) {
      showMessage(err.response?.data?.error || "Submit failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!artefact) {
    return (
      <Typography variant="body2">
        Artefact not found or you do not have access.
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {artefact.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Status: {artefact.status} • Classification: {artefact.classification}
      </Typography>
      <Typography sx={{ mb: 2 }}>{artefact.description}</Typography>
      <Box sx={{ mb: 2 }}>
        {artefact.tags?.map((t) => (
          <Chip key={t} label={t} size="small" sx={{ mr: 0.5 }} />
        ))}
      </Box>
      <Button
        variant="outlined"
        onClick={handleSubmitForReview}
        sx={{ mb: 2 }}
        disabled={actionLoading}
      >
        {actionLoading ? <CircularProgress size={20} /> : "Submit for review"}
      </Button>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Versions
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell>File</TableCell>
            <TableCell>Uploaded</TableCell>
            <TableCell>Note</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {artefact.versions?.map((v) => (
            <TableRow key={v._id}>
              <TableCell>{v.versionNumber}</TableCell>
              <TableCell>
                <a href={v.fileUrl} target="_blank" rel="noreferrer">
                  {v.fileName}
                </a>
              </TableCell>
              <TableCell>
                {v.uploadedAt ? new Date(v.uploadedAt).toLocaleString() : ""}
              </TableCell>
              <TableCell>{v.changeNote}</TableCell>
            </TableRow>
          ))}
          {(!artefact.versions || artefact.versions.length === 0) && (
            <TableRow>
              <TableCell colSpan={4}>No versions yet.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Upload new version
      </Typography>
      <Box component="form" onSubmit={handleAddVersion}>
        <TextField
          label="Change note"
          fullWidth
          margin="normal"
          value={changeNote}
          onChange={(e) => setChangeNote(e.target.value)}
        />
        <Button variant="outlined" component="label" sx={{ mt: 1 }}>
          Choose file
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </Button>
        {file && (
          <Typography variant="body2" sx={{ ml: 1, display: "inline" }}>
            {file.name}
          </Typography>
        )}
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={22} /> : "Upload version"}
          </Button>
        </Box>
      </Box>
      <FeedbackSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity={snackbarSeverity}
        message={snackbarMsg}
      />
    </Paper>
  );
};

export default ArtefactDetailPage;
