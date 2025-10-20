// import React, { useState } from 'react';
// import api from '../../services/api';
// import Form from '../../components/Form';

// const Notifications = () => {
//   const handleSubmit = (data) => {
//     api.post('/admin/notifications', data).then(() => alert('Sent'));
//   };

//   return (
//     <div>
//       <h2>Notifications</h2>
//       <Form 
//         fields={[
//           { name: 'message', type: 'text', placeholder: 'Message', required: true },
//           { name: 'type', type: 'select', placeholder: 'Type', options: [
//             { value: 'email', label: 'Email' },
//             { value: 'sms', label: 'SMS' },
//             { value: 'inapp', label: 'In-App' }
//           ], required: true }
//         ]}
//         onSubmit={handleSubmit}
//         buttonText="Send Notification"
//       />
//     </div>
//   );
// };

// export default Notifications;
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Notifications = () => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('email');
  const [notifications, setNotifications] = useState([]);

  // Fetch past notifications
  useEffect(() => {
    api.get('/admin/notifications')
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message) return alert('Please enter a message.');

    const data = { message, type };
    api.post('/admin/notifications', data)
      .then(res => {
        alert('Notification sent!');
        setNotifications(prev => [res.data, ...prev]);
        setMessage('');
        setType('email');
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Send Notification</h2>

      {/* Notification Form */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex', gap: '10px', marginBottom: '30px', alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          required
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="inapp">In-App</option>
        </select>
        <button type="submit" style={{
          padding: '10px 20px',
          backgroundColor: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600'
        }}>Send</button>
      </form>

      {/* Past Notifications */}
      <h3 style={{ marginBottom: '10px' }}>Past Notifications</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Message</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Type</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {notifications.length ? (
            notifications.map((n, i) => (
              <tr key={i}>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{n.message}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee', textTransform: 'capitalize' }}>{n.type}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{new Date(n.createdAt).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ padding: '10px', textAlign: 'center', color: '#888' }}>No notifications yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Notifications;
