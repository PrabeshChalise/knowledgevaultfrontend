import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import api from "../api";
import { useAuth } from "../auth/AuthContext";

const StatCard = ({ label, value }) => (
  <Paper sx={{ p: 2 }} elevation={2}>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h5">{value}</Typography>
  </Paper>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    mine: 0,
    approved: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/artefacts");
        const all = res.data || [];
        const mine = all.filter((a) => a.ownerId === user.id).length;
        const approved = all.filter((a) => a.status === "approved").length;
        const pending = all.filter((a) => a.status === "pending_review").length;
        setStats({
          total: all.length,
          mine,
          approved,
          pending,
        });
      } catch (err) {
        console.error("Dashboard stats error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Welcome, {user?.name}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total artefacts (region)" value={stats.total} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="My artefacts" value={stats.mine} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Approved" value={stats.approved} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Pending review" value={stats.pending} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
