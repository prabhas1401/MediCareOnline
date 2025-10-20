// import React, { useState, useEffect } from 'react';
// import api from '../../services/api';
// import Form from '../../components/Form';

// const AddAppointment = () => {
//   const [doctors, setDoctors] = useState([]);

//   useEffect(() => {
//     api.get('/patient/doctors').then(res => setDoctors(res.data));
//   }, []);

//   const handleSubmit = (data) => {
//     // Simulate payment
//     alert('Payment successful! Amount: $50');
//     api.post('/patient/appointments', data).then(() => alert('Appointment booked'));
//   };

//   return (
//     <div>
//       <h2>Add Appointment</h2>
//       <Form 
//         fields={[
//           { name: 'symptoms', type: 'textarea', placeholder: 'Symptoms', required: true },
//           { name: 'date', type: 'date', required: true },
//           { name: 'doctorId', type: 'select', placeholder: 'Select Doctor', options: doctors.map(d => ({ value: d.id, label: d.name })), required: true }
//         ]}
//         onSubmit={handleSubmit}
//         buttonText="Book and Pay"
//       />
//     </div>
//   );
// };

// export default AddAppointment;
// import React, { useState, useEffect } from 'react';
// import api from '../../services/api';

// const AddAppointment = () => {
//   const [doctors, setDoctors] = useState([]);
//   const [form, setForm] = useState({ symptoms: '', date: '', doctorId: '' });

//   useEffect(() => {
//     api.get('/patient/doctors').then(res => setDoctors(res.data));
//   }, []);

//   const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
//   const handleSubmit = e => {
//     e.preventDefault();
//     alert('Payment successful! Amount: $50');
//     api.post('/patient/appointments', form).then(() => alert('Appointment booked'));
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2 style={{ color: '#0077b6', marginBottom: 20 }}>Add Appointment</h2>
//       <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15, maxWidth: 500 }}>
//         <textarea
//           name="symptoms"
//           placeholder="Symptoms"
//           value={form.symptoms}
//           onChange={handleChange}
//           required
//           style={styles.input}
//         />
//         <input
//           type="date"
//           name="date"
//           value={form.date}
//           onChange={handleChange}
//           required
//           style={styles.input}
//         />
//         <select name="doctorId" value={form.doctorId} onChange={handleChange} required style={styles.input}>
//           <option value="">Select Doctor</option>
//           {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
//         </select>
//         <button type="submit" style={styles.button}>Book and Pay</button>
//       </form>
//     </div>
//   );
// };

// const styles = {
//   input: { padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 },
//   button: { padding: 12, background: '#0077b6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
// };

// export default AddAppointment;
// import React, { useState, useEffect } from 'react';
// import api from '../../services/api';

// const AddAppointment = () => {
//   const [doctors, setDoctors] = useState([]);
//   const [form, setForm] = useState({ symptoms: '', date: '', doctorId: '' });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     api.get('/patient/doctors')
//       .then(res => setDoctors(res.data))
//       .catch(err => console.error('Error fetching doctors:', err));
//   }, []);

//   const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async e => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');

//     try {
//       const patientId = JSON.parse(localStorage.getItem('user')).id; // logged in patient
//       const payload = {
//         patient: { id: patientId },
//         doctor: { id: form.doctorId },
//         date: form.date,
//         symptoms: form.symptoms,
//       };

//       const response = await api.post('/admin/appointments/book', payload);
      
//       if (response.data) {
//         setMessage(`Appointment booked successfully for ${form.date}. An email confirmation has been sent.`);
//         setForm({ symptoms: '', date: '', doctorId: '' });
//       }
//     } catch (error) {
//       console.error(error);
//       setMessage('Failed to book appointment. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2 style={{ color: '#0077b6', marginBottom: 20 }}>Add Appointment</h2>
//       {message && <p style={{ marginBottom: 15, color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
//       <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15, maxWidth: 500 }}>
//         <textarea
//           name="symptoms"
//           placeholder="Symptoms"
//           value={form.symptoms}
//           onChange={handleChange}
//           required
//           style={styles.input}
//         />
//         <input
//           type="date"
//           name="date"
//           value={form.date}
//           onChange={handleChange}
//           required
//           style={styles.input}
//         />
//         <select name="doctorId" value={form.doctorId} onChange={handleChange} required style={styles.input}>
//           <option value="">Select Doctor</option>
//           {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
//         </select>
//         <button type="submit" disabled={loading} style={styles.button}>
//           {loading ? 'Booking...' : 'Book and Pay'}
//         </button>
//       </form>
//     </div>
//   );
// };

