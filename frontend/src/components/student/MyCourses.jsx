// src/components/student/MyCourses.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const fetchMy = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/enrollments', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setEnrollments(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMy();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Mis Cursos</Typography>
      <Grid container spacing={2}>
        {enrollments.map(e => (
          <Grid item xs={12} md={6} key={e.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{e.item_name}</Typography>
                <Typography>Tipo: {e.type}</Typography>
                <Typography>Precio: S/. {e.item_price}</Typography>
                <Typography>Estado matrícula: {e.status}</Typography>
                <Typography>Pago: {e.payment_status} {e.payment_id ? `(id: ${e.payment_id})` : ''}</Typography>
                {e.voucher_url && <Typography>Voucher: <a href={`http://localhost:4000${e.voucher_url}`} target="_blank" rel="noreferrer">Ver</a></Typography>}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyCourses;
