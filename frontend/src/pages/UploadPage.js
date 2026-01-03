import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import api from "../api";
import FeedbackSnackbar from "../components/FeedbackSnackbar";

const UploadPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [classification, setClassification] = useState("open");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showMessage = (msg, severity = "success") => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showMessage("Please choose a file", "error");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", tags);
    formData.append("classification", classification);
    formData.append("file", file);

    setLoading(true);
    try {
      await api.post("/artefacts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitle("");
      setDescription("");
      setTags("");
      setClassification("open");
      setFile(null);
      showMessage("Artefact uploaded successfully", "success");
    } catch (err) {
      showMessage(err.response?.data?.error || "Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Upload new artefact
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
        />
        <TextField
          label="Tags (comma separated)"
          fullWidth
          margin="normal"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <TextField
          select
          label="Classification"
          fullWidth
          margin="normal"
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
        >
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="restricted">Restricted</MenuItem>
          <MenuItem value="confidential">Confidential</MenuItem>
        </TextField>
        <Button variant="outlined" component="label" sx={{ mt: 2 }}>
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
        <Box sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={22} /> : "Upload"}
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

export default UploadPage;
