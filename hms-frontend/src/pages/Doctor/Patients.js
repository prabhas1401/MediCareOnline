import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const Patients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    api.get('/doctor/patients').then(res => setPatients(res.data));
  }, []);

  return (
    <div>
      <h2>My Patients</h2>
      <Table headers={['Name', 'Email', 'Mobile']} data={patients} />
    </div>
  );
};

export default Patients;