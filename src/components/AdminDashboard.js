import React, { useState, useEffect } from 'react';
import {
  Container,
  Tabs,
  Tab,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import AdminPatients from "./Admin/AdminPatients";
import AdminDoctors from "./Admin/AdminDoctors";


import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  ClipboardList,
  Bell,
  Search,
  LogOut,
  BarChart2,
  Stethoscope,
} from 'lucide-react';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    prescriptions: 0,
    revenue: 0,
  });
  const [chartData, setChartData] = useState({
    appointments: { labels: [], datasets: [] },
    revenue: { labels: [], datasets: [] },
  });
  const [admin, setAdmin] = useState({ name: 'Admin', email: 'admin@hms.com' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedUser?.token) {
      console.error('No token found in localStorage');
      return;
    }
    setAdmin({ name: loggedUser.name || 'Admin', email: loggedUser.email });
    const token = loggedUser.token;

    const fetchDashboard = async () => {
      try {
        const [statsRes, apptsRes, revRes] = await Promise.all([
          api.get('/admin/stats', token),
          api.get('/admin/reports/appointments?days=7', token),
          api.get('/admin/reports/revenue?months=6', token),
        ]);
        setStats(statsRes || {});
        setChartData({
          appointments: {
            labels: apptsRes?.dates || [],
            datasets: [
              {
                label: 'Appointments',
                data: apptsRes?.counts || [],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0,123,255,0.3)',
                fill: true,
              },
            ],
          },
          revenue: {
            labels: revRes?.months || [],
            datasets: [
              {
                label: 'Revenue ($)',
                data: revRes?.amounts || [],
                backgroundColor: 'rgba(40,167,69,0.6)',
              },
            ],
          },
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <style>{`
        body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f7f9fb; }
        .dashboard-container { display: flex; min-height: 100vh; }
        .sidebar { width: 260px; background: linear-gradient(180deg, #2c3e50, #1a252f); color: white; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; }
        .sidebar h3 { color: #fff; margin-bottom: 20px; text-align: center; }
        .sidebar ul { list-style: none; padding: 0; }
        .sidebar li { margin: 10px 0; }
        .sidebar a { color: #bdc3c7; text-decoration: none; display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; transition: 0.3s; }
        .sidebar a:hover { background: #34495e; color: #fff; }
        .dashboard-content { flex: 1; display: flex; flex-direction: column; background: #f4f6f8; overflow-y: auto; }
        .topbar { display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .search-bar { display: flex; align-items: center; background: #f1f3f5; padding: 8px 12px; border-radius: 8px; width: 250px; }
        .search-bar input { border: none; outline: none; background: none; width: 100%; font-size: 14px; color: #333; }
        .profile-box { display: flex; align-items: center; gap: 15px; }
        .profile-details { display: flex; flex-direction: column; align-items: flex-end; }
        .profile-details span { font-size: 14px; color: #333; font-weight: 600; }
        .profile-details small { font-size: 12px; color: #666; }
        .logout-btn { background: #dc3545; border: none; color: white; padding: 8px 14px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
        .logout-btn:hover { background: #c82333; }
        .main-content { padding: 30px; flex: 1; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 15px; transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-5px); }
        .icon-box { background: linear-gradient(135deg, #007bff, #00c6ff); padding: 15px; border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center; }
        .icon-box.doctors { background: linear-gradient(135deg, #6f42c1, #9b59b6); }
        .icon-box.appointments { background: linear-gradient(135deg, #ffc107, #ffb347); }
        .icon-box.prescriptions { background: linear-gradient(135deg, #17a2b8, #20c997); }
        .icon-box.revenue { background: linear-gradient(135deg, #28a745, #85e085); }
        .stat-info h3 { color: #333; margin: 0; font-size: 1.2rem; }
        .stat-info p { margin: 5px 0 0; font-size: 1.8rem; font-weight: bold; color: #2c3e50; }
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
        .chart-container { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .chart-container h3 { color: #2c3e50; margin-bottom: 20px; }
        @media (max-width: 768px) {
          .charts-grid { grid-template-columns: 1fr; }
          .sidebar { width: 100%; flex-direction: row; overflow-x: auto; }
          .search-bar { width: 150px; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <h3>🩺 Admin Panel</h3>
          <ul>
            <li><a href="/admin-dashboard"><BarChart2 size={18}/> Dashboard</a></li>
            <li><a href="/admin/patients"><Users size={18}/> Patients</a></li>
            <li><a href="/admin/doctors"><Stethoscope size={18}/> Doctors</a></li>
            <li><a href="/admin/appointments"><Calendar size={18}/> Appointments</a></li>
            {/* <li><a href="/admin/prescriptions"><FileText size={18}/> Prescriptions</a></li> */}
            <li><a href="/admin/billing"><DollarSign size={18}/> Billing</a></li>
            <li><a href="/admin/reports"><ClipboardList size={18}/> Reports</a></li>
            <li><a href="/admin/notifications"><Bell size={18}/> Notifications</a></li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="topbar">
          <div className="search-bar">
            <Search size={16} color="#666" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="profile-box">
            <div className="profile-details">
              <span>{admin.name}</span>
              <small>{admin.email}</small>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <div className="main-content">
          {error && <Alert severity="error">{error}</Alert>}

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="icon-box"><Users size={26} /></div>
              <div className="stat-info"><h3>Patients</h3><p>{stats.patients}</p></div>
            </div>
            <div className="stat-card">
              <div className="icon-box doctors"><Stethoscope size={26} /></div>
              <div className="stat-info"><h3>Doctors</h3><p>{stats.doctors}</p></div>
            </div>
            <div className="stat-card">
              <div className="icon-box appointments"><Calendar size={26} /></div>
              <div className="stat-info"><h3>Appointments</h3><p>{stats.appointments}</p></div>
            </div>
            {/* <div className="stat-card">
              <div className="icon-box prescriptions"><FileText size={26} /></div>
              <div className="stat-info"><h3>Prescriptions</h3><p>{stats.prescriptions}</p></div>
            </div> */}
            <div className="stat-card">
              <div className="icon-box revenue"><DollarSign size={26} /></div>
              <div className="stat-info"><h3>Revenue</h3><p>${stats.revenue}</p></div>
            </div>
          </div>

          {/* <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
              <Tab label="Patients" />
              <Tab label="Doctors" />
            </Tabs>
          </Box>

          {tabValue === 0 && <AdminPatients patients={patients} setPatients={setPatients} />}
          {tabValue === 1 && <AdminDoctors doctors={doctors} setDoctors={setDoctors} />} */}
{/* <br><br></br></br> */}
          {/* Charts */}
          <div className="charts-grid">
            <div className="chart-container">
              <h3>Appointments (Last 7 Days)</h3>
              {chartData.appointments.labels?.length > 0 ? (
                <Line data={chartData.appointments} />
              ) : (
                <p style={{ textAlign: 'center', color: '#999' }}>No appointment data available</p>
              )}
            </div>
            <div className="chart-container">
              <h3>Revenue (Last 6 Months)</h3>
              {chartData.revenue.labels?.length > 0 ? (
                <Bar data={chartData.revenue} />
              ) : (
                <p style={{ textAlign: 'center', color: '#999' }}>No revenue data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;