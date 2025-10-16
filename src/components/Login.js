import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ LOGIN LOGIC
  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = form;

    // Admin fixed login
    if (email === "admin@hms.com" && password === "admin123") {
      const adminUser = { email, role: "ADMIN", name: "Admin" };
      localStorage.setItem("loggedInUser", JSON.stringify(adminUser));
      navigate("/admin/dashboard");
      return;
    }

    // Check Doctors
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];
    const doctor = doctors.find(
      (d) => d.email === email && d.password === password
    );
    if (doctor) {
      const loggedInDoctor = { ...doctor, role: "DOCTOR" };
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInDoctor));
      navigate("/doctor/dashboard");
      return;
    }

    // Check Patients
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const patient = users.find(
      (u) => u.email === email && u.password === password
    );
    if (patient) {
      const loggedInPatient = { ...patient, role: "PATIENT" }; // <-- FIX
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInPatient));
      navigate("/patient/dashboard");
      return;
    }

    // No match
    alert("Invalid credentials or user not registered.");
  };

  // ✅ Forgot Password Logic
  const handleForgotPassword = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const doctors = JSON.parse(localStorage.getItem("doctors")) || [];

    // First, check patients
    const userIndex = users.findIndex((u) => u.email === resetEmail);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));
      alert("Password reset successful for patient!");
      setForgotMode(false);
      return;
    }

    // Then, check doctors
    const doctorIndex = doctors.findIndex((d) => d.email === resetEmail);
    if (doctorIndex !== -1) {
      doctors[doctorIndex].password = newPassword;
      localStorage.setItem("doctors", JSON.stringify(doctors));
      alert("Password reset successful for doctor!");
      setForgotMode(false);
      return;
    }

    alert("User not found!");
  };

  return (
    <div className="login-wrapper">
      <style>{`
        .login-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: url("/bg-login.jpg") no-repeat center center fixed;
          background-size: cover;
        }
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          padding: 30px 40px;
          border-radius: 12px;
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
          width: 420px;
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #007bff;
        }
        label {
          display: block;
          margin: 10px 0 6px;
          font-weight: 600;
        }
        input {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 0.95rem;
        }
        button {
          width: 100%;
          padding: 12px;
          background: #007bff;
          color: white;
          font-size: 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 5px;
        }
        button:hover:not(:disabled) {
          background: #0056b3;
        }
        .toggle-link {
          text-align: center;
          margin-top: 10px;
          cursor: pointer;
          color: #007bff;
          font-size: 0.9rem;
        }
      `}</style>

      <div className="login-card">
        {!forgotMode ? (
          <>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="submit">Login</button>
            </form>
            <div className="toggle-link" onClick={() => setForgotMode(true)}>
              Forgot Password?
            </div>
          </>
        ) : (
          <>
            <h2>Reset Password</h2>
            <form onSubmit={handleForgotPassword}>
              <label>Email:</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <label>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">Reset Password</button>
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                style={{ marginTop: "10px", backgroundColor: "#6c757d" }}
              >
                Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;