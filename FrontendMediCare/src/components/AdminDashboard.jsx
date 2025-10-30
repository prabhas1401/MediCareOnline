// import React, { useState, useEffect } from 'react';
// import { adminAPI } from '../services/api';

// const AdminDashboard = () => {
//   const [activeSection, setActiveSection] = useState('doctors');
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [doctors, setDoctors] = useState([]);
//   const [patients, setPatients] = useState([]);
//   const [admins, setAdmins] = useState([]);
//   const [allAppointments, setAllAppointments] = useState([]);  // Combined list for all appointments
//   const [newDoctor, setNewDoctor] = useState({ fullName: '', emailId: '', phoneNumber: '', rawPassword: '', confirmPassword: '', specialization: '', qualification: '', experienceYears: '' });
//   const [newPatient, setNewPatient] = useState({ fullName: '', emailId: '', phoneNumber: '', rawPassword: '', confirmPassword: '', gender: '', dateOfBirth: '' });
//   const [newAdmin, setNewAdmin] = useState({ fullName: '', email: '', phoneNumber: '', rawPassword: '', confirmPassword: '', superAdmin: false });
//   const [reassignData, setReassignData] = useState({ appointmentId: '', newDoctorUserId: '', requestedDateTime: '', reason: '' });
//   const [rescheduleData, setRescheduleData] = useState({ appointmentId: '', newRequestedDateTime: '', reason: '' });
//   const [filters, setFilters] = useState({ doctors: 'all', patients: 'all', admins: 'all', appointments: 'all' });  // Added appointments filter
//   const [loading, setLoading] = useState(false);
//   const [showApproveModal, setShowApproveModal] = useState(false);
//   const [approveData, setApproveData] = useState({ appointmentId: '', doctorUserId: '', requestedDateTime: '' });
//   const [showRescheduleModal, setShowRescheduleModal] = useState(false);  // For cancelled appointments
//   const [rescheduleModalData, setRescheduleModalData] = useState({ appointmentId: '', newDoctorUserId: '', requestedDateTime: '', reason: '' });  // For cancelled
//   const [showPendingRescheduleModal, setShowPendingRescheduleModal] = useState(false);  // For pending appointments
//   const [pendingRescheduleData, setPendingRescheduleData] = useState({ appointmentId: '', newRequestedDateTime: '', reason: '' });  // For pending
//   const [error, setError] = useState('');
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//      const [newDateTime, setNewDateTime] = useState('');
//      const [rescheduleModal, setRescheduleModal] = useState(false);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [d, p, a, appts] = await Promise.all([
//         adminAPI.getDoctors(),
//         adminAPI.getPatients(),
//         adminAPI.getAdmins(),
//         adminAPI.getAllAppointments()  // New: Fetch all appointments
//       ]);
//       setDoctors(d.data || []);
//       setPatients(p.data || []);
//       setAdmins(a.data || []);
//       setAllAppointments(appts.data || []);
      
//       console.log('Fetched doctors:', d.data);
//       console.log('Fetched patients:', p.data);
//       console.log('Fetched admins:', a.data);
//       console.log('Fetched all appointments:', appts.data);
//     } catch (err) {
//       console.error('Fetch error details:', err);
//       alert('Error fetching data: ' + (err.response?.data?.message || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createDoctor = async () => {
//     console.log('Create Doctor button clicked');
//     if (newDoctor.rawPassword !== newDoctor.confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }
//     try {
//       await adminAPI.createDoctor(newDoctor);
//       setNewDoctor({ fullName: '', emailId: '', phoneNumber: '', rawPassword: '', confirmPassword: '', specialization: '', qualification: '', experienceYears: '' });
//       fetchData();
//       alert('Doctor created successfully!');
//     } catch (err) {
//       alert('Error creating doctor: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const createPatient = async () => {
//     console.log('Create Patient button clicked');
//     if (newPatient.rawPassword !== newPatient.confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }
//     try {
//       await adminAPI.createPatient(newPatient);
//       setNewPatient({ fullName: '', emailId: '', phoneNumber: '', rawPassword: '', confirmPassword: '', gender: '', dateOfBirth: '' });
//       fetchData();
//       alert('Patient created successfully!');
//     } catch (err) {
//       alert('Error creating patient: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const createAdmin = async () => {
//     console.log('Create Admin button clicked');
//     if (newAdmin.rawPassword !== newAdmin.confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }
//     try {
//       await adminAPI.createAdmin(newAdmin);
//       setNewAdmin({ fullName: '', email: '', phoneNumber: '', rawPassword: '', confirmPassword: '', superAdmin: false });
//       fetchData();
//       alert('Admin created successfully!');
//     } catch (err) {
//       alert('Error creating admin: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const approveDoctor = async (id) => {
//     console.log('Approve Doctor button clicked for ID:', id);
//     try {
//       await adminAPI.approveDoctor(id);
//       fetchData();
//       alert('Doctor approved!');
//     } catch (err) {
//       alert('Error approving doctor: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const blockUser = async (id, status) => {
//     console.log('Block User button clicked for ID:', id, 'Status:', status);
//     try {
//       await adminAPI.blockUser(id, status);
//       fetchData();
//       alert('User status updated!');
//     } catch (err) {
//       alert('Error updating user status: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const handleApprove = (appointmentId) => {
//     console.log('Approve Appointment button clicked for ID:', appointmentId);
//     const now = new Date();
//     const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
//     nextHour.setMinutes(Math.ceil(nextHour.getMinutes() / 20) * 20);
//     if (nextHour.getHours() < 9) nextHour.setHours(9, 0, 0, 0);
//     if (nextHour.getHours() >= 17) nextHour.setDate(nextHour.getDate() + 1, 9, 0, 0, 0);
//     setApproveData({ appointmentId, doctorUserId: '', requestedDateTime: nextHour.toISOString().slice(0, 16) });
//     setShowApproveModal(true);
//   };

//   const submitApprove = async () => {
//     const { appointmentId, doctorUserId, requestedDateTime } = approveData;
//     if (!doctorUserId || !requestedDateTime) {
//       setError('Please select a doctor and date/time.');
//       return;
//     }
//     const doctorExists = doctors.some(d => d.userId == doctorUserId);
//     if (!doctorExists) {
//       setError('Invalid Doctor ID. Please select from the list.');
//       return;
//     }
//     const dt = new Date(requestedDateTime);
//     const now = new Date();
//     if (dt <= now) {
//       setError('Date/time must be in the future.');
//       return;
//     }
//     const hours = dt.getHours();
//     const minutes = dt.getMinutes();
//     if (hours < 9 || hours >= 17 || (hours === 12 && minutes >= 0) || (hours === 13 && minutes < 60)) {
//       setError('Slot outside working hours. Working hours: 9:00 AM - 5:00 PM, excluding lunch 12:00-1:00 PM.');
//       return;
//     }
//     if (minutes % 20 !== 0) {
//       setError('Slot must align to 20-minute boundary (e.g., 09:00, 09:20).');
//       return;
//     }
//     try {
//       await adminAPI.approveAppointment(appointmentId, { doctorUserId: parseInt(doctorUserId), requestedDateTime });
//       setShowApproveModal(false);
//       setApproveData({ appointmentId: '', doctorUserId: '', requestedDateTime: '' });
//       setError('');
//       fetchData();
//       alert('Appointment approved!');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error approving appointment: ' + err.message);
//     }
//   };

//   const cancelAppointment = async (id) => {
//     console.log('Cancel Appointment button clicked for ID:', id);
//     const reason = prompt('Enter cancellation reason:');
//     if (!reason) return;
//     try {
//       await adminAPI.cancelAppointment(id, { reason });
//       fetchData();
//       alert('Appointment cancelled!');
//     } catch (err) {
//       alert('Error cancelling appointment: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const viewDetails = (appointment) => {
//     console.log('View Details button clicked for appointment:', appointment.appointmentId);
//     alert('Appointment Details:\n' + JSON.stringify(appointment, null, 2));
//   };

//   // const rescheduleAppointment = async () => {
//   //   try {
//   //     // UPDATED: Pass appointmentId as path param, and data as body
//   //     await adminAPI.rescheduleAppointment(rescheduleData.appointmentId, {
//   //       newRequestedDateTime: rescheduleData.newRequestedDateTime,
//   //       reason: rescheduleData.reason
//   //     });
//   //     setRescheduleData({ appointmentId: '', newRequestedDateTime: '', reason: '' });
//   //     fetchData();
//   //     alert('Appointment rescheduled successfully!');
//   //   } catch (err) {
//   //     alert('Error rescheduling appointment: ' + (err.response?.data?.message || err.message));
//   //   }
//   // };

