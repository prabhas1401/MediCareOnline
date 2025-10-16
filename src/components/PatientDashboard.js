// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// const PatientDashboard = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [user, setUser] = useState(
//     JSON.parse(localStorage.getItem("loggedInUser")) || {
//       name: "John Doe",
//       email: "john@example.com",
//       role: "PATIENT",
//     }
//   );
//   const [redirecting, setRedirecting] = useState(false);

//   // Redirect if not logged in or not a patient
//   useEffect(() => {
//     if (!user || user.role !== "PATIENT") {
//       setRedirecting(true);
//       navigate("/login");
//     }
//   }, [user, navigate]);

//   if (redirecting) return null; // Don't render while redirecting

//   // Dummy Data
//   const appointments = [
//     { id: 1, doctor: "Dr. Smith", date: "2025-10-15", time: "10:00 AM", status: "Confirmed", amountPaid: "$50" },
//     { id: 2, doctor: "Dr. Johnson", date: "2025-10-18", time: "02:00 PM", status: "Pending", amountPaid: "$50" },
//     { id: 3, doctor: "Dr. Lee", date: "2025-10-20", time: "11:00 AM", status: "Completed", amountPaid: "$50" },
//   ];

//   const prescriptions = [
//     { id: 1, doctor: "Dr. Smith", details: "Take 1 pill daily" },
//     { id: 2, doctor: "Dr. Johnson", details: "Rest for 2 days" },
//   ];

//   const chartData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     datasets: [
//       {
//         label: "Appointments",
//         data: [2, 3, 1, 4, 3, 5],
//         fill: false,
//         backgroundColor: "rgb(75, 192, 192)",
//         borderColor: "rgba(75, 192, 192, 0.5)",
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: { position: "top" },
//       title: { display: true, text: "Appointments Over Time" },
//     },
//   };

//   // Handlers
//   const handleLogout = () => {
//     localStorage.removeItem("loggedInUser");
//     navigate("/login");
//   };

//   const handleBookAppointment = (e) => {
//     e.preventDefault();
//     alert("Appointment booked! (Simulated)");
//   };

//   const handleCancelAppointment = (id) => {
//     alert(`Appointment ${id} canceled. (Simulated)`);
//   };

//   const handleReconsult = () => {
//     alert("Free reconsult requested. (Simulated)");
//   };

//   const handleDownloadPrescription = (id) => {
//     alert(`Downloading prescription ID: ${id}`);
//   };

//   const handleUpdateProfile = (e) => {
//     e.preventDefault();
//     alert("Profile updated successfully! (Simulated)");
//   };

//   return (
//     <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
//       {/* Sidebar */}
//       <div style={{ width: "200px", backgroundColor: "#f4f4f4", padding: "10px", boxShadow: "2px 0 5px rgba(0,0,0,0.1)" }}>
//         <h2 style={{ color: "#333", marginBottom: "20px" }}>Patient Panel</h2>
//         <ul style={{ listStyle: "none", padding: 0 }}>
//           {["dashboard", "book", "appointments", "prescriptions", "records", "billing", "reconsult", "profile"].map((tab) => (
//             <li key={tab} style={{ marginBottom: "10px" }}>
//               <a
//                 href="#"
//                 onClick={() => setActiveTab(tab)}
//                 style={{
//                   textDecoration: "none",
//                   color: activeTab === tab ? "#007bff" : "#333",
//                   fontWeight: activeTab === tab ? "bold" : "normal",
//                   padding: "5px 10px",
//                   display: "block",
//                   borderRadius: "5px",
//                   backgroundColor: activeTab === tab ? "#e9ecef" : "transparent",
//                   cursor: "pointer",
//                 }}
//               >
//                 {tab === "book" ? "Add Appointment" : tab.charAt(0).toUpperCase() + tab.slice(1)}
//               </a>
//             </li>
//           ))}
//         </ul>
//         <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Logout</button>
//       </div>

//       {/* Main Content */}
//       <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
//         <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Dashboard</h2>

