import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get('/admin/doctors').then(res => setDoctors(res.data));
  }, []);

  const actions = (doctor) => (
    <>
      <button className="btn btn-primary" onClick={() => api.put(`/admin/doctors/${doctor.id}/approve`).then(() => alert('Approved'))}>Approve</button>
      <button className="btn btn-danger" onClick={() => api.delete(`/admin/doctors/${doctor.id}`).then(() => setDoctors(doctors.filter(d => d.id !== doctor.id)))}>Delete</button>
    </>
  );

  return (
    <div>
      <h2>Doctors</h2>
      <Table headers={['Name', 'Email', 'Specialization', 'Status']} data={doctors} actions={actions} />
    </div>
  );
};

export default Doctors;