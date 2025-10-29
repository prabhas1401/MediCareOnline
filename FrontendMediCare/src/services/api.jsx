import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  registerPatient: (data) => api.post('/auth/register/patient', data),
  registerDoctor: (data) => api.post('/auth/register/doctor', data),
  login: (data) => axios.post(`${API_BASE_URL}/auth/login`, data),
  forgotPassword: (email) => axios.post(`${API_BASE_URL}/auth/forgot-password`, { email }),
  resetPassword: (token, newPassword) => axios.post(`${API_BASE_URL}/auth/reset-password`, { token, newPassword }),
};

// Patient API
export const patientAPI = {
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (data) => api.put('/patient/profile', data),
  getAppointments: () => api.get('/patient/appointments'),
  getPrescriptions: () => api.get('/patient/prescriptions'),
};

// Appointment API
export const appointmentAPI = {
  create: (data) => api.post('/appointments/request', data),
  confirmAfterPayment: (data) => api.post('/appointments/confirm-after-payment', data),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data),  // Correct: PUT
  getById: (id) => api.get(`/appointments/${id}`),
  getPending: (specialization) => api.get(`/appointments/pending/${specialization}`),
  getByDoctor: () => api.get('/appointments/doctor'),
  getByPatient: () => api.get('/appointments/patient'),
  lock: (id) => api.post(`/appointments/${id}/lock`),
  unlock: (id) => api.post(`/appointments/${id}/unlock`),
  schedule: (id, data) => api.post(`/appointments/${id}/schedule`, data),
  getCalendar: (doctorId, date) => api.get(`/appointments/doctor/${doctorId}/calendar/date/${date}`),
  blockSlot: (data) => api.post('/appointments/doctor/availability/block', data),
  createReconsult: (originalId) => api.post(`/appointments/${originalId}/reconsult`),  // Correct: Only one instance
  getReconsults: () => api.get('/appointments/doctor/reconsults'),
  startVisit: (id) => api.put(`/appointments/${id}/start-visit`),
};

// Prescription API
export const prescriptionAPI = {
  getPrescriptions: () => api.get('/prescriptions/by-current-user'),
  getById: (id) => api.get(`/prescriptions/${id}`),
  downloadPdf: (id) => api.get(`/prescriptions/${id}/download`, { responseType: 'blob' }),
  requestRefill: (id) => api.post(`/prescriptions/${id}/refill`),
  bookFollowUp: (id, data) => api.post(`/prescriptions/${id}/follow-up`, data),
  add: (appointmentId, data) => api.post(`/prescriptions/appointment/${appointmentId}`, data),
};

// Payment API
export const paymentAPI = {
  initiate: (data) => api.post('/payments/initiate', data),
};

// Doctor API
export const doctorAPI = {
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (data) => api.put('/doctor/profile', data),
  getAppointments: () => api.get('/doctor/appointments'),
  getPendingAppointments: () => api.get('/doctor/pending-appointments'),
  addPatient: (data) => api.post('/doctor/patients', data),
  rescheduleAppointment: (id, data) => api.post(`/doctor/appointments/${id}/reschedule`, data),  // Assuming backend uses POST for doctors; change to PUT if needed
  getLeaves: () => api.get('/doctor/leaves'),
  addLeave: (data) => api.post('/doctor/leaves', data),
  getAllDoctors: () => api.get('/doctor/all'),
  blockDoctor: (adminId, doctorId) => api.put(`/admin/doctors/${doctorId}/block`, { adminUserId: adminId }),
  deleteDoctor: (adminId, doctorId) => api.put(`/admin/doctors/${doctorId}/delete`, { adminUserId: adminId }),
  createDoctor: (adminId, data) => api.post('/admin/doctors', { ...data, adminUserId }),
  updateDoctor: (adminId, doctorId, data) => api.put(`/admin/doctors/${doctorId}`, { ...data, adminUserId }),
  findBySpecialization: (spec, adminId) => api.get(`/admin/doctors/specialization/${spec}`, { params: { adminUserId } }),
  addPrescription: (id, data) => prescriptionAPI.add(id, data),
  scheduleReconsult: (id, data) => api.post(`/doctor/reconsult/${id}/schedule`, data),
  rescheduleReconsult: (id, data) => api.post(`/doctor/reconsult/${id}/reschedule`, data),
  getReconsults: () => api.get('/appointments/doctor/reconsults'),
};

// Admin API
export const adminAPI = {
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  blockUser: (id, status) => api.post(`/admin/users/${id}/status`, { status }),
  unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getDoctors: () => api.get('/admin/doctors'),
  createDoctor: (data) => api.post('/admin/doctors', data),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
  getPatients: () => api.get('/admin/patients'),
  createPatient: (data) => api.post('/admin/patients', data),
  updatePatient: (id, data) => api.put(`/admin/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/admin/patients/${id}`),
  getPrescriptions: () => api.get('/admin/prescriptions'),
  getPayments: () => api.get('/admin/payments'),
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data) => api.post('/admin/admins', data),
  approveDoctor: (id) => api.post(`/admin/doctors/${id}/approve`),
  getPendingAppointments: () => api.get('/admin/appointments/pending'),
  getCancelledAppointments: () => api.get('/admin/appointments/cancelled'),
  approveAppointment: (id, data) => api.put(`/admin/appointments/${id}/approve`, data),
  cancelAppointment: (id, data) => api.post(`/admin/appointments/${id}/cancel`, data),
  // FIXED: Changed to PUT to match backend @PutMapping
  rescheduleAppointment: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
  reassignAppointment: (id, data) => api.put(`/appointments/${id}/reassign`, data),
  archiveAppointment: (id) => api.put(`/appointments/${id}/archive`),
  getAllAppointments: () => api.get('/admin/appointments'),
};