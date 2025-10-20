import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get('/admin/appointments').then(res => setAppointments(res.data));
  }, []);

  const actions = (appt) => (
    <>
      <button className="btn btn-primary" onClick={() => api.put(`/admin/appointments/${appt.id}/confirm`).then(() => alert('Confirmed'))}>Confirm</button>
      <button className="btn btn-danger" onClick={() => api.delete(`/admin/appointments/${appt.id}`).then(() => setAppointments(appointments.filter(a => a.id !== appt.id)))}>Cancel</button>
    </>
  );

  return (
    <div>
      <h2>Appointments</h2>
      <Table headers={['Patient', 'Doctor', 'Date', 'Status']} data={appointments} actions={actions} />
    </div>
  );
};

export default Appointments;