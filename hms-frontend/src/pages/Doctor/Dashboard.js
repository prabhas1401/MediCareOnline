// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
// import Chart from '../../components/Chart';
// import Table from '../../components/Table';

// const Dashboard = () => {
//   const [stats, setStats] = useState({});
//   const [chartData, setChartData] = useState({});

//   useEffect(() => {
//     api.get('/doctor/stats').then(res => {
//       setStats(res.data);
//       setChartData({
//         labels: ['Appointments', 'Patients'],
//         datasets: [{ label: 'Counts', data: [res.data.appointments, res.data.patients] }]
//       });
//     });
//   }, []);

//   return (
//     <div>
//       <h2>Doctor Dashboard</h2>
//       <div className="card">
//         <Chart data={chartData} />
//       </div>
//       <div className="card">
//         <Table headers={['Metric', 'Value']} data={Object.entries(stats).map(([k, v]) => ({ metric: k, value: v }))} />
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
// import Chart from '../../components/Chart';
// import Table from '../../components/Table';

// const Dashboard = () => {
//   const [stats, setStats] = useState({});
//   const [chartData, setChartData] = useState(null); // null initially

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await api.get('/doctor/stats');
//         const data = res.data || {};
//         setStats(data);

//         // Ensure valid fallback values
//         setChartData({
//           labels: ['Appointments', 'Patients'],
//           datasets: [
//             {
//               label: 'Counts',
//               data: [data.appointments || 0, data.patients || 0],
//               backgroundColor: ['#36A2EB', '#FF6384'],
//             },
//           ],
//         });
//       } catch (error) {
//         console.error('Error fetching stats:', error);
//         setStats({ appointments: 0, patients: 0 });
//         setChartData({
//           labels: ['Appointments', 'Patients'],
//           datasets: [
//             {
//               label: 'Counts',
//               data: [0, 0],
//               backgroundColor: ['#36A2EB', '#FF6384'],
//             },
//           ],
//         });
//       }
//     };
//     fetchStats();
//   }, []);

//   // 🩵 Prevent rendering before data is ready
//   if (!chartData) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h2>Doctor Dashboard</h2>
//       <div className="card">
//         <Chart data={chartData} />
//       </div>
//       <div className="card">
//         {stats && Object.keys(stats).length > 0 ? (
//           <Table
//             headers={['Metric', 'Value']}
//             data={Object.entries(stats).map(([k, v]) => ({
//               metric: k,
//               value: v,
//             }))}
//           />
//         ) : (
//           <p>No statistics available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
// import { Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const Dashboard = () => {
//   const [stats, setStats] = useState({});
//   const [chartData, setChartData] = useState(null); // initially null

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await api.get('/doctor/stats');
//         const data = res.data || {};
//         setStats(data);

//         setChartData({
//           labels: ['Appointments', 'Patients'],
//           datasets: [
//             {
//               label: 'Counts',
//               data: [data.appointments || 0, data.patients || 0],
//               backgroundColor: ['#36A2EB', '#FF6384'],
//             },
//           ],
//         });
//       } catch (error) {
//         console.error('Error fetching stats:', error);
//         setStats({ appointments: 0, patients: 0 });
//         setChartData({
//           labels: ['Appointments', 'Patients'],
//           datasets: [
//             {
//               label: 'Counts',
//               data: [0, 0],
//               backgroundColor: ['#36A2EB', '#FF6384'],
//             },
//           ],
//         });
//       }
//     };

//     fetchStats();
//   }, []);

//   if (!chartData) {
//     return (
//       <div style={styles.loadingContainer}>
//         <p>Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.page}>
//       <h2 style={styles.heading}>Doctor Dashboard</h2>

//       {/* Chart Card */}
//       <div style={styles.card}>
//         <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
//       </div>

//       {/* Stats Table Card */}
//       <div style={styles.card}>
//         {stats && Object.keys(stats).length > 0 ? (
//           <table style={styles.table}>
//             <thead>
//               <tr>
//                 <th style={styles.th}>Metric</th>
//                 <th style={styles.th}>Value</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(stats).map(([k, v]) => (
//                 <tr key={k}>
//                   <td style={styles.td}>{k}</td>
//                   <td style={styles.td}>{v}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p style={{ textAlign: 'center' }}>No statistics available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// const styles = {
//   page: {
//     padding: 20,
//     minHeight: '100vh',
//     background: '#f4f7fa',
//     fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
//   },
//   heading: {
//     color: '#0077b6',
//     marginBottom: 20,
//     fontSize: '2rem',
//     textAlign: 'center'
//   },
//   card: {
//     background: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 20,
//     boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
//   },
//   table: {
//     width: '100%',
//     borderCollapse: 'collapse',
//     marginTop: 10
//   },
//   th: {
//     padding: 12,
//     background: '#0077b6',
//     color: '#fff',
//     textAlign: 'left',
//     borderBottom: '1px solid #e0e0e0'
//   },
//   td: {
//     padding: 12,
//     borderBottom: '1px solid #e0e0e0'
//   },
//   loadingContainer: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: '60vh',
//     fontSize: 18,
//     color: '#0077b6'
//   }
// };

// export default Dashboard;
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState(null); // null initially

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/doctor/stats');
        const data = res.data || {};

        setStats(data);

        // Safely create chart data
        setChartData({
          labels: ['Appointments', 'Patients'],
          datasets: [
            {
              label: 'Counts',
              data: [
                typeof data.appointments === 'number' ? data.appointments : 0,
                typeof data.patients === 'number' ? data.patients : 0
              ],
              backgroundColor: ['#36A2EB', '#FF6384']
            }
          ]
        });
      } catch (error) {
        console.error(error);
        setStats({ appointments: 0, patients: 0 });
        setChartData({
          labels: ['Appointments', 'Patients'],
          datasets: [
            {
              label: 'Counts',
              data: [0, 0],
              backgroundColor: ['#36A2EB', '#FF6384']
            }
          ]
        });
      }
    };

    fetchStats();
  }, []);

  // ✅ Only render chart if datasets exist
  const isChartReady =
    chartData &&
    Array.isArray(chartData.datasets) &&
    chartData.datasets.length > 0;

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#f4f7fa' }}>
      <h2 style={{ color: '#0077b6', textAlign: 'center', marginBottom: 20 }}>
        Doctor Dashboard
      </h2>

      <div
        style={{
          background: '#fff',
          padding: 20,
          borderRadius: 10,
          marginBottom: 20,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        {isChartReady ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Appointments vs Patients' }
              }
            }}
          />
        ) : (
          <p>Loading chart...</p>
        )}
      </div>

      <div
        style={{
          background: '#fff',
          padding: 20,
          borderRadius: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        {stats && Object.keys(stats).length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: 12, background: '#0077b6', color: '#fff' }}>
                  Metric
                </th>
                <th style={{ padding: 12, background: '#0077b6', color: '#fff' }}>
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats).map(([k, v]) => (
                <tr key={k}>
                  <td style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>
                    {k}
                  </td>
                  <td style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>
                    {v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center' }}>No statistics available.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;


