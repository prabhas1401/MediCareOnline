// import React, { useState, useEffect } from 'react';
// import { patientAPI, prescriptionAPI, paymentAPI, appointmentAPI } from '../services/api';

// const PatientDashboard = () => {
//   const [reconsultModal, setReconsultModal] = useState(false);
//   const [selectedAppointmentForReconsult, setSelectedAppointmentForReconsult] = useState(null);
//   const [activeSection, setActiveSection] = useState('profile');
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [profile, setProfile] = useState({ userId: '', fullName: '', emailId: '', phoneNumber: '', rawPassword: '' });
//   const [appointments, setAppointments] = useState([]);
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [newAppointment, setNewAppointment] = useState({ 
//     specialization: '', 
//     symptoms: [], 
//     additionalSymptoms: '', 
//     preferredDate: '' 
//   });
//   const [appointmentStats, setAppointmentStats] = useState({ upcoming: 0, pending: 0, completed: 0, cancelled: 0 });
//   const [filters, setFilters] = useState({ appointments: 'all', prescriptions: 'all', dateRange: '' });
//   const [search, setSearch] = useState('');
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [selectedPrescription, setSelectedPrescription] = useState(null);
//   const [rescheduleModal, setRescheduleModal] = useState(false);
//   const [newDateTime, setNewDateTime] = useState('');
//   const [refillModal, setRefillModal] = useState(false);
//   const [followUpModal, setFollowUpModal] = useState(false);
//   const [preferredDate, setPreferredDate] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [clickedButtons, setClickedButtons] = useState({});  // Added: State to track clicked buttons

//   const symptomOptions = [
//     'FEVER', 'COUGH', 'HEADACHE', 'CHEST_PAIN', 'NAUSEA', 'SHORTNESS_OF_BREATH', 'FATIGUE', 'OTHER'
//   ];

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [profileRes, appointmentsRes, prescriptionsRes] = await Promise.all([
//         patientAPI.getProfile().catch(() => ({ data: {} })),
//         patientAPI.getAppointments(),
//         prescriptionAPI.getPrescriptions().catch(() => ({ data: [] }))
//       ]);
//       setProfile({
//         userId: profileRes.data?.user?.userId || '',
//         fullName: profileRes.data?.user?.fullName || '',
//         emailId: profileRes.data?.user?.emailId || '',
//         phoneNumber: profileRes.data?.user?.phoneNumber || '',
//         rawPassword: ''
//       });
//       setAppointments(appointmentsRes.data || []);
//       setPrescriptions(prescriptionsRes.data || []);
//       calculateStats(appointmentsRes.data || []);
//       console.log('Fetched appointments:', appointmentsRes.data);
//       console.log('Fetched prescriptions:', prescriptionsRes.data);
//     } catch (err) {
//       console.error('Fetch error:', err);
//       alert('Error fetching data: ' + (err.response?.data?.message || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateStats = (apps) => {
//     const now = new Date();
//     const upcoming = apps.filter(a => new Date(a.scheduledDateTime) > now && a.status === 'CONFIRMED').length;
//     const pending = apps.filter(a => a.status === 'PENDING').length;
//     const completed = apps.filter(a => a.status === 'COMPLETED').length;
//     const cancelled = apps.filter(a => a.status === 'CANCELLED').length;
//     setAppointmentStats({ upcoming, pending, completed, cancelled });
//   };

//   const updateProfile = async () => {
//     console.log('Update Profile button clicked');
//     try {
//       const payload = {
//         fullName: profile.fullName || null,
//         emailId: profile.emailId || null,
//         phoneNumber: profile.phoneNumber || null,
//         rawPassword: profile.rawPassword || null
//       };
//       await patientAPI.updateProfile(payload);
//       alert('Profile updated successfully!');
//       fetchData();
//     } catch (err) {
//       console.error('Profile update error:', err);
//       alert('Error updating profile: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const createReconsult = async (originalAppointmentId) => {
//     try {
//       await appointmentAPI.createReconsult(originalAppointmentId);
//       alert('Reconsult scheduled successfully!');
//       fetchData();
//       setReconsultModal(false);
//     } catch (err) {
//       alert('Error scheduling reconsult: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const initiatePayment = async () => {
//     console.log('Pay Now button clicked');
//     try {
//       const paymentPayload = {
//         specialization: newAppointment.specialization,
//         symptoms: newAppointment.symptoms.join(','),
//         additionalSymptoms: newAppointment.additionalSymptoms,
//         preferredDate: new Date(newAppointment.preferredDate).toISOString().split('T')[0]
//       };
//       const response = await paymentAPI.initiate(paymentPayload);
//       const { orderId, amount, currency, patientId } = response.data;
//       const options = {
//         key: 'rzp_test_RVcBsWaU6E63ug',
//         amount: amount,
//         currency: currency,
//         order_id: orderId,
//         name: 'MediCare Appointment',
//         description: 'Appointment Booking',
//         handler: async (response) => {
//           const confirmPayload = {
//             orderId: response.razorpay_order_id,
//             paymentId: response.razorpay_payment_id,
//             signature: response.razorpay_signature,
//             method: 'CARD',
//             specialization: newAppointment.specialization,
//             symptoms: newAppointment.symptoms,
//             additionalSymptoms: newAppointment.additionalSymptoms,
//             preferredDate: newAppointment.preferredDate
//           };
//           try {
//             await appointmentAPI.confirmAfterPayment(confirmPayload);
//             alert('Appointment booked successfully after payment!');
//             setNewAppointment({ specialization: '', symptoms: [], additionalSymptoms: '', preferredDate: '' });
//             fetchData();
//           } catch (err) {
//             console.error('Confirmation error:', err);
//             alert('Payment successful, but appointment confirmation failed: ' + (err.response?.data?.message || err.message));
//           }
//         },
//         prefill: {
//           name: profile.fullName,
//           email: profile.emailId,
//           contact: profile.phoneNumber
//         },
//         theme: {
//           color: '#3399cc'
//         }
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.error('Payment initiation error:', err);
//       alert('Oops, something went wrong. Payment failed: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const cancelAppointment = async (id) => {
//     if (window.confirm('Are you sure you want to cancel this appointment?')) {
//       try {
//         await appointmentAPI.cancel(id);
//         alert('Appointment cancelled successfully!');
//         fetchData();
//       } catch (err) {
//         alert('Error cancelling appointment: ' + (err.response?.data?.message || err.message));
//       }
//     }
//   };

//   const rescheduleAppointment = async () => {
//     try {
//       await appointmentAPI.reschedule(selectedAppointment.appointmentId, { newRequestedDateTime: newDateTime });
//       alert('Appointment rescheduled successfully!');
//       setRescheduleModal(false);
//       fetchData();
//     } catch (err) {
//       alert('Error rescheduling appointment: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const downloadPdf = async (prescriptionId) => {
//     console.log('Download PDF button clicked for prescription ID:', prescriptionId);
//     try {
//       const response = await prescriptionAPI.downloadPdf(prescriptionId);
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//     } catch (err) {
//       console.error('Download PDF error:', err);
//       alert('Error downloading PDF: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const printPrescription = (prescription) => {
//     console.log('Print button clicked, prescription data:', prescription);  // Added: Log to check if advice is null in frontend
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//       <html>
//         <head><title>Prescription</title></head>
//         <body>
//           <h1>Prescription Details</h1>
//           <p><strong>Patient:</strong> ${profile.fullName}</p>
//           <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
//           <p><strong>Medications:</strong></p>
//           <ul>
//             ${prescription.medicines?.map(med => `<li>${med.name} - ${med.dosage} - ${med.frequency} - ${med.duration} days</li>`).join('')}
//           </ul>
//           <p><strong>Advice:</strong> ${prescription.advice || 'No advice provided'}</p>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   const requestRefill = async (prescriptionId) => {
//     console.log('Request Refill button clicked for prescription ID:', prescriptionId);
//     try {
//       await prescriptionAPI.requestRefill(prescriptionId);
//       alert('Refill requested successfully!');
//     } catch (err) {
//       console.error('Request Refill error:', err);
//       alert('Error requesting refill: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const bookFollowUp = async (prescriptionId) => {
//     console.log('Book Follow-up Confirm button clicked for prescription ID:', prescriptionId);
//     try {
//       await prescriptionAPI.bookFollowUp(prescriptionId, { preferredDate });
//       alert('Follow-up booked successfully!');
//       setFollowUpModal(false);
//       setPreferredDate('');
//       fetchData();
//     } catch (err) {
//       console.error('Book Follow-up error:', err);
//       alert('Error booking follow-up: ' + (err.response?.data?.message || err.message));
//     }
//   };

//   const filteredAppointments = appointments.filter(a => {
//     const matchesStatus = filters.appointments === 'all' || a.status.toLowerCase() === filters.appointments;
//     const matchesSearch = a.doctor?.fullName?.toLowerCase().includes(search.toLowerCase()) || a.specialization?.toLowerCase().includes(search.toLowerCase());
//     return matchesStatus && matchesSearch;
//   });

//   const filteredPrescriptions = prescriptions.filter(p => {
//     const matchesStatus = filters.prescriptions === 'all' || (p.status || 'ACTIVE').toLowerCase() === filters.prescriptions;
//     const matchesSearch = p.doctor?.fullName?.toLowerCase().includes(search.toLowerCase()) || (p.specialization || '').toLowerCase().includes(search.toLowerCase());
//     return matchesStatus && matchesSearch;
//   });

//   console.log('Filtered prescriptions:', filteredPrescriptions);  // Added: Debug filtered data

//   const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.9rem' };
//   const thStyle = { border: '1px solid #ddd', padding: '12px', backgroundColor: '#f2f2f2', textAlign: 'left' };
//   const tdStyle = { border: '1px solid #ddd', padding: '12px' };
//   const buttonStyle = { padding: '6px 12px', margin: '2px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

//   const getSidebarButtonStyle = (isActive) => ({
    
//     background: 'none',
//     border: 'none',
//     color: 'black',
//     cursor: 'pointer',
//     fontWeight: isActive ? 'bold' : 'normal'
//   });

//   const getActionButtonStyle = (buttonKey) => ({
//     ...buttonStyle,
//     background: clickedButtons[buttonKey] ? 'lightgreen' : 'green',
//     color: 'black'
//   });

//   return (
//     <div style={{ display: 'flex', fontFamily: 'Poppins, sans-serif', background: '#f4f8fb', minHeight: '100vh' }}>
//       <div style={{ width: sidebarCollapsed ? '0' : '250px', background: 'white', color: 'black', padding: '1rem', transition: 'width 0.3s', overflow: 'hidden' }}>
//         <button onClick={() => { console.log('Sidebar toggle clicked'); setSidebarCollapsed(!sidebarCollapsed); }} style={{ background: 'none', border: 'none', color: 'black', fontSize: '1.5rem', cursor: 'pointer' }}>
//           ☰
//         </button>
//         <h2>Patient Menu</h2>
//         <ul style={{ listStyle: 'none', padding: 0 }}>
//           <li><button onClick={() => { console.log('Profile section clicked'); setActiveSection('profile'); }} style={getSidebarButtonStyle(activeSection === 'profile')}>Update Profile</button></li>
//           <li><button onClick={() => { console.log('Book Appointment section clicked'); setActiveSection('bookAppointment'); }} style={getSidebarButtonStyle(activeSection === 'bookAppointment')}>Book Appointment</button></li>
//           <li><button onClick={() => { console.log('Appointments section clicked'); setActiveSection('appointments'); }} style={getSidebarButtonStyle(activeSection === 'appointments')}>Your Appointments</button></li>
//           <li><button onClick={() => { console.log('Prescriptions section clicked'); setActiveSection('prescriptions'); }} style={getSidebarButtonStyle(activeSection === 'prescriptions')}>Your Prescriptions</button></li>
//         </ul>
//       </div>
//       <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
//         {loading && <p>Loading...</p>}
//         <div style={{ display: activeSection === 'profile' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
//           <div style={{ flex: 1 }}>
//             <h3>Update Profile</h3>
//             <form onSubmit={(e) => { e.preventDefault(); updateProfile(); }}>
//               <input type="text" placeholder="Full Name" value={profile.fullName || ''} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="email" placeholder="Email" value={profile.emailId || ''} onChange={(e) => setProfile({ ...profile, emailId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="text" placeholder="Phone" value={profile.phoneNumber || ''} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="password" placeholder="Password" value={profile.rawPassword || ''} onChange={(e) => setProfile({ ...profile, rawPassword: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Update Profile</button>
//             </form>
//           </div>
//         </div>
//         <div style={{ display: activeSection === 'bookAppointment' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
//           <div style={{ flex: 1 }}>
//             <h3>Book Appointment</h3>
//             <form onSubmit={(e) => { e.preventDefault(); initiatePayment(); }}>
//               <select value={newAppointment.specialization} onChange={(e) => setNewAppointment({ ...newAppointment, specialization: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
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
//               <label>Symptoms (Select one or more):</label>
//               <div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 0' }}>
//                 {symptomOptions.map(symptom => (
//                   <label key={symptom} style={{ margin: '5px', display: 'flex', alignItems: 'center' }}>
//                     <input
//                       type="checkbox"
//                       value={symptom}
//                       checked={newAppointment.symptoms.includes(symptom)}
//                       onChange={(e) => {
//                         const { value, checked } = e.target;
//                         setNewAppointment(prev => ({
//                           ...prev,
//                           symptoms: checked ? [...prev.symptoms, value] : prev.symptoms.filter(s => s !== value)
//                         }));
//                       }}
//                     />
//                     {symptom.replace('_', ' ')}
//                   </label>
//                 ))}
//               </div>
//               <input type="text" placeholder="Additional Symptoms" value={newAppointment.additionalSymptoms} onChange={(e) => setNewAppointment({ ...newAppointment, additionalSymptoms: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <input type="datetime-local" value={newAppointment.preferredDate} onChange={(e) => setNewAppointment({ ...newAppointment, preferredDate: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//               <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Pay Now (₹500)</button>
//             </form>
//           </div>
//         </div>
//         <div style={{ display: activeSection === 'appointments' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1, flexDirection: 'column' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
//             <div style={{ textAlign: 'center', padding: '1rem', background: '#e9ecef', borderRadius: '8px' }}>🗓️ Upcoming: {appointmentStats.upcoming}</div>
//             <div style={{ textAlign: 'center', padding: '1rem', background: '#e9ecef', borderRadius: '8px' }}>⏳ Pending: {appointmentStats.pending}</div>
//             <div style={{ textAlign: 'center', padding: '1rem', background: '#e9ecef', borderRadius: '8px' }}>✅ Completed: {appointmentStats.completed}</div>
//             <div style={{ textAlign: 'center', padding: '1rem', background: '#e9ecef', borderRadius: '8px' }}>❌ Cancelled: {appointmentStats.cancelled}</div>
//           </div>
//           <div style={{ display: 'flex', marginBottom: '1rem' }}>
//             <input type="text" placeholder="Search by doctor or department" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
//             <select value={filters.appointments} onChange={(e) => setFilters({ ...filters, appointments: e.target.value })} style={{ marginLeft: '1rem', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
//               <option value="all">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="confirmed">Confirmed</option>
//               <option value="completed">Completed</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>
//           <table style={tableStyle}>
//             <thead>
//               <tr>
//                 <th style={thStyle}>Appointment ID</th>
//                 {/* <th style={thStyle}>Doctor Name</th> */}
//                 <th style={thStyle}>Specialization</th>
//                 <th style={thStyle}>Date & Time</th>
//                 <th style={thStyle}>Status</th>
//                 <th style={thStyle}>Booking Date</th>
//                 <th style={thStyle}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredAppointments.map((a, index) => (
//                 <tr key={a.appointmentId} style={index % 2 === 0 ? {} : { backgroundColor: '#f9f9f9' }}>
//                   <td style={tdStyle}>{a.appointmentId}</td>
//                   {/* <td style={tdStyle}>{a.doctor?.fullName || 'Not Assigned'}</td> */}
//                   <td style={tdStyle}>{a.specialization || 'N/A'}</td>
//                   <td style={tdStyle}>{a.scheduledDateTime || a.preferredDate || 'N/A'}</td>
//                   <td style={tdStyle}>
//                     <span style={{
//                       color: a.status === 'CONFIRMED' ? 'green' : a.status === 'PENDING' ? 'orange' : a.status === 'COMPLETED' ? 'blue' : 'red',
//                       fontWeight: 'bold'
//                     }}>
//                       {a.status}
//                     </span>
//                   </td>
//                   <td style={tdStyle}>{a.createdAt}</td>
//                   <td style={tdStyle}>
//                     <button style={{ ...getActionButtonStyle(`view-${a.appointmentId}`), background: '#17a2b8', color: 'white' }} onClick={() => { console.log('View Details clicked'); setSelectedAppointment(a); setClickedButtons(prev => ({ ...prev, [`view-${a.appointmentId}`]: true })); }}>View Details</button>
//                     <button style={getActionButtonStyle(`cancel-${a.appointmentId}`)} onClick={() => { cancelAppointment(a.appointmentId); setClickedButtons(prev => ({ ...prev, [`cancel-${a.appointmentId}`]: true })); }}>Cancel</button>
//                     {a.status === 'COMPLETED' && (
//                       <button style={getActionButtonStyle(`reconsult-${a.appointmentId}`)} onClick={() => { setSelectedAppointmentForReconsult(a); setReconsultModal(true); setClickedButtons(prev => ({ ...prev, [`reconsult-${a.appointmentId}`]: true })); }}>Schedule Reconsult</button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {selectedAppointment && (
//             <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
//               <h4>Appointment Details</h4>
//               <p><strong>Appointment ID:</strong> {selectedAppointment.appointmentId}</p>
//               <p><strong>Doctor:</strong> {selectedAppointment.doctor?.fullName}</p>
//               <p><strong>Specialization:</strong> {selectedAppointment.specialization}</p>
//               <p><strong>Status:</strong> {selectedAppointment.status}</p>
//               <p><strong>Scheduled Date/Time:</strong> {selectedAppointment.scheduledDateTime}</p>
//               <p><strong>Symptoms:</strong> {selectedAppointment.symptoms}</p>
//               <p><strong>Additional Symptoms:</strong> {selectedAppointment.additionalSymptoms}</p>
//               <p><strong>Preferred Date:</strong> {selectedAppointment.preferredDate}</p>
//               <p><strong>Fee:</strong> ₹{selectedAppointment.fee}</p>
//               <p><strong>Meeting Link:</strong> <a href={selectedAppointment.meetingLink} target="_blank" rel="noopener noreferrer">{selectedAppointment.meetingLink}</a></p>
//             </div>
//           )}
//         </div>
//         <div style={{ display: activeSection === 'prescriptions' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1, flexDirection: 'column' }}>
//           <div style={{ display: 'flex', marginBottom: '1rem' }}>
//             <input type="text" placeholder="Search by doctor or department" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
//             <select value={filters.prescriptions} onChange={(e) => setFilters({ ...filters, prescriptions: e.target.value })} style={{ marginLeft: '1rem', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
//               <option value="all">All Status</option>
//               <option value="active">Active</option>
//               <option value="expired">Expired</option>
//             </select>
//             <button onClick={fetchData} style={{ ...buttonStyle, background: '#28a745', color: 'white', marginLeft: '1rem' }}>Refresh</button>
//           </div>
//           <table style={tableStyle}>
//             <thead>
//               <tr>
//                 <th style={thStyle}>Prescription ID</th>
//                 {/* <th style={thStyle}>Doctor Name</th>
//                 <th style={thStyle}>Specialization</th>
//                 <th style={thStyle}>Appointment Date</th> */}
//                 <th style={thStyle}>Prescription Date</th>
//                 <th style={thStyle}>Status</th>
//                 <th style={thStyle}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(() => {
//                 console.log('Filtered prescriptions data:', filteredPrescriptions);
//                 return filteredPrescriptions.length > 0 ? filteredPrescriptions.map((p, index) => (
//                   <tr key={p.prescriptionId} style={index % 2 === 0 ? {} : { backgroundColor: '#f9f9f9' }}>
//                     <td style={tdStyle}>{p.prescriptionId}</td>
//                     {/* <td style={tdStyle}>{p.doctor?.fullName || p.doctorName || 'Not Assigned'}</td>
//                     <td style={tdStyle}>{p.doctor?.specialization || p.specialization || 'N/A'}</td>
//                     <td style={tdStyle}>{p.appointmentDate || 'N/A'}</td> */}
//                     <td style={tdStyle}>{p.issuedAt}</td>
//                     <td style={tdStyle}>
//                       <span style={{ color: (p.status || 'ACTIVE') === 'ACTIVE' ? 'green' : 'red', fontWeight: 'bold' }}>
//                         {p.status || 'ACTIVE'}
//                       </span>
//                     </td>
//                     <td style={tdStyle}>
//                       <button style={{ ...getActionButtonStyle(`view-${p.prescriptionId}`), background: '#17a2b8', color: 'white' }} onClick={() => { console.log('View Prescription clicked'); setSelectedPrescription(p); setClickedButtons(prev => ({ ...prev, [`view-${p.prescriptionId}`]: true })); }}>View</button>
//                       <button style={getActionButtonStyle(`download-${p.prescriptionId}`)} onClick={() => { downloadPdf(p.prescriptionId); setClickedButtons(prev => ({ ...prev, [`download-${p.prescriptionId}`]: true })); }}>Download PDF</button>
//                       <button style={getActionButtonStyle(`print-${p.prescriptionId}`)} onClick={() => { printPrescription(p); setClickedButtons(prev => ({ ...prev, [`print-${p.prescriptionId}`]: true })); }}>Print</button>
//                       <button style={getActionButtonStyle(`refill-${p.prescriptionId}`)} onClick={() => { requestRefill(p.prescriptionId); setClickedButtons(prev => ({ ...prev, [`refill-${p.prescriptionId}`]: true })); }}>Request Refill</button>
//                       <button style={getActionButtonStyle(`followup-${p.prescriptionId}`)} onClick={() => { console.log('Book Follow-up clicked'); setSelectedPrescription(p); setFollowUpModal(true); setClickedButtons(prev => ({ ...prev, [`followup-${p.prescriptionId}`]: true })); }}>Book Follow-up</button>
//                     </td>
//                   </tr>
//                 )) : (
//                   <tr>
//                     <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No prescriptions found. Try refreshing or check if prescriptions have been added.</td>
//                   </tr>
//                 );
//               })()}
//             </tbody>
//           </table>
//           {selectedPrescription && (
//             <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
//               <h4>Prescription Details</h4>
//               <p><strong>Patient:</strong> {profile.fullName} (ID: {profile.userId})</p>
//               <p><strong>Diagnosis:</strong> {selectedPrescription.diagnosis}</p>
//               <p><strong>Medications:</strong></p>
//               <ul>
//                 {selectedPrescription.medicines?.length > 0 ? selectedPrescription.medicines.map((med, idx) => (
//                   <li key={idx}>{med.name} - {med.dosage} - {med.frequency} - {med.duration} days - Notes: {med.notes}</li>
//                 )) : <li>No medications listed.</li>}
//               </ul>
//               <p><strong>Advice:</strong> {selectedPrescription.advice}</p>
//             </div>
//           )}
//         </div>
//         {reconsultModal && (
//           <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
//             <h3>Schedule Reconsult</h3>
//             <p>Appointment ID: {selectedAppointmentForReconsult?.appointmentId}</p>
//             <p>Doctor: {selectedAppointmentForReconsult?.doctor?.fullName}</p>
//             <p>This will create a new reconsult request for this completed appointment.</p>
//             <button onClick={() => createReconsult(selectedAppointmentForReconsult.appointmentId)} style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Confirm</button>
//             <button onClick={() => setReconsultModal(false)} style={{ ...buttonStyle, background: '#ccc', color: 'black' }}>Cancel</button>
//           </div>
//         )}
//         {rescheduleModal && (
//           <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
//             <h3>Reschedule Appointment</h3>
//             <p>Doctor: {selectedAppointment?.doctor?.fullName}</p>
//             <p>Current Date/Time: {selectedAppointment?.scheduledDateTime}</p>
//             <input type="datetime-local" value={newDateTime} onChange={(e) => setNewDateTime(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//             <button onClick={rescheduleAppointment} style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Confirm</button>
//             <button onClick={() => { console.log('Reschedule Cancel clicked'); setRescheduleModal(false); }} style={{ ...buttonStyle, background: '#ccc', color: 'black' }}>Cancel</button>
//           </div>
//         )}
//         {followUpModal && (
//           <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
//             <h3>Book Follow-up</h3>
//             <p>Prescription ID: {selectedPrescription?.prescriptionId}</p>
//             <input type="datetime-local" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
//             <button onClick={() => bookFollowUp(selectedPrescription.prescriptionId)} style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Confirm</button>
//             <button onClick={() => { console.log('Follow-up Cancel clicked'); setFollowUpModal(false); }} style={{ ...buttonStyle, background: '#ccc', color: 'black' }}>Cancel</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PatientDashboard;


import React, { useState, useEffect } from 'react';
import { patientAPI, prescriptionAPI, paymentAPI, appointmentAPI } from '../services/api';

const PatientDashboard = () => {
  const [reconsultModal, setReconsultModal] = useState(false);
  const [selectedAppointmentForReconsult, setSelectedAppointmentForReconsult] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState({ userId: '', fullName: '', emailId: '', phoneNumber: '', rawPassword: '' });
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [newAppointment, setNewAppointment] = useState({ 
    specialization: '', 
    symptoms: [], 
    additionalSymptoms: '', 
    preferredDate: '' 
  });
  const [appointmentStats, setAppointmentStats] = useState({ upcoming: 0, pending: 0, completed: 0, cancelled: 0 });
  const [filters, setFilters] = useState({ appointments: 'all', prescriptions: 'all', dateRange: '' });
  const [search, setSearch] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [newDateTime, setNewDateTime] = useState('');
  const [refillModal, setRefillModal] = useState(false);
  const [followUpModal, setFollowUpModal] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [clickedButtons, setClickedButtons] = useState({});  // Added: State to track clicked buttons

  const symptomOptions = [
    'FEVER', 'COUGH', 'HEADACHE', 'CHEST_PAIN', 'NAUSEA', 'SHORTNESS_OF_BREATH', 'FATIGUE', 'OTHER'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, appointmentsRes, prescriptionsRes] = await Promise.all([
        patientAPI.getProfile().catch(() => ({ data: {} })),
        patientAPI.getAppointments(),
        prescriptionAPI.getPrescriptions().catch(() => ({ data: [] }))
      ]);
      setProfile({
        userId: profileRes.data?.user?.userId || '',
        fullName: profileRes.data?.user?.fullName || '',
        emailId: profileRes.data?.user?.emailId || '',
        phoneNumber: profileRes.data?.user?.phoneNumber || '',
        rawPassword: ''
      });
      setAppointments(appointmentsRes.data || []);
      setPrescriptions(prescriptionsRes.data || []);
      calculateStats(appointmentsRes.data || []);
      console.log('Fetched appointments:', appointmentsRes.data);
      console.log('Fetched prescriptions:', prescriptionsRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Error fetching data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps) => {
    const now = new Date();
    const upcoming = apps.filter(a => new Date(a.scheduledDateTime) > now && a.status === 'CONFIRMED').length;
    const pending = apps.filter(a => a.status === 'PENDING').length;
    const completed = apps.filter(a => a.status === 'COMPLETED').length;
    const cancelled = apps.filter(a => a.status === 'CANCELLED').length;
    setAppointmentStats({ upcoming, pending, completed, cancelled });
  };

  const updateProfile = async () => {
    console.log('Update Profile button clicked');
    try {
      const payload = {
        fullName: profile.fullName || null,
        emailId: profile.emailId || null,
        phoneNumber: profile.phoneNumber || null,
        rawPassword: profile.rawPassword || null
      };
      await patientAPI.updateProfile(payload);
      alert('Profile updated successfully!');
      fetchData();
    } catch (err) {
      console.error('Profile update error:', err);
      alert('Error updating profile: ' + (err.response?.data?.message || err.message));
    }
  };

  // const createReconsult = async (originalAppointmentId) => {
  //   try {
  //     await appointmentAPI.createReconsult(originalAppointmentId);
  //     alert('Reconsult scheduled successfully!');
  //     fetchData();
  //     setReconsultModal(false);
  //   } catch (err) {
  //     alert('Error scheduling reconsult: ' + (err.response?.data?.message || err.message));
  //   }
  // };
  const createReconsult = async (originalAppointmentId) => {
    console.log('Creating reconsult for appointment ID:', originalAppointmentId);
    try {
      await appointmentAPI.createReconsult(originalAppointmentId);
      alert('Reconsult scheduled successfully!');
      fetchData();
      setReconsultModal(false);
    } catch (err) {
      console.error('Reconsult error details:', err.response?.data);  // Added for debugging
      alert('Error scheduling reconsult: ' + (err.response?.data?.message || err.message));
    }
  };

  const initiatePayment = async () => {
    console.log('Pay Now button clicked');
    try {
      const paymentPayload = {
        specialization: newAppointment.specialization,
        symptoms: newAppointment.symptoms.join(','),
        additionalSymptoms: newAppointment.additionalSymptoms,
        preferredDate: new Date(newAppointment.preferredDate).toISOString().split('T')[0]
      };
      const response = await paymentAPI.initiate(paymentPayload);
      const { orderId, amount, currency, patientId } = response.data;
      const options = {
        key: 'rzp_test_RVcBsWaU6E63ug',
        amount: amount,
        currency: currency,
        order_id: orderId,
        name: 'MediCare Appointment',
        description: 'Appointment Booking',
        handler: async (response) => {
          const confirmPayload = {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            method: 'CARD',
            specialization: newAppointment.specialization,
            symptoms: newAppointment.symptoms,
            additionalSymptoms: newAppointment.additionalSymptoms,
            preferredDate: newAppointment.preferredDate
          };
          try {
            await appointmentAPI.confirmAfterPayment(confirmPayload);
            alert('Appointment booked successfully after payment!');
            setNewAppointment({ specialization: '', symptoms: [], additionalSymptoms: '', preferredDate: '' });
            fetchData();
          } catch (err) {
            console.error('Confirmation error:', err);
            alert('Payment successful, but appointment confirmation failed: ' + (err.response?.data?.message || err.message));
          }
        },
        prefill: {
          name: profile.fullName,
          email: profile.emailId,
          contact: profile.phoneNumber
        },
        theme: {
          color: '#3399cc'
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
      alert('Oops, something went wrong. Payment failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const cancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.cancel(id);
        alert('Appointment cancelled successfully!');
        fetchData();
      } catch (err) {
        alert('Error cancelling appointment: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const rescheduleAppointment = async () => {
    try {
      await appointmentAPI.reschedule(selectedAppointment.appointmentId, { newRequestedDateTime: newDateTime });
      alert('Appointment rescheduled successfully!');
      setRescheduleModal(false);
      fetchData();
    } catch (err) {
      alert('Error rescheduling appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  const downloadPdf = async (prescriptionId) => {
    console.log('Download PDF button clicked for prescription ID:', prescriptionId);
    try {
      const response = await prescriptionAPI.downloadPdf(prescriptionId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Download PDF error:', err);
      alert('Error downloading PDF: ' + (err.response?.data?.message || err.message));
    }
  };

  const printPrescription = (prescription) => {
    console.log('Print button clicked, prescription data:', prescription);  // Added: Log to check if advice is null in frontend
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Prescription</title></head>
        <body>
          <h1>Prescription Details</h1>
          <p><strong>Patient:</strong> ${profile.fullName}</p>
          <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
          <p><strong>Medications:</strong></p>
          <ul>
            ${prescription.medicines?.map(med => `<li>${med.name} - ${med.dosage} - ${med.frequency} - ${med.duration} days</li>`).join('')}
          </ul>
          <p><strong>Advice:</strong> ${prescription.advice || 'No advice provided'}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const requestRefill = async (prescriptionId) => {
    console.log('Request Refill button clicked for prescription ID:', prescriptionId);
    try {
      await prescriptionAPI.requestRefill(prescriptionId);
      alert('Refill requested successfully!');
    } catch (err) {
      console.error('Request Refill error:', err);
      alert('Error requesting refill: ' + (err.response?.data?.message || err.message));
    }
  };

  const bookFollowUp = async (prescriptionId) => {
    console.log('Book Follow-up Confirm button clicked for prescription ID:', prescriptionId);
    try {
      await prescriptionAPI.bookFollowUp(prescriptionId, { preferredDate });
      alert('Follow-up booked successfully!');
      setFollowUpModal(false);
      setPreferredDate('');
      fetchData();
    } catch (err) {
      console.error('Book Follow-up error:', err);
      alert('Error booking follow-up: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesStatus = filters.appointments === 'all' || a.status.toLowerCase() === filters.appointments;
    const matchesSearch = a.doctor?.fullName?.toLowerCase().includes(search.toLowerCase()) || a.specialization?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesStatus = filters.prescriptions === 'all' || (p.status || 'ACTIVE').toLowerCase() === filters.prescriptions;
    const matchesSearch = p.doctor?.fullName?.toLowerCase().includes(search.toLowerCase()) || (p.specialization || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  console.log('Filtered prescriptions:', filteredPrescriptions);  // Added: Debug filtered data

  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.9rem' };
  const thStyle = { border: '1px solid #ddd', padding: '12px', backgroundColor: '#f2f2f2', textAlign: 'left' };
  const tdStyle = { border: '1px solid #ddd', padding: '12px' };
  const buttonStyle = { padding: '6px 12px', margin: '2px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

  const getSidebarButtonStyle = (isActive) => ({
    
    background: 'none',
    border: 'none',
    color: 'black',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal'
  });

  const getActionButtonStyle = (buttonKey) => ({
    ...buttonStyle,
    background: clickedButtons[buttonKey] ? 'lightgreen' : 'green',
    color: 'black'
  });

  return (
    <div style={{ display: 'flex', fontFamily: 'Poppins, sans-serif', background: '#f4f8fb', minHeight: '100vh' }}>
      <div style={{ width: sidebarCollapsed ? '0' : '250px', background: 'white', color: 'black', padding: '1rem', transition: 'width 0.3s', overflow: 'hidden' }}>
        <button onClick={() => { console.log('Sidebar toggle clicked'); setSidebarCollapsed(!sidebarCollapsed); }} style={{ background: 'none', border: 'none', color: 'black', fontSize: '1.5rem', cursor: 'pointer' }}>
          ☰
        </button>
        <h2>Patient Menu</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><button onClick={() => { console.log('Profile section clicked'); setActiveSection('profile'); }} style={getSidebarButtonStyle(activeSection === 'profile')}>Update Profile</button></li>
          <li><button onClick={() => { console.log('Book Appointment section clicked'); setActiveSection('bookAppointment'); }} style={getSidebarButtonStyle(activeSection === 'bookAppointment')}>Book Appointment</button></li>
          <li><button onClick={() => { console.log('Appointments section clicked'); setActiveSection('appointments'); }} style={getSidebarButtonStyle(activeSection === 'appointments')}>Your Appointments</button></li>
          <li><button onClick={() => { console.log('Prescriptions section clicked'); setActiveSection('prescriptions'); }} style={getSidebarButtonStyle(activeSection === 'prescriptions')}>Your Prescriptions</button></li>
        </ul>
      </div>
      <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        {loading && <p>Loading...</p>}
        <div style={{ display: activeSection === 'profile' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Update Profile</h3>
            <form onSubmit={(e) => { e.preventDefault(); updateProfile(); }}>
              <input type="text" placeholder="Full Name" value={profile.fullName || ''} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="email" placeholder="Email" value={profile.emailId || ''} onChange={(e) => setProfile({ ...profile, emailId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="text" placeholder="Phone" value={profile.phoneNumber || ''} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="password" placeholder="Password" value={profile.rawPassword || ''} onChange={(e) => setProfile({ ...profile, rawPassword: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Update Profile</button>
            </form>
          </div>
        </div>
        <div style={{ display: activeSection === 'bookAppointment' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Book Appointment</h3>
            <form onSubmit={(e) => { e.preventDefault(); initiatePayment(); }}>
              <select value={newAppointment.specialization} onChange={(e) => setNewAppointment({ ...newAppointment, specialization: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
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
              <label>Symptoms (Select one or more):</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 0' }}>
                {symptomOptions.map(symptom => (
                  <label key={symptom} style={{ margin: '5px', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      value={symptom}
                      checked={newAppointment.symptoms.includes(symptom)}
                      onChange={(e) => {
                        const { value, checked } = e.target;
                                                setNewAppointment(prev => ({
                          ...prev,
                          symptoms: checked ? [...prev.symptoms, value] : prev.symptoms.filter(s => s !== value)
                        }));
                      }}
                    />
                    {symptom.replace('_', ' ')}
                  </label>
                ))}
              </div>
              <input type="text" placeholder="Additional Symptoms" value={newAppointment.additionalSymptoms} onChange={(e) => setNewAppointment({ ...newAppointment, additionalSymptoms: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="datetime-local" value={newAppointment.preferredDate} onChange={(e) => setNewAppointment({ ...newAppointment, preferredDate: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Pay Now (₹500)</button>
            </form>
          </div>
        </div>
        <div style={{ display: activeSection === 'appointments' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1, flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#e9ecef', borderRadius: '8px' }}>🗓️ Upcoming: {appointmentStats.upcoming}</div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#e9ecef', borderRadius: '8px' }}>⏳ Pending: {appointmentStats.pending}</div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#e9ecef', borderRadius: '8px' }}>✅ Completed: {appointmentStats.completed}</div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#e9ecef', borderRadius: '8px' }}>❌ Cancelled: {appointmentStats.cancelled}</div>
          </div>
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <input type="text" placeholder="Search by doctor or department" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <select value={filters.appointments} onChange={(e) => setFilters({ ...filters, appointments: e.target.value })} style={{ marginLeft: '1rem', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Appointment ID</th>
                <th style={thStyle}>Specialization</th>
                <th style={thStyle}>Date & Time</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Booking Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a, index) => (
                <tr key={a.appointmentId} style={index % 2 === 0 ? {} : { backgroundColor: '#f9f9f9' }}>
                  <td style={tdStyle}>{a.appointmentId}</td>
                  <td style={tdStyle}>{a.specialization || 'N/A'}</td>
                  <td style={tdStyle}>{a.scheduledDateTime || a.preferredDate || 'N/A'}</td>
                  <td style={tdStyle}>
                    <span style={{
                      color: a.status === 'CONFIRMED' ? 'green' : a.status === 'PENDING' ? 'orange' : a.status === 'COMPLETED' ? 'blue' : 'red',
                      fontWeight: 'bold'
                    }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={tdStyle}>{a.createdAt}</td>
                  <td style={tdStyle}>
                    {a.status === 'CANCELLED' && (
                      <button style={{ ...getActionButtonStyle(`view-${a.appointmentId}`), background: '#17a2b8', color: 'white' }} onClick={() => { console.log('View Details clicked'); setSelectedAppointment(a); setClickedButtons(prev => ({ ...prev, [`view-${a.appointmentId}`]: true })); }}>View Details</button>
                    )}
                    {a.status === 'COMPLETED' && (
                      <>
                        <button style={{ ...getActionButtonStyle(`view-${a.appointmentId}`), background: '#17a2b8', color: 'white' }} onClick={() => { console.log('View Details clicked'); setSelectedAppointment(a); setClickedButtons(prev => ({ ...prev, [`view-${a.appointmentId}`]: true })); }}>View Details</button>
                        <button style={getActionButtonStyle(`reconsult-${a.appointmentId}`)} onClick={() => { setSelectedAppointmentForReconsult(a); setReconsultModal(true); setClickedButtons(prev => ({ ...prev, [`reconsult-${a.appointmentId}`]: true })); }}>Schedule Reconsult</button>
                      </>
                    )}
                    {a.status === 'CONFIRMED' && (
                      <button style={{ ...getActionButtonStyle(`view-${a.appointmentId}`), background: '#17a2b8', color: 'white' }} onClick={() => { console.log('View Details clicked'); setSelectedAppointment(a); setClickedButtons(prev => ({ ...prev, [`view-${a.appointmentId}`]: true })); }}>View Details</button>
                    )}
                    {a.status === 'PENDING' && (
                      <>
                        <button style={{ ...getActionButtonStyle(`view-${a.appointmentId}`), background: '#17a2b8', color: 'white' }} onClick={() => { console.log('View Details clicked'); setSelectedAppointment(a); setClickedButtons(prev => ({ ...prev, [`view-${a.appointmentId}`]: true })); }}>View Details</button>
                        <button style={getActionButtonStyle(`cancel-${a.appointmentId}`)} onClick={() => { cancelAppointment(a.appointmentId); setClickedButtons(prev => ({ ...prev, [`cancel-${a.appointmentId}`]: true })); }}>Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedAppointment && (
  <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
    <h4>Appointment Details</h4>
    <p><strong>Appointment ID:</strong> {selectedAppointment.appointmentId}</p>
    {/* <p><strong>Doctor:</strong> {selectedAppointment.doctor?.fullName || selectedAppointment.doctorName || (selectedAppointment.status === 'PENDING' ? 'Not Assigned (Pending Approval)' : 'Not Assigned')}</p> */}
    <p><strong>Specialization:</strong> {selectedAppointment.specialization}</p>
    <p><strong>Status:</strong> {selectedAppointment.status}</p>
    <p><strong>Scheduled Date/Time:</strong> {selectedAppointment.scheduledDateTime}</p>
    <p><strong>Symptoms:</strong> {selectedAppointment.symptoms}</p>
    <p><strong>Additional Symptoms:</strong> {selectedAppointment.additionalSymptoms}</p>
    <p><strong>Preferred Date:</strong> {selectedAppointment.preferredDate}</p>
    <p><strong>Fee:</strong> ₹{selectedAppointment.fee}</p>
    <p><strong>Meeting Link:</strong> <a href={selectedAppointment.meetingLink} target="_blank" rel="noopener noreferrer">{selectedAppointment.meetingLink}</a></p>
  </div>
)}

          {/* {selectedAppointment && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4>Appointment Details</h4>
              <p><strong>Appointment ID:</strong> {selectedAppointment.appointmentId}</p>
              <p><strong>Doctor:</strong> {selectedAppointment.doctor?.fullName}</p>
              <p><strong>Specialization:</strong> {selectedAppointment.specialization}</p>
              <p><strong>Status:</strong> {selectedAppointment.status}</p>
              <p><strong>Scheduled Date/Time:</strong> {selectedAppointment.scheduledDateTime}</p>
              <p><strong>Symptoms:</strong> {selectedAppointment.symptoms}</p>
              <p><strong>Additional Symptoms:</strong> {selectedAppointment.additionalSymptoms}</p>
              <p><strong>Preferred Date:</strong> {selectedAppointment.preferredDate}</p>
              <p><strong>Fee:</strong> ₹{selectedAppointment.fee}</p>
              <p><strong>Meeting Link:</strong> <a href={selectedAppointment.meetingLink} target="_blank" rel="noopener noreferrer">{selectedAppointment.meetingLink}</a></p>
            </div>
          )} */}
        </div>
        <div style={{ display: activeSection === 'prescriptions' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1, flexDirection: 'column' }}>
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <input type="text" placeholder="Search by doctor or department" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <select value={filters.prescriptions} onChange={(e) => setFilters({ ...filters, prescriptions: e.target.value })} style={{ marginLeft: '1rem', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
            <button onClick={fetchData} style={{ ...buttonStyle, background: '#28a745', color: 'white', marginLeft: '1rem' }}>Refresh</button>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Prescription ID</th>
                <th style={thStyle}>Prescription Date</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                console.log('Filtered prescriptions data:', filteredPrescriptions);
                return filteredPrescriptions.length > 0 ? filteredPrescriptions.map((p, index) => (
                  <tr key={p.prescriptionId} style={index % 2 === 0 ? {} : { backgroundColor: '#f9f9f9' }}>
                    <td style={tdStyle}>{p.prescriptionId}</td>
                    <td style={tdStyle}>{p.issuedAt}</td>
                    <td style={tdStyle}>
                      <span style={{ color: (p.status || 'ACTIVE') === 'ACTIVE' ? 'green' : 'red', fontWeight: 'bold' }}>
                        {p.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button style={{ ...getActionButtonStyle(`view-${p.prescriptionId}`), background: '#17a2b8', color: 'white' }} onClick={() => { console.log('View Prescription clicked'); setSelectedPrescription(p); setClickedButtons(prev => ({ ...prev, [`view-${p.prescriptionId}`]: true })); }}>View</button>
                      <button style={getActionButtonStyle(`download-${p.prescriptionId}`)} onClick={() => { downloadPdf(p.prescriptionId); setClickedButtons(prev => ({ ...prev, [`download-${p.prescriptionId}`]: true })); }}>Download PDF</button>
                      <button style={getActionButtonStyle(`print-${p.prescriptionId}`)} onClick={() => { printPrescription(p); setClickedButtons(prev => ({ ...prev, [`print-${p.prescriptionId}`]: true })); }}>Print</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No prescriptions found. Try refreshing or check if prescriptions have been added.</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
          {selectedPrescription && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4>Prescription Details</h4>
              <p><strong>Patient:</strong> {profile.fullName} (ID: {profile.userId})</p>
              <p><strong>Diagnosis:</strong> {selectedPrescription.diagnosis}</p>
              <p><strong>Medications:</strong></p>
              <ul>
                {selectedPrescription.medicines?.length > 0 ? selectedPrescription.medicines.map((med, idx) => (
                  <li key={idx}>{med.name} - {med.dosage} - {med.frequency} - {med.duration} days - Notes: {med.notes}</li>
                )) : <li>No medications listed.</li>}
              </ul>
              <p><strong>Advice:</strong> {selectedPrescription.advice}</p>
            </div>
          )}
        </div>
        {reconsultModal && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
            <h3>Schedule Reconsult</h3>
            <p>Appointment ID: {selectedAppointmentForReconsult?.appointmentId}</p>
            <p>Doctor: {selectedAppointmentForReconsult?.doctor?.fullName}</p>
            <p>This will create a new reconsult request for this completed appointment.</p>
            <button onClick={() => createReconsult(selectedAppointmentForReconsult.appointmentId)} style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Confirm</button>
            <button onClick={() => setReconsultModal(false)} style={{ ...buttonStyle, background: '#ccc', color: 'black' }}>Cancel</button>
          </div>
        )}
        {rescheduleModal && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
            <h3>Reschedule Appointment</h3>
            <p>Doctor: {selectedAppointment?.doctor?.fullName}</p>
            <p>Current Date/Time: {selectedAppointment?.scheduledDateTime}</p>
            <input type="datetime-local" value={newDateTime} onChange={(e) => setNewDateTime(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
            <button onClick={rescheduleAppointment} style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Confirm</button>
            <button onClick={() => { console.log('Reschedule Cancel clicked'); setRescheduleModal(false); }} style={{ ...buttonStyle, background: '#ccc', color: 'black' }}>Cancel</button>
          </div>
        )}
        {followUpModal && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
            <h3>Book Follow-up</h3>
            <p>Prescription ID: {selectedPrescription?.prescriptionId}</p>
            <input type="datetime-local" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
            <button onClick={() => bookFollowUp(selectedPrescription.prescriptionId)} style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Confirm</button>
            <button onClick={() => { console.log('Follow-up Cancel clicked'); setFollowUpModal(false); }} style={{ ...buttonStyle, background: '#ccc', color: 'black' }}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
