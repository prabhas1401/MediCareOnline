// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "../styles/Sidebar.css"; // Create this CSS file

// const Sidebar = ({ role }) => {
//   const navigate = useNavigate();

//   const links = {
//     admin: [
//       { to: "/admin/", label: "Dashboard" },
//       { to: "/admin/patients", label: "Patients" },
//       { to: "/admin/doctors", label: "Doctors" },
//       { to: "/admin/appointments", label: "Appointments" },
//       { to: "/admin/billing", label: "Billing" },
//       { to: "/admin/reports", label: "Reports" },
//       { to: "/admin/notifications", label: "Notifications" },
//     ],
//     patient: [
//       { to: "/patient/", label: "Dashboard" },
//       { to: "/patient/add-appointment", label: "Add Appointment" },
//       { to: "/patient/appointments", label: "Appointments" },
//       { to: "/patient/prescriptions", label: "Prescriptions" },
//       { to: "/patient/records", label: "Records" },
//       { to: "/patient/billing", label: "Billing" },
//       { to: "/patient/reconsult", label: "Reconsult" },
//       { to: "/patient/profile", label: "Profile" },
//     ],
//     doctor: [
//       { to: "/doctor/", label: "Dashboard" },
//       { to: "/doctor/appointments", label: "Appointments" },
//       { to: "/doctor/patients", label: "Patients" },
//       { to: "/doctor/availability", label: "Availability" },
//     ],
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     navigate("/login");
//   };

//   return (
//     <div className="sidebar">
//       <h2 className="sidebar-title">{role.charAt(0).toUpperCase() + role.slice(1)} Panel</h2>
//       <ul className="sidebar-links">
//         {links[role].map((link, index) => (
//           <li key={index} className="sidebar-item">
//             <Link to={link.to} className="sidebar-link">
//               {link.label}
//             </Link>
//           </li>
//         ))}
//       </ul>
//       <button className="sidebar-logout" onClick={handleLogout}>
//         Logout
//       </button>
//     </div>
//   );
// };

// export default Sidebar;

// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "../styles/Sidebar.css";

