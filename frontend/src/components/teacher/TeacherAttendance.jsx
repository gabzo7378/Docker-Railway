// src/components/teacher/TeacherAttendance.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { teachersAPI, schedulesAPI, coursesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TeacherAttendance = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('presente');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.related_id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, coursesData] = await Promise.all([
        teachersAPI.getStudents(user.related_id),
        coursesAPI.getAll(),
      ]);
      setStudents(studentsData);
      
      // Obtener horarios de los cursos del profesor
      const allSchedules = [];
      for (const course of coursesData) {
        if (course.offerings) {
          for (const offering of course.offerings) {
            if (offering.teacher_id === user.related_id && offering.schedules) {
              for (const schedule of offering.schedules) {
                allSchedules.push({
                  ...schedule,
                  courseName: course.name,
                  offeringId: offering.id,
                });
              }
            }
          }
        }
      }
      setSchedules(allSchedules);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedSchedule || !selectedStudent) {
      setError('Selecciona un horario y un estudiante');
      return;
    }

    try {
      setError('');
      await teachersAPI.markAttendance(user.related_id, {
        schedule_id: selectedSchedule.id,
        student_id: selectedStudent,
        status: attendanceStatus,
      });
      setSuccess('Asistencia marcada correctamente');
      setOpenDialog(false);
      setSelectedSchedule(null);
      setSelectedStudent(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Error al marcar asistencia');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Marcar Asistencias
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Lista de horarios */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Mis Horarios
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Curso</TableCell>
              <TableCell>Día</TableCell>
              <TableCell>Hora Inicio</TableCell>
              <TableCell>Hora Fin</TableCell>
              <TableCell>Aula</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.courseName || '-'}</TableCell>
                <TableCell>{schedule.day_of_week}</TableCell>
                <TableCell>{schedule.start_time}</TableCell>
                <TableCell>{schedule.end_time}</TableCell>
                <TableCell>{schedule.classroom || '-'}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setOpenDialog(true);
                    }}
                  >
                    Marcar Asistencia
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {schedules.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography color="textSecondary">No tienes horarios asignados</Typography>
          </Box>
        )}
      </TableContainer>

      {/* Dialog para marcar asistencia */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Marcar Asistencia</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {selectedSchedule && (
              <>
                <TextField
                  label="Curso"
                  value={selectedSchedule.courseName || '-'}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Día"
                  value={selectedSchedule.day_of_week}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Horario"
                  value={`${selectedSchedule.start_time} - ${selectedSchedule.end_time}`}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </>
            )}
            <TextField
              label="Estudiante"
              select
              fullWidth
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} - {student.dni}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Estado"
              select
              fullWidth
              value={attendanceStatus}
              onChange={(e) => setAttendanceStatus(e.target.value)}
            >
              <MenuItem value="presente">Presente</MenuItem>
              <MenuItem value="ausente">Ausente</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleMarkAttendance} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAttendance;

