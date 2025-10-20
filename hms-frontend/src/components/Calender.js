import React, { useState } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const AvailabilityCalendar = ({ onDateSelect }) => {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
    onDateSelect(newDate);
  };

  return <Calendar onChange={handleDateChange} value={date} />;
};

export default AvailabilityCalendar;