// const styles = {
//   input: { padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 },
//   button: { padding: 12, background: '#0077b6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
// };

// export default AddAppointment;
// import React, { useState, useEffect } from 'react';
// import api from '../../services/api';

// const AddAppointment = () => {
//   const [doctors, setDoctors] = useState([]);
//   const [form, setForm] = useState({ symptoms: '', date: '', doctorId: '' });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     api.get('/patient/doctors')
//       .then(res => setDoctors(res.data))
//       .catch(err => console.error('Error fetching doctors:', err));
//   }, []);

//   const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async e => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');

//     try {
//       const patientId = JSON.parse(localStorage.getItem('user')).id;
//       const payload = {
//         patient: { id: patientId },
//         doctor: { id: form.doctorId },
//         date: form.date,
//         symptoms: form.symptoms,
//       };

//       const response = await api.post('/admin/appointments/book', payload);
      
//       if (response.data) {
//         setMessage(`Appointment booked successfully for ${form.date}. An email confirmation has been sent.`);
//         setForm({ symptoms: '', date: '', doctorId: '' });
//       }
//     } catch (error) {
//       console.error(error);
//       setMessage('Failed to book appointment. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2 style={{ color: '#0077b6', marginBottom: 20 }}>Add Appointment</h2>
//       {message && <p style={{ marginBottom: 15, color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
//       <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15, maxWidth: 500 }}>
//         <textarea
//           name="symptoms"
//           placeholder="Symptoms"
//           value={form.symptoms}
//           onChange={handleChange}
//           required
//           style={styles.input}
//         />
//         <input
//           type="date"
//           name="date"
//           value={form.date}
//           onChange={handleChange}
//           required
//           style={styles.input}
//         />
//         <select name="doctorId" value={form.doctorId} onChange={handleChange} required style={styles.input}>
//           <option value="">Select Doctor</option>
//           {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
//         </select>
//         <button type="submit" disabled={loading} style={styles.button}>
//           {loading ? 'Booking...' : 'Book and Pay'}
//         </button>
//       </form>
//     </div>
//   );
// };

// const styles = {
//   input: { padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 },
//   button: { padding: 12, background: '#0077b6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
// };

// export default AddAppointment;
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AddAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ symptoms: '', date: '', doctorId: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/patient/doctors')
      .then(res => setDoctors(res.data))
      .catch(err => console.error('Error fetching doctors:', err));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const patientId = JSON.parse(localStorage.getItem('user')).id;
      const payload = {
        patient: { id: patientId },
        doctor: { id: form.doctorId },
        date: form.date,
        symptoms: form.symptoms,
      };

      // Book appointment via admin controller
      const response = await api.post('/admin/appointments/book', payload);

      if (response.data) {
        setMessage(`Appointment booked successfully for ${form.date}. Email confirmation sent.`);
        setForm({ symptoms: '', date: '', doctorId: '' });

        // Automatically proceed to payment (example: 500 INR)
        handlePayment(response.data.id, 500);
      }
    } catch (error) {
      console.error(error);
      setMessage('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Razorpay payment
  const handlePayment = async (appointmentId, amount) => {
    try {
      const res = await api.post('/payment/create-order', { amount: amount * 100 }); // amount in paise
      const { orderId, key, currency } = res.data;

      const options = {
        key,
        amount: amount * 100,
        currency,
        name: "Hospital Management System",
        description: "Appointment Payment",
        order_id: orderId,
        handler: async function (response) {
          await api.post(`/patient/appointments/${appointmentId}/pay`, response);
          alert("Payment Successful!");
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('user')).name,
          email: JSON.parse(localStorage.getItem('user')).email,
        },
        theme: { color: "#0077b6" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#0077b6', marginBottom: 20 }}>Add Appointment</h2>
      {message && <p style={{ marginBottom: 15, color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15, maxWidth: 500 }}>
        <textarea
          name="symptoms"
          placeholder="Symptoms"
          value={form.symptoms}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <select name="doctorId" value={form.doctorId} onChange={handleChange} required style={styles.input}>
          <option value="">Select Doctor</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Booking...' : 'Book and Pay'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  input: { padding: 12, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 },
  button: { padding: 12, background: '#0077b6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
};

export default AddAppointment;





