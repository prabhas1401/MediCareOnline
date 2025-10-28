
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { authAPI } from "../services/api";

const Login = () => {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [forgotModal, setForgotModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.login(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      navigate("/welcome"); // To middle page
    } catch (error) {
      console.error("Login error:", error);
      // Display specific backend message if available
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      alert(errorMessage);
    }
  };

  const handleForgot = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      alert("Reset link sent to email");
      setForgotModal(false);
    } catch (error) {
      alert("Error sending reset link");
    }
  };

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, newPassword });
      alert("Password reset successful");
      setResetModal(false);
      navigate("/login");
    } catch (error) {
      alert("Error resetting password");
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "400px",
        margin: "auto",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          name="identifier"
          placeholder="Email"
          value={form.identifier}
          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
          }}
        >
          Login
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        <Link
          onClick={() => setForgotModal(true)}
          style={{ color: "#007bff", cursor: "pointer" }}
        >
          Forgot Password?
        </Link>
        <br />
      </p>

      {forgotModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "2rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Forgot Password</h3>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          />
          <button
            onClick={handleForgot}
            style={{
              width: "100%",
              padding: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
            }}
          >
            Send Verification
          </button>
          <button
            onClick={() => setForgotModal(false)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              background: "#ccc",
              border: "none",
            }}
          >
            Close
          </button>
        </div>
      )}

      {resetModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "2rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Reset Password</h3>
          <input
            placeholder="Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          />
          <button
            onClick={handleReset}
            style={{
              width: "100%",
              padding: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
            }}
          >
            Reset
          </button>
          <button
            onClick={() => setResetModal(false)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              background: "#ccc",
              border: "none",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;