// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';

// const AdminBookAppointment = () => {
//   const [patients, setPatients] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [form, setForm] = useState({
//     patientId: '',
//     doctorId: '',
//     date: '',
//     time: '',
//     purpose: '',
//     symptoms: '',
//   });
//   const [error, setError] = useState('');

//   useEffect(() => {
//     api.get('/admin/patients').then(res => setPatients(res.data));
//     api.get('/admin/doctors').then(res => setDoctors(res.data));
//   }, []);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (!form.patientId || !form.doctorId || !form.date || !form.time) {
//       setError('Please fill all required fields');
//       return;
//     }

//     try {
//       await api.post('/admin/appointments/book', {
//         patient: { id: form.patientId },
//         doctor: { id: form.doctorId },
//         date: form.date,
//         startTime: form.time,
//         endTime: form.time,
//         purpose: form.purpose,
//         symptoms: form.symptoms,
//         status: 'pending',
//       });
//       alert('Appointment booked successfully!');
//       setForm({ patientId: '', doctorId: '', date: '', time: '', purpose: '', symptoms: '' });
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || 'Failed to book appointment');
//     }
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         <h2 style={styles.heading}>Book Appointment</h2>
//         <form onSubmit={handleSubmit} style={styles.form}>
//           <select name="patientId" value={form.patientId} onChange={handleChange} style={styles.input} required>
//             <option value="">Select Patient</option>
//             {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
//           </select>

//           <select name="doctorId" value={form.doctorId} onChange={handleChange} style={styles.input} required>
//             <option value="">Select Doctor</option>
//             {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>)}
//           </select>

//           <input type="date" name="date" value={form.date} onChange={handleChange} style={styles.input} required />
//           <input type="time" name="time" value={form.time} onChange={handleChange} style={styles.input} required />

//           <input type="text" name="purpose" placeholder="Purpose" value={form.purpose} onChange={handleChange} style={styles.input} />
//           <textarea name="symptoms" placeholder="Symptoms" value={form.symptoms} onChange={handleChange} style={{ ...styles.input, height: 80 }} />

//           {error && <div style={styles.error}>{error}</div>}

//           <button type="submit" style={styles.button}>Save Appointment</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 30, background: '#f4f6f8' },
//   card: { width: 500, padding: 30, borderRadius: 12, background: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
//   heading: { textAlign: 'center', marginBottom: 20, color: '#0077b6', fontSize: 24, fontWeight: 700 },
//   form: { display: 'flex', flexDirection: 'column', gap: 15 },
//   input: { padding: 12, borderRadius: 8, border: '1px solid #ccc', outline: 'none', fontSize: 14 },
//   button: { padding: 12, background: '#0077b6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginTop: 10 },
//   error: { color: 'red', textAlign: 'center', fontSize: 14 },
// };

// export default AdminBookAppointment;

import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminBookAppointment = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    purpose: '',
    symptoms: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/patients').then(res => setPatients(res.data));
    api.get('/admin/doctors').then(res => setDoctors(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.patientId || !form.doctorId || !form.date || !form.time) {
      setError('Please fill all required fields');
      return;
    }

    try {
      await api.post('/admin/appointments/book', {
        patient: { id: form.patientId },
        doctor: { id: form.doctorId },
        date: form.date,
        startTime: form.time,
        endTime: form.time,
        purpose: form.purpose,
        symptoms: form.symptoms,
        status: 'pending',
      });
      alert('Appointment booked successfully!');
      setForm({ patientId: '', doctorId: '', date: '', time: '', purpose: '', symptoms: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Book Appointment</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <select name="patientId" value={form.patientId} onChange={handleChange} style={styles.input} required>
            <option value="">Select Patient</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select name="doctorId" value={form.doctorId} onChange={handleChange} style={styles.input} required>
            <option value="">Select Doctor</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>)}
          </select>

          <input type="date" name="date" value={form.date} onChange={handleChange} style={styles.input} required />
          <input type="time" name="time" value={form.time} onChange={handleChange} style={styles.input} required />

          <input type="text" name="purpose" placeholder="Purpose" value={form.purpose} onChange={handleChange} style={styles.input} />
          <textarea name="symptoms" placeholder="Symptoms" value={form.symptoms} onChange={handleChange} style={{ ...styles.input, height: 80 }} />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button}>Save Appointment</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 30, background: '#f4f6f8' },
  card: { width: 500, padding: 30, borderRadius: 12, background: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
  heading: { textAlign: 'center', marginBottom: 20, color: '#0077b6', fontSize: 24, fontWeight: 700 },
  form: { display: 'flex', flexDirection: 'column', gap: 15 },
  input: { padding: 12, borderRadius: 8, border: '1px solid #ccc', outline: 'none', fontSize: 14 },
  button: { padding: 12, background: '#0077b6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginTop: 10 },
  error: { color: 'red', textAlign: 'center', fontSize: 14 },
};

export default AdminBookAppointment;
