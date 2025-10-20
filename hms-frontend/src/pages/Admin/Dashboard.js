import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Chart from '../../components/Chart';
import Table from '../../components/Table';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    api.get('/admin/stats').then(res => {
      setStats(res.data);
      setChartData({
        labels: ['Patients', 'Doctors', 'Appointments'],
        datasets: [{ label: 'Counts', data: [res.data.patients, res.data.doctors, res.data.appointments] }]
      });
    });
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
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