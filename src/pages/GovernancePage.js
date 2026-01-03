import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import api from "../api";
import { useAuth } from "../auth/AuthContext";
import FeedbackSnackbar from "../components/FeedbackSnackbar";

const GovernancePage = () => {
  const { user } = useAuth();
  const [artefacts, setArtefacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [decisionType, setDecisionType] = useState("approved");

  const showMessage = (msg, severity = "success") => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/governance/pending");
      setArtefacts(res.data || []);
    } catch (err) {
      showMessage(
        err.response?.data?.error ||
          "You may need reviewer/admin role to see this",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openConfirm = (artefact, decision) => {
    setSelected(artefact);
    setDecisionType(decision);
    setConfirmOpen(true);
  };

  const handleConfirmDecision = async () => {
    if (!selected) return;
    setDecisionLoading(true);
    try {
      await api.post("/governance/decision", {
        artefactId: selected._id,
        decision: decisionType,
      });
      showMessage(`Artefact ${decisionType}`, "success");
      await load();
    } catch (err) {
      showMessage(err.response?.data?.error || "Decision failed", "error");
    } finally {
      setDecisionLoading(false);
      setConfirmOpen(false);
      setSelected(null);
    }
  };

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Governance queue
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Logged in as: {user?.name} ({user?.role})
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {artefacts.map((a) => (
              <TableRow key={a._id}>
                <TableCell>{a.title}</TableCell>
                <TableCell>{String(a.ownerId)}</TableCell>
                <TableCell>
                  {a.updatedAt
                    ? new Date(a.updatedAt).toLocaleDateString()
                    : ""}
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color="success"
                    onClick={() => openConfirm(a, "approved")}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => openConfirm(a, "rejected")}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {artefacts.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2">
                    No pending artefacts or you do not have access.
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
        severity={snackbarSeverity}
        message={snackbarMsg}
      />
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          {decisionType === "approved" ? "Approve artefact" : "Reject artefact"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {decisionType}{" "}
            <strong>{selected?.title}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDecision}
            color={decisionType === "approved" ? "success" : "error"}
            disabled={decisionLoading}
          >
            {decisionLoading ? (
              <CircularProgress size={20} />
            ) : decisionType === "approved" ? (
              "Approve"
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default GovernancePage;
