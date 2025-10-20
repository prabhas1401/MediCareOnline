import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Doctor/Dashboard';
import Appointments from '../pages/Doctor/Appointments';
import Patients from '../pages/Doctor/Patients';
import Availability from '../pages/Doctor/Availability';

const DoctorDashboard = () => {
  return (
    <div>
      <Sidebar role="doctor" />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/availability" element={<Availability />} />
        </Routes>
      </div>
    </div>
  );
};

export default DoctorDashboard;