//   const rescheduleCancelled = async (appointmentId) => {
//     console.log('Re-schedule Cancelled button clicked for ID:', appointmentId);
//     const now = new Date();
//     const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
//     nextHour.setMinutes(Math.ceil(nextHour.getMinutes() / 20) * 20);
//     if (nextHour.getHours() < 9) nextHour.setHours(9, 0, 0, 0);
//     if (nextHour.getHours() >= 17) nextHour.setDate(nextHour.getDate() + 1, 9, 0, 0, 0);
//     // NEW: Set selectedAppointment to the current appointment for modal display
//     const appt = allAppointments.find(a => a.appointmentId === appointmentId);
//     setSelectedAppointment(appt);
//     setRescheduleModalData({ appointmentId, newDoctorUserId: '', requestedDateTime: nextHour.toISOString().slice(0, 16), reason: '' });
//     setShowRescheduleModal(true);
//   };
//   const reschedulePending = async (appointmentId) => {
//     console.log('Reschedule Pending button clicked for ID:', appointmentId);
//     const now = new Date();
//     const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
//     nextHour.setMinutes(Math.ceil(nextHour.getMinutes() / 20) * 20);
//     if (nextHour.getHours() < 9) nextHour.setHours(9, 0, 0, 0);
//     if (nextHour.getHours() >= 17) nextHour.setDate(nextHour.getDate() + 1, 9, 0, 0, 0);
//     // NEW: Set selectedAppointment
//     const appt = allAppointments.find(a => a.appointmentId === appointmentId);
//     setSelectedAppointment(appt);
//     setPendingRescheduleData({ appointmentId, newRequestedDateTime: nextHour.toISOString().slice(0, 16), reason: '' });
//     setShowPendingRescheduleModal(true);
//   };
//   const rescheduleAppointment = async () => {
//     try {
//       // UPDATED: Use rescheduleData instead of  variables
//       await adminAPI.rescheduleAppointment(rescheduleData.appointmentId, {
//         newRequestedDateTime: rescheduleData.newRequestedDateTime,
//         reason: rescheduleData.reason
//       });
//       setRescheduleData({ appointmentId: '', newRequestedDateTime: '', reason: '' });
//       fetchData();
//       alert('Appointment rescheduled successfully!');
//     } catch (err) {
//       alert('Error rescheduling: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const reassignAppointment = async () => {
//     try {
//       // UPDATED: Pass appointmentId as path param, and data as body
//       await adminAPI.reassignAppointment(reassignData.appointmentId, {
//         newDoctorUserId: reassignData.newDoctorUserId,
//         requestedDateTime: reassignData.requestedDateTime,
//         reason: reassignData.reason
//       });
//       setReassignData({ appointmentId: '', newDoctorUserId: '', requestedDateTime: '', reason: '' });
//       fetchData();
//       alert('Appointment reassigned successfully!');
//     } catch (err) {
//       alert('Error reassigning appointment: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   // const rescheduleCancelled = async (appointmentId) => {
//   //   console.log('Re-schedule Cancelled button clicked for ID:', appointmentId);
//   //   const now = new Date();
//   //   const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
//   //   nextHour.setMinutes(Math.ceil(nextHour.getMinutes() / 20) * 20);
//   //   if (nextHour.getHours() < 9) nextHour.setHours(9, 0, 0, 0);
//   //   if (nextHour.getHours() >= 17) nextHour.setDate(nextHour.getDate() + 1, 9, 0, 0, 0);
//   //   setRescheduleModalData({ appointmentId, newDoctorUserId: '', requestedDateTime: nextHour.toISOString().slice(0, 16), reason: '' });
//   //   setShowRescheduleModal(true);
//   // };

//   const submitReschedule = async () => {
//     const { appointmentId, newDoctorUserId, requestedDateTime, reason } = rescheduleModalData;
//     if (!newDoctorUserId || !requestedDateTime) {
//       setError('Please select a doctor and date/time.');
//       return;
//     }
//     const doctorExists = doctors.some(d => d.userId == newDoctorUserId);
//     if (!doctorExists) {
//       setError('Invalid Doctor ID. Please select from the list.');
//       return;
//     }
//     const dt = new Date(requestedDateTime);
//     const now = new Date();
//     if (dt <= now) {
//       setError('Date/time must be in the future.');
//       return;
//     }
//     const hours = dt.getHours();
//     const minutes = dt.getMinutes();
//     if (hours < 9 || hours >= 17 || (hours === 12 && minutes >= 0) || (hours === 13 && minutes < 60)) {
//       setError('Slot outside working hours. Working hours: 9:00 AM - 5:00 PM, excluding lunch 12:00-1:00 PM.');
//       return;
//     }
//     if (minutes % 20 !== 0) {
//       setError('Slot must align to 20-minute boundary (e.g., 09:00, 09:20).');
//       return;
//     }
//     try {
//       await adminAPI.reassignAppointment({ appointmentId: parseInt(appointmentId), newDoctorUserId: parseInt(newDoctorUserId), requestedDateTime, reason });
//       setShowRescheduleModal(false);
//       setRescheduleModalData({ appointmentId: '', newDoctorUserId: '', requestedDateTime: '', reason: '' });
//       setError('');
//       fetchData();
//       alert('Appointment rescheduled!');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error rescheduling appointment: ' + err.message);
//     }
//   };

//   // const reschedulePending = async (appointmentId) => {
//   //   console.log('Reschedule Pending button clicked for ID:', appointmentId);
//   //   const now = new Date();
//   //   const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
//   //   nextHour.setMinutes(Math.ceil(nextHour.getMinutes() / 20) * 20);
//   //   if (nextHour.getHours() < 9) nextHour.setHours(9, 0, 0, 0);
//   //   if (nextHour.getHours() >= 17) nextHour.setDate(nextHour.getDate() + 1, 9, 0, 0, 0);
//   //   setPendingRescheduleData({ appointmentId, newRequestedDateTime: nextHour.toISOString().slice(0, 16), reason: '' });
//   //   setShowPendingRescheduleModal(true);
//   // };

//   const submitPendingReschedule = async () => {
//     const { appointmentId, newRequestedDateTime, reason } = pendingRescheduleData;
//     if (!newRequestedDateTime) {
//       setError('Please select a date/time.');
//       return;
//     }
//     const dt = new Date(newRequestedDateTime);
//     const now = new Date();
//     if (dt <= now) {
//       setError('Date/time must be in the future.');
//       return;
//     }
//     const hours = dt.getHours();
//     const minutes = dt.getMinutes();
//     if (hours < 9 || hours >= 17 || (hours === 12 && minutes >= 0) || (hours === 13 && minutes < 60)) {
//       setError('Slot outside working hours.');
//       return;
//     }
//     if (minutes % 20 !== 0) {
//       setError('Slot must align to 20-minute boundary.');
//       return;
//     }
//     try {
//       await adminAPI.rescheduleAppointment({ appointmentId: parseInt(appointmentId), newRequestedDateTime, reason });
//       setShowPendingRescheduleModal(false);
//       setPendingRescheduleData({ appointmentId: '', newRequestedDateTime: '', reason: '' });
//       setError('');
//       fetchData();
//       alert('Appointment rescheduled!');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error rescheduling appointment: ' + err.message);
//     }
//   };

//   const archiveAppointment = async (id) => {
//     try {
//       await adminAPI.archiveAppointment(id);
//       fetchData();
//       alert('Appointment archived!');
//     } catch (err) {
//       alert('Error archiving appointment: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const filteredDoctors = doctors.filter(d => filters.doctors === 'all' || d.status.toLowerCase() === filters.doctors);
//   const filteredPatients = patients.filter(p => filters.patients === 'all' || p.status.toLowerCase() === filters.patients);
//   const filteredAdmins = admins.filter(a => filters.admins === 'all' || a.status.toLowerCase() === filters.admins);
//   const filteredAppointments = allAppointments.filter(ap => {
//     if (!ap) return false;
//     const searchTerm = filters.appointments.toLowerCase();
//     return searchTerm === 'all' || ap.status.toLowerCase() === searchTerm;
//   });

//   const tableStyle = {
//     width: '100%',
//     borderCollapse: 'collapse',
//     marginTop: '1rem',
//     fontSize: '0.9rem',
//   };
//   const thStyle = {
//     border: '1px solid #ddd',
//     padding: '12px',
//     backgroundColor: '#f2f2f2',
//     textAlign: 'left',
//   };
//   const tdStyle = {
//     border: '1px solid #ddd',
//     padding: '12px',
//   };
//   const trHoverStyle = {
//     backgroundColor: '#f5f5f5',
//   };
//   const buttonStyle = {
//     padding: '6px 12px',
//     margin: '2px',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     fontSize: '0.8rem',
//   };

