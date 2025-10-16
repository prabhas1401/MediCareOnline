import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoctor } from "../services/localDb";

const specializations = [
  "Cardiologist",
  "Orthopedic",
  "Dentist",
  "Gynaecologist",
  "Neurologist",
  "Gastroenterologist",
  "Pediatrics",
  "Radiology",
  "General Physician",
  "ENT Specialist",
  "Endocrinologist",
  "Oncologist",
];

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    qualification: "",
    experience: "",
    specialization: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError("");
    setLoading(true);

    // Get existing doctors
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];

    // Prevent duplicate registration
    if (doctors.some((d) => d.email === form.email)) {
      setError("Email already registered!");
      setLoading(false);
      return;
    }

    // Create new doctor
    const newDoctor = {
      id: doctors.length + 1,
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      qualification: form.qualification,
      experience: form.experience,
      specialization: form.specialization,
      role: "DOCTOR",
    };

    doctors.push(newDoctor);
    localStorage.setItem("doctors", JSON.stringify(doctors));

    alert(`Doctor Registered: ${form.name}`);
    navigate("/login");
    setLoading(false);
  };

  return (
    <div className="doctor-register">
      <style>{`
        .doctor-register {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url('https://images.unsplash.com/photo-1588776814546-ec9d7a6fb4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80') no-repeat center center/cover;
        }
        .doctor-register form {
          background: rgba(255, 255, 255, 0.95);
          padding: 25px;
          border-radius: 12px;
          border: 2px solid #0077b6;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
        }
        .doctor-register h3 {
          color: #0077b6;
          text-align: center;
          margin-bottom: 20px;
          font-size: 1.6rem;
        }
        .doctor-register label {
          display: block;
          margin: 10px 0 6px;
          font-weight: 600;
          color: #333;
        }
        .doctor-register input, .doctor-register select {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 0.95rem;
        }
        .doctor-register button {
          width: 100%;
          padding: 12px;
          background: #0077b6;
          color: white;
          font-size: 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.3s;
        }
        .doctor-register button:hover:not(:disabled) {
          background: #005f87;
        }
        .doctor-register button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .error-text {
          color: red;
          text-align: center;
          margin-bottom: 10px;
          font-size: 0.9rem;
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <h3>Doctor Registration</h3>

        <label>Name:</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} required />

        <label>Email:</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Phone Number:</label>
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} required pattern="[0-9]{10}" />

        <label>Password:</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />

        <label>Confirm Password:</label>
        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />

        {error && <p className="error-text">{error}</p>}

        <label>Qualification:</label>
        <input type="text" name="qualification" value={form.qualification} onChange={handleChange} required />

        <label>Experience (Years):</label>
        <input type="number" name="experience" value={form.experience} onChange={handleChange} required min="0" />

        <label>Specialization:</label>
        <select name="specialization" value={form.specialization} onChange={handleChange} required>
          <option value="">-- Select Specialization --</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register as Doctor"}
        </button>
      </form>
    </div>
  );
};

export default DoctorRegister;