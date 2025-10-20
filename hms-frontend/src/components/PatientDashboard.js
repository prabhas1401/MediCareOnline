// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Sidebar from './Sidebar';
// import Dashboard from '../pages/Patient/Dashboard';
// import AddAppointment from '../pages/Patient/AddAppointment';
// import ViewAppointments from '../pages/Patient/ViewAppointments';
// import Prescriptions from '../pages/Patient/Prescriptions';
// import Records from '../pages/Patient/Records';
// import Billing from '../pages/Patient/Billing';
// import Reconsult from '../pages/Patient/Reconsult';
// import Profile from '../pages/Patient/Profile';
// // import ViewAppointments from '../pages/Patient/ViewAppointments'; // import patient appointments




// const PatientDashboard = () => {
//   return (
//     <div>
//       <Sidebar role="patient" />
//       <div className="main-content">
//         <Routes>
//           <Route path="/" element={<Dashboard />} />
//           <Route path="/add-appointment" element={<AddAppointment />} />
//           <Route path="/appointments" element={<ViewAppointments />} />
//           <Route path="/prescriptions" element={<Prescriptions />} />
//           <Route path="/records" element={<Records />} />
//           <Route path="/billing" element={<Billing />} />
//           <Route path="/reconsult" element={<Reconsult />} />
//           <Route path="/profile" element={<Profile />} />
  
//   {/* <Route path="/" element={<DashboardWrapper><Dashboard /></DashboardWrapper>} />
//   <Route path="/appointments" element={<DashboardWrapper><ViewAppointments patientId={loggedInPatientId} /></DashboardWrapper>} /> */}
// </Routes>
//       </div>
//     </div>
//   );
// };

// export default PatientDashboard;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Patient/Dashboard';
import AddAppointment from '../pages/Patient/AddAppointment';
import ViewAppointments from '../pages/Patient/ViewAppointments';
import Prescriptions from '../pages/Patient/Prescriptions';
import Records from '../pages/Patient/Records';
import Billing from '../pages/Patient/Billing';
import Reconsult from '../pages/Patient/Reconsult';
import Profile from '../pages/Patient/Profile';

const PatientDashboard = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f6f8', color: '#111827' }}>
      {/* Sidebar */}
      <Sidebar role="patient" />

      {/* Main Content */}
      <div style={{ marginLeft: 250, flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<DashboardWrapper><Dashboard /></DashboardWrapper>} />
          <Route path="/add-appointment" element={<DashboardWrapper><AddAppointment /></DashboardWrapper>} />
          <Route path="/appointments" element={<DashboardWrapper><ViewAppointments /></DashboardWrapper>} />
          <Route path="/prescriptions" element={<DashboardWrapper><Prescriptions /></DashboardWrapper>} />
          <Route path="/records" element={<DashboardWrapper><Records /></DashboardWrapper>} />
          <Route path="/billing" element={<DashboardWrapper><Billing /></DashboardWrapper>} />
          <Route path="/reconsult" element={<DashboardWrapper><Reconsult /></DashboardWrapper>} />
          <Route path="/profile" element={<DashboardWrapper><Profile /></DashboardWrapper>} />
        </Routes>
      </div>
    </div>
  );
};

// Wrapper for consistent card style
const DashboardWrapper = ({ children }) => (
  <div style={{
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginBottom: '20px',
  }}>
    {children}
  </div>
);

export default PatientDashboard;
