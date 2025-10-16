import React, { useState, useEffect } from "react";
import api from "../../../services/api";

const BillingList = () => {
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, paid, refunded

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token || "";

    if (!token) {
      console.warn("⚠️ No token found, skipping billing fetch.");
      return;
    }

    api.get(`/admin/bills?status=${filter}`, token).then(setBills);
  }, [filter]);

  const handleMarkPaid = async (id) => {
    const storedUser = localStorage.getItem("loggedInUser");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token || "";

    if (!token) return;

    await api.put(`/admin/bills/${id}/pay`, {}, token);
    setBills((bills) =>
      bills.map((b) => (b.id === id ? { ...b, status: "PAID" } : b))
    );
  };

  const handleRefund = async (id) => {
    if (!window.confirm("Refund this bill?")) return;

    const storedUser = localStorage.getItem("loggedInUser");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token || "";

    if (!token) return;

    await api.post(`/admin/bills/${id}/refund`, {}, token);
    setBills((bills) =>
      bills.map((b) => (b.id === id ? { ...b, status: "REFUNDED" } : b))
    );

    // Simulate notification
    await api.post(
      "/admin/notifications/send",
      {
        userId: id,
        type: "EMAIL",
        title: "Refund Processed",
        body: "Your payment has been refunded.",
      },
      token
    );
  };

  return (
    <div className="content">
      <style>{`
        .content { padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .filters { margin-bottom: 20px; }
        .filters select { padding: 8px; border: 1px solid #ccc; border-radius: 5px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
        .table th { background: #007bff; color: white; }
        .status-badge { padding: 4px 8px; border-radius: 4px; color: white; font-size: 0.8rem; }
        .status-PENDING { background: #ffc107; }
        .status-PAID { background: #28a745; }
        .status-REFUNDED { background: #6c757d; }
        .btn { padding: 5px 10px; border-radius: 3px; margin-right: 5px; cursor: pointer; border: none; }
        .btn-success { background: #28a745; color: white; }
        .btn-warning { background: #ffc107; color: #212529; }
      `}</style>

      <h2>Billing Management</h2>

      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>Appointment</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.patientName}</td>
              <td>{b.appointmentId}</td>
              <td>${b.amount}</td>
              <td>
                <span className={`status-badge status-${b.status}`}>
                  {b.status}
                </span>
              </td>
              <td>
                {b.status === "PENDING" && (
                  <button
                    onClick={() => handleMarkPaid(b.id)}
                    className="btn btn-success"
                  >
                    Mark Paid
                  </button>
                )}
                {b.status === "PAID" && (
                  <button
                    onClick={() => handleRefund(b.id)}
                    className="btn btn-warning"
                  >
                    Refund
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillingList;