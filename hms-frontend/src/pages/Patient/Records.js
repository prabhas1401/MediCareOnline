import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const Records = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get('/patient/records').then(res => setRecords(res.data));
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    api.post('/patient/records', formData).then(() => alert('Uploaded'));
  };

  const actions = (record) => (
    <>
      <button className="btn btn-primary" onClick={() => window.open(`/view/${record.id}`, '_blank')}>View</button>
      <button className="btn btn-danger" onClick={() => api.delete(`/patient/records/${record.id}`).then(() => setRecords(records.filter(r => r.id !== record.id)))}>Delete</button>
    </>
  );

  return (
    <div>
      <h2>My Records</h2>
      <input type="file" onChange={handleUpload} />
      <Table headers={['File Name', 'Date']} data={records} actions={actions} />
    </div>
  );
};

export default Records;