import React, { useState } from 'react';
import api from '../../services/api';
import Calendar from '../../components/Calender';
import Form from '../../components/Form';

const Availability = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availability, setAvailability] = useState([]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleSubmit = (data) => {
    api.post('/doctor/availability', { date: selectedDate, ...data })
      .then(() => alert('Availability set successfully!'))
      .catch(err => console.error(err));
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Set Availability</h2>

        <div style={styles.calendarContainer}>
          <Calendar onDateSelect={handleDateSelect} />
        </div>

        {selectedDate && (
          <div style={styles.formContainer}>
            <Form
              fields={[
                { 
                  name: 'status', 
                  type: 'select', 
                  placeholder: 'Status', 
                  options: [
                    { value: 'available', label: 'Available' },
                    { value: 'leave', label: 'Leave' }
                  ], 
                  required: true 
                },
                { name: 'startTime', type: 'time', required: true },
                { name: 'endTime', type: 'time', required: true }
              ]}
              onSubmit={handleSubmit}
              buttonText="Save"
              style={styles.form}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e0f7fa, #f1f8ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: 'Segoe UI, sans-serif'
  },
  card: {
    width: 500,
    padding: 30,
    borderRadius: 15,
    background: '#fff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0077b6',
    textAlign: 'center',
  },
  calendarContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
  },
  formContainer: {
    marginTop: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    outline: 'none',
    fontSize: 14,
    transition: 'all 0.3s',
  },
  button: {
    padding: 12,
    background: '#0077b6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  }
};

export default Availability;
