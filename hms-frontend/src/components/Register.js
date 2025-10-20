// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';

// const Register = () => {
//   const [role, setRole] = useState('patient');
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phone: '',
//     qualification: '',
//     experience: '',
//     specialization: '',
//     dob: '',
//     mobile: '',
//     gender: ''
//   });
//   const navigate = useNavigate();

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (form.password !== form.confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }
//     try {
//       await api.post('/auth/register', { ...form, role });
//       alert('Registration successful. For doctors, wait for admin approval.');
//       navigate('/login');
//     } catch (err) {
//       alert('Registration failed');
//     }
//   };

//   return (
//     <div className="container">
//       <h2>Register</h2>
//       <form onSubmit={handleSubmit} className="card">
//         <div className="form-group">
//           <select name="role" value={role} onChange={(e) => setRole(e.target.value)}>
//             <option value="doctor">Doctor</option>
//             <option value="patient">Patient</option>
//           </select>
//         </div>
//         <div className="form-group">
//           <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
//         </div>
//         {role === 'doctor' && (
//           <>
//             <div className="form-group">
//               <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <input type="text" name="qualification" placeholder="Qualification" value={form.qualification} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <input type="text" name="experience" placeholder="Experience" value={form.experience} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <input type="text" name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} required />
//             </div>
//           </>
//         )}
//         {role === 'patient' && (
//           <>
//             <div className="form-group">
//               <input type="date" name="dob" value={form.dob} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <input type="text" name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <select name="gender" value={form.gender} onChange={handleChange} required>
//                 <option value="">Select Gender</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>
//           </>
//         )}
//         <button type="submit" className="btn btn-primary">Register</button>
//       </form>
//     </div>
//   );
// };

// export default Register;
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';

