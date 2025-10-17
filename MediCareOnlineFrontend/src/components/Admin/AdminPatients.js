import React, { useEffect, useState } from "react";

// 🧠 Dummy patient data
const dummyPatients = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@gmail.com",
    phone: "9876543210",
    address: "123 Main St, Hyderabad",
    records: [
      {
        type: "Prescription",
        name: "Blood Pressure Medication",
        uploadedAt: Date.now() - 86400000,
        dataUrl: "#",
      },
    ],
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "9123456789",
    address: "45 Banjara Hills, Hyderabad",
    records: [
      {
        type: "Scan",
        name: "Chest X-Ray",
        uploadedAt: Date.now() - 172800000,
        dataUrl: "#",
      },
    ],
  },
];

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    // load dummy data
    setPatients(dummyPatients);
  }, []);

  const openPatient = (patient) => {
    setSelected(patient);
    setEditData({ ...patient });
  };

  const handleSave = () => {
    const updated = patients.map((p) =>
      p.id === selected.id ? editData : p
    );
    setPatients(updated);
    alert("Patient details updated successfully!");
  };

  const handleDeletePatient = (id) => {
    if (!window.confirm("Delete this patient?")) return;
    setPatients(patients.filter((p) => p.id !== id));
    setSelected(null);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👩‍⚕️ Patient Management ({patients.length})</h2>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} style={styles.tr}>
              <td style={styles.td}>
                <button
                  onClick={() => openPatient(p)}
                  style={styles.linkButton}
                >
                  {p.name}
                </button>
              </td>
              <td style={styles.td}>{p.email}</td>
              <td style={styles.td}>{p.phone}</td>
              <td style={styles.td}>
                <button
                  onClick={() => handleDeletePatient(p.id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Patient Details Modal */}
      {selected && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Patient Profile</h3>

            <label style={styles.label}>Name</label>
            <input
              type="text"
              value={editData.name || ""}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              style={styles.input}
            />

            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={editData.email || ""}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
              style={styles.input}
            />

            <label style={styles.label}>Phone</label>
            <input
              type="text"
              value={editData.phone || ""}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
              style={styles.input}
            />

            <label style={styles.label}>Address</label>
            <textarea
              value={editData.address || ""}
              onChange={(e) =>
                setEditData({ ...editData, address: e.target.value })
              }
              rows="2"
              style={styles.textarea}
            />

            <button onClick={handleSave} style={styles.saveBtn}>
              Save Changes
            </button>
            <button
              onClick={() => setSelected(null)}
              style={styles.closeBtn}
            >
              Close
            </button>

            <h4 style={styles.recordsTitle}>📋 Records</h4>
            {(selected.records || []).map((r, i) => (
              <div key={i} style={styles.recordCard}>
                <strong>{r.type}</strong> — {r.name}
                <div style={styles.recordMeta}>
                  Uploaded:{" "}
                  {r.uploadedAt
                    ? new Date(r.uploadedAt).toLocaleString()
                    : "N/A"}
                </div>
                <a href={r.dataUrl} target="_blank" rel="noreferrer">
                  View File
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 🎨 Inline Styles
const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#f4f6f8",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: "100vh",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    backgroundColor: "#ecf0f1",
    color: "#2c3e50",
    fontWeight: "600",
    borderBottom: "2px solid #ddd",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    color: "#34495e",
  },
  tr: {
    transition: "background 0.2s ease",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#007bff",
    fontWeight: "600",
    cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "30px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "15px",
    textAlign: "center",
  },
  label: {
    fontWeight: "600",
    color: "#34495e",
    marginTop: "10px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginTop: "5px",
    fontSize: "15px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginTop: "5px",
    fontSize: "15px",
    resize: "none",
  },
  saveBtn: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "15px",
    width: "100%",
    cursor: "pointer",
    fontWeight: "600",
  },
  closeBtn: {
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "10px",
    width: "100%",
    cursor: "pointer",
    fontWeight: "600",
  },
  recordsTitle: {
    marginTop: "25px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  recordCard: {
    backgroundColor: "#f8f9fa",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "10px",
    fontSize: "14px",
  },
  recordMeta: {
    fontSize: "12px",
    color: "#666",
  },
};

export default AdminPatients;