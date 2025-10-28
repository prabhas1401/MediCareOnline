import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Added for navigation
import { doctorAPI, appointmentAPI, prescriptionAPI } from '../services/api';

const DoctorDashboard = () => {
  const navigate = useNavigate();  // Added for navigation
  const [activeSection, setActiveSection] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState({ fullName: '', emailId: '', phoneNumber: '', rawPassword: '', qualification: '', experienceYears: '', specialization: '' });
  const [appointments, setAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [prescription, setPrescription] = useState({ diagnosis: '', advice: '', medicines: [] });
  const [leave, setLeave] = useState({ date: '' });
  const [reconsult, setReconsult] = useState({ id: '', newRequestedDateTime: '' });
  const [newPatient, setNewPatient] = useState({ fullName: '', emailId: '', phoneNumber: '', rawPassword: '', gender: '', dateOfBirth: '' });
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDateTime, setNewDateTime] = useState('');
  const [filters, setFilters] = useState({ appointments: 'all', pending: 'all', patients: 'all' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  // New state for prescription section
  const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState(null);
  const [newMedicine, setNewMedicine] = useState({ name: '', dosage: '', frequency: '', duration: '', notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [a, pend, prof] = await Promise.all([
        doctorAPI.getAppointments(),
        doctorAPI.getPendingAppointments(),
        doctorAPI.getProfile()
      ]);
      setAppointments(a.data);
      setPendingAppointments(pend.data);
      setProfile(prof.data);
      // Fetch patients if endpoint exists, else mock or add backend
      // setPatients(pat.data);
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Error fetching data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    console.log('Update Profile button clicked');
    try {
      await doctorAPI.updateProfile(profile);
      alert('Profile updated successfully');
      fetchData();
    } catch (err) {
      console.error('Update profile error:', err);
      alert('Error updating profile: ' + (err.response?.data?.message || err.message));
    }
  };

  const addPrescription = async (id) => {
    console.log('Add Prescription button clicked for appointment ID:', id);
    if (!prescription.diagnosis || prescription.medicines.length === 0) {
      alert('Please enter diagnosis and at least one medicine.');
      return;
    }
    try {
      await doctorAPI.addPrescription(id, prescription);
      setPrescription({ diagnosis: '', advice: '', medicines: [] });
      setSelectedAppointmentForPrescription(null);
      alert('Prescription added successfully');
      fetchData();
    } catch (err) {
      console.error('Add prescription error:', err);
      alert('Error adding prescription: ' + (err.response?.data?.message || err.message));
    }
  };

  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.dosage || !newMedicine.frequency || !newMedicine.duration) {
      alert('Please fill in all medicine fields.');
      return;
    }
    setPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine]
    }));
    setNewMedicine({ name: '', dosage: '', frequency: '', duration: '', notes: '' });
  };

  const removeMedicine = (index) => {
    setPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const addLeave = async () => {
    console.log('Add Leave button clicked');
    try {
      await doctorAPI.addLeave(leave);
      setLeave({ date: '' });
      fetchData();
      alert('Leave added successfully');
    } catch (err) {
      console.error('Add leave error:', err);
      alert('Error adding leave: ' + (err.response?.data?.message || err.message));
    }
  };

  const scheduleReconsult = async () => {
    try {
      await doctorAPI.scheduleReconsult(reconsult.id, reconsult);  // Now defined in api.jsx
      setReconsult({ id: '', newRequestedDateTime: '' });
      fetchData();
      alert('Reconsult scheduled successfully');
    } catch (err) {
      alert('Error scheduling reconsult: ' + (err.response?.data?.message || err.message));
    }
  };

  const addPatient = async () => {
    try {
      await doctorAPI.addPatient(newPatient);  // Now uses /doctor/patients
      setNewPatient({ fullName: '', emailId: '', phoneNumber: '', rawPassword: '', gender: '', dateOfBirth: '' });
      fetchData();
      alert('Patient added successfully');
    } catch (err) {
      alert('Error adding patient: ' + (err.response?.data?.message || err.message));
    }
  };

  const rescheduleAppointment = async () => {
    console.log('Reschedule Confirm button clicked');
    try {
      // Use calendar API to confirm availability, then update
      await doctorAPI.rescheduleAppointment(selectedAppointment.appointmentId, { newRequestedDateTime: newDateTime });
      setRescheduleModal(false);
      setNewDateTime('');
      fetchData();
      alert('Appointment rescheduled successfully');
    } catch (err) {
      console.error('Reschedule error:', err);
      alert('Error rescheduling: ' + (err.response?.data?.message || err.message));
    }
  };

  const confirmAppointment = async (id) => {
    console.log('Confirm Appointment button clicked for ID:', id);
    try {
      await appointmentAPI.schedule(id, { scheduledDateTime: new Date().toISOString() });  // Example: schedule now
      alert('Appointment confirmed successfully');
      fetchData();
    } catch (err) {
      console.error('Confirm appointment error:', err);
      alert('Error confirming appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  const rejectAppointment = async (id) => {
    console.log('Reject Appointment button clicked for ID:', id);
    try {
      await appointmentAPI.cancel(id);  // Example: cancel as reject
      alert('Appointment rejected successfully');
      fetchData();
    } catch (err) {
      console.error('Reject appointment error:', err);
      alert('Error rejecting appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  const startVisit = async (id) => {
    try {
      await appointmentAPI.startVisit(id);  // Now uses PUT
      const appointment = appointments.find(a => a.appointmentId === id);
      if (appointment && appointment.meetingLink) {
        window.open(appointment.meetingLink, '_blank');
      }
      navigate(`/doctor/visit/${id}`);
      alert('Visit started successfully');
      fetchData();
    } catch (err) {
      alert('Error starting visit: ' + (err.response?.data?.message || err.message));
    }
  };

  const cancelAppointment = async (id) => {
    console.log('Cancel Appointment button clicked for ID:', id);
    try {
      await appointmentAPI.cancel(id);
      alert('Appointment cancelled successfully');
      fetchData();
    } catch (err) {
      console.error('Cancel appointment error:', err);
      alert('Error cancelling appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  const editPatient = (patient) => {
    console.log('Edit Patient button clicked for:', patient.fullName);
    // Placeholder: Set selected patient and open edit modal
    alert('Edit patient (placeholder)');
  };

  const deletePatient = async (id) => {
    console.log('Delete Patient button clicked for ID:', id);
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await doctorAPI.deletePatient(id);  // Assume endpoint exists
        alert('Patient deleted successfully');
        fetchData();
      } catch (err) {
        console.error('Delete patient error:', err);
        alert('Error deleting patient: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const blockPatient = async (id) => {
    console.log('Block Patient button clicked for ID:', id);
    try {
      await doctorAPI.blockPatient(id);  // Assume endpoint exists
      alert('Patient blocked successfully');
      fetchData();
    } catch (err) {
      console.error('Block patient error:', err);
      alert('Error blocking patient: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const today = new Date().toDateString();
    const week = new Date();
    week.setDate(week.getDate() + 7);
    const isToday = new Date(a.scheduledDateTime).toDateString() === today;
    const isThisWeek = new Date(a.scheduledDateTime) <= week;
    return (filters.appointments === 'all' || (filters.appointments === 'today' && isToday) || (filters.appointments === 'week' && isThisWeek)) &&
           a.patient.fullName.toLowerCase().includes(search.toLowerCase());
  });

  // Updated: Safer filtering for pending appointments
  const filteredPending = (() => {
    const filtered = pendingAppointments.filter(pa => {
      if (!pa) return false;  // Skip invalid items
      const searchTerm = search.toLowerCase();
      const fullName = pa.patient?.fullName?.toLowerCase() || '';
      return searchTerm === '' || fullName.includes(searchTerm);
    });
    console.log('Filtered pending appointments:', filtered);  // Added: Debug filtered data
    return filtered;
  })();

  const filteredPatients = patients.filter(p => filters.patients === 'all' || p.specialization === filters.patients);

  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.9rem' };
  const thStyle = { border: '1px solid #ddd', padding: '12px', backgroundColor: '#f2f2f2', textAlign: 'left' };
  const tdStyle = { border: '1px solid #ddd', padding: '12px' };
  const buttonStyle = { padding: '6px 12px', margin: '2px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

  return (
    <div style={{ display: 'flex', fontFamily: 'Poppins, sans-serif', background: '#f4f8fb', minHeight: '100vh' }}>
      <div style={{ width: sidebarCollapsed ? '0' : '250px', background: '#007bff', color: 'white', padding: '1rem', transition: 'width 0.3s', overflow: 'hidden' }}>
        <button onClick={() => { console.log('Sidebar toggle clicked'); setSidebarCollapsed(!sidebarCollapsed); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
          ☰
        </button>
        <h2>Doctor Menu</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><button onClick={() => { console.log('Profile section clicked'); setActiveSection('profile'); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Update Profile</button></li>
          <li><button onClick={() => { console.log('Appointments section clicked'); setActiveSection('appointments'); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Appointments</button></li>
          <li><button onClick={() => { console.log('Pending Appointments section clicked'); setActiveSection('pendingAppointments'); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Pending Appointments</button></li>
          <li><button onClick={() => { console.log('Write Prescription section clicked'); setActiveSection('writePrescription'); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Write Prescription</button></li>
          <li><button onClick={() => { console.log('Add Leave section clicked'); setActiveSection('addLeave'); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Add Leave</button></li>
          <li><button onClick={() => { console.log('Add Patients section clicked'); setActiveSection('addPatients'); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Add Patients</button></li>
          <li><button onClick={() => { console.log('Schedule Reconsult section clicked'); setActiveSection('scheduleReconsult'); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Schedule Reconsult</button></li>
        </ul>
      </div>
      <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        {loading && <p>Loading...</p>}
        <div style={{ display: activeSection === 'profile' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Update Profile</h3>
            <form onSubmit={(e) => { e.preventDefault(); updateProfile(); }}>
              <input type="text" placeholder="Full Name" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="email" placeholder="Email" value={profile.emailId} onChange={(e) => setProfile({ ...profile, emailId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="text" placeholder="Phone" value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="password" placeholder="Password" value={profile.rawPassword} onChange={(e) => setProfile({ ...profile, rawPassword: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="text" placeholder="Qualification" value={profile.qualification} onChange={(e) => setProfile({ ...profile, qualification: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="number" placeholder="Experience Years" value={profile.experienceYears} onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <select value={profile.specialization} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
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
              <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Update Profile</button>
            </form>
          </div>
        </div>
        <div style={{ display: activeSection === 'appointments' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Appointments</h3>
            <div style={{ display: 'flex', marginBottom: '1rem' }}>
              <div>Today's: {appointments.filter(a => new Date(a.scheduledDateTime).toDateString() === new Date().toDateString()).length}</div>
              <div>This Week: {appointments.filter(a => new Date(a.scheduledDateTime) <= new Date(new Date().setDate(new Date().getDate() + 7))).length}</div>
              <div>Missed: {appointments.filter(a => a.status === 'MISSED').length}</div>
            </div>
            <input type="text" placeholder="Search by patient name or ID" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Appointment ID</th>
                  <th style={thStyle}>Patient Name + ID</th>
                  <th style={thStyle}>Date & Time</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((a, index) => (
                  <tr key={a.appointmentId} style={index % 2 === 0 ? {} : { backgroundColor: '#f9f9f9' }}>
                    <td style={tdStyle}>{a.appointmentId}</td>
                    <td style={tdStyle}>{a.patient.fullName} ({a.patient.userId})</td>
                    <td style={tdStyle}>{a.scheduledDateTime}</td>
                    <td style={tdStyle}><span style={{ color: a.status === 'CONFIRMED' ? 'green' : 'grey' }}>{a.status}</span></td>
                    <td style={tdStyle}>
                      <button onClick={() => startVisit(a.appointmentId)} style={{ ...buttonStyle, background: '#28a745', color: 'white' }}>Start Visit</button>
                      <button onClick={() => cancelAppointment(a.appointmentId)} style={{ ...buttonStyle, background: '#dc3545', color: 'white' }}>Cancel</button>
                      <button onClick={() => { setSelectedAppointment(a); setRescheduleModal(true); }} style={{ ...buttonStyle, background: '#ffc107', color: 'white' }}>Reschedule</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ width: '200px', marginLeft: '2rem', marginTop: '-1rem' }}>
            <h4>Filters</h4>
            <select value={filters.appointments} onChange={(e) => setFilters({ ...filters, appointments: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>
        <div style={{ display: activeSection === 'pendingAppointments' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Pending Appointments</h3>
            <input type="text" placeholder="Search by patient name or ID" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Appointment ID</th>
                  <th style={thStyle}>Patient Name + ID</th>
                  <th style={thStyle}>Requested Date & Time</th>
                  <th style={thStyle}>Status</th>
                  {/* <th style={thStyle}>Time Since Request</th> */}
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.length > 0 ? (
                  filteredPending.map((pa, index) => (
                    <tr key={pa.appointmentId} style={index % 2 === 0 ? {} : { backgroundColor: '#f9f9f9' }}>
                      <td style={tdStyle}>{pa.appointmentId}</td>
                      <td style={tdStyle}>{pa.patient.fullName} ({pa.patient.userId})</td>
                      <td style={tdStyle}>{pa.preferredDate}</td>
                      <td style={tdStyle}><span style={{ color: 'orange' }}>{pa.status}</span></td>
                      {/* <td style={tdStyle}>{pa.createdAt ? Math.floor((new Date() - new Date(pa.createdAt)) / (1000 * 60 * 60)) + 'h ago' : 'N/A'}</td> */}
                      <td style={tdStyle}>
                        <button onClick={() => confirmAppointment(pa.appointmentId)} style={{ ...buttonStyle, background: '#28a745', color: 'white' }}>Confirm</button>
                        <button onClick={() => rejectAppointment(pa.appointmentId)} style={{ ...buttonStyle, background: '#dc3545', color: 'white' }}>Reject</button>
                        <button onClick={() => { setSelectedAppointment(pa); setRescheduleModal(true); }} style={{ ...buttonStyle, background: '#ffc107', color: 'white' }}>Reschedule</button>
                        <button onClick={() => { console.log('View Details clicked for pending appointment'); alert('View Details (placeholder)'); }} style={{ ...buttonStyle, background: '#17a2b8', color: 'white' }}>View Details</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No pending appointments available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ width: '200px', marginLeft: '2rem', marginTop: '-1rem' }}>
            <h4>Filters</h4>
            <select value={filters.pending} onChange={(e) => setFilters({ ...filters, pending: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="all">All</option>
              <option value="old">Older than 24h</option>
            </select>
          </div>
        </div>
        <div style={{ display: activeSection === 'writePrescription' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Write Prescription</h3>
            <select value={selectedAppointmentForPrescription ? selectedAppointmentForPrescription.appointmentId : ''} onChange={(e) => {
              const appId = e.target.value;
              const app = appointments.find(a => a.appointmentId == appId);
              setSelectedAppointmentForPrescription(app);
            }} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="">Select Appointment</option>
              {appointments.filter(a => a.status === 'CONFIRMED').map(a => (
                <option key={a.appointmentId} value={a.appointmentId}>
                  {a.appointmentId} - {a.patient.fullName} ({a.scheduledDateTime})
                </option>
              ))}
            </select>
            {selectedAppointmentForPrescription && (
              <div>
                <input type="text" placeholder="Diagnosis" value={prescription.diagnosis} onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
                <textarea placeholder="Advice" value={prescription.advice} onChange={(e) => setPrescription({ ...prescription, advice: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }} />
                <h4>Add Medicines</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <input type="text" placeholder="Medicine Name" value={newMedicine.name} onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <input type="text" placeholder="Dosage (e.g., 500mg)" value={newMedicine.dosage} onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <input type="text" placeholder="Frequency (e.g., 3 times a day)" value={newMedicine.frequency} onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <input type="number" placeholder="Duration (days)" value={newMedicine.duration} onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <input type="text" placeholder="Notes" value={newMedicine.notes} onChange={(e) => setNewMedicine({ ...newMedicine, notes: e.target.value })} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <button onClick={addMedicine} style={{ ...buttonStyle, background: '#28a745', color: 'white' }}>Add Medicine</button>
                </div>
                <ul style={{ marginTop: '10px' }}>
                  {prescription.medicines.map((med, index) => (
                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px', border: '1px solid #ddd', marginBottom: '5px' }}>
                      <span>{med.name} - {med.dosage} - {med.frequency} - {med.duration} days - {med.notes}</span>
                      <button onClick={() => removeMedicine(index)} style={{ ...buttonStyle, background: '#dc3545', color: 'white' }}>Remove</button>
                    </li>
                  ))}
                </ul>
                <button onClick={() => addPrescription(selectedAppointmentForPrescription.appointmentId)} style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Submit Prescription</button>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: activeSection === 'addLeave' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Add Leave (Break Time)</h3>
            <form onSubmit={(e) => { e.preventDefault(); addLeave(); }}>
              <input type="date" value={leave.date} onChange={(e) => setLeave({ ...leave, date: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Add Leave</button>
            </form>
          </div>
        </div>
        <div style={{ display: activeSection === 'addPatients' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Add Patient</h3>
            <form onSubmit={(e) => { e.preventDefault(); addPatient(); }}>
              <input type="text" placeholder="Full Name" value={newPatient.fullName} onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="email" placeholder="Email" value={newPatient.emailId} onChange={(e) => setNewPatient({ ...newPatient, emailId: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="text" placeholder="Phone" value={newPatient.phoneNumber} onChange={(e) => setNewPatient({ ...newPatient, phoneNumber: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="password" placeholder="Password" value={newPatient.rawPassword} onChange={(e) => setNewPatient({ ...newPatient, rawPassword: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <select value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <input type="date" value={newPatient.dateOfBirth} onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Add Patient</button>
            </form>
            <h3>Patients List</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Specialization</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, index) => (
                  <tr key={p.userId} style={index % 2 === 0 ? {} : { backgroundColor: '#f9f9f9' }}>
                    <td style={tdStyle}>{p.fullName}</td>
                    <td style={tdStyle}>{p.userId}</td>
                    <td style={tdStyle}>{p.specialization}</td>
                    <td style={tdStyle}>
                      <button onClick={() => editPatient(p)} style={{ ...buttonStyle, background: '#ffc107', color: 'white' }}>Edit</button>
                      <button onClick={() => deletePatient(p.userId)} style={{ ...buttonStyle, background: '#dc3545', color: 'white' }}>Delete</button>
                      <button onClick={() => blockPatient(p.userId)} style={{ ...buttonStyle, background: '#6c757d', color: 'white' }}>Block</button>
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
          </div>
        </div>
        <div style={{ display: activeSection === 'scheduleReconsult' ? 'flex' : 'none', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>Schedule Reconsult</h3>
            <form onSubmit={(e) => { e.preventDefault(); scheduleReconsult(); }}>
              <input type="number" placeholder="Reconsult ID" value={reconsult.id} onChange={(e) => setReconsult({ ...reconsult, id: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="datetime-local" value={reconsult.newRequestedDateTime} onChange={(e) => setReconsult({ ...reconsult, newRequestedDateTime: e.target.value })} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
              <button type="submit" style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Schedule Reconsult</button>
            </form>
          </div>
        </div>
        {rescheduleModal && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
            <h3>Reschedule Appointment</h3>
            <p>Patient: {selectedAppointment?.patient.fullName}</p>
            <p>Current Date/Time: {selectedAppointment?.scheduledDateTime}</p>
            <input type="datetime-local" value={newDateTime} onChange={(e) => setNewDateTime(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px' }} />
            <button onClick={rescheduleAppointment} style={{ ...buttonStyle, background: '#007bff', color: 'white' }}>Confirm</button>
            <button onClick={() => { console.log('Reschedule Cancel clicked'); setRescheduleModal(false); }} style={{ ...buttonStyle, background: '#ccc', color: 'black' }}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
