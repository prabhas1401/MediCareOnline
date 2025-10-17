import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPatient} from "../services/localDb";

const PatientRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    mobile: "",
    gender: "",
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

    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some((u) => u.email === form.email)) {
      setError("Email already registered!");
      setLoading(false);
      return;
    }

    const newPatient = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      password: form.password,
      dob: form.dob,
      phone: form.mobile,
      gender: form.gender,
      role: "patient",
      medicalHistory: "",
    };

    users.push(newPatient);
    localStorage.setItem("users", JSON.stringify(users));

    alert(`Patient Registered: ${form.name}`);
    navigate("/login");
    setLoading(false);
  };

  return (
    <div className="patient-register">
      <style>{`
        .patient-register {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url('https://img.freepik.com/free-photo/healthcare-still-life-with-copy-space_23-2148854032.jpg') no-repeat center center/cover;
          padding: 20px;
        }
        .patient-register form {
          background: rgba(255, 255, 255, 0.95);
          padding: 25px 30px;
          border-radius: 12px;
          border: 2px solid #38a169;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          backdrop-filter: blur(5px);
        }
        .patient-register h3 {
          color: #2f855a;
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
        }
        .patient-register label {
          display: block;
          margin: 10px 0 5px;
          font-weight: 600;
          color: #333;
        }
        .patient-register input, .patient-register select {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: border 0.3s;
        }
        .patient-register input:focus, .patient-register select:focus {
          border-color: #38a169;
        }
        .patient-register button {
          width: 100%;
          padding: 12px;
          background: #38a169;
          color: white;
          font-size: 16px;
          font-weight: bold;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .patient-register button:hover:not(:disabled) {
          background: #2f855a;
        }
        .patient-register button:disabled {
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
        <h3>Patient Registration</h3>

        <label>Name:</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} required />

        <label>Email:</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Password:</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />

        <label>Confirm Password:</label>
        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />

        {error && <p className="error-text">{error}</p>}

        <label>Date of Birth:</label>
        <input type="date" name="dob" value={form.dob} onChange={handleChange} required />

        <label>Mobile Number:</label>
        <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} required pattern="[0-9]{10}" placeholder="10 digit number" />

        <label>Gender:</label>
        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">-- Select Gender --</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>

        <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register as Patient"}</button>
      </form>
    </div>
  );
};

export default PatientRegister;