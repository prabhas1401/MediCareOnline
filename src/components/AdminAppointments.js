import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doctors, patients, getMockAppointments } from "../../src/mockData";
import AppointmentForm from "./Admin/Appointments/Form";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

  // Load appointments from localStorage or fallback to mock
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    const stored = localStorage.getItem("mockAppointments");
    let appts = stored ? JSON.parse(stored) : getMockAppointments();

    // Enrich appointments with doctor/patient names
    const enriched = appts.map((appt) => {
      const patient = patients.find((p) => p.id === appt.patientId);
      const doctor = doctors.find((d) => d.id === appt.doctorId);
      return {
        ...appt,
        patientName: patient ? patient.name : "Unknown Patient",
        doctorName: doctor ? doctor.name : "Unknown Doctor",
        status: appt.status || "REQUESTED",
        symptoms: appt.symptoms || "",
      };
    });

    setAppointments(enriched);
  };

  const saveAppointments = (appts) => {
    localStorage.setItem("mockAppointments", JSON.stringify(appts));
    loadAppointments();
  };

  const handleUpdateStatus = (id, status) => {
    let appts = appointments.map((a) =>
      a.id === id
        ? { ...a, status, note: status === "CANCELLED" ? "Cancelled by Admin" : a.note }
        : a
    );
    saveAppointments(appts);
    alert(`Appointment ${status.toLowerCase()}! Mock notification sent.`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Cancel appointment?")) {
      handleUpdateStatus(id, "CANCELLED");
    }
  };

  const handleSubmit = (data) => {
    let appts = [...appointments];

    if (editingAppt) {
      const index = appts.findIndex((a) => a.id === editingAppt.id);
      appts[index] = { ...appts[index], ...data };
    } else {
      data.id = Date.now();
      data.status = "REQUESTED";
      appts.push(data);
    }

    saveAppointments(appts);
    setShowForm(false);
    setEditingAppt(null);
    alert("Appointment updated/created!");
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>Admin — Appointment Management</h1>
        <button
          style={styles.addButton}
          onClick={() => {
            setShowForm(true);
            setEditingAppt(null);
          }}
        >
          + Add Appointment
        </button>
      </div>

      <table style={styles.table}>
        <thead style={styles.tableHead}>
          <tr>
            <th style={styles.th}>Patient</th>
            <th style={styles.th}>Doctor</th>
            <th style={styles.th}>Date / Time</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Symptoms</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((appt) => (
              <tr key={appt.id} style={styles.row}>
                <td style={styles.td}>{appt.patientName}</td>
                <td style={styles.td}>{appt.doctorName}</td>
                <td style={styles.td}>
                  {appt.date} {appt.time || ""}
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.status,
                      backgroundColor:
                        appt.status === "REQUESTED"
                          ? "#fff3cd"
                          : appt.status === "CANCELLED"
                          ? "#f8d7da"
                          : "#d4edda",
                      color:
                        appt.status === "REQUESTED"
                          ? "#856404"
                          : appt.status === "CANCELLED"
                          ? "#721c24"
                          : "#155724",
                    }}
                  >
                    {appt.status}
                  </span>
                </td>
                <td style={styles.td}>{appt.symptoms}</td>
                <td style={styles.td}>
                  <button
                    style={styles.actionBtnGreen}
                    onClick={() => handleUpdateStatus(appt.id, "CONFIRMED")}
                  >
                    Confirm
                  </button>
                  <button
                    style={styles.actionBtnYellow}
                    onClick={() => handleUpdateStatus(appt.id, "RESCHEDULED")}
                  >
                    Reschedule
                  </button>
                  <button
                    style={styles.actionBtnRed}
                    onClick={() => handleDelete(appt.id)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={styles.noData}>
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <h2 style={styles.popupTitle}>
              {editingAppt ? "Edit Appointment" : "Create Appointment"}
            </h2>
            <AppointmentForm initialData={editingAppt} onSubmit={handleSubmit} />
            <button
              onClick={() => setShowForm(false)}
              style={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Styles (same as your current code) ----------
const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#f4f6f8",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: "100vh",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  addButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    fontSize: "15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  tableHead: {
    backgroundColor: "#ecf0f1",
  },
  th: {
    textAlign: "left",
    padding: "14px",
    fontWeight: "600",
    color: "#34495e",
    borderBottom: "2px solid #dee2e6",
  },
  td: {
    padding: "12px",
    color: "#2c3e50",
    borderBottom: "1px solid #f0f0f0",
  },
  row: {
    transition: "background 0.2s ease",
  },
  status: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  actionBtnGreen: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "5px 10px",
    margin: "0 4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  actionBtnYellow: {
    backgroundColor: "#ffc107",
    color: "#212529",
    border: "none",
    borderRadius: "6px",
    padding: "5px 10px",
    margin: "0 4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  actionBtnRed: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "5px 10px",
    margin: "0 4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  noData: {
    textAlign: "center",
    padding: "20px",
    color: "#7f8c8d",
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
  popup: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "30px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  popupTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: "20px",
  },
  closeButton: {
    marginTop: "10px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    width: "100%",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default AdminAppointments;