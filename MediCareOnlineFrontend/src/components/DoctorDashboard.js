import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);


const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [availability, setAvailability] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeModal, setTimeModal] = useState(null);
  const [timeOptions] = useState(generateTimeOptions());

  // Helpers
  const saveToStorage = (key, data) =>
    localStorage.setItem(key, JSON.stringify(data));
  const loadFromStorage = (key, defaultValue) =>
    JSON.parse(localStorage.getItem(key)) || defaultValue;

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("loggedInUser")) || {
        id: 1,
        name: "John Doe",
        role: "DOCTOR",
        specialization: "Cardiologist",
      };
    if (!storedUser || storedUser.role !== "DOCTOR") {
      navigate("/login");
      return;
    }
    setDoctor(storedUser);

    const dummyPatients = loadFromStorage("patients", [
      { id: 1, name: "Alice Smith", age: 28, gender: "Female", phone: "9876543210" },
      { id: 2, name: "Bob Johnson", age: 35, gender: "Male", phone: "8765432109" },
      { id: 3, name: "Charlie Brown", age: 42, gender: "Male", phone: "7654321098" },
    ]);
    setPatients(dummyPatients);

    const dummyAppointments = loadFromStorage("appointments", [
      {
        id: 1,
        patientId: 1,
        patientName: "Alice Smith",
        status: "Completed",
        date: "2025-10-14",
        time: "10:30 AM",
      },
      {
        id: 2,
        patientId: 2,
        patientName: "Bob Johnson",
        status: "Pending",
        date: "2025-10-15",
        time: "11:00 AM",
      },
    ]);
    setAppointments(dummyAppointments);

    setPrescriptions(
      loadFromStorage("prescriptions", [
        { id: 1, patientId: 1, patientName: "Alice Smith", medicine: "Paracetamol 500mg", date: "2025-10-10" },
        { id: 2, patientId: 1, patientName: "Alice Smith", medicine: "Vitamin C", date: "2025-10-12" },
        { id: 3, patientId: 2, patientName: "Bob Johnson", medicine: "Amoxicillin", date: "2025-10-11" },
      ])
    );

    setReports(
      loadFromStorage("reports", [
        { id: 1, patientId: 1, title: "Blood Test Report", date: "2025-10-09" },
        { id: 2, patientId: 2, title: "X-Ray Report", date: "2025-10-08" },
      ])
    );

    setAvailability(loadFromStorage("availability", {}));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  // -------- Patients ----------
  const handleAddPatient = () => {
    if (!newPatientName.trim()) return alert("Enter valid name");
    const newPatient = {
      id: Date.now(),
      name: newPatientName,
      age: Math.floor(Math.random() * 20) + 25,
      gender: Math.random() > 0.5 ? "Male" : "Female",
      phone: `9${Math.floor(Math.random() * 1000000000)}`,
    };
    const updated = [...patients, newPatient];
    setPatients(updated);
    saveToStorage("patients", updated);
    setShowAddPatientForm(false);
    setNewPatientName("");
  };

  const handleDeletePatient = (patient) => {
    if (!window.confirm(`Delete ${patient.name}?`)) return;
    const updated = patients.filter((p) => p.id !== patient.id);
    setPatients(updated);
    saveToStorage("patients", updated);
  };
  const handleMarkCompleted = (appointmentId) => {
    const updated = appointments.map((a) =>
      a.id === appointmentId ? { ...a, status: "Completed" } : a
    );
    setAppointments(updated);
    saveToStorage("appointments", updated);
  };
  

  // -------- Availability Calendar ----------
  const handleResetAvailability = () => {
    setAvailability({});
    localStorage.removeItem("availability");
  };

  const openTimeModal = (dateStr) => {
    const existing = availability[dateStr] || { status: "On Leave", start: "", end: "" };
    setTimeModal({ dateStr, ...existing });
  };

  const handleSaveModal = () => {
    if (!timeModal) return;
    const { dateStr, status, start, end } = timeModal;
    const updated = {
      ...availability,
      [dateStr]: status === "Available" ? { status, start, end } : { status: "On Leave" },
    };
    setAvailability(updated);
    saveToStorage("availability", updated);
    setTimeModal(null);
  };

  const handleDeleteDayAvailability = (dateStr) => {
    const updated = { ...availability };
    delete updated[dateStr];
    setAvailability(updated);
    saveToStorage("availability", updated);
    setTimeModal(null);
  };

  // -------- Styles ----------
  const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
    zIndex: 1000,
    width: 300,
  };



  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  if (!doctor) return <div style={{ padding: 20 }}>Loading...</div>;

  if (selectedPatient) {
    const patientPrescriptions = prescriptions.filter((p) => p.patientId === selectedPatient.id);
    const patientReports = reports.filter((r) => r.patientId === selectedPatient.id);

    return (
      <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
        <div style={{ width: 220, backgroundColor: "#2c3e50", color: "#fff", padding: 20 }}>
          <h3 style={{ textAlign: "center" }}>Doctor Panel</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {["dashboard", "appointments", "patients", "availability"].map((tab) => (
              <li key={tab} style={{ marginBottom: 10 }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedPatient(null);
                    setActiveTab(tab);
                  }}
                  style={{
                    textDecoration: "none",
                    color: activeTab === tab ? "#1abc9c" : "white",
                    fontWeight: activeTab === tab ? "bold" : "normal",
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </a>
              </li>
            ))}
          </ul>
          <button onClick={handleLogout} style={{ ...actionButtonStyle("#e74c3c"), width: "100%", marginTop: 20 }}>
            Logout
          </button>
        </div>

        <div style={{ flex: 1, padding: 20, backgroundColor: "#ecf0f1", overflowY: "auto" }}>
          <button onClick={() => setSelectedPatient(null)} style={actionButtonStyle("#3498db")}>⬅ Back</button>
          <h2 style={{ marginTop: 10 }}>{selectedPatient.name}'s Profile</h2>

          <table style={{ width: "100%", marginTop: 20, background: "#fff", borderCollapse: "collapse" }}>
            <tbody>
              <tr><td style={profileCell("bold")}>Name:</td><td style={profileCell()}>{selectedPatient.name}</td></tr>
              <tr><td style={profileCell("bold")}>Age:</td><td style={profileCell()}>{selectedPatient.age}</td></tr>
              <tr><td style={profileCell("bold")}>Gender:</td><td style={profileCell()}>{selectedPatient.gender}</td></tr>
              <tr><td style={profileCell("bold")}>Phone:</td><td style={profileCell()}>{selectedPatient.phone}</td></tr>
            </tbody>
          </table>

          <hr style={{ margin: "20px 0" }} />

          <h3>Reports</h3>
          {patientReports.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {patientReports.map((r) => (
                <div key={r.id} style={cardBox()}>
                  <h4>{r.title}</h4>
                  <p>Date: {r.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No reports available.</p>
          )}

          <hr style={{ margin: "20px 0" }} />

          <h3>Prescriptions</h3>
          {patientPrescriptions.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {patientPrescriptions.map((p) => (
                <div key={p.id} style={cardBox()}>
                  <p><b>Medicine:</b> {p.medicine}</p>
                  <p><b>Date:</b> {p.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No prescriptions found.</p>
          )}
        </div>
      </div>
    );
  }


  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <div style={{ width: 220, backgroundColor: "#2c3e50", color: "white", padding: 20 }}>
        <h3 style={{ textAlign: "center" }}>Doctor Panel</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {["dashboard", "appointments", "patients", "availability"].map((tab) => (
            <li key={tab} style={{ marginBottom: 10 }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab);
                }}
                style={{
                  textDecoration: "none",
                  color: activeTab === tab ? "#1abc9c" : "white",
                  fontWeight: activeTab === tab ? "bold" : "normal",
                  padding: "8px 12px",
                  display: "block",
                  borderRadius: 5,
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </a>
            </li>
          ))}
        </ul>
        <button onClick={handleLogout} style={{ marginTop: 20, width: "100%", padding: "10px", ...actionButtonStyle("#e74c3c") }}>
          Logout
        </button>
      </div>
      <div style={{ flex: 1, padding: 20, backgroundColor: "#ecf0f1", overflowY: "auto" }}>
        <h2>Welcome, Dr. {doctor.name}</h2>
        <p>Specialization: {doctor.specialization}</p>

        {activeTab === "dashboard" && (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    {/* KPI Cards */}
    <div style={{ display: "flex", gap: 20 }}>
      <div style={cardBox()}>
        <h4>Total Patients</h4>
        <p style={{ fontSize: 24, fontWeight: "bold" }}>{patients.length}</p>
      </div>
      <div style={cardBox()}>
        <h4>Total Appointments</h4>
        <p style={{ fontSize: 24, fontWeight: "bold" }}>{appointments.length}</p>
      </div>
      <div style={cardBox()}>
        <h4>Pending Appointments</h4>
        <p style={{ fontSize: 24, fontWeight: "bold" }}>
          {appointments.filter((a) => a.status === "Pending").length}
        </p>
      </div>
    </div>

    {/* Appointments Status Pie Chart */}
    <div style={cardBox()}>
      <h4>Appointments Status</h4>
      <Pie
        data={{
          labels: ["Pending", "Completed"],
          datasets: [
            {
              label: "Appointments",
              data: [
                appointments.filter((a) => a.status === "Pending").length,
                appointments.filter((a) => a.status === "Completed").length,
              ],
              backgroundColor: ["#e74c3c", "#2ecc71"],
              borderWidth: 1,
            },
          ],
        }}
        options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
      />
    </div>

    {/* Appointments per Patient Bar Chart */}
    <div style={cardBox()}>
      <h4>Appointments per Patient</h4>
      <Bar
        data={{
          labels: patients.map((p) => p.name),
          datasets: [
            {
              label: "Appointments",
              data: patients.map(
                (p) => appointments.filter((a) => a.patientId === p.id).length
              ),
              backgroundColor: "#3498db",
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, stepSize: 1 } },
        }}
      />
    </div>

    {/* Monthly Appointments Trend Line Chart */}
    <div style={cardBox()}>
      <h4>Monthly Appointments Trend</h4>
      <Line
        data={{
          labels: Array.from({ length: 12 }, (_, i) =>
            new Date(0, i).toLocaleString("default", { month: "short" })
          ),
          datasets: [
            {
              label: "Appointments per Month",
              data: Array.from({ length: 12 }, (_, i) =>
                appointments.filter(
                  (a) => new Date(a.date).getMonth() === i
                ).length
              ),
              borderColor: "#2980b9",
              backgroundColor: "rgba(41, 128, 185, 0.2)",
              tension: 0.3,
            },
          ],
        }}
        options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
      />
    </div>

    {/* Latest Prescriptions Table */}
    <div style={cardBox()}>
      <h4>Recent Prescriptions</h4>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#34495e", color: "#fff" }}>
            <th style={tableCell()}>Patient</th>
            <th style={tableCell()}>Medicine</th>
            <th style={tableCell()}>Date</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map((p) => (
              <tr key={p.id}>
                <td style={tableCell()}>{p.patientName}</td>
                <td style={tableCell()}>{p.medicine}</td>
                <td style={tableCell()}>{p.date}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
)}



        {/* {activeTab === "appointments" && (
          <div>
            <h3>Appointments</h3>
            <table style={{ width: "100%", background: "#fff", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#34495e", color: "#fff" }}>
                  <th style={tableCell()}>Patient Name</th>
                  <th style={tableCell()}>Date</th>
                  <th style={tableCell()}>Time</th>
                  <th style={tableCell()}>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td style={tableCell()}>{a.patientName}</td>
                    <td style={tableCell()}>{a.date}</td>
                    <td style={tableCell()}>{a.time}</td>
                    <td style={tableCell()}>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )} */}
        {activeTab === "appointments" && (
  <div>
    <h3>Appointments</h3>
    <table style={{ width: "100%", background: "#fff", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ backgroundColor: "#34495e", color: "#fff" }}>
          <th style={tableCell()}>Patient Name</th>
          <th style={tableCell()}>Date</th>
          <th style={tableCell()}>Time</th>
          <th style={tableCell()}>Status</th>
          <th style={tableCell()}>Actions</th> {/* ✅ Add this */}
        </tr>
      </thead>
      <tbody>
        {appointments.map((a) => (
          <tr key={a.id}>
            <td style={tableCell()}>{a.patientName}</td>
            <td style={tableCell()}>{a.date}</td>
            <td style={tableCell()}>{a.time}</td>
            <td style={tableCell()}>{a.status}</td>
            <td style={tableCell()}>
              {a.status !== "Completed" && (
                <button
                  onClick={() => handleMarkCompleted(a.id)}
                  style={actionButtonStyle("#2ecc71")}
                >
                  Mark Completed
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


        {activeTab === "patients" && (
          <div>
            <h3>Patients</h3>
            <button onClick={() => setShowAddPatientForm(true)} style={{ ...actionButtonStyle("#1abc9c"), marginBottom: 10 }}>
              Add Patient
            </button>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead>
                <tr style={{ background: "#34495e", color: "#fff" }}>
                  <th style={tableCell()}>Name</th>
                  <th style={tableCell()}>Age</th>
                  <th style={tableCell()}>Gender</th>
                  <th style={tableCell()}>Phone</th>
                  <th style={tableCell()}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td style={tableCell({ color: "#3498db", cursor: "pointer" })} onClick={() => setSelectedPatient(p)}>
                      {p.name}
                    </td>
                    <td style={tableCell()}>{p.age}</td>
                    <td style={tableCell()}>{p.gender}</td>
                    <td style={tableCell()}>{p.phone}</td>
                    <td style={tableCell()}>
                      <button onClick={() => handleDeletePatient(p)} style={actionButtonStyle("#e74c3c")}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showAddPatientForm && (
              <div style={modalStyle}>
                <h4>Add Patient</h4>
                <input
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="Enter Name"
                  style={{ width: "100%", padding: 8, marginBottom: 10 }}
                />
                <div style={{ textAlign: "right" }}>
                  <button onClick={handleAddPatient} style={actionButtonStyle("#27ae60")}>
                    Save
                  </button>
                  <button onClick={() => setShowAddPatientForm(false)} style={actionButtonStyle("#7f8c8d")}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "availability" && (
          <AvailabilityCalendar
            availability={availability}
            year={year}
            month={month}
            monthName={monthName}
            firstDay={firstDay}
            daysInMonth={daysInMonth}
            openTimeModal={openTimeModal}
            handleResetAvailability={handleResetAvailability}
            actionButtonStyle={actionButtonStyle}
            modalStyle={modalStyle}
            timeModal={timeModal}
            setTimeModal={setTimeModal}
            timeOptions={timeOptions}
            handleSaveModal={handleSaveModal}
            handleDeleteDayAvailability={handleDeleteDayAvailability}
            setCurrentMonth={setCurrentMonth}
          />
        )}
      </div>
    </div>
  );
};
function AvailabilityCalendar({
  availability,
  year,
  month,
  monthName,
  firstDay,
  daysInMonth,
  openTimeModal,
  handleResetAvailability,
  actionButtonStyle,
  modalStyle,
  timeModal,
  setTimeModal,
  timeOptions,
  handleSaveModal,
  handleDeleteDayAvailability,
  setCurrentMonth,
}) {
  return (
    <div>
      <h3>Availability Calendar</h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>⬅️</button>
        <h4 style={{ margin: 0 }}>{monthName} {year}</h4>
        <button onClick={() => setCurrentMonth(new Date(year, month+ 1, 1))}>➡️</button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
          textAlign: "center",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} style={{ fontWeight: "bold" }}>{d}</div>
        ))}

        {Array(firstDay).fill(null).map((_, i) => (
          <div key={`empty-${i}`}></div>
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${(month + 1)
            .toString()
            .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
          const dayData = availability[dateStr];
          const bg =
            dayData?.status === "Available"
              ? "#2ecc71"
              : dayData?.status === "On Leave"
              ? "#e74c3c"
              : "#bdc3c7";
          return (
            <div
              key={dateStr}
              onClick={() => openTimeModal(dateStr)}
              style={{
                padding: 10,
                background: bg,
                borderRadius: 8,
                cursor: "pointer",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleResetAvailability}
        style={{ ...actionButtonStyle("#e67e22"), marginTop: 15 }}
      >
        Reset All
      </button>

      {timeModal && (
        <>
          <div style={overlayStyle()}></div>
          <div style={modalBoxStyle()}>
            <h4>Set Availability for {timeModal.dateStr}</h4>
            <div>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="Available"
                  checked={timeModal.status === "Available"}
                  onChange={() =>
                    setTimeModal({ ...timeModal, status: "Available" })
                  }
                />{" "}
                Available
              </label>
              <label style={{ marginLeft: 10 }}>
                <input
                  type="radio"
                  name="status"
                  value="On Leave"
                  checked={timeModal.status === "On Leave"}
                  onChange={() =>
                    setTimeModal({ ...timeModal, status: "On Leave" })
                  }
                />{" "}
                On Leave
              </label>
            </div>

            {timeModal.status === "Available" && (
              <div style={{ marginTop: 10 }}>
                <div style={{ marginBottom: 10 }}>
                  <label>Start Time: </label>
                  <select
                    value={timeModal.start}
                    onChange={(e) =>
                      setTimeModal({ ...timeModal, start: e.target.value })
                    }
                  >
                    <option value="">--Select--</option>
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>End Time: </label>
                  <select
                    value={timeModal.end}
                    onChange={(e) =>
                      setTimeModal({ ...timeModal, end: e.target.value })
                    }
                  >
                    <option value="">--Select--</option>
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button onClick={handleSaveModal} style={actionButtonStyle("#2ecc71")}>
                Save
              </button>
              <button
                onClick={() => handleDeleteDayAvailability(timeModal.dateStr)}
                style={actionButtonStyle("#e67e22")}
              >
                Delete
              </button>
              <button onClick={() => setTimeModal(null)} style={actionButtonStyle("#7f8c8d")}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
function generateTimeOptions() {
  const times = [];
  for (let h = 8; h <= 18; h++) {
    for (let m of ["00", "30"]) {
      const hour12 = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      times.push(`${hour12}:${m} ${ampm}`);
    }
  }
  return times;
}

function cardBox() {
  return {
    background: "#fff",
    borderRadius: 8,
    padding: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };
}

function tableCell(extra = {}) {
  return {
    padding: 10,
    border: "1px solid #ddd",
    textAlign: "left",
    ...extra,
  };
}

function profileCell(weight) {
  return {
    padding: 8,
    borderBottom: "1px solid #ccc",
    fontWeight: weight || "normal",
  };
}

function actionButtonStyle(color) {
  return {
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 14px",
    marginLeft: 8,
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background 0.3s",
  };
}

function cardStyle() {
  return {
    background: "linear-gradient(135deg, #74b9ff, #0984e3)",
    color: "#fff",
    padding: "20px 30px",
    borderRadius: 12,
    boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
    minWidth: 200,
    textAlign: "center",
    flex: "1 1 200px",
  };
}

function modalBoxStyle() {
  return {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    zIndex: 1000,
    width: 320,
  };
}

function overlayStyle() {
  return {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 999,
  };
}

function tabButtonStyle(activeTab, tabName) {
  return {
    background: activeTab === tabName ? "#0984e3" : "#dfe6e9",
    color: activeTab === tabName ? "#fff" : "#2d3436",
    border: "none",
    borderRadius: 6,
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: 10,
    transition: "all 0.3s ease",
  };
}


export default DoctorDashboard;