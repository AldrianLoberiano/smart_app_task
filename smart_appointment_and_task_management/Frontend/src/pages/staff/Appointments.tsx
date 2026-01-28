import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Layout from '../../components/common/Layout';
import AppointmentList from '../../components/appointments/AppointmentList';
import AppointmentDialog from '../../components/appointments/AppointmentDialog';
import { appointmentService } from '../../services/appointmentService';
import { getErrorMessage } from '../../services/api';
import type { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from '../../types';
import AddIcon from '@mui/icons-material/Add';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      await appointmentService.delete(id);
      await fetchAppointments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
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

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Appointments</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            New Appointment
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <AppointmentList
            appointments={appointments}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <AppointmentDialog
          open={dialogOpen}
          appointment={editingAppointment}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
        />
      </Box>
    </Layout>
  );
};

export default Appointments;