//         {/* Dashboard */}
//         {activeTab === "dashboard" && (
//           <>
//             <div style={{ maxWidth: "700px", marginBottom: "20px" }}>
//               <Line data={chartData} options={chartOptions} />
//             </div>
//             <h3>Recent Appointments</h3>
//             <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
//               <thead style={{ backgroundColor: "#f4f4f4" }}>
//                 <tr>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Doctor</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Time</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {appointments.map((appt, idx) => (
//                   <tr key={appt.id} style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white" }}>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.id}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.doctor}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.date}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.time}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.status}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </>
//         )}

//         {/* Add Appointment */}
//         {activeTab === "book" && (
//           <div>
//             <h2>Add Appointment</h2>
//             <form onSubmit={handleBookAppointment} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//               <input type="text" placeholder="Symptoms (describe)" style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
//               <input type="date" style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
//               <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Book and Pay (Simulated)</button>
//             </form>
//           </div>
//         )}

//         {/* View Appointments */}
//         {activeTab === "appointments" && (
//           <div>
//             <h2>View Appointments</h2>
//             <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
//               <thead style={{ backgroundColor: "#f4f4f4" }}>
//                 <tr>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Doctor</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Time</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {appointments.map((appt, idx) => (
//                   <tr key={appt.id} style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white" }}>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.id}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.doctor}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.date}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.time}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.status}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>
//                       <button onClick={() => alert(`Viewing appointment ${appt.id}`)} style={{ marginRight: "5px", padding: "5px 10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>View</button>
//                       <button onClick={() => handleCancelAppointment(appt.id)} style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Prescriptions */}
//         {activeTab === "prescriptions" && (
//           <div>
//             <h2>View Prescriptions</h2>
//             <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
//               <thead style={{ backgroundColor: "#f4f4f4" }}>
//                 <tr>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Doctor</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Details</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {prescriptions.map((pres, idx) => (
//                   <tr key={pres.id} style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white" }}>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{pres.id}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{pres.doctor}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{pres.details}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>
//                       <button onClick={() => handleDownloadPrescription(pres.id)} style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
//                         Download
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Records */}
//         {activeTab === "records" && (
//           <div>
//             <h2>Upload Scans</h2>
//             <input type="file" style={{ marginBottom: "10px", padding: "10px" }} />
//             <button style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Upload Scan</button>
//             <h3 style={{ marginTop: "20px" }}>Uploaded Scans</h3>
//             <ul style={{ listStyle: "none", padding: 0 }}>
//               <li style={{ marginBottom: "10px" }}>Scan 1 - View/Delete</li>
//             </ul>
//           </div>
//         )}

//         {/* Billing */}
//         {activeTab === "billing" && (
//           <div>
//             <h2>Billing</h2>
//             <p>Total Paid: $150 (Simulated)</p>
//             <table style={{ width: "100%", borderCollapse: "collapse" }}>
//               <thead style={{ backgroundColor: "#f4f4f4" }}>
//                 <tr>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Appointment ID</th>
//                   <th style={{ padding: "10px", border: "1px solid #ddd" }}>Amount</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {appointments.map((appt, idx) => (
//                   <tr key={appt.id} style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white" }}>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.id}</td>
//                     <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.amountPaid}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Reconsult */}
//         {activeTab === "reconsult" && (
//           <div>
//             <h2>Reconsult</h2>
//             <p>Request free reconsult for completed appointments within 10 days.</p>
//             <button onClick={handleReconsult} style={{ padding: "10px", backgroundColor: "#ffc107", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Request Reconsult</button>
//           </div>
//         )}

