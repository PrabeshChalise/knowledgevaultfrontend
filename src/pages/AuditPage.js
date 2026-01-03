import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import api from "../api";
import FeedbackSnackbar from "../components/FeedbackSnackbar";

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/audit");
        setLogs(res.data || []);
      } catch (err) {
        const msg = err.response?.data?.error || "Failed to load audit logs";
        setError(msg);
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Audit trail
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Target type</TableCell>
              <TableCell>Target id</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l._id}>
                <TableCell>
                  {l.createdAt ? new Date(l.createdAt).toLocaleString() : ""}
                </TableCell>
                <TableCell>{l.action}</TableCell>
                <TableCell>{l.targetType}</TableCell>
                <TableCell>{String(l.targetId || "")}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2">
                    No audit logs yet or you do not have access.
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

export default AuditPage;
