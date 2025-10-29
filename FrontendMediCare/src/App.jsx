<<<<<<< HEAD
=======

>>>>>>> 4fd22286824ab62afecbb8bfccc0dc5345ed407c
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Welcome from './components/Welcome';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashBoard';  // Corrected import (rename file to PatientDashboard.jsx if needed)
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/NavBar';
<<<<<<< HEAD
import ResetPassword from './components/ResetPassword';  // New import
=======
>>>>>>> 4fd22286824ab62afecbb8bfccc0dc5345ed407c

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
<<<<<<< HEAD
        <Route path="/reset-password" element={<ResetPassword />} />  {/* New route */}
=======
>>>>>>> 4fd22286824ab62afecbb8bfccc0dc5345ed407c
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/doctor" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/patient" element={<ProtectedRoute role="PATIENT"><PatientDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;