//   return (
//     <div style={{ display: 'flex', fontFamily: 'Poppins, sans-serif', background: '#f4f8fb', minHeight: '100vh' }}>
//       <div style={{ width: sidebarCollapsed ? '0' : '250px', background: '#007bff', color: 'black', padding: '1rem', transition: 'width 0.3s', overflow: 'hidden' }}>
//         <button onClick={() => { console.log('Sidebar toggle clicked'); setSidebarCollapsed(!sidebarCollapsed); }} style={{ background: 'none', border: 'none', color: 'black', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
//           ☰
//         </button>
//         <h2 style={{ color: 'black', fontWeight: 'bold' }}>Admin Menu</h2>
//         <ul style={{ listStyle: 'none', padding: 0 }}>
//           <li><button onClick={() => { console.log('Create Doctor section clicked'); setActiveSection('createDoctor'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Create Doctor</button></li>
//           <li><button onClick={() => { console.log('Create Patient section clicked'); setActiveSection('createPatient'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Create Patient</button></li>
//           <li><button onClick={() => { console.log('Create Admin section clicked'); setActiveSection('createAdmin'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Create Admin</button></li>
//           <li><button onClick={() => { console.log('Doctors section clicked'); setActiveSection('doctors'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Doctors</button></li>
//           <li><button onClick={() => { console.log('Patients section clicked'); setActiveSection('patients'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Patients</button></li>
//           <li><button onClick={() => { console.log('Admins section clicked'); setActiveSection('admins'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Admins</button></li>
//           <li><button onClick={() => { console.log('Appointments section clicked'); setActiveSection('appointments'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Appointments</button></li>  
//           <li><button onClick={() => { console.log('Reschedule Appointment section clicked'); setActiveSection('rescheduleAppointment'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Reschedule Appointment</button></li>
//           <li><button onClick={() => { console.log('Reassign Appointment section clicked'); setActiveSection('reassignAppointment'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Reassign Appointment</button></li>
//         </ul>
//       </div>
//       <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
//         {loading && <p>Loading...</p>}
//         {error && <p style={{ color: 'red' }}>{error}</p>}
//         <div style={{ display: activeSection === 'createDoctor' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
//           <div style={{ flex: 1 }}>
//             <h3>Create Doctor</h3>
//             <form onSubmit={(e) => { e.preventDefault(); createDoctor(); }}>
//               <input type="text" placeholder="Full Name" value={newDoctor.fullName} onChange={(e) => setNewDoctor({ ...newDoctor, fullName: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="email" placeholder="Email" value={newDoctor.emailId} onChange={(e) => setNewDoctor({ ...newDoctor, emailId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="text" placeholder="Phone" value={newDoctor.phoneNumber} onChange={(e) => setNewDoctor({ ...newDoctor, phoneNumber: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="password" placeholder="Password" value={newDoctor.rawPassword} onChange={(e) => setNewDoctor({ ...newDoctor, rawPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="password" placeholder="Confirm Password" value={newDoctor.confirmPassword} onChange={(e) => setNewDoctor({ ...newDoctor, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}/>
//               <select value={newDoctor.specialization} onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
//                 <option value="">Select Specialization</option>
//                 <option value="CARDIOLOGIST">Cardiologist</option>
//                 <option value="ORTHOPEDIC">Orthopedic</option>
//                 <option value="DENTIST">Dentist</option>
//                 <option value="GYNAECOLOGIST">Gynaecologist</option>
//                 <option value="NEUROLOGIST">Neurologist</option>
//                 <option value="GASTROENTEROLOGIST">Gastroenterologist</option>
//                 <option value="PEDIATRICS">Pediatrics</option>
//                 <option value="RADIOLOGY">Radiology</option>
//                 <option value="GENERAL_PHYSICIAN">General Physician</option>
//                 <option value="OTOLARYNGOLOGIST_ENT">Otolaryngologist ENT</option>
//                 <option value="ENDOCRINOLOGIST">Endocrinologist</option>
//                 <option value="ONCOLOGY">Oncology</option>
//               </select>
//               <input type="text" placeholder="Qualification" value={newDoctor.qualification} onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="number" placeholder="Experience Years" value={newDoctor.experienceYears} onChange={(e) => setNewDoctor({ ...newDoctor, experienceYears: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Create Doctor</button>
//             </form>
//           </div>
//         </div>
//         <div style={{ display: activeSection === 'createPatient' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
//           <div style={{ flex: 1 }}>
//             <h3>Create Patient</h3>
//             <form onSubmit={(e) => { e.preventDefault(); createPatient(); }}>
//               <input type="text" placeholder="Full Name" value={newPatient.fullName} onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="email" placeholder="Email" value={newPatient.emailId} onChange={(e) => setNewPatient({ ...newPatient, emailId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="text" placeholder="Phone" value={newPatient.phoneNumber} onChange={(e) => setNewPatient({ ...newPatient, phoneNumber: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="password" placeholder="Password" value={newPatient.rawPassword} onChange={(e) => setNewPatient({ ...newPatient, rawPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="password" placeholder="Confirm Password" value={newPatient.confirmPassword} onChange={(e) => setNewPatient({ ...newPatient, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <select value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
//                 <option value="">Select Gender</option>
//                 <option value="MALE">Male</option>
//                 <option value="FEMALE">Female</option>
//                 <option value="OTHER">Other</option>
//               </select>
//               <input type="date" value={newPatient.dateOfBirth} onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Create Patient</button>
//             </form>
//           </div>
//         </div>
//         <div style={{ display: activeSection === 'createAdmin' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
//           <div style={{ flex: 1 }}>
//             <h3>Create Admin</h3>
//             <form onSubmit={(e) => { e.preventDefault(); createAdmin(); }}>
//               <input type="text" placeholder="Full Name" value={newAdmin.fullName} onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="email" placeholder="Email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="text" placeholder="Phone" value={newAdmin.phoneNumber} onChange={(e) => setNewAdmin({ ...newAdmin, phoneNumber: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="password" placeholder="Password" value={newAdmin.rawPassword} onChange={(e) => setNewAdmin({ ...newAdmin, rawPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="password" placeholder="Confirm Password" value={newAdmin.confirmPassword} onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <label><input type="checkbox" checked={newAdmin.superAdmin} onChange={(e) => setNewAdmin({ ...newAdmin, superAdmin: e.target.checked })} /> Super Admin</label>
//               <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Create Admin</button>
//             </form>
//           </div>
//         </div>
//         <div style={{ display: activeSection === 'doctors' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
//           <div style={{ flex: 1 }}>
//             <h3>Doctors</h3>
//             <table style={tableStyle}>
//               <thead>
//                 <tr>
//                   <th style={thStyle}>Name</th>
//                   <th style={thStyle}>Status</th>
//                   <th style={thStyle}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredDoctors.map((d, index) => (
//                   <tr key={d.userId} style={index % 2 === 0 ? {} : trHoverStyle} onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'} onMouseLeave={(e) => e.target.style.backgroundColor = index % 2 === 0 ? 'white' : '#f5f5f5'}>
//                     <td style={tdStyle}>{d.fullName}</td>
//                     <td style={tdStyle}>{d.status}</td>
//                     <td style={tdStyle}>
//                       <button onClick={() => approveDoctor(d.userId)} style={{ ...buttonStyle, background: '#28a745', color: 'white' }}>Approve</button>
//                       <button onClick={() => blockUser(d.userId, 'BLOCKED')} style={{ ...buttonStyle, background: '#dc3545', color: 'white' }}>Block</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div style={{ width: '200px', marginLeft: '2rem', marginTop: '-1rem' }}>
//             <h4>Filters</h4>
//             <select value={filters.doctors} onChange={(e) => setFilters({ ...filters, doctors: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
//               <option value="all">All</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//               <option value="approved">Approved</option>
//               <option value="blocked">Blocked</option>
//             </select>
//           </div>
//         </div>
//         <div style={{ display: activeSection === 'patients' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
//           <div style={{ flex: 1 }}>
//             <h3>Patients</h3>
//             <table style={tableStyle}>
//               <thead>
//                 <tr>
//                   <th style={thStyle}>Name</th>
//                   <th style={thStyle}>Status</th>
//                   <th style={thStyle}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredPatients.map((p, index) => (
//                   <tr key={p.userId} style={index % 2 === 0 ? {} : trHoverStyle} onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'} onMouseLeave={(e) => e.target.style.backgroundColor = index % 2 === 0 ? 'white' : '#f5f5f5'}>
//                     <td style={tdStyle}>{p.fullName}</td>
//                     <td style={tdStyle}>{p.status}</td>
//                     <td style={tdStyle}>
//                       <button onClick={() => blockUser(p.userId, 'BLOCKED')} style={{ ...buttonStyle, background: '#dc3545', color: 'white' }}>Block</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div style={{ width: '200px', marginLeft: '2rem', marginTop: '-1rem' }}>
//             <h4>Filters</h4>
//             <select value={filters.patients} onChange={(e) => setFilters({ ...filters, patients: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
//               <option value="all">All</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//               <option value="blocked">Blocked</option>
//             </select>
//           </div>
//         </div>
//         <div style={{ display: activeSection === 'admins' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
//           <div style={{ flex: 1 }}>
//             <h3>Admins</h3>
//             <table style={tableStyle}>
//               <thead>
//                 <tr>
//                   <th style={thStyle}>Name</th>
//                   <th style={thStyle}>Status</th>
//                   <th style={thStyle}>Super Admin</th>
//                   <th style={thStyle}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredAdmins.map((a, index) => (
//                   <tr key={a.adminId} style={index % 2 === 0 ? {} : trHoverStyle} onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'} onMouseLeave={(e) => e.target.style.backgroundColor = index % 2 === 0 ? 'white' : '#f5f5f5'}>
//                     <td style={tdStyle}>{a.fullName}</td>
//                     <td style={tdStyle}>{a.status}</td>
//                     <td style={tdStyle}>{a.superAdmin ? 'Yes' : 'No'}</td>
//                     <td style={tdStyle}>
//                       <button onClick={() => blockUser(a.adminId, 'BLOCKED')} style={{ ...buttonStyle, background: '#dc3545', color: 'white' }}>Block</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div style={{ width: '200px', marginLeft: '2rem', marginTop: '-1rem' }}>
//             <h4>Filters</h4>
//             <select value={filters.admins} onChange={(e) => setFilters({ ...filters, admins: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
//               <option value="all">All</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//               <option value="blocked">Blocked</option>
//             </select>
//           </div>
//         </div>
//         <div style={{ display: activeSection === 'appointments' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
//           <div style={{ flex: 1 }}>
//             <h3>All Appointments</h3>
//             <table style={tableStyle}>
//               <thead>
//                 <tr>
//                   <th style={thStyle}>Appointment ID</th>
//                   <th style={thStyle}>Patient Name & ID</th>
//                   <th style={thStyle}>Doctor Name & Specialization</th>
//                   <th style={thStyle}>Date & Time</th>
//                   <th style={thStyle}>Status</th>
//                   <th style={thStyle}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredAppointments.length > 0 ? (
//                   filteredAppointments.map((ap, index) => (
//                     <tr key={ap.appointmentId || index} style={index % 2 === 0 ? {} : trHoverStyle} onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'} onMouseLeave={(e) => e.target.style.backgroundColor = index % 2 === 0 ? 'white' : '#f5f5f5'}>
//                       <td style={tdStyle}>{ap.appointmentId}</td>
//                       <td style={tdStyle}>{ap.patient?.fullName || 'N/A'} ({ap.patient?.userId || 'N/A'})</td>
//                       <td style={tdStyle}>{ap.doctor ? `${ap.doctor.fullName} (${ap.doctor.specialization})` : 'Not Assigned'}</td>
//                       <td style={tdStyle}>{ap.scheduledDateTime || ap.preferredDate || 'N/A'}</td>
//                       <td style={tdStyle}>{ap.status}</td>
//                       <td style={tdStyle}>
//                         {ap.status === 'PENDING' && (
//                           <>
//                             <button onClick={() => handleApprove(ap.appointmentId)} style={{ ...buttonStyle, background: '#28a745', color: 'white' }}>Approve</button>
//                             <button onClick={() => reschedulePending(ap.appointmentId)} style={{ ...buttonStyle, background: '#ffc107', color: 'white' }}>Reschedule</button>
//                             <button onClick={() => cancelAppointment(ap.appointmentId)} style={{ ...buttonStyle, background: '#dc3545', color: 'white' }}>Cancel</button>
//                           </>
//                         )}
//                         {ap.status === 'CANCELLED' && (
//                           <>
//                             <button onClick={() => rescheduleCancelled(ap.appointmentId)} style={{ ...buttonStyle, background: '#ffc107', color: 'white' }}>Re-schedule</button>
//                             <button onClick={() => archiveAppointment(ap.appointmentId)} style={{ ...buttonStyle, background: '#6c757d', color: 'white' }}>Archive</button>
//                           </>
//                         )}
//                         <button onClick={() => viewDetails(ap)} style={{ ...buttonStyle, background: '#17a2b8', color: 'white' }}>View Details</button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No appointments available.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           <div style={{ width: '200px', marginLeft: '2rem', marginTop: '-1rem' }}>
//             <h4>Filters</h4>
//             <select value={filters.appointments} onChange={(e) => setFilters({ ...filters, appointments: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
//               <option value="all">All</option>
//               <option value="pending">Pending</option>
//               <option value="confirmed">Confirmed</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>
//         </div>
//         <div style={{ display: activeSection === 'rescheduleAppointment' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
//           <div style={{ flex: 1 }}>
//             <h3>Reschedule Appointment</h3>
//             <form onSubmit={(e) => { e.preventDefault(); rescheduleAppointment(); }}>
//               <input type="number" placeholder="Appointment ID" value={rescheduleData.appointmentId} onChange={(e) => setRescheduleData({ ...rescheduleData, appointmentId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="datetime-local" value={rescheduleData.newRequestedDateTime} onChange={(e) => setRescheduleData({ ...rescheduleData, newRequestedDateTime: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="text" placeholder="Reason" value={rescheduleData.reason} onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Reschedule</button>
//             </form>
//           </div>
//         </div>
//         <div style={{ display: activeSection === 'reassignAppointment' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
//           <div style={{ flex: 1 }}>
//             <h3>Reassign Appointment</h3>
//             <form onSubmit={(e) => { e.preventDefault(); reassignAppointment(); }}>
//               <input type="number" placeholder="Appointment ID" value={reassignData.appointmentId} onChange={(e) => setReassignData({ ...reassignData, appointmentId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <select value={reassignData.newDoctorUserId} onChange={(e) => setReassignData({ ...reassignData, newDoctorUserId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
//                 <option value="">Select New Doctor</option>
//                 {doctors.map(d => <option key={d.userId} value={d.userId}>{d.fullName} ({d.specialization})</option>)}
//               </select>
//               <input type="datetime-local" value={reassignData.requestedDateTime} onChange={(e) => setReassignData({ ...reassignData, requestedDateTime: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="text" placeholder="Reason" value={reassignData.reason} onChange={(e) => setReassignData({ ...reassignData, reason: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Reassign</button>
//             </form>
//           </div>
//         </div>
//       </div>