// const Sidebar = ({ role }) => {
//   const navigate = useNavigate();
//   const links = {
//     admin: [
//       { to: "/admin/", label: "Dashboard" },
//       { to: "/admin/patients", label: "Patients" },
//       { to: "/admin/doctors", label: "Doctors" },
//       { to: "/admin/appointments", label: "Appointments" },
//       { to: "/admin/billing", label: "Billing" },
//       { to: "/admin/reports", label: "Reports" },
//       { to: "/admin/notifications", label: "Notifications" },
//     ],
//     patient: [
//       { to: "/patient/", label: "Dashboard" },
//       { to: "/patient/add-appointment", label: "Add Appointment" },
//       { to: "/patient/appointments", label: "Appointments" },
//       { to: "/patient/prescriptions", label: "Prescriptions" },
//       { to: "/patient/records", label: "Records" },
//       { to: "/patient/billing", label: "Billing" },
//       { to: "/patient/reconsult", label: "Reconsult" },
//       { to: "/patient/profile", label: "Profile" },
//     ],
//     doctor: [
//       { to: "/doctor/", label: "Dashboard" },
//       { to: "/doctor/appointments", label: "Appointments" },
//       { to: "/doctor/patients", label: "Patients" },
//       { to: "/doctor/availability", label: "Availability" },
//     ],
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   return (
//     <div className="sidebar">
//       <div className="sidebar-header">
//         {role.charAt(0).toUpperCase() + role.slice(1)} Panel
//       </div>

//       <div className="sidebar-links-container">
//         <ul className="sidebar-links">
//           {links[role]?.map((link, index) => (
//             <li key={index} className="sidebar-item">
//               <Link to={link.to} className="sidebar-link">
//                 {link.label}
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="sidebar-logout-container">
//         <button className="sidebar-logout" onClick={handleLogout}>
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
// import React from "react";
// import { Link, useNavigate } from "react-router-dom";

// const Sidebar = ({ role }) => {
//   const navigate = useNavigate();
//   const links = {
//     admin: [
//       { to: "/admin/", label: "Dashboard" },
//       { to: "/admin/patients", label: "Patients" },
//       { to: "/admin/doctors", label: "Doctors" },
//       { to: "/admin/appointments", label: "Appointments" },
//       { to: "/admin/billing", label: "Billing" },
//       { to: "/admin/reports", label: "Reports" },
//       { to: "/admin/notifications", label: "Notifications" },
//     ],
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   return (
//     <div style={{
//       width: 250,
//       height: '100vh',
//       backgroundColor: '#1f2937',
//       color: '#fff',
//       display: 'flex',
//       flexDirection: 'column',
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
//     }}>
//       <div style={{
//         padding: 20,
//         textAlign: 'center',
//         fontSize: '1.5rem',
//         fontWeight: 700,
//         background: '#111827',
//       }}>
//         {role.charAt(0).toUpperCase() + role.slice(1)} Panel
//       </div>

//       <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px 0' }}>
//         <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
//           {links[role]?.map((link, index) => (
//             <li key={index} style={{ marginBottom: 15 }}>
//               <Link
//                 to={link.to}
//                 style={{
//                   color: '#e5e7eb',
//                   textDecoration: 'none',
//                   fontSize: '1.1rem',
//                   padding: '10px 20px',
//                   display: 'block',
//                   borderRadius: 4,
//                   transition: '0.2s',
//                 }}
//                 onMouseEnter={e => e.target.style.backgroundColor = '#2563eb'}
//                 onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
//               >
//                 {link.label}
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div style={{ padding: 20 }}>
//         <button
//           onClick={handleLogout}
//           style={{
//             width: '100%',
//             backgroundColor: '#ef4444',
//             border: 'none',
//             padding: 12,
//             borderRadius: 6,
//             color: '#fff',
//             fontSize: '1rem',
//             cursor: 'pointer',
//             transition: '0.2s',
//           }}
//           onMouseEnter={e => e.target.style.backgroundColor = '#dc2626'}
//           onMouseLeave={e => e.target.style.backgroundColor = '#ef4444'}
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;


// import React from "react";
// import { Link, useNavigate } from "react-router-dom";

// const Sidebar = ({ role = "admin" }) => {
//   const navigate = useNavigate();

//   const links = {
//     admin: [
//       { to: "/admin/", label: "Dashboard" },
//       { to: "/admin/patients", label: "Patients" },
//       { to: "/admin/doctors", label: "Doctors" },
//       { to: "/admin/appointments", label: "Appointments" },
//       { to: "/admin/billing", label: "Billing" },
//       { to: "/admin/reports", label: "Reports" },
//       { to: "/admin/notifications", label: "Notifications" },
//     ],
//     doctor: [
//       { to: "/doctor/", label: "Dashboard" },
//       { to: "/doctor/appointments", label: "Appointments" },
//       { to: "/doctor/patients", label: "Patients" },
//       { to: "/doctor/availability", label: "Availability" },
//     ],
//     patient: [
//       { to: "/patient/", label: "Dashboard" },
//       { to: "/patient/add-appointment", label: "Add Appointment" },
//       { to: "/patient/appointments", label: "Appointments" },
//       { to: "/patient/prescriptions", label: "Prescriptions" },
//       { to: "/patient/records", label: "Records" },
//       { to: "/patient/billing", label: "Billing" },
//       { to: "/patient/reconsult", label: "Reconsult" },
//       { to: "/patient/profile", label: "Profile" },
//     ],
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const roleKey = role.toLowerCase(); // safe lookup

//   return (
//     <div
//       style={{
//         width: 250,
//         height: "100vh",
//         backgroundColor: "#1f2937",
//         color: "#fff",
//         display: "flex",
//         flexDirection: "column",
//         position: "fixed",
//         top: 0,
//         left: 0,
//         boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
//         zIndex: 1000,
//       }}
//     >
//       <div
//         style={{
//           padding: 20,
//           textAlign: "center",
//           fontSize: "1.5rem",
//           fontWeight: 700,
//           background: "#111827",
//         }}
//       >
//         {role.charAt(0).toUpperCase() + role.slice(1)} Panel
//       </div>

//       <div style={{ flexGrow: 1, overflowY: "auto", padding: "20px 0" }}>
//         <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
//           {links[roleKey] && links[roleKey].length > 0 ? (
//             links[roleKey].map((link, index) => (
//               <li key={index} style={{ marginBottom: 15 }}>
//                 <Link
//                   to={link.to}
//                   style={{
//                     color: "#e5e7eb",
//                     textDecoration: "none",
//                     fontSize: "1.1rem",
//                     padding: "10px 20px",
//                     display: "block",
//                     borderRadius: 4,
//                     transition: "0.2s",
//                   }}
//                   onMouseEnter={(e) =>
//                     (e.target.style.backgroundColor = "#2563eb")
//                   }
//                   onMouseLeave={(e) =>
//                     (e.target.style.backgroundColor = "transparent")
//                   }
//                 >
//                   {link.label}
//                 </Link>
//               </li>
//             ))
//           ) : (
//             <li style={{ color: "#fff", padding: "10px 20px" }}>
//               No links available
//             </li>
//           )}
//         </ul>
//       </div>

//       <div style={{ padding: 20 }}>
//         <button
//           onClick={handleLogout}
//           style={{
//             width: "100%",
//             backgroundColor: "#ef4444",
//             border: "none",
//             padding: 12,
//             borderRadius: 6,
//             color: "#fff",
//             fontSize: "1rem",
//             cursor: "pointer",
//             transition: "0.2s",
//           }}
//           onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
//           onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ role = "admin" }) => {
  const navigate = useNavigate();

  // Sidebar links for each role
  const links = {
    admin: [
      { to: "/admin/", label: "Dashboard" },
      { to: "/admin/patients", label: "Patients" },
      { to: "/admin/doctors", label: "Doctors" },
      { to: "/admin/appointments", label: "Appointments" },
      { to: "/admin/book-appointment", label: "Book Appointment" }, // New link
      { to: "/admin/billing", label: "Billing" },
      { to: "/admin/reports", label: "Reports" },
      { to: "/admin/notifications", label: "Notifications" },
    ],
    doctor: [
      { to: "/doctor/", label: "Dashboard" },
      { to: "/doctor/appointments", label: "Appointments" },
      { to: "/doctor/patients", label: "Patients" },
      { to: "/doctor/availability", label: "Availability" },
    ],
    patient: [
      { to: "/patient/", label: "Dashboard" },
      { to: "/patient/add-appointment", label: "Add Appointment" },
      { to: "/patient/appointments", label: "My Appointments" }, // Updated label
      { to: "/patient/prescriptions", label: "Prescriptions" },
      { to: "/patient/records", label: "Records" },
      { to: "/patient/billing", label: "Billing" },
      { to: "/patient/reconsult", label: "Reconsult" },
      { to: "/patient/profile", label: "Profile" },
    ],
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const roleKey = role.toLowerCase(); // safe lookup

  return (
    <div
      style={{
        width: 250,
        height: "100vh",
        backgroundColor: "#1f2937",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
        zIndex: 1000,
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: 20,
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: 700,
          background: "#111827",
        }}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)} Panel
      </div>

      {/* Navigation Links */}
      <div style={{ flexGrow: 1, overflowY: "auto", padding: "20px 0" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {links[roleKey] && links[roleKey].length > 0 ? (
            links[roleKey].map((link, index) => (
              <li key={index} style={{ marginBottom: 15 }}>
                <Link
                  to={link.to}
                  style={{
                    color: "#e5e7eb",
                    textDecoration: "none",
                    fontSize: "1.1rem",
                    padding: "10px 20px",
                    display: "block",
                    borderRadius: 4,
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#2563eb")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  {link.label}
                </Link>
              </li>
            ))
          ) : (
            <li style={{ color: "#fff", padding: "10px 20px" }}>
              No links available
            </li>
          )}
        </ul>
      </div>

      {/* Logout Button */}
      <div style={{ padding: 20 }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            backgroundColor: "#ef4444",
            border: "none",
            padding: 12,
            borderRadius: 6,
            color: "#fff",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


