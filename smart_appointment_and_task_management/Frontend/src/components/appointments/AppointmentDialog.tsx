import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import type { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from '../../types';
import { getErrorMessage } from '../../services/api';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface AppointmentDialogProps {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSave: (data: CreateAppointmentRequest | UpdateAppointmentRequest) => Promise<void>;
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  open,
  appointment,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    status: 'Scheduled' as 'Scheduled' | 'Completed' | 'Cancelled' | 'Approved',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title,
        description: appointment.description || '',
        startDateTime: appointment.startDateTime.slice(0, 16),
        endDateTime: appointment.endDateTime.slice(0, 16),
        location: appointment.location || '',
        status: appointment.status,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDateTime: '',
        endDateTime: '',
        location: '',
        status: 'Scheduled',
      });
    }
    setError('');
  }, [appointment, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
    // Clear specific validation error
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  // Calculate duration when dates change
  useEffect(() => {
    if (formData.startDateTime && formData.endDateTime) {
      const start = new Date(formData.startDateTime);
      const end = new Date(formData.endDateTime);
      const diffMs = end.getTime() - start.getTime();
      
      if (diffMs > 0) {
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        
        if (hours > 0) {
          setDuration(`${hours}h ${mins}m`);
        } else {
          setDuration(`${mins}m`);
        }
      } else {
        setDuration('');
      }
    } else {
      setDuration('');
    }
  }, [formData.startDateTime, formData.endDateTime]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!formData.startDateTime) {
      errors.startDateTime = 'Start date and time is required';
    }

    if (!formData.endDateTime) {
      errors.endDateTime = 'End date and time is required';
    }

    if (formData.startDateTime && formData.endDateTime) {
      const start = new Date(formData.startDateTime);
      const end = new Date(formData.endDateTime);
      const now = new Date();

      if (start < now && !appointment) {
        errors.startDateTime = 'Start time cannot be in the past';
      }

      if (end <= start) {
        errors.endDateTime = 'End time must be after start time';
      }

      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 15) {
        errors.endDateTime = 'Appointment must be at least 15 minutes long';
      }

      if (diffMins > 1440) { // 24 hours
        errors.endDateTime = 'Appointment cannot exceed 24 hours';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        startDateTime: new Date(formData.startDateTime).toISOString(),
        endDateTime: new Date(formData.endDateTime).toISOString(),
        location: formData.location.trim() || undefined,
      };

      if (appointment) {
        data.status = formData.status;
      }

      await onSave(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {appointment ? 'Edit Appointment' : 'Create Appointment'}
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
            error={!!validationErrors.title}
            helperText={validationErrors.title}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            helperText="Optional: Add more details about the appointment"
          />

          <TextField
            fullWidth
            label="Start Date & Time"
            name="startDateTime"
            type="datetime-local"
            value={formData.startDateTime}
            onChange={handleChange}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
            error={!!validationErrors.startDateTime}
            helperText={validationErrors.startDateTime}
          />

          <TextField
            fullWidth
            label="End Date & Time"
            name="endDateTime"
            type="datetime-local"
            value={formData.endDateTime}
            onChange={handleChange}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
            error={!!validationErrors.endDateTime}
            helperText={validationErrors.endDateTime}
          />

          {duration && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Chip 
                label={`Duration: ${duration}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          )}

          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            margin="normal"
            helperText="Optional: Meeting room, address, or online link"
          />

          {appointment && (
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              margin="normal"
              required
            >
              <MenuItem value="Scheduled">Scheduled</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentDialog;
