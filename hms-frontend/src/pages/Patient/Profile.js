import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Form from '../../components/Form';

const Profile = () => {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    api.get('/patient/profile').then(res => setProfile(res.data));
  }, []);

  const handleSubmit = (data) => {
    api.put('/patient/profile', data).then(() => alert('Updated'));
  };

  return (
    <div>
      <h2>My Profile</h2>
      <Form 
        fields={[
          { name: 'name', type: 'text', placeholder: 'Name', required: true },
          { name: 'email', type: 'email', placeholder: 'Email', required: true },
          { name: 'dob', type: 'date', required: true },
          { name: 'mobile', type: 'text', placeholder: 'Mobile', required: true },
          { name: 'gender', type: 'select', placeholder: 'Gender', options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' }
          ], required: true }
        ]}
        onSubmit={handleSubmit}
        buttonText="Update Profile"
      />
    </div>
  );
};

export default Profile;