const ADMINS_KEY = "hms_admins";
const DOCTORS_KEY = "hms_doctors";
const PATIENTS_KEY = "hms_patients";
const APPOINTMENTS_KEY = "hms_appointments";

const genId = () => `${Date.now()}_${Math.floor(Math.random()*10000)}`;

const read = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch (e) { console.error("localDb read error", e); return []; }
};
const write = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
  return data;
};

const ensureAdmin = () => {
  const admins = read(ADMINS_KEY);
  if (!admins || admins.length === 0) {
    write(ADMINS_KEY, [{ id: genId(), name: "admin", email: "admin@example.com", password: "admin123", role: "ADMIN" }]);
  }
};
ensureAdmin();

// Doctors
export const getAllDoctors = () => read(DOCTORS_KEY);
export const getActiveDoctors = () => getAllDoctors().filter(d => d.status === "active");
export const getPendingDoctors = () => getAllDoctors().filter(d => d.status === "pending");
export const addDoctor = (doctor) => {
  const doctors = getAllDoctors();
  const newDoc = { ...doctor, id: genId(), status: "pending", createdAt: Date.now(), records: [] };
  doctors.push(newDoc);
  return write(DOCTORS_KEY, doctors), newDoc;
};
export const approveDoctor = (id) => write(DOCTORS_KEY, getAllDoctors().map(d => d.id===id ? { ...d, status: "active" } : d));
export const updateDoctor = (id, data) => write(DOCTORS_KEY, getAllDoctors().map(d => d.id===id ? { ...d, ...data } : d));
export const deleteDoctor = (id) => write(DOCTORS_KEY, getAllDoctors().filter(d => d.id !== id));
export const getDoctorById = (id) => getAllDoctors().find(d => d.id === id);

// Patients
export const getAllPatients = () => read(PATIENTS_KEY);
export const addPatient = (patient) => {
  const patients = getAllPatients();
  const newP = { ...patient, id: genId(), createdAt: Date.now(), records: [] };
  patients.push(newP);
  return write(PATIENTS_KEY, patients), newP;
};
export const updatePatient = (id, data) => write(PATIENTS_KEY, getAllPatients().map(p => p.id===id ? { ...p, ...data } : p));
export const deletePatient = (id) => write(PATIENTS_KEY, getAllPatients().filter(p => p.id !== id));
export const getPatientById = (id) => getAllPatients().find(p => p.id === id);

// Records
export const addRecordToPatient = (patientId, record) => {
  const patients = getAllPatients().map(p => {
    if (p.id !== patientId) return p;
    const rec = { id: genId(), uploadedAt: Date.now(), ...record };
    return { ...p, records: [...(p.records||[]), rec] };
  });
  write(PATIENTS_KEY, patients);
  return getPatientById(patientId);
};
export const addRecordToDoctor = (doctorId, record) => {
  const doctors = getAllDoctors().map(d => {
    if (d.id !== doctorId) return d;
    const rec = { id: genId(), uploadedAt: Date.now(), ...record };
    return { ...d, records: [...(d.records||[]), rec] };
  });
  write(DOCTORS_KEY, doctors);
  return getDoctorById(doctorId);
};

// Appointments
export const getAllAppointments = () => read(APPOINTMENTS_KEY);
export const addAppointment = (appt) => {
  const appts = getAllAppointments();
  const n = { ...appt, id: genId(), createdAt: Date.now(), status: "booked" };
  appts.push(n);
  write(APPOINTMENTS_KEY, appts);
  return n;
};
export const getAppointmentsByPatient = (patientId) => getAllAppointments().filter(a => a.patientId === patientId);
export const getAppointmentsByDoctor = (doctorId) => getAllAppointments().filter(a => a.doctorId === doctorId);
export const updateAppointment = (id, data) => write(APPOINTMENTS_KEY, getAllAppointments().map(a => a.id===id ? { ...a, ...data } : a));
export const deleteAppointment = (id) => write(APPOINTMENTS_KEY, getAllAppointments().filter(a => a.id !== id));

// Auth helper
export const login = ({ email, password }) => {
  const admins = read(ADMINS_KEY);
  const doctors = getAllDoctors().filter(d => d.status === "active");
  const patients = getAllPatients();
  const foundAdmin = admins.find(a => a.email === email && a.password === password);
  if (foundAdmin) return { ...foundAdmin, role: "ADMIN" };
  const foundDoc = doctors.find(d => d.email === email && d.password === password);
  if (foundDoc) return { ...foundDoc, role: "DOCTOR" };
  const foundPatient = patients.find(p => p.email === email && p.password === password);
  if (foundPatient) return { ...foundPatient, role: "PATIENT" };
  return null;
};

export const clearAllData = () => {
  localStorage.removeItem(ADMINS_KEY);
  localStorage.removeItem(DOCTORS_KEY);
  localStorage.removeItem(PATIENTS_KEY);
  localStorage.removeItem(APPOINTMENTS_KEY);
  ensureAdmin();
};