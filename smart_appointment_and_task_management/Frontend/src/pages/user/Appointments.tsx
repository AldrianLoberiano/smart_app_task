import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Paper,
} from '@mui/material';
import Layout from '../../components/common/Layout';
import AppointmentList from '../../components/appointments/AppointmentList';
import AppointmentDialog from '../../components/appointments/AppointmentDialog';
import { appointmentService } from '../../services/appointmentService';
import { getErrorMessage } from '../../services/api';
import type { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from '../../types';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAll();
      setAppointments(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreate = () => {
    setEditingAppointment(null);
    setDialogOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingAppointmentId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingAppointmentId === null) return;

    try {
      await appointmentService.delete(deletingAppointmentId);
      setDeleteDialogOpen(false);
      setDeletingAppointmentId(null);
      await fetchAppointments();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingAppointmentId(null);
  };

  const handleSave = async (data: CreateAppointmentRequest | UpdateAppointmentRequest) => {
    try {
      if (editingAppointment) {
        await appointmentService.update(editingAppointment.id, data as UpdateAppointmentRequest);
      } else {
        await appointmentService.create(data as CreateAppointmentRequest);
      }
      setDialogOpen(false);
      await fetchAppointments();
    } catch (err) {
      throw err;
    }
  };

  // Filter and search appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(apt =>
        apt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'upcoming') {
      filtered = filtered.filter(apt => new Date(apt.startDateTime) > now);
    } else if (dateFilter === 'past') {
      filtered = filtered.filter(apt => new Date(apt.startDateTime) < now);
    } else if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.startDateTime);
        return aptDate >= today && aptDate < tomorrow;
      });
    } else if (dateFilter === 'week') {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.startDateTime);
        return aptDate >= now && aptDate <= weekFromNow;
      });
    }

    // Sort by date
    return filtered.sort((a, b) => 
      new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );
  }, [appointments, searchQuery, statusFilter, dateFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: appointments.length,
      scheduled: appointments.filter(apt => apt.status === 'Scheduled').length,
      completed: appointments.filter(apt => apt.status === 'Completed').length,
      cancelled: appointments.filter(apt => apt.status === 'Cancelled').length,
      upcoming: appointments.filter(apt => 
        new Date(apt.startDateTime) > now && apt.status === 'Scheduled'
      ).length,
    };
  }, [appointments]);

  const handleExport = () => {
    appointmentService.exportToCsv(filteredAppointments);
  };

  const handleComplete = async (id: number) => {
    try {
      await appointmentService.complete(id);
      setSuccessMessage('Appointment marked as completed');
      await fetchAppointments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await appointmentService.cancel(id);
      setSuccessMessage('Appointment cancelled');
      await fetchAppointments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Appointments</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              disabled={filteredAppointments.length === 0}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              New Appointment
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Statistics Cards */}
        {!loading && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <CalendarTodayIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <EventAvailableIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5">{stats.upcoming}</Typography>
                  <Typography variant="body2" color="text.secondary">Upcoming</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5">{stats.completed}</Typography>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h5" color="primary">{stats.scheduled}</Typography>
                  <Typography variant="body2" color="text.secondary">Scheduled</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <CancelIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5">{stats.cancelled}</Typography>
                  <Typography variant="body2" color="text.secondary">Cancelled</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Search and Filter Controls */}
        {!loading && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Date Range"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="all">All Dates</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="past">Past</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary" align="right">
                  {filteredAppointments.length} result{filteredAppointments.length !== 1 ? 's' : ''}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <AppointmentList
            appointments={filteredAppointments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        )}

        <AppointmentDialog
          open={dialogOpen}
          appointment={editingAppointment}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
        />

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">
            Delete Appointment
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Appointments;
