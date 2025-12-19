// src/components/teacher/TeacherAttendance.jsx
import React, { useEffect, useState, useMemo } from 'react';
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
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { teachersAPI, coursesAPI, cyclesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './teacher-dashboard.css';

const TeacherAttendance = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [courses, setCourses] = useState([]);

  // Filtros
  const [filterCycle, setFilterCycle] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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
      const [studentsData, coursesData, cyclesData] = await Promise.all([
        teachersAPI.getStudents(user.related_id),
        coursesAPI.getAll(),
        cyclesAPI.getAll(),
      ]);

      setStudents(studentsData);
      setCycles(cyclesData);
      setCourses(coursesData);

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
                  courseId: course.id,
                  offeringId: offering.id,
                  cycleId: offering.cycle_id,
                  groupLabel: offering.group_label,
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

  // Filtrado de horarios
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      const matchCycle = filterCycle === 'all' || s.cycleId === parseInt(filterCycle);
      const matchCourse = filterCourse === 'all' || s.courseId === parseInt(filterCourse);
      return matchCycle && matchCourse;
    });
  }, [schedules, filterCycle, filterCourse]);

  // Obtener estudiantes filtrados por el horario seleccionado
  const filteredStudents = useMemo(() => {
    if (!selectedSchedule) return [];
    return students;
  }, [students, selectedSchedule]);

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
        date: selectedDate, // Nueva fecha seleccionada
      });
      setSuccess('Asistencia marcada correctamente para el ' + selectedDate);
      setOpenDialog(false);
      setSelectedStudent(null);
    } catch (err) {
      setError(err.message || 'Error al marcar asistencia');
    }
  };

  if (loading) {
    return (
      <Box className="teacher-loading">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="teacher-dashboard">
      <Typography variant="h4" gutterBottom className="teacher-dashboard-title">
        Gestión de Asistencias
      </Typography>

      {error && (
        <Alert severity="error" className="teacher-alert" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className="teacher-alert" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Filtrar por Ciclo"
              value={filterCycle}
              onChange={(e) => setFilterCycle(e.target.value)}
              size="small"
            >
              <MenuItem value="all">Todos los Ciclos</MenuItem>
              {cycles.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Filtrar por Curso"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              size="small"
            >
              <MenuItem value="all">Todos los Cursos</MenuItem>
              {courses.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              fullWidth
              label="Fecha de Asistencia"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => { setFilterCycle('all'); setFilterCourse('all'); }}
            >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography className="teacher-section-header">
        Horarios Disponibles ({filteredSchedules.length})
      </Typography>
      <TableContainer component={Paper} className="teacher-table-container">
        <Table className="teacher-table">
          <TableHead className="teacher-table-head">
            <TableRow>
              <TableCell className="teacher-table-head-cell">Curso / Grupo</TableCell>
              <TableCell className="teacher-table-head-cell">Ciclo</TableCell>
              <TableCell className="teacher-table-head-cell">Horario</TableCell>
              <TableCell className="teacher-table-head-cell">Aula</TableCell>
              <TableCell className="teacher-table-head-cell">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSchedules.map((schedule) => (
              <TableRow key={schedule.id} className="teacher-table-row">
                <TableCell className="teacher-table-cell">
                  <Typography variant="subtitle2" fontWeight="bold">
                    {schedule.courseName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Grupo: {schedule.groupLabel || 'A'}
                  </Typography>
                </TableCell>
                <TableCell className="teacher-table-cell">
                  {cycles.find(c => c.id === schedule.cycleId)?.name || 'N/A'}
                </TableCell>
                <TableCell className="teacher-table-cell">
                  <Chip
                    label={`${schedule.day_of_week}: ${schedule.start_time} - ${schedule.end_time}`}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell className="teacher-table-cell">{schedule.classroom || '-'}</TableCell>
                <TableCell className="teacher-table-cell">
                  <Button
                    size="small"
                    variant="contained"
                    className="teacher-button teacher-button-primary"
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setOpenDialog(true);
                    }}
                  >
                    Tomar Asistencia
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredSchedules.length === 0 && (
          <Box className="teacher-empty-state">
            <Typography className="teacher-empty-state-text">
              No se encontraron horarios con los filtros seleccionados
            </Typography>
          </Box>
        )}
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        className="teacher-dialog"
      >
        <DialogTitle>Marcar Asistencia - {selectedDate}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {selectedSchedule && (
              <Alert severity="info" sx={{ mb: 1 }}>
                Registrando para: <strong>{selectedSchedule.courseName}</strong> ({selectedSchedule.day_of_week})
              </Alert>
            )}

            <TextField
              label="Seleccionar Estudiante"
              select
              fullWidth
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="teacher-input"
            >
              {filteredStudents.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.last_name}, {student.first_name} ({student.dni})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant={attendanceStatus === 'presente' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setAttendanceStatus('presente')}
                startIcon={<CheckCircleIcon />}
              >
                Presente
              </Button>
              <Button
                fullWidth
                variant={attendanceStatus === 'ausente' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setAttendanceStatus('ausente')}
                startIcon={<CancelIcon />}
              >
                Ausente
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            className="teacher-button teacher-button-secondary"
          >
            Cerrar
          </Button>
          <Button
            onClick={handleMarkAttendance}
            variant="contained"
            className="teacher-button teacher-button-primary"
            disabled={!selectedStudent}
          >
            Guardar Asistencia
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAttendance;

