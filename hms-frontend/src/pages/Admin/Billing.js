import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const Billing = () => {
  const [billings, setBillings] = useState([]);

  useEffect(() => {
    api.get('/admin/billings').then(res => setBillings(res.data));
  }, []);

  return (
    <div>
      <h2>Billing</h2>
      <Table headers={['Patient', 'Amount', 'Status']} data={billings} />
    </div>
  );
};

export default Billing;