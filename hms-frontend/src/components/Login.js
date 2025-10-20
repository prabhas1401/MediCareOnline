// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';

// const Login = () => {
//   const [form, setForm] = useState({ email: '', password: '', role: 'patient' });
//   const navigate = useNavigate();

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post('/auth/login', form);
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('role', form.role);
//       navigate(`/${form.role}`);
//     } catch (err) {
//       alert('Login failed');
//     }
//   };

//   return (
//     <div className="container">
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit} className="card">
//         <div className="form-group">
//           <select name="role" value={form.role} onChange={handleChange}>
//             <option value="admin">Admin</option>
//             <option value="doctor">Doctor</option>
//             <option value="patient">Patient</option>
//           </select>
//         </div>
//         <div className="form-group">
//           <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
//         </div>
//         <button type="submit" className="btn btn-primary">Login</button>
//       </form>
//     </div>
//   );
// };

// export default Login;
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';

// const Login = () => {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       // Hardcoded admin login
//       if (form.email === 'admin@hms.com' && form.password === 'admin123') {
//         const adminUser = {
//           email: 'admin@hms.com',
//           role: 'ADMIN',
//           token: 'admin-token', // dummy token
//         };
//         localStorage.setItem('loggedInUser', JSON.stringify(adminUser));
//         navigate('/admin/');
//         setLoading(false);
//         return;
//       }

//       // Normal login for doctor/patient
//       const res = await api.post('/auth/login', form);

//       if (res.data?.token) {
//         const user = {
//           email: form.email,
//           role: res.data.role.toUpperCase(), // backend must return role
//           token: res.data.token,
//         };
//         localStorage.setItem('loggedInUser', JSON.stringify(user));

//         if (user.role === 'DOCTOR') navigate('/doctor/');
//         else if (user.role === 'PATIENT') navigate('/patient/');
//         else navigate('/'); // fallback
//       } else {
//         setError(res.data?.message || 'Invalid credentials.');
//       }
//     } catch (err) {
//       console.error(err);
//       const msg = err.response?.data?.message || 'Server error. Try again later.';
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container">
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit} className="card">
//         <div className="form-group">
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={form.email}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div className="form-group">
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={form.password}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         {error && <div className="error">{error}</div>}
//         <button type="submit" className="btn btn-primary" disabled={loading}>
//           {loading ? 'Logging in...' : 'Login'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend login endpoint for ALL users (including admin)
      const res = await api.post('/auth/login', form);

      if (res.data?.token) {
        const user = {
          email: res.data.email,
          role: res.data.role.toUpperCase(),
          token: res.data.token,
        };
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        if (user.role === 'ADMIN') navigate('/admin/');
        else if (user.role === 'DOCTOR') navigate('/doctor/');
        else if (user.role === 'PATIENT') navigate('/patient/');
        else navigate('/'); // fallback
      } else {
        setError(res.data?.message || 'Invalid credentials.');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Server error. Try again later.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;