//       {showApproveModal && (
//         <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
//           <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', width: '400px' }}>
//             <h3>Approve Appointment</h3>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             <label>Doctor:</label>
//             <select value={approveData.doctorUserId} onChange={(e) => setApproveData({ ...approveData, doctorUserId: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
//               <option value="">Select Doctor</option>
//               {doctors.map(d => <option key={d.userId} value={d.userId}>{d.fullName} ({d.specialization})</option>)}
//             </select>
//             <label>Date/Time:</label>
//             <input type="datetime-local" value={approveData.requestedDateTime} onChange={(e) => setApproveData({ ...approveData, requestedDateTime: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//             <button onClick={submitApprove} style={{ ...buttonStyle, background: '#28a745', color: 'white', marginRight: '10px' }}>Approve</button>
//             <button onClick={() => { setShowApproveModal(false); setError(''); }} style={{ ...buttonStyle, background: '#6c757d', color: 'white' }}>Cancel</button>
//           </div>
//         </div>
//       )}

//       {showRescheduleModal && (
//         <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
//           <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', width: '400px' }}>
//             <h3>Reschedule Cancelled Appointment</h3>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             <label>Doctor:</label>
//             <select value={rescheduleModalData.newDoctorUserId} onChange={(e) => setRescheduleModalData({ ...rescheduleModalData, newDoctorUserId: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
//               <option value="">Select Doctor</option>
//               {doctors.map(d => <option key={d.userId} value={d.userId}>{d.fullName} ({d.specialization})</option>)}
//             </select>
//             <label>Date/Time:</label>
//             <input type="datetime-local" value={rescheduleModalData.requestedDateTime} onChange={(e) => setRescheduleModalData({ ...rescheduleModalData, requestedDateTime: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//             <label>Reason:</label>
//             <input type="text" placeholder="Reason for reschedule" value={rescheduleModalData.reason} onChange={(e) => setRescheduleModalData({ ...rescheduleModalData, reason: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//             <button onClick={submitReschedule} style={{ ...buttonStyle, background: '#28a745', color: 'white', marginRight: '10px' }}>Reschedule</button>
//             <button onClick={() => { setShowRescheduleModal(false); setError(''); }} style={{ ...buttonStyle, background: '#6c757d', color: 'white' }}>Cancel</button>
//           </div>
//         </div>
//       )}
//       {rescheduleModal && (
//        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
//          <h3>Reschedule Appointment</h3>
//          <p>Patient: {selectedAppointment?.patient?.fullName || 'N/A'}</p>
//          <p>Current Date/Time: {selectedAppointment?.scheduledDateTime || 'N/A'}</p>
//          <input type="datetime-local" value={newDateTime} onChange={(e) => setNewDateTime(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//          <button onClick={() => {
//            // UPDATED: Use selectedAppointment for modal-based reschedule
//            adminAPI.rescheduleAppointment(selectedAppointment.appointmentId, { newRequestedDateTime: newDateTime });
//            setRescheduleModal(false);
//            setNewDateTime('');
//            fetchData();
//            alert('Appointment rescheduled successfully');
//          }} style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Confirm</button>
//          <button onClick={() => setRescheduleModal(false)} style={{ ...buttonStyle, background: '#ccc', color: 'black' }}>Cancel</button>
//        </div>
//      )}


