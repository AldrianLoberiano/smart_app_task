import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Grid,
  Divider,
  Stack,
} from '@mui/material';
import type { Appointment } from '../../types';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format, formatDistance, differenceInMinutes, isFuture, isToday, isTomorrow } from 'date-fns';

interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: number) => void;
  onComplete?: (id: number) => void;
  onCancel?: (id: number) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onEdit,
  onDelete,
  onComplete,
  onCancel,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'primary';
      case 'Approved':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimeUntil = (date: Date): { text: string; color: string; urgent: boolean } => {
    const now = new Date();
    const diffMins = differenceInMinutes(date, now);

    if (diffMins < 0) {
      return { text: 'Past', color: '#666', urgent: false };
    } else if (diffMins < 60) {
      return { text: `In ${diffMins} min`, color: '#d32f2f', urgent: true };
    } else if (diffMins < 120) {
      return { text: 'In 1 hour', color: '#f57c00', urgent: true };
    } else if (isToday(date)) {
      return { text: `Today at ${format(date, 'h:mm a')}`, color: '#1976d2', urgent: false };
    } else if (isTomorrow(date)) {
      return { text: `Tomorrow at ${format(date, 'h:mm a')}`, color: '#388e3c', urgent: false };
    } else {
      return { text: formatDistance(date, now, { addSuffix: true }), color: '#666', urgent: false };
    }
  };

  const calculateDuration = (start: string, end: string): string => {
    const diffMins = differenceInMinutes(new Date(end), new Date(start));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (appointments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No appointments found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first appointment to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {appointments.map((appointment) => {
        const startDate = new Date(appointment.startDateTime);
        const endDate = new Date(appointment.endDateTime);
        const timeUntil = formatTimeUntil(startDate);
        const duration = calculateDuration(appointment.startDateTime, appointment.endDateTime);
        const isUpcoming = isFuture(startDate) && appointment.status === 'Scheduled';

        return (
          <Grid item xs={12} md={6} lg={4} key={appointment.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: timeUntil.urgent ? '2px solid #d32f2f' : 'none',
                boxShadow: timeUntil.urgent ? 3 : 1,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    {appointment.title}
                  </Typography>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </Box>

                {appointment.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {appointment.description}
                  </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1}>
                  {/* Time Until */}
                  {isUpcoming && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: timeUntil.urgent ? 'error.light' : 'primary.light',
                        color: timeUntil.urgent ? 'error.dark' : 'primary.dark',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="bold">
                        {timeUntil.text}
                      </Typography>
                    </Box>
                  )}

                  {/* Date and Time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {format(startDate, 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{format(startDate, 'h:mm a')}</strong> - <strong>{format(endDate, 'h:mm a')}</strong>
                    </Typography>
                    <Chip label={duration} size="small" variant="outlined" />
                  </Box>

                  {/* Location */}
                  {appointment.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {appointment.location}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(appointment)}
                >
                  Edit
                </Button>
                {appointment.status === 'Scheduled' && onComplete && (
                  <Button
                    size="small"
                    color="success"
                    onClick={() => onComplete(appointment.id)}
                  >
                    Complete
                  </Button>
                )}
                {(appointment.status === 'Scheduled' || appointment.status === 'Approved') && onCancel && (
                  <Button
                    size="small"
                    color="warning"
                    onClick={() => onCancel(appointment.id)}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDelete(appointment.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default AppointmentList;
