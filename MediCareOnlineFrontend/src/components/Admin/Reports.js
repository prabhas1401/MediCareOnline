import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../services/api';
// import api from "../../../services/api";
// import "../../styles/theme"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Reports = () => {
  const [reportType, setReportType] = useState('appointments'); // appointments, revenue, doctor-performance
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportData, setReportData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    if (fromDate && toDate) {
      const token = JSON.parse(localStorage.getItem('loggedInUser  ')).token;
      let endpoint = `/admin/reports/${reportType}?from=${fromDate}&to=${toDate}`;
      api.get(endpoint, token).then(data => {
        setReportData({
          labels: data.labels,
          datasets: data.datasets
        });
      });
    }
  }, [reportType, fromDate, toDate]);

  return (
    <div className="content">
      <style>{`
        .content { padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .report-filters { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; }
        .report-filters input, .report-filters select { padding: 8px; border: 1px solid #ccc; border-radius: 5px; }
        .chart-container { height: 400px; margin-top: 20px; }
      `}</style>
      <h2>Reports & Analytics</h2>
      <div className="report-filters">
        <select value={reportType} onChange={e => setReportType(e.target.value)}>
          <option value="appointments">Appointment Reports</option>
          <option value="revenue">Financial Reports</option>
          <option value="doctor-performance">Doctor Performance</option>
        </select>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
      </div>
      <div className="chart-container">
        {reportType === 'appointments' && <Line data={reportData} />}
        {reportType === 'revenue' && <Bar data={reportData} />}
        {reportType === 'doctor-performance' && <Bar data={reportData} />}
      </div>
    </div>
  );
};

export default Reports;