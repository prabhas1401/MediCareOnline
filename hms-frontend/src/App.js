// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Layout from "./components/Layout";
// import Home from './components/Home';
// import Login from './components/Login';
// import Register from './components/Register';
// import AdminDashboard from './components/AdminDashboard';
// import PatientDashboard from './components/PatientDashboard';
// import DoctorDashboard from './components/DoctorDashboard';
// import './styles.css';
// import './components/chartConfig';


// function App() {
//   return (
//     <Router>
//       <Routes>
//       <Route path="/" element={<Layout><Home /></Layout>} />
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/admin/*" element={<AdminDashboard />} />
//         <Route path="/patient/*" element={<PatientDashboard />} />
//         <Route path="/doctor/*" element={<DoctorDashboard />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import './styles.css';
import './components/chartConfig';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/patient/*" element={<PatientDashboard />} />
          <Route path="/doctor/*" element={<DoctorDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
