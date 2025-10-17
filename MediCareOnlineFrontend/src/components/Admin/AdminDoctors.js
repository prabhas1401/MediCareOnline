import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from "@mui/material";

// 🧠 Dummy data (if localDb not connected)
const mockDoctors = [
  { id: 1, name: "Dr. Rajesh Kumar", email: "rajesh.k@example.com", specialization: "Cardiologist", status: "active" },
  { id: 2, name: "Dr. Sneha Reddy", email: "sneha.r@example.com", specialization: "Dermatologist", status: "pending" },
  { id: 3, name: "Dr. Aamir Khan", email: "aamir.k@example.com", specialization: "Neurologist", status: "active" },
  { id: 4, name: "Dr. Meena Sharma", email: "meena.s@example.com", specialization: "Pediatrician", status: "pending" },
];

// 🧩 Mock functions for localDb
const getAllDoctors = () => mockDoctors;
const approveDoctor = (id) => {
  const doc = mockDoctors.find((d) => d.id === id);
  if (doc) doc.status = "active";
};
const deleteDoctor = (id) => {
  const index = mockDoctors.findIndex((d) => d.id === id);
  if (index !== -1) mockDoctors.splice(index, 1);
};
const getDoctorById = (id) => mockDoctors.find((d) => d.id === id);
const updateDoctor = (id, data) => {
  const index = mockDoctors.findIndex((d) => d.id === id);
  if (index !== -1) mockDoctors[index] = { ...mockDoctors[index], ...data };
};

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    setDoctors(getAllDoctors());
  }, []);

  const approve = (id) => {
    approveDoctor(id);
    setDoctors(getAllDoctors());
    alert("Doctor approved!");
  };

  const remove = (id) => {
    if (!window.confirm("Delete doctor?")) return;
    deleteDoctor(id);
    setDoctors(getAllDoctors());
    alert("Doctor deleted!");
  };

  const open = (id) => {
    const doc = getDoctorById(id);
    setSelected(doc);
    setEditData(doc ? { ...doc } : {});
  };

  const save = () => {
    updateDoctor(selected.id, editData);
    setDoctors(getAllDoctors());
    alert("Doctor details updated.");
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
        Doctor Management ({doctors.length})
      </Typography>

      <TableContainer sx={{ mt: 2, borderRadius: 2, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              {["Name", "Email", "Specialization", "Status", "Actions"].map((header) => (
                <TableCell key={header} sx={{ color: "white", fontWeight: "bold" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((d) => (
              <TableRow key={d.id} hover sx={{ backgroundColor: "#fff" }}>
                <TableCell>
                  <Button onClick={() => open(d.id)} sx={{ textTransform: "none", color: "#1976d2" }}>
                    {d.name}
                  </Button>
                </TableCell>
                <TableCell>{d.email}</TableCell>
                <TableCell>{d.specialization}</TableCell>
                <TableCell sx={{ color: d.status === "active" ? "green" : "orange", fontWeight: 600 }}>
                  {d.status === "active" ? "Approved" : "Pending"}
                </TableCell>
                <TableCell>
                  {d.status !== "active" && (
                    <Button
                      color="success"
                      variant="contained"
                      size="small"
                      onClick={() => approve(d.id)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    color="error"
                    variant="outlined"
                    size="small"
                    onClick={() => remove(d.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Doctor Profile Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#1976d2", color: "white" }}>Doctor Profile</DialogTitle>
        <DialogContent sx={{ backgroundColor: "#fafafa", p: 3 }}>
          {selected && (
            <>
              <TextField
                fullWidth
                label="Name"
                value={editData.name || ""}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={editData.email || ""}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Specialization"
                value={editData.specialization || ""}
                onChange={(e) => setEditData({ ...editData, specialization: e.target.value })}
                sx={{ mt: 2 }}
              />
              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  backgroundColor: "#1976d2",
                  "&:hover": { backgroundColor: "#125ea2" },
                }}
                onClick={save}
              >
                Save Changes
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default AdminDoctors;
// ✅ AdminDoctors.jsx (Backend-integrated version)
// import React, { useEffect, useState } from "react";
// import {
//   Paper,
//   Typography,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   TableContainer,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
// } from "@mui/material";
// import api from "../../services/api"; // ✅ Backend API service import

// const AdminDoctors = () => {
//   const [doctors, setDoctors] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [editData, setEditData] = useState({});

//   // 🕐 Fetch doctors from backend on mount
//   useEffect(() => {
//     api
//       .get("/api/users?role=DOCTOR")
//       .then((response) => setDoctors(response.data))
//       .catch((error) => {
//         console.error("Error fetching doctors:", error);
//         alert("Failed to load doctors. Please try again.");
//       });
//   }, []);

//   // ✅ Approve doctor
//   const approve = (id) => {
//     api
//       .put(`/api/users/approve/${id}`)
//       .then(() => {
//         setDoctors((prev) =>
//           prev.map((doc) =>
//             doc.id === id ? { ...doc, status: "ACTIVE" } : doc
//           )
//         );
//         alert("Doctor approved!");
//       })
//       .catch(() => alert("Error approving doctor."));
//   };

//   // ✅ Delete doctor
//   const remove = (id) => {
//     if (!window.confirm("Delete doctor?")) return;
//     api
//       .delete(`/api/users/${id}`)
//       .then(() => {
//         setDoctors((prev) => prev.filter((doc) => doc.id !== id));
//         alert("Doctor deleted!");
//       })
//       .catch(() => alert("Error deleting doctor."));
//   };

//   // ✅ Open profile dialog for editing
//   const open = (id) => {
//     const doc = doctors.find((d) => d.id === id);
//     setSelected(doc);
//     setEditData(doc ? { ...doc } : {});
//   };

//   // ✅ Save updated doctor info
//   const save = () => {
//     if (!selected) return;
//     api
//       .put(`/api/users/${selected.id}`, editData)
//       .then(() => {
//         setDoctors((prev) =>
//           prev.map((doc) =>
//             doc.id === selected.id ? { ...doc, ...editData } : doc
//           )
//         );
//         alert("Doctor details updated successfully!");
//         setSelected(null);
//       })
//       .catch(() => alert("Error updating doctor details."));
//   };

//   return (
//     <Paper
//       elevation={4}
//       sx={{
//         p: 3,
//         borderRadius: 3,
//         backgroundColor: "#f9f9f9",
//         boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//       }}
//     >
//       <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
//         Doctor Management ({doctors.length})
//       </Typography>

//       {/* 🧾 Doctors Table */}
//       <TableContainer sx={{ mt: 2, borderRadius: 2, overflow: "hidden" }}>
//         <Table>
//           <TableHead sx={{ backgroundColor: "#1976d2" }}>
//             <TableRow>
//               {["Name", "Email", "Specialization", "Status", "Actions"].map(
//                 (header) => (
//                   <TableCell
//                     key={header}
//                     sx={{ color: "white", fontWeight: "bold" }}
//                   >
//                     {header}
//                   </TableCell>
//                 )
//               )}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {doctors.map((d) => (
//               <TableRow key={d.id} hover sx={{ backgroundColor: "#fff" }}>
//                 <TableCell>
//                   <Button
//                     onClick={() => open(d.id)}
//                     sx={{ textTransform: "none", color: "#1976d2" }}
//                   >
//                     {d.name}
//                   </Button>
//                 </TableCell>
//                 <TableCell>{d.email}</TableCell>
//                 <TableCell>{d.specialization}</TableCell>
//                 <TableCell
//                   sx={{
//                     color:
//                       d.status?.toUpperCase() === "ACTIVE" ? "green" : "orange",
//                     fontWeight: 600,
//                   }}
//                 >
//                   {d.status?.toUpperCase() === "ACTIVE"
//                     ? "Approved"
//                     : "Pending"}
//                 </TableCell>
//                 <TableCell>
//                   {d.status?.toUpperCase() !== "ACTIVE" && (
//                     <Button
//                       color="success"
//                       variant="contained"
//                       size="small"
//                       onClick={() => approve(d.id)}
//                       sx={{ mr: 1 }}
//                     >
//                       Approve
//                     </Button>
//                   )}
//                   <Button
//                     color="error"
//                     variant="outlined"
//                     size="small"
//                     onClick={() => remove(d.id)}
//                   >
//                     Delete
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* 🧑‍⚕️ Doctor Profile Dialog */}
//       <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
//         <DialogTitle sx={{ backgroundColor: "#1976d2", color: "white" }}>
//           Doctor Profile
//         </DialogTitle>
//         <DialogContent sx={{ backgroundColor: "#fafafa", p: 3 }}>
//           {selected && (
//             <>
//               <TextField
//                 fullWidth
//                 label="Name"
//                 value={editData.name || ""}
//                 onChange={(e) =>
//                   setEditData({ ...editData, name: e.target.value })
//                 }
//                 sx={{ mt: 2 }}
//               />
//               <TextField
//                 fullWidth
//                 label="Email"
//                 value={editData.email || ""}
//                 onChange={(e) =>
//                   setEditData({ ...editData, email: e.target.value })
//                 }
//                 sx={{ mt: 2 }}
//               />
//               <TextField
//                 fullWidth
//                 label="Specialization"
//                 value={editData.specialization || ""}
//                 onChange={(e) =>
//                   setEditData({
//                     ...editData,
//                     specialization: e.target.value,
//                   })
//                 }
//                 sx={{ mt: 2 }}
//               />
//               <Button
//                 variant="contained"
//                 sx={{
//                   mt: 3,
//                   backgroundColor: "#1976d2",
//                   "&:hover": { backgroundColor: "#125ea2" },
//                 }}
//                 onClick={save}
//               >
//                 Save Changes
//               </Button>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </Paper>
//   );
// };

// export default AdminDoctors;
