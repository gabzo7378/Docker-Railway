// src/components/admin/AdminPayments.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Paper } from '@mui/material';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/payments?status=pendiente', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPayments(data);
      else setError(data.message || 'Error al cargar pagos');
    } catch (err) {
      console.error(err);
      setError('Error al cargar pagos');
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleApprove = async (enrollmentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ enrollment_id: enrollmentId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al aprobar');
      fetchPayments();
      alert('Pago aprobado');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al aprobar');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Pagos pendientes</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Pago</TableCell>
              <TableCell>Estudiante</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Voucher</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.first_name} {p.last_name} ({p.dni})</TableCell>
                <TableCell>{p.item_name} ({p.type})</TableCell>
                <TableCell>S/. {p.amount}</TableCell>
                <TableCell>{p.voucher_url ? <a href={`http://localhost:4000${p.voucher_url}`} target="_blank" rel="noreferrer">Ver</a> : 'Sin voucher' }</TableCell>
                <TableCell>
                  <Button variant="contained" size="small" onClick={() => handleApprove(p.enrollment_id)}>Aprobar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AdminPayments;
