// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
// import Table from '../../components/Table';

// const ViewAppointments = () => {
//   const [appointments, setAppointments] = useState([]);

//   useEffect(() => {
//     api.get('/patient/appointments').then(res => setAppointments(res.data));
//   }, []);

//   const actions = (appt) => (
//     <button className="btn btn-danger" onClick={() => api.delete(`/patient/appointments/${appt.id}`).then(() => setAppointments(appointments.filter(a => a.id !== appt.id)))}>Delete</button>
//   );

//   return (
//     <div>
//       <h2>My Appointments</h2>
//       <Table headers={['Doctor', 'Date', 'Status']} data={appointments} actions={actions} />
//     </div>
//   );
// };

// export default ViewAppointments;
// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
// import Table from '../../components/Table';

// const ViewAppointments = () => {
//   const [appointments, setAppointments] = useState([]);

//   useEffect(() => {
//     api.get('/patient/appointments').then(res => setAppointments(res.data));
//   }, []);

//   const actions = (appt) => (
//     <>
//       {appt.status === 'pending' && (
//         <button
//           style={styles.button}
//           onClick={() => api.post(`/patient/appointments/${appt.id}/pay`).then(() => {
//             alert('Payment successful');
//             setAppointments(appointments.map(a => a.id === appt.id ? { ...a, status: 'paid' } : a));
//           })}
//         >
//           Pay
//         </button>
//       )}
//       <button
//         style={{ ...styles.button, background: '#ef4444' }}
//         onClick={() => api.delete(`/patient/appointments/${appt.id}`).then(() => setAppointments(appointments.filter(a => a.id !== appt.id)))}
//       >
//         Delete
//       </button>
//     </>
//   );

//   return (
//     <div style={{ padding: 30 }}>
//       <h2 style={{ color: '#0077b6', marginBottom: 20 }}>My Appointments</h2>
//       <Table
//         headers={['Doctor', 'Date', 'Time', 'Purpose', 'Symptoms', 'Status']}
//         data={appointments}
//         actions={actions}
//       />
//     </div>
//   );
// };

// const styles = {
//   button: { padding: '6px 12px', marginRight: 8, borderRadius: 6, border: 'none', cursor: 'pointer', background: '#0077b6', color: '#fff' },
// };

// export default ViewAppointments;

// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
// import Table from '../../components/Table';

// const ViewAppointments = ({ patientId }) => {
//   const [appointments, setAppointments] = useState([]);

//   useEffect(() => {
//     api.get(`/patient/appointments?patientId=${patientId}`).then(res => setAppointments(res.data));
//   }, [patientId]);

//   const actions = (appt) => (
//     <>
//       {appt.status === 'pending' && (
//         <button
//           style={styles.button}
//           onClick={() => api.post(`/patient/appointments/${appt.id}/pay`).then(() => {
//             alert('Payment successful');
//             setAppointments(appointments.map(a => a.id === appt.id ? { ...a, status: 'paid' } : a));
//           })}
//         >
//           Pay
//         </button>
//       )}
//       <button
//         style={{ ...styles.button, background: '#ef4444' }}
//         onClick={() => api.delete(`/patient/appointments/${appt.id}`).then(() => setAppointments(appointments.filter(a => a.id !== appt.id)))}
//       >
//         Delete
//       </button>
//     </>
//   );

//   return (
//     <div style={{ padding: 30 }}>
//       <h2 style={{ color: '#0077b6', marginBottom: 20 }}>My Appointments</h2>
//       <Table
//         headers={['Doctor', 'Date', 'Time', 'Purpose', 'Symptoms', 'Status']}
//         data={appointments}
//         actions={actions}
//       />
//     </div>
//   );
// };

// const styles = {
//   button: { padding: '6px 12px', marginRight: 8, borderRadius: 6, border: 'none', cursor: 'pointer', background: '#0077b6', color: '#fff' },
// };

// export default ViewAppointments;
// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
// import Table from '../../components/Table';

// const ViewAppointments = () => {
//   const [appointments, setAppointments] = useState([]);
//   const patientId = JSON.parse(localStorage.getItem('user')).id;

