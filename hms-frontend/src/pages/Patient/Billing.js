// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
// import Table from '../../components/Table';

// const Billing = () => {
//   const [billings, setBillings] = useState([]);

//   useEffect(() => {
//     api.get('/patient/billings').then(res => setBillings(res.data));
//   }, []);

//   return (
//     <div>
//       <h2>My Billings</h2>
//       <Table headers={['Appointment', 'Amount', 'Status']} data={billings} />
//     </div>
//   );
// };

// export default Billing;
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Billing = () => {
  const [billings, setBillings] = useState([]);

  useEffect(() => {
    api.get('/patient/billings').then(res => setBillings(res.data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#0077b6', marginBottom: 20 }}>My Billings</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Appointment</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {billings.map(b => (
            <tr key={b.id}>
              <td style={styles.td}>{b.appointment}</td>
              <td style={styles.td}>{b.amount}</td>
              <td style={styles.td}>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' },
  th: { textAlign: 'left', padding: 12, background: '#0077b6', color: '#fff' },
  td: { padding: 12, borderBottom: '1px solid #e0e0e0' },
};

export default Billing;
