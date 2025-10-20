import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const Patients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    api.get('/admin/patients').then(res => setPatients(res.data));
  }, []);

  const actions = (patient) => (
    <button className="btn btn-danger" onClick={() => api.delete(`/admin/patients/${patient.id}`).then(() => setPatients(patients.filter(p => p.id !== patient.id)))}>Delete</button>
  );

  return (
    <div>
      <h2>Patients</h2>
      <Table headers={['Name', 'Email', 'Mobile']} data={patients} actions={actions} />
    </div>
  );
};

export default Patients;