//   useEffect(() => {
//     api.get(`/patient/appointments?patientId=${patientId}`).then(res => setAppointments(res.data));
//   }, [patientId]);

//   const handlePay = async (appt) => {
//     try {
//       // Create Razorpay order
//       const res = await api.post(`/patient/appointments/${appt.id}/create-order`);
//       const { id: order_id, amount, currency } = JSON.parse(res.data);

//       const options = {
//         key: "YOUR_KEY_ID",
//         amount: amount,
//         currency: currency,
//         name: "Hospital Management System",
//         description: "Appointment Payment",
//         order_id: order_id,
//         handler: async function (response) {
//           await api.post(`/patient/appointments/${appt.id}/pay`, response);
//           alert("Payment Successful!");
//           setAppointments(appointments.map(a => a.id === appt.id ? { ...a, status: 'paid' } : a));
//         },
//         prefill: {
//           name: JSON.parse(localStorage.getItem('user')).name,
//           email: JSON.parse(localStorage.getItem('user')).email,
//         },
//         theme: { color: "#0077b6" },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.error(err);
//       alert("Payment failed. Try again.");
//     }
//   };

//   const actions = (appt) => (
//     <>
//       {appt.status === 'pending' && <button style={styles.button} onClick={() => handlePay(appt)}>Pay Now</button>}
//       <button style={{ ...styles.button, background: '#ef4444' }} onClick={() => api.delete(`/patient/appointments/${appt.id}`).then(() => setAppointments(appointments.filter(a => a.id !== appt.id)))}>
//         Delete
//       </button>
//     </>
//   );

//   return (
//     <div style={{ padding: 30 }}>
//       <h2 style={{ color: '#0077b6', marginBottom: 20 }}>My Appointments</h2>
//       <Table
//         headers={['Doctor', 'Date', 'Time', 'Purpose', 'Symptoms', 'Status']}
//         data={appointments}
//         actions={actions}
//       />
//     </div>
//   );
// };

// const styles = {
//   button: { padding: '6px 12px', marginRight: 8, borderRadius: 6, border: 'none', cursor: 'pointer', background: '#0077b6', color: '#fff' },
// };

// export default ViewAppointments;

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const patientId = JSON.parse(localStorage.getItem('user')).id;

  useEffect(() => {
    api.get(`/patient/appointments?patientId=${patientId}`)
      .then(res => setAppointments(res.data))
      .catch(err => console.error(err));
  }, [patientId]);

  const handlePay = async (appt) => {
    try {
      const amountInPaise = 500 * 100; // example: 500 INR
      const res = await api.post('/payment/create-order', { amount: amountInPaise });
      const { orderId, key, currency } = res.data;

      const options = {
        key,
        amount: amountInPaise,
        currency,
        name: "Hospital Management System",
        description: "Appointment Payment",
        order_id: orderId,
        handler: async function (response) {
          await api.post(`/patient/appointments/${appt.id}/pay`, response);
          alert("Payment Successful!");
          setAppointments(appointments.map(a => a.id === appt.id ? { ...a, status: 'paid' } : a));
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

  const actions = (appt) => (
    <>
      {appt.status === 'pending' && <button style={styles.button} onClick={() => handlePay(appt)}>Pay Now</button>}
      <button style={{ ...styles.button, background: '#ef4444' }} onClick={() => api.delete(`/patient/appointments/${appt.id}`)
        .then(() => setAppointments(appointments.filter(a => a.id !== appt.id)))}
      >
        Delete
      </button>
    </>
  );

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ color: '#0077b6', marginBottom: 20 }}>My Appointments</h2>
      <Table
        headers={['Doctor', 'Date', 'Time', 'Symptoms', 'Status']}
        data={appointments}
        actions={actions}
      />
    </div>
  );
};

const styles = {
  button: { padding: '6px 12px', marginRight: 8, borderRadius: 6, border: 'none', cursor: 'pointer', background: '#0077b6', color: '#fff' },
};

export default ViewAppointments;