//       {showPendingRescheduleModal && (
//         <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
//           <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', width: '400px' }}>
//             <h3>Reschedule Pending Appointment</h3>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             <label>Date/Time:</label>
//             <input type="datetime-local" value={pendingRescheduleData.newRequestedDateTime} onChange={(e) => setPendingRescheduleData({ ...pendingRescheduleData, newRequestedDateTime: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//             <label>Reason:</label>
//             <input type="text" placeholder="Reason for reschedule" value={pendingRescheduleData.reason} onChange={(e) => setPendingRescheduleData({ ...pendingRescheduleData, reason: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//             <button onClick={submitPendingReschedule} style={{ ...buttonStyle, background: '#28a745', color: 'white', marginRight: '10px' }}>Reschedule</button>
//             <button onClick={() => { setShowPendingRescheduleModal(false); setError(''); }} style={{ ...buttonStyle, background: '#6c757d', color: 'white' }}>Cancel</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('doctors');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);  // Combined list for all appointments
  const [newDoctor, setNewDoctor] = useState({ fullName: '', emailId: '', phoneNumber: '', rawPassword: '', confirmPassword: '', specialization: '', qualification: '', experienceYears: '' });
  const [newPatient, setNewPatient] = useState({ fullName: '', emailId: '', phoneNumber: '', rawPassword: '', confirmPassword: '', gender: '', dateOfBirth: '' });
  const [newAdmin, setNewAdmin] = useState({ fullName: '', email: '', phoneNumber: '', rawPassword: '', confirmPassword: '', superAdmin: false });
  const [reassignData, setReassignData] = useState({ appointmentId: '', newDoctorUserId: '', requestedDateTime: '', reason: '' });
  const [rescheduleData, setRescheduleData] = useState({ appointmentId: '', newRequestedDateTime: '', reason: '' });
  const [filters, setFilters] = useState({ doctors: 'all', patients: 'all', admins: 'all', appointments: 'all' });  // Added appointments filter
  const [loading, setLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveData, setApproveData] = useState({ appointmentId: '', doctorUserId: '', requestedDateTime: '' });
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);  // For cancelled appointments
  const [rescheduleModalData, setRescheduleModalData] = useState({ appointmentId: '', newDoctorUserId: '', requestedDateTime: '', reason: '' });  // For cancelled
  const [showPendingRescheduleModal, setShowPendingRescheduleModal] = useState(false);  // For pending appointments
  const [pendingRescheduleData, setPendingRescheduleData] = useState({ appointmentId: '', newRequestedDateTime: '', reason: '' });  // For pending
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
     const [newDateTime, setNewDateTime] = useState('');
     const [rescheduleModal, setRescheduleModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [d, p, a, appts] = await Promise.all([
        adminAPI.getDoctors(),
        adminAPI.getPatients(),
        adminAPI.getAdmins(),
        adminAPI.getAllAppointments()  // New: Fetch all appointments
      ]);
      setDoctors(d.data || []);
      setPatients(p.data || []);
      setAdmins(a.data || []);
      setAllAppointments(appts.data || []);
      
      console.log('Fetched doctors:', d.data);
      console.log('Fetched patients:', p.data);
      console.log('Fetched admins:', a.data);
      console.log('Fetched all appointments:', appts.data);
    } catch (err) {
      console.error('Fetch error details:', err);
      alert('Error fetching data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const createDoctor = async () => {
    console.log('Create Doctor button clicked');
    if (newDoctor.rawPassword !== newDoctor.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await adminAPI.createDoctor(newDoctor);
      setNewDoctor({ fullName: '', emailId: '', phoneNumber: '', rawPassword: '', confirmPassword: '', specialization: '', qualification: '', experienceYears: '' });
      fetchData();
      alert('Doctor created successfully!');
    } catch (err) {
      alert('Error creating doctor: ' + (err.response?.data?.message || err.message));
    }
  };

  const createPatient = async () => {
    console.log('Create Patient button clicked');
    if (newPatient.rawPassword !== newPatient.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await adminAPI.createPatient(newPatient);
      setNewPatient({ fullName: '', emailId: '', phoneNumber: '', rawPassword: '', confirmPassword: '', gender: '', dateOfBirth: '' });
      fetchData();
      alert('Patient created successfully!');
    } catch (err) {
      alert('Error creating patient: ' + (err.response?.data?.message || err.message));
    }
  };

  const createAdmin = async () => {
    console.log('Create Admin button clicked');
    if (newAdmin.rawPassword !== newAdmin.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await adminAPI.createAdmin(newAdmin);
      setNewAdmin({ fullName: '', email: '', phoneNumber: '', rawPassword: '', confirmPassword: '', superAdmin: false });
      fetchData();
      alert('Admin created successfully!');
    } catch (err) {
      alert('Error creating admin: ' + (err.response?.data?.message || err.message));
    }
  };

  const approveDoctor = async (id) => {
    console.log('Approve Doctor button clicked for ID:', id);
    try {
      await adminAPI.approveDoctor(id);
      fetchData();
      alert('Doctor approved!');
    } catch (err) {
      alert('Error approving doctor: ' + (err.response?.data?.message || err.message));
    }
  };

  const blockUser = async (id, status) => {
    console.log('Block User button clicked for ID:', id, 'Status:', status);
    try {
      await adminAPI.blockUser(id, status);
      fetchData();
      alert('User status updated!');
    } catch (err) {
      alert('Error updating user status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = (appointmentId) => {
    console.log('Approve Appointment button clicked for ID:', appointmentId);
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    nextHour.setMinutes(Math.ceil(nextHour.getMinutes() / 20) * 20);
    if (nextHour.getHours() < 9) nextHour.setHours(9, 0, 0, 0);
    if (nextHour.getHours() >= 17) nextHour.setDate(nextHour.getDate() + 1, 9, 0, 0, 0);
    setApproveData({ appointmentId, doctorUserId: '', requestedDateTime: nextHour.toISOString().slice(0, 16) });
    setShowApproveModal(true);
  };

  const submitApprove = async () => {
    const { appointmentId, doctorUserId, requestedDateTime } = approveData;
    if (!doctorUserId || !requestedDateTime) {
      setError('Please select a doctor and date/time.');
      return;
    }
    const doctorExists = doctors.some(d => d.userId == doctorUserId);
    if (!doctorExists) {
      setError('Invalid Doctor ID. Please select from the list.');
      return;
    }
    const dt = new Date(requestedDateTime);
    const now = new Date();
    if (dt <= now) {
      setError('Date/time must be in the future.');
      return;
    }
    const hours = dt.getHours();
    const minutes = dt.getMinutes();
    if (hours < 9 || hours >= 17 || (hours === 12 && minutes >= 0) || (hours === 13 && minutes < 60)) {
      setError('Slot outside working hours. Working hours: 9:00 AM - 5:00 PM, excluding lunch 12:00-1:00 PM.');
      return;
    }
    if (minutes % 20 !== 0) {
      setError('Slot must align to 20-minute boundary (e.g., 09:00, 09:20).');
      return;
    }
    try {
      await adminAPI.approveAppointment(appointmentId, { doctorUserId: parseInt(doctorUserId), requestedDateTime });
      setShowApproveModal(false);
      setApproveData({ appointmentId: '', doctorUserId: '', requestedDateTime: '' });
      setError('');
      fetchData();
      alert('Appointment approved!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error approving appointment: ' + err.message);
    }
  };

  const cancelAppointment = async (id) => {
    console.log('Cancel Appointment button clicked for ID:', id);
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;
    try {
      await adminAPI.cancelAppointment(id, { reason });
      fetchData();
      alert('Appointment cancelled!');
    } catch (err) {
      alert('Error cancelling appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  const viewDetails = (appointment) => {
    console.log('View Details button clicked for appointment:', appointment.appointmentId);
    alert('Appointment Details:\n' + JSON.stringify(appointment, null, 2));
  };

  // const rescheduleAppointment = async () => {
  //   try {
  //     // UPDATED: Pass appointmentId as path param, and data as body
  //     await adminAPI.rescheduleAppointment(rescheduleData.appointmentId, {
  //       newRequestedDateTime: rescheduleData.newRequestedDateTime,
  //       reason: rescheduleData.reason
  //     });
  //     setRescheduleData({ appointmentId: '', newRequestedDateTime: '', reason: '' });
  //     fetchData();
  //     alert('Appointment rescheduled successfully!');
  //   } catch (err) {
  //     alert('Error rescheduling appointment: ' + (err.response?.data?.message || err.message));
  //   }
  // };

  const rescheduleCancelled = async (appointmentId) => {
    console.log('Re-schedule Cancelled button clicked for ID:', appointmentId);
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    nextHour.setMinutes(Math.ceil(nextHour.getMinutes() / 20) * 20);
    if (nextHour.getHours() < 9) nextHour.setHours(9, 0, 0, 0);
    if (nextHour.getHours() >= 17) nextHour.setDate(nextHour.getDate() + 1, 9, 0, 0, 0);
    // NEW: Set selectedAppointment to the current appointment for modal display
    const appt = allAppointments.find(a => a.appointmentId === appointmentId);
    setSelectedAppointment(appt);
    setRescheduleModalData({ appointmentId, newDoctorUserId: '', requestedDateTime: nextHour.toISOString().slice(0, 16), reason: '' });
    setShowRescheduleModal(true);
  };
  const reschedulePending = async (appointmentId) => {
    console.log('Reschedule Pending button clicked for ID:', appointmentId);
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    nextHour.setMinutes(Math.ceil(nextHour.getMinutes() / 20) * 20);
    if (nextHour.getHours() < 9) nextHour.setHours(9, 0, 0, 0);
    if (nextHour.getHours() >= 17) nextHour.setDate(nextHour.getDate() + 1, 9, 0, 0, 0);
    // NEW: Set selectedAppointment
    const appt = allAppointments.find(a => a.appointmentId === appointmentId);
    setSelectedAppointment(appt);
    setPendingRescheduleData({ appointmentId, newRequestedDateTime: nextHour.toISOString().slice(0, 16), reason: '' });
    setShowPendingRescheduleModal(true);
  };
  const rescheduleAppointment = async () => {
    try {
      // UPDATED: Use rescheduleData instead of  variables
      await adminAPI.rescheduleAppointment(rescheduleData.appointmentId, {
        newRequestedDateTime: rescheduleData.newRequestedDateTime,
        reason: rescheduleData.reason
      });
      setRescheduleData({ appointmentId: '', newRequestedDateTime: '', reason: '' });
      fetchData();
      alert('Appointment rescheduled successfully!');
    } catch (err) {
      alert('Error rescheduling: ' + (err.response?.data?.message || err.message));
    }
  };

  const reassignAppointment = async () => {
    try {
      // UPDATED: Pass appointmentId as path param, and data as body
      await adminAPI.reassignAppointment(reassignData.appointmentId, {
        newDoctorUserId: reassignData.newDoctorUserId,
        requestedDateTime: reassignData.requestedDateTime,
        reason: reassignData.reason
      });
      setReassignData({ appointmentId: '', newDoctorUserId: '', requestedDateTime: '', reason: '' });
      fetchData();
      alert('Appointment reassigned successfully!');
    } catch (err) {
      alert('Error reassigning appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  // const rescheduleCancelled = async (appointmentId) => {
  //   console.log('Re-schedule Cancelled button clicked for ID:', appointmentId);
  //   const now = new Date();
  //   const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  //   nextHour.setMinutes(Math.ceil(nextHour.getMinutes() / 20) * 20);
  //   if (nextHour.getHours() < 9) nextHour.setHours(9, 0, 0, 0);
  //   if (nextHour.getHours() >= 17) nextHour.setDate(nextHour.getDate() + 1, 9, 0, 0, 0);
  //   setRescheduleModalData({ appointmentId, newDoctorUserId: '', requestedDateTime: nextHour.toISOString().slice(0, 16), reason: '' });
  //   setShowRescheduleModal(true);
  // };

  const submitReschedule = async () => {
    const { appointmentId, newDoctorUserId, requestedDateTime, reason } = rescheduleModalData;
    if (!newDoctorUserId || !requestedDateTime) {
      setError('Please select a doctor and date/time.');
      return;
    }
    const doctorExists = doctors.some(d => d.userId == newDoctorUserId);
    if (!doctorExists) {
      setError('Invalid Doctor ID. Please select from the list.');
      return;
    }
    const dt = new Date(requestedDateTime);
    const now = new Date();
    if (dt <= now) {
      setError('Date/time must be in the future.');
      return;
    }
    const hours = dt.getHours();
    const minutes = dt.getMinutes();
    if (hours < 9 || hours >= 17 || (hours === 12 && minutes >= 0) || (hours === 13 && minutes < 60)) {
      setError('Slot outside working hours. Working hours: 9:00 AM - 5:00 PM, excluding lunch 12:00-1:00 PM.');
      return;
    }
    if (minutes % 20 !== 0) {
      setError('Slot must align to 20-minute boundary (e.g., 09:00, 09:20).');
      return;
    }
    try {
      await adminAPI.reassignAppointment({ appointmentId: parseInt(appointmentId), newDoctorUserId: parseInt(newDoctorUserId), requestedDateTime, reason });
      setShowRescheduleModal(false);
      setRescheduleModalData({ appointmentId: '', newDoctorUserId: '', requestedDateTime: '', reason: '' });
      setError('');
      fetchData();
      alert('Appointment rescheduled!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error rescheduling appointment: ' + err.message);
    }
  };

  // const reschedulePending = async (appointmentId) => {
  //   console.log('Reschedule Pending button clicked for ID:', appointmentId);
  //   const now = new Date();
  //   const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  //   nextHour.setMinutes(Math.ceil(nextHour.getMinutes() / 20) * 20);
  //   if (nextHour.getHours() < 9) nextHour.setHours(9, 0, 0, 0);
  //   if (nextHour.getHours() >= 17) nextHour.setDate(nextHour.getDate() + 1, 9, 0, 0, 0);
  //   setPendingRescheduleData({ appointmentId, newRequestedDateTime: nextHour.toISOString().slice(0, 16), reason: '' });
  //   setShowPendingRescheduleModal(true);
  // };

  const submitPendingReschedule = async () => {
    const { appointmentId, newRequestedDateTime, reason } = pendingRescheduleData;
    if (!newRequestedDateTime) {
      setError('Please select a date/time.');
      return;
    }
    const dt = new Date(newRequestedDateTime);
    const now = new Date();
    if (dt <= now) {
      setError('Date/time must be in the future.');
      return;
    }
    const hours = dt.getHours();
    const minutes = dt.getMinutes();
    if (hours < 9 || hours >= 17 || (hours === 12 && minutes >= 0) || (hours === 13 && minutes < 60)) {
      setError('Slot outside working hours.');
      return;
    }
    if (minutes % 20 !== 0) {
      setError('Slot must align to 20-minute boundary.');
      return;
    }
    try {
      await adminAPI.rescheduleAppointment({ appointmentId: parseInt(appointmentId), newRequestedDateTime, reason });
      setShowPendingRescheduleModal(false);
      setPendingRescheduleData({ appointmentId: '', newRequestedDateTime: '', reason: '' });
      setError('');
      fetchData();
      alert('Appointment rescheduled!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error rescheduling appointment: ' + err.message);
    }
  };

  const archiveAppointment = async (id) => {
    try {
      await adminAPI.archiveAppointment(id);
      fetchData();
      alert('Appointment archived!');
    } catch (err) {
      alert('Error archiving appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredDoctors = doctors.filter(d => filters.doctors === 'all' || d.status.toLowerCase() === filters.doctors);
  const filteredPatients = patients.filter(p => filters.patients === 'all' || p.status.toLowerCase() === filters.patients);
  const filteredAdmins = admins.filter(a => filters.admins === 'all' || a.status.toLowerCase() === filters.admins);
  const filteredAppointments = allAppointments.filter(ap => {
    if (!ap) return false;
    const searchTerm = filters.appointments.toLowerCase();
    return searchTerm === 'all' || ap.status.toLowerCase() === searchTerm;
  });

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
    fontSize: '0.9rem',
  };
  const thStyle = {
    border: '1px solid #ddd',
    padding: '12px',
    backgroundColor: '#f2f2f2',
    textAlign: 'left',
  };
  const tdStyle = {
    border: '1px solid #ddd',
    padding: '12px',
  };
  const trHoverStyle = {
    backgroundColor: '#f5f5f5',
  };
  const buttonStyle = {
    padding: '6px 12px',
    margin: '2px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    backgroundColor: '#343a40', // Initial dark
    color: 'white',
    transition: 'background-color 0.3s', // For graded effect on click
  };

  return (
    <div style={{ display: 'flex', fontFamily: 'Poppins, sans-serif', background: '#f4f8fb', minHeight: '100vh' }}>
      {/* CSS to prevent hover from changing button color to white */}
      <style>
        {`
          .action-button:hover {
            background-color: #343a40 !important; /* Keep dark on hover */
            color: white !important;
          }
          .action-button.clicked {
            background-color: #6c757d; /* Lighter shade for graded effect after click */
          }
        `}
      </style>
      <div style={{ width: sidebarCollapsed ? '0' : '250px', background: '#007bff', color: 'black', padding: '1rem', transition: 'width 0.3s', overflow: 'hidden' }}>
        <button onClick={() => { console.log('Sidebar toggle clicked'); setSidebarCollapsed(!sidebarCollapsed); }} style={{ background: 'none', border: 'none', color: 'black', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
          ☰
        </button>
        <h2 style={{ color: 'black', fontWeight: 'bold' }}>Admin Menu</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><button onClick={() => { console.log('Create Doctor section clicked'); setActiveSection('createDoctor'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Create Doctor</button></li>
          <li><button onClick={() => { console.log('Create Patient section clicked'); setActiveSection('createPatient'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Create Patient</button></li>
          <li><button onClick={() => { console.log('Create Admin section clicked'); setActiveSection('createAdmin'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Create Admin</button></li>
          <li><button onClick={() => { console.log('Doctors section clicked'); setActiveSection('doctors'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Doctors</button></li>
          <li><button onClick={() => { console.log('Patients section clicked'); setActiveSection('patients'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Patients</button></li>
          <li><button onClick={() => { console.log('Admins section clicked'); setActiveSection('admins'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Admins</button></li>
          <li><button onClick={() => { console.log('Appointments section clicked'); setActiveSection('appointments'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Appointments</button></li>  
          <li><button onClick={() => { console.log('Reschedule Appointment section clicked'); setActiveSection('rescheduleAppointment'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Reschedule Appointment</button></li>
          <li><button onClick={() => { console.log('Reassign Appointment section clicked'); setActiveSection('reassignAppointment'); }} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>Reassign Appointment</button></li>
        </ul>
      </div>
      <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: activeSection === 'createDoctor' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Create Doctor</h3>
            <form onSubmit={(e) => { e.preventDefault(); createDoctor(); }}>
              <input type="text" placeholder="Full Name" value={newDoctor.fullName} onChange={(e) => setNewDoctor({ ...newDoctor, fullName: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="email" placeholder="Email" value={newDoctor.emailId} onChange={(e) => setNewDoctor({ ...newDoctor, emailId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="text" placeholder="Phone" value={newDoctor.phoneNumber} onChange={(e) => setNewDoctor({ ...newDoctor, phoneNumber: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="password" placeholder="Password" value={newDoctor.rawPassword} onChange={(e) => setNewDoctor({ ...newDoctor, rawPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="password" placeholder="Confirm Password" value={newDoctor.confirmPassword} onChange={(e) => setNewDoctor({ ...newDoctor, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}/>
              <select value={newDoctor.specialization} onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">Select Specialization</option>
                <option value="CARDIOLOGIST">Cardiologist</option>
                <option value="ORTHOPEDIC">Orthopedic</option>
                <option value="DENTIST">Dentist</option>
                <option value="GYNAECOLOGIST">Gynaecologist</option>
                <option value="NEUROLOGIST">Neurologist</option>
                <option value="GASTROENTEROLOGIST">Gastroenterologist</option>
                <option value="PEDIATRICS">Pediatrics</option>
                <option value="RADIOLOGY">Radiology</option>
                <option value="GENERAL_PHYSICIAN">General Physician</option>
                <option value="OTOLARYNGOLOGIST_ENT">Otolaryngologist ENT</option>
                <option value="ENDOCRINOLOGIST">Endocrinologist</option>
                <option value="ONCOLOGY">Oncology</option>
              </select>
              <input type="text" placeholder="Qualification" value={newDoctor.qualification} onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="number" placeholder="Experience Years" value={newDoctor.experienceYears} onChange={(e) => setNewDoctor({ ...newDoctor, experienceYears: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Create Doctor</button>
            </form>
          </div>
        </div>
        <div style={{ display: activeSection === 'createPatient' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Create Patient</h3>
            <form onSubmit={(e) => { e.preventDefault(); createPatient(); }}>
              <input type="text" placeholder="Full Name" value={newPatient.fullName} onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="email" placeholder="Email" value={newPatient.emailId} onChange={(e) => setNewPatient({ ...newPatient, emailId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="text" placeholder="Phone" value={newPatient.phoneNumber} onChange={(e) => setNewPatient({ ...newPatient, phoneNumber: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="password" placeholder="Password" value={newPatient.rawPassword} onChange={(e) => setNewPatient({ ...newPatient, rawPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="password" placeholder="Confirm Password" value={newPatient.confirmPassword} onChange={(e) => setNewPatient({ ...newPatient, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <select value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <input type="date" value={newPatient.dateOfBirth} onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Create Patient</button>
            </form>
          </div>
        </div>
        <div style={{ display: activeSection === 'createAdmin' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Create Admin</h3>
            <form onSubmit={(e) => { e.preventDefault(); createAdmin(); }}>
              <input type="text" placeholder="Full Name" value={newAdmin.fullName} onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="email" placeholder="Email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="text" placeholder="Phone" value={newAdmin.phoneNumber} onChange={(e) => setNewAdmin({ ...newAdmin, phoneNumber: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="password" placeholder="Password" value={newAdmin.rawPassword} onChange={(e) => setNewAdmin({ ...newAdmin, rawPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="password" placeholder="Confirm Password" value={newAdmin.confirmPassword} onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <label><input type="checkbox" checked={newAdmin.superAdmin} onChange={(e) => setNewAdmin({ ...newAdmin, superAdmin: e.target.checked })} /> Super Admin</label>
              <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Create Admin</button>
            </form>
          </div>
        </div>
        <div style={{ display: activeSection === 'doctors' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Doctors</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Specialization</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((d, index) => (
                  <tr key={d.userId} style={index % 2 === 0 ? {} : trHoverStyle} onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'} onMouseLeave={(e) => e.target.style.backgroundColor = index % 2 === 0 ? 'white' : '#f5f5f5'}>
                    <td style={tdStyle}>{d.fullName}</td>
                    <td style={tdStyle}>{d.specialization}</td>
                    <td style={tdStyle}>{d.emailId}</td>
                    <td style={tdStyle}>{d.status}</td>
                    <td style={tdStyle}>
                      {d.status.toUpperCase() === 'ACTIVE' && (
                        <>
                          <button className="action-button" style={{ ...buttonStyle, background: '#28a745' }} disabled>Approved</button>
                          <button className="action-button" onClick={() => blockUser(d.userId, 'BLOCKED')} style={{ ...buttonStyle, background: '#dc3545' }}>Block</button>
                        </>
                      )}
                      {d.status.toUpperCase() === 'INACTIVE' && (
                                                <>
                                                <button className="action-button" onClick={() => approveDoctor(d.userId)} style={{ ...buttonStyle, background: '#28a745' }}>Approve</button>
                                                <button className="action-button" onClick={() => blockUser(d.userId, 'BLOCKED')} style={{ ...buttonStyle, background: '#dc3545' }}>Block</button>
                                              </>
                                            )}
                                            {d.status.toUpperCase() === 'BLOCKED' && (
                                              <>
                                                <button className="action-button" onClick={() => approveDoctor(d.userId)} style={{ ...buttonStyle, background: '#28a745' }}>Approve</button>
                                                <button className="action-button" onClick={() => blockUser(d.userId, 'ACTIVE')} style={{ ...buttonStyle, background: '#dc3545' }}>Blocked</button>
                                              </>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div style={{ width: '200px', marginLeft: '2rem', marginTop: '-1rem' }}>
                                  <h4>Filters</h4>
                                  <select value={filters.doctors} onChange={(e) => setFilters({ ...filters, doctors: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                    <option value="all">All</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="approved">Approved</option>
                                    <option value="blocked">Blocked</option>
                                  </select>
                                </div>
                              </div>
                              <div style={{ display: activeSection === 'patients' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
                                <div style={{ flex: 1 }}>
                                  <h3>Patients</h3>
                                  <table style={tableStyle}>
                                    <thead>
                                      <tr>
                                        <th style={thStyle}>Name</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredPatients.map((p, index) => (
                                        <tr key={p.userId} style={index % 2 === 0 ? {} : trHoverStyle}>
                                          <td style={tdStyle}>{p.fullName}</td>
                                          <td style={tdStyle}>{p.status}</td>
                                          <td style={tdStyle}>
                                            {p.status.toUpperCase() === 'ACTIVE' && (
                                              <button className="action-button" onClick={() => blockUser(p.userId, 'BLOCKED')} style={{ ...buttonStyle, background: '#dc3545' }}>Block</button>
                                            )}
                                            {p.status.toUpperCase() === 'BLOCKED' && (
                                              <button className="action-button" onClick={() => blockUser(p.userId, 'ACTIVE')} style={{ ...buttonStyle, background: '#dc3545' }}>Blocked</button>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div style={{ width: '200px', marginLeft: '2rem', marginTop: '-1rem' }}>
                                  <h4>Filters</h4>
                                  <select value={filters.patients} onChange={(e) => setFilters({ ...filters, patients: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                    <option value="all">All</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                  </select>
                                </div>
                              </div>
                              <div style={{ display: activeSection === 'admins' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
                                <div style={{ flex: 1 }}>
                                  <h3>Admins</h3>
                                  <table style={tableStyle}>
                                    <thead>
                                      <tr>
                                        <th style={thStyle}>Name</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Super Admin</th>
                                        <th style={thStyle}>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredAdmins.map((a, index) => (
                                        <tr key={a.adminId} style={index % 2 === 0 ? {} : trHoverStyle}>
                                          <td style={tdStyle}>{a.fullName}</td>
                                          <td style={tdStyle}>{a.status}</td>
                                          <td style={tdStyle}>{a.superAdmin ? 'Yes' : 'No'}</td>
                                          <td style={tdStyle}>
                                            <button className="action-button" onClick={() => blockUser(a.adminId, 'BLOCKED')} style={{ ...buttonStyle, background: '#dc3545' }}>Block</button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div style={{ width: '200px', marginLeft: '2rem', marginTop: '-1rem' }}>
                                  <h4>Filters</h4>
                                  <select value={filters.admins} onChange={(e) => setFilters({ ...filters, admins: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                    <option value="all">All</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                  </select>
                                </div>
                              </div>
                              <div style={{ display: activeSection === 'appointments' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
                                <div style={{ flex: 1 }}>
                                  <h3>All Appointments</h3>
                                  <table style={tableStyle}>
                                    <thead>
                                      <tr>
                                        <th style={thStyle}>Appointment ID</th>
                                        <th style={thStyle}>Patient Name & ID</th>
                                        <th style={thStyle}>Doctor Name & Specialization</th>
                                        <th style={thStyle}>Date & Time</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredAppointments.length > 0 ? (
                                        filteredAppointments.map((ap, index) => (
                                          <tr key={ap.appointmentId || index} style={index % 2 === 0 ? {} : trHoverStyle}>
                                            <td style={tdStyle}>{ap.appointmentId}</td>
                                            <td style={tdStyle}>{ap.patient?.fullName || 'N/A'} ({ap.patient?.userId || 'N/A'})</td>
                                            <td style={tdStyle}>{ap.doctor ? `${ap.doctor.fullName} (${ap.doctor.specialization})` : 'Not Assigned'}</td>
                                            <td style={tdStyle}>{ap.scheduledDateTime || ap.preferredDate || 'N/A'}</td>
                                            <td style={tdStyle}>{ap.status}</td>
                                            <td style={tdStyle}>
                                              {ap.status === 'PENDING' && (
                                                <>
                                                  <button className="action-button" onClick={() => handleApprove(ap.appointmentId)} style={{ ...buttonStyle, background: '#28a745' }}>Approve</button>
                                                  <button className="action-button" onClick={() => reschedulePending(ap.appointmentId)} style={{ ...buttonStyle, background: '#ffc107' }}>Reschedule</button>
                                                  <button className="action-button" onClick={() => cancelAppointment(ap.appointmentId)} style={{ ...buttonStyle, background: '#dc3545' }}>Cancel</button>
                                                </>
                                              )}
                                              {ap.status === 'CANCELLED' && (
                                                <>
                                                  <button className="action-button" onClick={() => rescheduleCancelled(ap.appointmentId)} style={{ ...buttonStyle, background: '#ffc107' }}>Re-schedule</button>
                                                  <button className="action-button" onClick={() => archiveAppointment(ap.appointmentId)} style={{ ...buttonStyle, background: '#6c757d' }}>Archive</button>
                                                </>
                                              )}
                                              <button className="action-button" onClick={() => viewDetails(ap)} style={{ ...buttonStyle, background: '#17a2b8' }}>View Details</button>
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No appointments available.</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                                <div style={{ width: '200px', marginLeft: '2rem', marginTop: '-1rem' }}>
                                  <h4>Filters</h4>
                                  <select value={filters.appointments} onChange={(e) => setFilters({ ...filters, appointments: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                    <option value="all">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </div>
                              </div>
                              <div style={{ display: activeSection === 'rescheduleAppointment' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
                                <div style={{ flex: 1 }}>
                                  <h3>Reschedule Appointment</h3>
                                  <form onSubmit={(e) => { e.preventDefault(); rescheduleAppointment(); }}>
                                    <input type="number" placeholder="Appointment ID" value={rescheduleData.appointmentId} onChange={(e) => setRescheduleData({ ...rescheduleData, appointmentId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    <input type="datetime-local" value={rescheduleData.newRequestedDateTime} onChange={(e) => setRescheduleData({ ...rescheduleData, newRequestedDateTime: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    <input type="text" placeholder="Reason" value={rescheduleData.reason} onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Reschedule</button>
                                  </form>
                                </div>
                              </div>
                              <div style={{ display: activeSection === 'reassignAppointment' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
                                <div style={{ flex: 1 }}>
                                  <h3>Reassign Appointment</h3>
                                  <form onSubmit={(e) => { e.preventDefault(); reassignAppointment(); }}>
                                    <input type="number" placeholder="Appointment ID" value={reassignData.appointmentId} onChange={(e) => setReassignData({ ...reassignData, appointmentId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    <select value={reassignData.newDoctorUserId} onChange={(e) => setReassignData({ ...reassignData, newDoctorUserId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
                                      <option value="">Select New Doctor</option>
                                      {doctors.map(d => <option key={d.userId} value={d.userId}>{d.fullName} ({d.specialization})</option>)}
                                    </select>
                                    <input type="datetime-local" value={reassignData.requestedDateTime} onChange={(e) => setReassignData({ ...reassignData, requestedDateTime: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    <input type="text" placeholder="Reason" value={reassignData.reason} onChange={(e) => setReassignData({ ...reassignData, reason: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Reassign</button>
                                  </form>
                                </div>
                              </div>
                            </div>
                      
                            {showApproveModal && (
                              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                                <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', width: '400px' }}>
                                  <h3>Approve Appointment</h3>
                                  {error && <p style={{ color: 'red' }}>{error}</p>}
                                  <label>Doctor:</label>
                                  <select value={approveData.doctorUserId} onChange={(e) => setApproveData({ ...approveData, doctorUserId: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
                                    <option value="">Select Doctor</option>
                                    {doctors.map(d => <option key={d.userId} value={d.userId}>{d.fullName} ({d.specialization})</option>)}
                                  </select>
                                  <label>Date/Time:</label>
                                  <input type="datetime-local" value={approveData.requestedDateTime} onChange={(e) => setApproveData({ ...approveData, requestedDateTime: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
                                  <button onClick={submitApprove} style={{ ...buttonStyle, background: '#28a745', color: 'white', marginRight: '10px' }}>Approve</button>
                                  <button onClick={() => { setShowApproveModal(false); setError(''); }} style={{ ...buttonStyle, background: '#6c757d', color: 'white' }}>Cancel</button>
                                </div>
                              </div>
                            )}
                      
                            {showRescheduleModal && (
                              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                                <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', width: '400px' }}>
                                  <h3>Reschedule Cancelled Appointment</h3>
                                  {error && <p style={{ color: 'red' }}>{error}</p>}
                                  <label>Doctor:</label>
                                  <select value={rescheduleModalData.newDoctorUserId} onChange={(e) => setRescheduleModalData({ ...rescheduleModalData, newDoctorUserId: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
                                    <option value="">Select Doctor</option>
                                    {doctors.map(d => <option key={d.userId} value={d.userId}>{d.fullName} ({d.specialization})</option>)}
                                  </select>
                                  <label>Date/Time:</label>
                                  <input type="datetime-local" value={rescheduleModalData.requestedDateTime} onChange={(e) => setRescheduleModalData({ ...rescheduleModalData, requestedDateTime: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
                                  <label>Reason:</label>
                                  <input type="text" placeholder="Reason for reschedule" value={rescheduleModalData.reason} onChange={(e) => setRescheduleModalData({ ...rescheduleModalData, reason: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
                                  <button onClick={submitReschedule} style={{ ...buttonStyle, background: '#28a745', color: 'white', marginRight: '10px' }}>Reschedule</button>
            <button onClick={() => { setShowRescheduleModal(false); setError(''); }} style={{ ...buttonStyle, background: '#6c757d', color: 'white' }}>Cancel</button>
          </div>
        </div>
      )}

      {rescheduleModal && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
          <h3>Reschedule Appointment</h3>
          <p>Patient: {selectedAppointment?.patient?.fullName || 'N/A'}</p>
          <p>Current Date/Time: {selectedAppointment?.scheduledDateTime || 'N/A'}</p>
          <input type="datetime-local" value={newDateTime} onChange={(e) => setNewDateTime(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
          <button onClick={async () => {
            try {
              await adminAPI.rescheduleAppointment(selectedAppointment.appointmentId, { newRequestedDateTime: newDateTime });
              setRescheduleModal(false);
              setNewDateTime('');
              fetchData();
              alert('Appointment rescheduled successfully');
            } catch (err) {
              alert('Error rescheduling: ' + (err.response?.data?.message || err.message));
            }
          }} style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Confirm</button>
          <button onClick={() => setRescheduleModal(false)} style={{ ...buttonStyle, background: '#ccc', color: 'black' }}>Cancel</button>
        </div>
      )}

      {showPendingRescheduleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', width: '400px' }}>
            <h3>Reschedule Pending Appointment</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <label>Date/Time:</label>
            <input type="datetime-local" value={pendingRescheduleData.newRequestedDateTime} onChange={(e) => setPendingRescheduleData({ ...pendingRescheduleData, newRequestedDateTime: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
            <label>Reason:</label>
            <input type="text" placeholder="Reason for reschedule" value={pendingRescheduleData.reason} onChange={(e) => setPendingRescheduleData({ ...pendingRescheduleData, reason: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
            <button onClick={submitPendingReschedule} style={{ ...buttonStyle, background: '#28a745', color: 'white', marginRight: '10px' }}>Reschedule</button>
            <button onClick={() => { setShowPendingRescheduleModal(false); setError(''); }} style={{ ...buttonStyle, background: '#6c757d', color: 'white' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;