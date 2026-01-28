import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
} from '@mui/material';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../contexts/AuthContext';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TaskIcon from '@mui/icons-material/Task';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Choose an option to get started
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EventNoteIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">Appointments</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Manage your appointments, schedule meetings, and track upcoming events.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="large" 
                  onClick={() => navigate('/appointments')}
                >
                  View Appointments
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TaskIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">Tasks</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Organize your tasks, set priorities, and track your progress.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="large" 
                  onClick={() => navigate('/tasks')}
                >
                  View Tasks
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;
