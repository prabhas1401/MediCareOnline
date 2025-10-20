import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Form from '../../components/Form';

const Reconsult = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get('/patient/doctors').then(res => setDoctors(res.data));
  }, []);

  const handleSubmit = (data) => {
    api.post('/patient/reconsult', data).then(() => alert('Reconsult requested'));
  };

  return (
    <div>
      <h2>Reconsult</h2>
      <Form 
        fields={[
          { name: 'doctorId', type: 'select', placeholder: 'Select Doctor', options: doctors.map(d => ({ value: d.id, label: d.name })), required: true },
          { name: 'reason', type: 'textarea', placeholder: 'Reason', required: true }
        ]}
        onSubmit={handleSubmit}
        buttonText="Request Reconsult"
      />
    </div>
  );
};

export default Reconsult;