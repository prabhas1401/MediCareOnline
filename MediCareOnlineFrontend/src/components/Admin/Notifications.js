import React, { useState, useEffect } from "react";
import api from "../../services/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({
    userId: "",
    title: "",
    body: "",
    type: "EMAIL",
  }); // EMAIL, SMS, INAPP

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token || "";

    if (!token) {
      console.warn("⚠️ No token found, skipping notification fetch.");
      return;
    }

    api.get("/admin/notifications", token).then(setNotifications);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = localStorage.getItem("loggedInUser");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token || "";

    if (!token) return;

    await api.post("/admin/notifications/send", form, token);
    alert("Notification sent!");
    setForm({ userId: "", title: "", body: "", type: "EMAIL" });

    api.get("/admin/notifications", token).then(setNotifications);
  };

  return (
    <div className="content">
      <h2>Notifications Management</h2>
      <form onSubmit={handleSubmit} className="form" style={{ marginBottom: "30px" }}>
        <label>User ID:</label>
        <input type="number" name="userId" value={form.userId} onChange={handleChange} required />

        <label>Title:</label>
        <input type="text" name="title" value={form.title} onChange={handleChange} required />

        <label>Body:</label>
        <textarea name="body" value={form.body} onChange={handleChange} rows="3" required></textarea>

        <label>Type:</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
          <option value="INAPP">In-App</option>
        </select>

        <button type="submit" className="btn btn-primary">Send Notification</button>
      </form>

      <h3>Recent Notifications</h3>
      <table className="table">
        <thead>
          <tr><th>ID</th><th>User</th><th>Title</th><th>Type</th><th>Sent At</th></tr>
        </thead>
        <tbody>
          {notifications.map((n) => (
            <tr key={n.id}>
              <td>{n.id}</td>
              <td>{n.userId}</td>
              <td>{n.title}</td>
              <td>{n.type}</td>
              <td>{n.sentAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Notifications;
