import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import FeedbackSnackbar from "../components/FeedbackSnackbar";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";
      setError(msg);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Paper sx={{ p: 4, width: 400 }} elevation={4}>
        <Typography variant="h5" gutterBottom>
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            margin="normal"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            margin="normal"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} /> : "Login"}
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          No account?{" "}
          <MuiLink component={Link} to="/signup">
            Sign up
          </MuiLink>
        </Typography>
      </Paper>
      <FeedbackSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity="error"
        message={error}
      />
    </Box>
  );
};

export default LoginPage;
