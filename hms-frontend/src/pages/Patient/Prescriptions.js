import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    api.get('/patient/prescriptions').then(res => setPrescriptions(res.data));
  }, []);

  const actions = (pres) => (
    <button className="btn btn-primary" onClick={() => window.open(`/download/${pres.id}`, '_blank')}>Download</button>
  );

  return (
    <div>
      <h2>My Prescriptions</h2>
      <Table headers={['Doctor', 'Date', 'Details']} data={prescriptions} actions={actions} />
    </div>
  );
};

export default Prescriptions;