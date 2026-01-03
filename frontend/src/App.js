import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import LibraryPage from "./pages/LibraryPage";
import ArtefactDetailPage from "./pages/ArtefactDetailPage";
import GovernancePage from "./pages/GovernancePage";
import AuditPage from "./pages/AuditPage";
import ProtectedRoute from "./auth/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AppLayout>
            <LoginPage />
          </AppLayout>
        }
      />
      <Route
        path="/signup"
        element={
          <AppLayout>
            <SignupPage />
          </AppLayout>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UploadPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <AppLayout>
              <LibraryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/artefacts/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ArtefactDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/governance"
        element={
          <ProtectedRoute>
            <AppLayout>
              <GovernancePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AuditPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