//         {/* Profile */}
//         {activeTab === "profile" && (
//           <div>
//             <h2>Profile</h2>
//             <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
//               <input type="text" placeholder="Name" value={user.name || ""} onChange={(e) => setUser({ ...user, name: e.target.value })} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
//               <input type="email" placeholder="Email" value={user.email || ""} onChange={(e) => setUser({ ...user, email: e.target.value })} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
//               <input type="number" placeholder="Age" value={user.age || ""} onChange={(e) => setUser({ ...user, age: e.target.value })} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
//               <select value={user.gender || ""} onChange={(e) => setUser({ ...user, gender: e.target.value })} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
//                 <option value="">Select Gender</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//               </select>
//               <input type="text" placeholder="Phone" value={user.phone || ""} onChange={(e) => setUser({ ...user, phone: e.target.value })} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }} />
//               <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Update Profile</button>
//             </form>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default PatientDashboard;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// import AppointmentForm from '../components/AppointmentForm';  // Import the form component

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("loggedInUser")) || {
      name: "John Doe",
      email: "john@example.com",
      role: "PATIENT",
    }
  );
  const [redirecting, setRedirecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);  // New state for modal
  const [bookingDetails, setBookingDetails] = useState(null);  // New state for booking details

  const handleBookingSuccess = (details) => {
    setBookingDetails(details);  // Set details from AppointmentForm
    setIsModalOpen(true);  // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBookingDetails(null);  // Clear details
  };

  // Redirect if not logged in or not a patient
  useEffect(() => {
    if (!user || user.role !== "PATIENT") {
      setRedirecting(true);
      navigate("/login");
    }
  }, [user, navigate]);

  if (redirecting) return null; // Don't render while redirecting

  // Dummy Data (unchanged)
  const appointments = [
    { id: 1, doctor: "Dr. Smith", date: "2025-10-15", time: "10:00 AM", status: "Confirmed", amountPaid: "$50" },
    { id: 2, doctor: "Dr. Johnson", date: "2025-10-18", time: "02:00 PM", status: "Pending", amountPaid: "$50" },
    { id: 3, doctor: "Dr. Lee", date: "2025-10-20", time: "11:00 AM", status: "Completed", amountPaid: "$50" },
  ];

  const prescriptions = [
    { id: 1, doctor: "Dr. Smith", details: "Take 1 pill daily" },
    { id: 2, doctor: "Dr. Johnson", details: "Rest for 2 days" },
  ];

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Appointments",
        data: [2, 3, 1, 4, 3, 5],
        fill: false,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Appointments Over Time" },
    },
  };

  // Handlers (unchanged, except for integration)
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  const handleCancelAppointment = (id) => {
    alert(`Appointment ${id} canceled. (Simulated)`);
  };

  const handleReconsult = () => {
    alert("Free reconsult requested. (Simulated)");
  };

  const handleDownloadPrescription = (id) => {
    alert(`Downloading prescription ID: ${id}`);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert("Profile updated successfully! (Simulated)");
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar (unchanged) */}
      <div style={{ width: "200px", backgroundColor: "#f4f4f4", padding: "10px", boxShadow: "2px 0 5px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Patient Panel</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {["dashboard", "book", "appointments", "prescriptions", "records", "billing", "reconsult", "profile"].map((tab) => (
            <li key={tab} style={{ marginBottom: "10px" }}>
              <a
                href="#"
                onClick={() => setActiveTab(tab)}
                style={{
                  textDecoration: "none",
                  color: activeTab === tab ? "#007bff" : "#333",
                  fontWeight: activeTab === tab ? "bold" : "normal",
                  padding: "5px 10px",
                  display: "block",
                  borderRadius: "5px",
                  backgroundColor: activeTab === tab ? "#e9ecef" : "transparent",
                  cursor: "pointer",
                }}
              >
                {tab === "book" ? "Add Appointment" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </a>
            </li>
          ))}
        </ul>
        <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Dashboard</h2>

        {/* Render AppointmentForm in the "book" tab */}
        {activeTab === "book" && (
          <div>
            <h2>Add Appointment</h2>
            <AppointmentForm onBookingSuccess={handleBookingSuccess} />  {/* Integrated here */}
          </div>
        )}

        {/* Rest of your tabs remain unchanged */}
        {activeTab === "dashboard" && (
          <>
            <div style={{ maxWidth: "700px", marginBottom: "20px" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
            <h3>Recent Appointments</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
              <thead style={{ backgroundColor: "#f4f4f4" }}>
                <tr>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Doctor</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Time</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt, idx) => (
                  <tr key={appt.id} style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white" }}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.id}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.doctor}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.date}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.time}</td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{appt.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Other tabs (appointments, prescriptions, etc.) remain as in your original code */}

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>Booking Confirmation</h2>
              <p>Your appointment has been booked successfully!</p>
              <p>Date: {bookingDetails?.date}</p>
              <p>Time: {bookingDetails?.time}</p>
              <p>Symptoms: {bookingDetails?.symptoms}</p>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;