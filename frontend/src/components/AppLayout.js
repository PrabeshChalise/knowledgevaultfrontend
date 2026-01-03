import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Stack,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NavButton = ({ to, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Button
      component={Link}
      to={to}
      color={active ? "secondary" : "inherit"}
      sx={{ textTransform: "none" }}
    >
      {label}
    </Button>
  );
};

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <Box className="kv-main">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Knowledge Vault
          </Typography>
          {user && (
            <Stack direction="row" spacing={1} alignItems="center">
              <NavButton to="/" label="Dashboard" />
              <NavButton to="/upload" label="Upload" />
              <NavButton to="/library" label="Library" />
              <NavButton to="/governance" label="Governance" />
              <NavButton to="/audit" label="Audit" />
              <Button
                color="inherit"
                onClick={logout}
                sx={{ textTransform: "none" }}
              >
                Logout
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout;
