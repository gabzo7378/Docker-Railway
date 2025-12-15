// src/components/admin/AdminCourses.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from '@mui/material';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [editing, setEditing] = useState({});
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const startEdit = (c) => setEditing({ ...c });

  const save = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editing)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar');
      setEditing({});
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error');
    }
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar curso?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar');
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Cursos</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Profesor</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map(c => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.teacher_name || '—'}</TableCell>
                <TableCell>
                  {editing.id === c.id ? (
                    <TextField size="small" type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
                  ) : (
                    `S/. ${c.price}`
                  )}
                </TableCell>
                <TableCell>
                  {editing.id === c.id ? (
                    <>
                      <Button size="small" onClick={() => save(c.id)}>Guardar</Button>
                      <Button size="small" onClick={() => setEditing({})}>Cancelar</Button>
                    </>
                  ) : (
                    <>
                      <Button size="small" onClick={() => startEdit(c)}>Editar</Button>
                      <Button size="small" color="error" onClick={() => remove(c.id)}>Eliminar</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AdminCourses;
