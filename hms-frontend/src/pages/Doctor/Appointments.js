import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get('/doctor/appointments').then(res => setAppointments(res.data));
  }, []);

  const actions = (appt) => (
    <>
      <button className="btn btn-primary" onClick={() => api.put(`/doctor/appointments/${appt.id}/complete`).then(() => alert('Completed'))}>Mark Completed</button>
      <button className="btn btn-danger" onClick={() => api.put(`/doctor/appointments/${appt.id}/cancel`).then(() => alert('Cancelled'))}>Cancel</button>
    </>
  );

  return (
    <div>
      <h2>My Appointments</h2>
      <Table headers={['Patient', 'Date', 'Status']} data={appointments} actions={actions} />
    </div>
  );
};

export default Appointments;