// const Register = () => {
//   const navigate = useNavigate();
//   const [step, setStep] = useState(1); // Step 1: role selection, Step 2: form
//   const [role, setRole] = useState('');
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phone: '',
//     qualification: '',
//     experience: '',
//     specialization: '',
//     dob: '',
//     mobile: '',
//     gender: ''
//   });
//   const [error, setError] = useState('');

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleRoleSelect = (selectedRole) => {
//     setRole(selectedRole);
//     setStep(2);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (form.password !== form.confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     try {
//       await api.post('/auth/register', { ...form, role });
//       alert('Registration successful! For doctors, wait for admin approval.');
//       navigate('/login');
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || 'Registration failed. Try again.');
//     }
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         {step === 1 && (
//           <>
//             <h2 style={styles.heading}>Select Role</h2>
//             <div style={styles.roleContainer}>
//               <button style={styles.roleButton} onClick={() => handleRoleSelect('patient')}>
//                 Register as Patient
//               </button>
//               <button style={styles.roleButton} onClick={() => handleRoleSelect('doctor')}>
//                 Register as Doctor
//               </button>
//             </div>
//           </>
//         )}

//         {step === 2 && (
//           <>
//             <h2 style={styles.heading}>Register as {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
//             <form onSubmit={handleSubmit} style={styles.form}>
//               <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required />
//               <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
//               <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
//               <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />

//               {role === 'doctor' && (
//                 <>
//                   <input name="phone" type="text" placeholder="Phone" value={form.phone} onChange={handleChange} required />
//                   <input name="qualification" type="text" placeholder="Qualification" value={form.qualification} onChange={handleChange} required />
//                   <input name="experience" type="text" placeholder="Experience" value={form.experience} onChange={handleChange} required />
//                   <input name="specialization" type="text" placeholder="Specialization" value={form.specialization} onChange={handleChange} required />
//                 </>
//               )}

//               {role === 'patient' && (
//                 <>
//                   <input name="dob" type="date" value={form.dob} onChange={handleChange} required />
//                   <input name="mobile" type="text" placeholder="Mobile" value={form.mobile} onChange={handleChange} required />
//                   <select name="gender" value={form.gender} onChange={handleChange} required>
//                     <option value="">Select Gender</option>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </>
//               )}

//               {error && <div style={styles.error}>{error}</div>}

//               <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
//                 <button type="button" style={{ ...styles.button, background: '#6c757d' }} onClick={() => setStep(1)}>
//                   Back
//                 </button>
//                 <button type="submit" style={styles.button}>
//                   Register
//                 </button>
//               </div>
//             </form>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// const styles = {
//   page: {
//     minHeight: '100vh',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     background: '#f3f7fa',
//     padding: 20,
//   },
//   card: {
//     width: 450,
//     padding: 30,
//     borderRadius: 12,
//     background: '#fff',
//     boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
//   },
//   heading: {
//     color: '#0077b6',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   roleContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: 15,
//   },
//   roleButton: {
//     padding: 15,
//     background: '#0077b6',
//     color: '#fff',
//     border: 'none',
//     borderRadius: 8,
//     cursor: 'pointer',
//     fontSize: 16,
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: 12,
//   },
//   button: {
//     padding: 12,
//     background: '#0077b6',
//     color: '#fff',
//     border: 'none',
//     borderRadius: 6,
//     cursor: 'pointer',
//     fontWeight: 'bold',
//     marginTop: 10,
//   },
//   error: {
//     color: 'red',
//     fontSize: 14,
//     textAlign: 'center',
//   },
// };

// export default Register;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: role selection, Step 2: form
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    qualification: '',
    experience: '',
    specialization: '',
    dob: '',
    mobile: '',
    gender: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await api.post('/auth/register', { ...form, role });
      alert('Registration successful! For doctors, wait for admin approval.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  const specializations = [
    'Cardiologist',
    'Orthopedic',
    'Dentist',
    'Gynaecologist',
    'Neurologist',
    'Gastroenterologist',
    'Pediatrics',
    'Radiology',
    'General Physician',
    'Otolaryngologist-ENT',
    'Endocrinologist',
    'Oncology'
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {step === 1 && (
          <>
            <h2 style={styles.heading}>Choose Your Role</h2>
            <div style={styles.roleContainer}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={styles.roleSelectButton} onClick={() => handleRoleSelect('patient')}>
                  Register as Patient
                </button>
                <button style={styles.roleSelectButton} onClick={() => handleRoleSelect('doctor')}>
                  Register as Doctor
                </button>
              </div>
              <div style={styles.infoText}>Select a role to continue</div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={styles.heading}>Register as {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required style={styles.input} />
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={styles.input} />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={styles.input} />
              <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required style={styles.input} />

              {role === 'doctor' && (
                <>
                  <input name="phone" type="text" placeholder="Phone Number" value={form.phone} onChange={handleChange} required style={styles.input} />
                  <input name="qualification" type="text" placeholder="Qualification" value={form.qualification} onChange={handleChange} required style={styles.input} />
                  <input name="experience" type="text" placeholder="Experience (years)" value={form.experience} onChange={handleChange} required style={styles.input} />
                  <select name="specialization" value={form.specialization} onChange={handleChange} required style={styles.input}>
                    <option value="">Select Specialization</option>
                    {specializations.map((spec, index) => (
                      <option key={index} value={spec}>{spec}</option>
                    ))}
                  </select>
                </>
              )}

              {role === 'patient' && (
                <>
                  <input name="dob" type="date" value={form.dob} onChange={handleChange} required style={styles.input} />
                  <input name="mobile" type="text" placeholder="Mobile Number" value={form.mobile} onChange={handleChange} required style={styles.input} />
                  <select name="gender" value={form.gender} onChange={handleChange} required style={styles.input}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </>
              )}

              {error && <div style={styles.error}>{error}</div>}

              <div style={styles.buttonGroup}>
                <button type="button" style={{ ...styles.button, background: '#6c757d' }} onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" style={styles.button}>
                  Register
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #e0f7fa, #f1f8ff)',
    padding: 20,
  },
  card: {
    width: 500,
    padding: 35,
    borderRadius: 15,
    background: '#fff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease-in-out',
  },
  heading: {
    color: '#0077b6',
    textAlign: 'center',
    marginBottom: 25,
    fontSize: 24,
    fontWeight: 700,
  },
  roleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    alignItems: 'center',
  },
  roleSelectButton: {
    padding: '10px 20px',
    background: '#0077b6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    outline: 'none',
    fontSize: 14,
    transition: 'all 0.3s',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flex: 1,
    padding: 12,
    margin: '0 5px',
    background: '#0077b6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  error: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
};

export default Register;

