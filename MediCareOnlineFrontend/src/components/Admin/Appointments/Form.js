import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../../services/api";
import { doctors as mockDoctors, patients as mockPatients } from "../../../mockData";

const AppointmentForm = ({ onSubmit, initialData }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(
    initialData || {
      patientId: "",
      doctorId: "",
      scheduledDate: "",
      scheduledTime: "",
      purpose: "",
      symptoms: "",
    }
  );
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [docRes, patRes] = await Promise.all([
          api.get("/doctors").catch(() => ({ data: mockDoctors })),
          api.get("/patients").catch(() => ({ data: mockPatients })),
        ]);

        const docData = Array.isArray(docRes.data)
          ? docRes.data
          : Array.isArray(docRes.data?.doctors)
          ? docRes.data.doctors
          : mockDoctors;

        const patData = Array.isArray(patRes.data)
          ? patRes.data
          : Array.isArray(patRes.data?.patients)
          ? patRes.data.patients
          : mockPatients;

        setDoctors(docData);
        setPatients(patData);
      } catch (err) {
        setDoctors(mockDoctors);
        setPatients(mockPatients);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>🩺 Appointment Form</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Patient:</label>
            <select
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="">Select Patient</option>
              {Array.isArray(patients) &&
                patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Doctor:</label>
            <select
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="">Select Doctor</option>
              {Array.isArray(doctors) &&
                doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Date:</label>
              <input
                type="date"
                name="scheduledDate"
                value={form.scheduledDate}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Time:</label>
              <input
                type="time"
                name="scheduledTime"
                value={form.scheduledTime}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Purpose:</label>
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              rows="2"
              required
              style={{ ...styles.input, resize: "none", height: "60px" }}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Symptoms:</label>
            <textarea
              name="symptoms"
              value={form.symptoms}
              onChange={handleChange}
              rows="3"
              style={{ ...styles.input, resize: "none", height: "80px" }}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Saving..." : "Save Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Inline CSS Styles
const styles = {
  page: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "60px",
  },
  container: {
    backgroundColor: "#fff",
    width: "90%",
    maxWidth: "650px",
    borderRadius: "16px",
    padding: "30px 40px",
    boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    color: "#2c3e50",
    fontWeight: 700,
    marginBottom: "25px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    color: "#34495e",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.3s",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    fontSize: "15px",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.3s",
    fontWeight: "600",
  },
};

export default AppointmentForm;
// import React, { useState } from 'react';
// // import api from '../services/api';  

// const AppointmentForm = () => {
//   const [symptoms, setSymptoms] = useState('');
//   const [date, setDate] = useState('');
//   const [time, setTime] = useState('');
//   const [purpose, setPurpose] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     const appointmentData = {
//       patientId: localStorage.getItem('userId'),  // Assume userId is stored after login
//       doctorId: 1,  // You might dynamically select this; for now, hardcoded
//       date,
//       time,
//       symptoms,
//       purpose,
//       status: 'BOOKED',  // Default status
//     };

//     try {
//       const response = await api.post('/api/appointments', appointmentData);  // Calls backend API
//       setSuccess('Appointment booked successfully!');
//       setSymptoms('');
//       setDate('');
//       setTime('');
//       setPurpose('');
//       // Optionally, trigger a modal or redirect
//     } catch (err) {
//       setError('Failed to book appointment. Please try again.');
//       console.error(err);
//     }
//   };

//   return (
//     <div>
//       <h2>Book an Appointment</h2>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {success && <p style={{ color: 'green' }}>{success}</p>}
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Symptoms:</label>
//           <textarea
//             value={symptoms}
//             onChange={(e) => setSymptoms(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label>Date:</label>
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label>Time:</label>
//           <input
//             type="time"
//             value={time}
//             onChange={(e) => setTime(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label>Purpose:</label>
//           <input
//             type="text"
//             value={purpose}
//             onChange={(e) => setPurpose(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit">Book Appointment</button>
//       </form>
//     </div>
//   );
// };

// export default AppointmentForm;