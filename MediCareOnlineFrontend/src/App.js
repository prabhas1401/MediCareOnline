
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "./styles/theme";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import PatientRegister from "./components/PatientRegister";
import DoctorRegister from "./components/DoctorRegister";
import AdminDashboard from "./components/AdminDashboard";
import AdminDoctor from "./components/Admin/AdminDoctors";
import AdminPatient from "./components/Admin/AdminPatients";
import AdminAppointments from "./components/AdminAppointments";
import BillingList from "./components/Admin/Billing/List";
import Reports from "./components/Admin/Reports";
import Notifications from "./components/Admin/Notifications";
import DoctorDashboard from "./components/DoctorDashboard";
import PatientDashboard from "./components/PatientDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./utils/AuthUtils";
import { getMockUsers } from "./mockData";

function App() {
  const { user } = useAuth();
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const doctors = JSON.parse(localStorage.getItem("doctors") || "[]");
  
    if (users.length === 0 || doctors.length === 0) {
      const mockUsers = getMockUsers() || [];
      localStorage.setItem(
        "users",
        JSON.stringify(Array.isArray(mockUsers) ? mockUsers.filter((u) => u.role === "patient") : [])
      );
      localStorage.setItem(
        "doctors",
        JSON.stringify(Array.isArray(mockUsers) ? mockUsers.filter((u) => u.role === "doctor") : [])
      );
    }
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/register/patient" element={<Layout><PatientRegister /></Layout>} />
          <Route path="/register/doctor" element={<Layout><DoctorRegister /></Layout>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute role="admin"><AdminDoctor /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute role="admin"><AdminPatient /></ProtectedRoute>} />
          <Route path="/admin/billing" element={<ProtectedRoute role="admin"><BillingList /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><Notifications /></ProtectedRoute>} />
          <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route
            path="/dashboard"
            element={
              user ? (
                user.role === "patient" ? (
                  <Navigate to="/patient/dashboard" />
                ) : user.role === "doctor" ? (
                  <Navigate to="/doctor/dashboard" />
                ) : (
                  <Navigate to="/admin/dashboard" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
