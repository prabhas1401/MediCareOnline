import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Chart from '../../components/Chart';
import Table from '../../components/Table';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    api.get('/patient/stats').then(res => {
      setStats(res.data);
      setChartData({
        labels: ['Appointments', 'Prescriptions', 'Billings'],
        datasets: [{ label: 'Counts', data: [res.data.appointments, res.data.prescriptions, res.data.billings] }]
      });
    });
  }, []);

  return (
    <div>
      <h2>Patient Dashboard</h2>
      <div className="card">
        <Chart data={chartData} />
      </div>
      <div className="card">
        <Table headers={['Metric', 'Value']} data={Object.entries(stats).map(([k, v]) => ({ metric: k, value: v }))} />
      </div>
    </div>
  );
};

export default Dashboard;
// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const Dashboard = () => {
//   const [stats, setStats] = useState({});
//   const [chartData, setChartData] = useState({});

//   useEffect(() => {
//     api.get('/patient/stats').then(res => {
//       setStats(res.data);
//       setChartData({
//         labels: ['Appointments', 'Prescriptions', 'Billings'],
//         datasets: [{ label: 'Counts', data: [res.data.appointments, res.data.prescriptions, res.data.billings], backgroundColor: ['#0077b6','#00bcd4','#ff5722'] }]
//       });
//     });
//   }, []);

//   return (
//     <div style={{ padding: 20 }}>
//       <h2 style={{ color: '#0077b6', marginBottom: 20 }}>Dashboard</h2>
//       <div style={{ background: '#fff', padding: 20, borderRadius: 10, marginBottom: 20 }}>
//         <Bar data={chartData} />
//       </div>
//       <div style={{ background: '#fff', padding: 20, borderRadius: 10 }}>
//         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//           <thead>
//             <tr><th style={tableHeader}>Metric</th><th style={tableHeader}>Value</th></tr>
//           </thead>
//           <tbody>
//             {Object.entries(stats).map(([k,v]) => (
//               <tr key={k}><td style={tableCell}>{k}</td><td style={tableCell}>{v}</td></tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// const tableHeader = { padding: 12, background: '#0077b6', color: '#fff', textAlign: 'left' };
// const tableCell = { padding: 12, borderBottom: '1px solid #e0e0e0' };

// export default Dashboard;
