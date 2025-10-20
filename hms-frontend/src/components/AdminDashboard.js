// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Sidebar from './Sidebar';
// import Dashboard from '../pages/Admin/Dashboard';
// import Patients from '../pages/Admin/Patients';
// import Doctors from '../pages/Admin/Doctors';
// import Appointments from '../pages/Admin/Appointments';
// import Billing from '../pages/Admin/Billing';
// import Reports from '../pages/Admin/Reports';
// import Notifications from '../pages/Admin/Notifications';

// const AdminDashboard = () => {
//   return (
//     <div>
//       <Sidebar role="admin" />
//       <div className="main-content">
//         <Routes>
//           <Route path="/" element={<Dashboard />} />
//           <Route path="/patients" element={<Patients />} />
//           <Route path="/doctors" element={<Doctors />} />
//           <Route path="/appointments" element={<Appointments />} />
//           <Route path="/billing" element={<Billing />} />
//           <Route path="/reports" element={<Reports />} />
//           <Route path="/notifications" element={<Notifications />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;
// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Sidebar from './Sidebar';
// import AdminBookAppointment from '../pages/Admin/AdminBookAppointment'; // import your new page

// // Inside <Routes>


// import Dashboard from '../pages/Admin/Dashboard';
// import Patients from '../pages/Admin/Patients';
// import Doctors from '../pages/Admin/Doctors';
// import Appointments from '../pages/Admin/Appointments';
// import Billing from '../pages/Admin/Billing';
// import Reports from '../pages/Admin/Reports';
// import Notifications from '../pages/Admin/Notifications';

// const AdminDashboard = () => {
//   return (
//     <div style={{
//       display: 'flex',
//       minHeight: '100vh',
//       fontFamily: 'Segoe UI, sans-serif',
//       backgroundColor: '#f4f6f8',
//       color: '#111827',
//     }}>
//       {/* Sidebar */}
//       <Sidebar role="admin" />

//       {/* Main Content */}
//       <div style={{
//         marginLeft: 250, // width of sidebar
//         flex: 1,
//         padding: '30px 40px',
//         overflowY: 'auto',
//       }}>
//         <Routes>
//           <Route path="/" element={<DashboardWrapper><Dashboard /></DashboardWrapper>} />
//           <Route path="/appointments/book" element={<DashboardWrapper><AdminBookAppointment /></DashboardWrapper>} />
//           <Route path="/patients" element={<DashboardWrapper><Patients /></DashboardWrapper>} />
//           <Route path="/doctors" element={<DashboardWrapper><Doctors /></DashboardWrapper>} />
//           <Route path="/appointments" element={<DashboardWrapper><Appointments /></DashboardWrapper>} />
//           <Route path="/billing" element={<DashboardWrapper><Billing /></DashboardWrapper>} />
//           <Route path="/reports" element={<DashboardWrapper><Reports /></DashboardWrapper>} />
//           <Route path="/notifications" element={<DashboardWrapper><Notifications /></DashboardWrapper>} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// // Wrapper for consistent card style for pages
// const DashboardWrapper = ({ children }) => (
//   <div style={{
//     backgroundColor: '#fff',
//     padding: '25px',
//     borderRadius: '12px',
//     boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
//     marginBottom: '20px',
//   }}>
//     {children}
//   </div>
// );

// export default AdminDashboard;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminBookAppointment from '../pages/Admin/AdminBookAppointment';
import Dashboard from '../pages/Admin/Dashboard';
import Patients from '../pages/Admin/Patients';
import Doctors from '../pages/Admin/Doctors';
import Appointments from '../pages/Admin/Appointments';
import Billing from '../pages/Admin/Billing';
import Reports from '../pages/Admin/Reports';
import Notifications from '../pages/Admin/Notifications';

const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f6f8', color: '#111827' }}>
      {/* Sidebar */}
      <Sidebar role="admin" />

      {/* Main Content */}
      <div style={{ marginLeft: 250, flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<DashboardWrapper><Dashboard /></DashboardWrapper>} />
          <Route path="/book-appointment" element={<DashboardWrapper><AdminBookAppointment /></DashboardWrapper>} />
          <Route path="/patients" element={<DashboardWrapper><Patients /></DashboardWrapper>} />
          <Route path="/doctors" element={<DashboardWrapper><Doctors /></DashboardWrapper>} />
          <Route path="/appointments" element={<DashboardWrapper><Appointments /></DashboardWrapper>} />
          <Route path="/billing" element={<DashboardWrapper><Billing /></DashboardWrapper>} />
          <Route path="/reports" element={<DashboardWrapper><Reports /></DashboardWrapper>} />
          <Route path="/notifications" element={<DashboardWrapper><Notifications /></DashboardWrapper>} />
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

export default AdminDashboard;


