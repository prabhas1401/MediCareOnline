export const doctors = [
    {
      id: 1,
      name: "Dr. Asha Singh",
      role: "doctor",
      specialization: "Cardiologist",
      availability: ["2025-10-15 10:00", "2025-10-16 14:00"],
    },
    {
      id: 2,
      name: "Dr. Raj Patel",
      role: "doctor",
      specialization: "Orthopedic",
      availability: ["2025-10-15 11:00", "2025-10-17 09:00"],
    },
    {
      id: 3,
      name: "Dr. Neha Kapoor",
      role: "doctor",
      specialization: "Dentist",
      availability: ["2025-10-18 13:00", "2025-10-19 15:00"],
    },
  ];
  
  // ------------------ PATIENTS ------------------
  export const patients = [
    { id: 101, name: "Rahul Verma", role: "patient", age: 29, condition: "Flu" },
    { id: 102, name: "Priya Sharma", role: "patient", age: 34, condition: "Back Pain" },
    { id: 103, name: "Aman Singh", role: "patient", age: 45, condition: "Diabetes" },
  ];
  
  // ------------------ APPOINTMENTS ------------------
  export const appointments = [
    { id: 1, doctorId: 1, patientId: 101, date: "2025-10-15", time: "10:00" },
    { id: 2, doctorId: 2, patientId: 102, date: "2025-10-17", time: "09:00" },
  ];
  
  // ------------------ MOCK FUNCTIONS ------------------
  export function getMockAppointments() {
    return appointments;
  }
  
  // ✅ Function to get mock users (returns a single array for filter)
  export function getMockUsers() {
    return [...doctors, ...patients];
  }
  