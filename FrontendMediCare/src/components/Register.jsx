

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ 
    role: 'PATIENT', 
    fullName: '', 
    emailId: '', 
    phoneNumber: '', 
    rawPassword: '', 
    confirmPassword: '', 
    gender: '', 
    dateOfBirth: '', 
    specialization: '', 
    qualification: '', 
    experienceYears: '' 
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rawPassword !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      let response;
      if (form.role === 'PATIENT') {
        response = await authAPI.registerPatient(form);
      } else {
        response = await authAPI.registerDoctor(form);
      }
      alert(response.data.message || 'Registration successful! Check email for verification.');
      navigate('/login');
    } catch (err) {
      // Backend returns ApiResponse with 'message' on error
      alert('Error: ' + (err.response?.data?.message || 'Registration failed. Please try again.'));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', fontFamily: 'Poppins, sans-serif' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <select 
          value={form.role} 
          onChange={(e) => setForm({ ...form, role: e.target.value })} 
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        >
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
        </select>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={form.fullName} 
          onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
          required 
          style={{ width: '100%', padding: '10px', margin: '10px 0' }} 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={form.emailId} 
          onChange={(e) => setForm({ ...form, emailId: e.target.value })} 
          required 
          style={{ width: '100%', padding: '10px', margin: '10px 0' }} 
        />
        <input 
          type="text" 
          placeholder="Phone" 
          value={form.phoneNumber} 
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} 
          required 
          style={{ width: '100%', padding: '10px', margin: '10px 0' }} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={form.rawPassword} 
          onChange={(e) => setForm({ ...form, rawPassword: e.target.value })} 
          required 
          style={{ width: '100%', padding: '10px', margin: '10px 0' }} 
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={form.confirmPassword} 
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
          required 
          style={{ width: '100%', padding: '10px', margin: '10px 0' }} 
        />
        {form.role === 'PATIENT' && (
          <>
            <select 
              value={form.gender} 
              onChange={(e) => setForm({ ...form, gender: e.target.value })} 
              required 
              style={{ width: '100%', padding: '10px', margin: '10px 0' }}
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            <input 
              type="date" 
              value={form.dateOfBirth} 
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} 
              required 
              style={{ width: '100%', padding: '10px', margin: '10px 0' }} 
            />
          </>
        )}
        {form.role === 'DOCTOR' && (
          <>
            <select 
              value={form.specialization} 
              onChange={(e) => setForm({ ...form, specialization: e.target.value })} 
              required 
              style={{ width: '100%', padding: '10px', margin: '10px 0' }}
            >
              <option value="">Select Specialization</option>
              <option value="CARDIOLOGIST">Cardiologist</option>
              <option value="ORTHOPEDIC">Orthopedic</option>
              <option value="DENTIST">Dentist</option>
              <option value="GYNAECOLOGIST">Gynaecologist</option>
              <option value="NEUROLOGIST">Neurologist</option>
              <option value="GASTROENTEROLOGIST">Gastroenterologist</option>
              <option value="PEDIATRICS">Pediatrics</option>
              <option value="RADIOLOGY">Radiology</option>
              <option value="GENERAL_PHYSICIAN">General Physician</option>
              <option value="OTOLARYNGOLOGIST_ENT">Otolaryngologist ENT</option>
              <option value="ENDOCRINOLOGIST">Endocrinologist</option>
              <option value="ONCOLOGY">Oncology</option>
            </select>
            <input 
              type="text" 
              placeholder="Qualification" 
              value={form.qualification} 
              onChange={(e) => setForm({ ...form, qualification: e.target.value })} 
              required 
              style={{ width: '100%', padding: '10px', margin: '10px 0' }} 
            />
            <input 
              type="number" 
              placeholder="Experience Years" 
              value={form.experienceYears} 
              onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} 
              required 
              style={{ width: '100%', padding: '10px', margin: '10px 0' }} 
            />
          </>
        )}
        <button 
          type="submit" 
          style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none' }}
        >
          Register
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        If you have an account, <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;