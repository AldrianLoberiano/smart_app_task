import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Stack,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  Task as TaskIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingActionsIcon,
  AssignmentLate as AssignmentLateIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Area, AreaChart 
} from 'recharts';
import { format, subDays, startOfDay, isPast } from 'date-fns';
import Layout from '../../components/common/Layout';
import { adminService } from '../../services/adminService';
import type { Appointment, Task } from '../../types';
import { useNavigate } from 'react-router-dom';

interface Stats {
  totalAppointments: number;
  totalTasks: number;
  scheduledAppointments: number;
  approvedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  totalUsers: number;
  overdueAppointments: number;
  overdueTasks: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, tasksData] = await Promise.all([
        adminService.getAllAppointments(),
        adminService.getAllTasks(),
      ]);

      setAppointments(appointmentsData);
      setTasks(tasksData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive stats
  const stats = useMemo((): Stats => {
    return {
      totalAppointments: appointments.length,
      totalTasks: tasks.length,
      scheduledAppointments: appointments.filter(a => a.status === 'Scheduled').length,
      approvedAppointments: appointments.filter(a => a.status === 'Approved').length,
      completedAppointments: appointments.filter(a => a.status === 'Completed').length,
      cancelledAppointments: appointments.filter(a => a.status === 'Cancelled').length,
      pendingTasks: tasks.filter(t => t.status === 'Pending').length,
      inProgressTasks: tasks.filter(t => t.status === 'InProgress').length,
      completedTasks: tasks.filter(t => t.isCompleted).length,
      totalUsers: new Set([...appointments.map(a => a.userId), ...tasks.map(t => t.userId)]).size,
      overdueAppointments: appointments.filter(a => 
        isPast(new Date(a.startDateTime)) && a.status === 'Scheduled'
      ).length,
      overdueTasks: tasks.filter(t => 
        t.dueDate && isPast(new Date(t.dueDate)) && !t.isCompleted
      ).length,
    };
  }, [appointments, tasks]);

  // Appointment status distribution for pie chart
  const appointmentStatusData = useMemo(() => [
    { name: 'Scheduled', value: stats.scheduledAppointments },
    { name: 'Approved', value: stats.approvedAppointments },
    { name: 'Completed', value: stats.completedAppointments },
    { name: 'Cancelled', value: stats.cancelledAppointments },
  ].filter(item => item.value > 0), [stats]);

  // Task status distribution for pie chart
  const taskStatusData = useMemo(() => [
    { name: 'Pending', value: stats.pendingTasks },
    { name: 'In Progress', value: stats.inProgressTasks },
    { name: 'Completed', value: stats.completedTasks },
  ].filter(item => item.value > 0), [stats]);

  // Last 7 days activity trend
  const activityTrendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayAppointments = appointments.filter(a => 
        format(new Date(a.createdAt), 'yyyy-MM-dd') === dateStr
      );
      
      const dayTasks = tasks.filter(t => 
        format(new Date(t.createdAt), 'yyyy-MM-dd') === dateStr
      );

      return {
        date: format(date, 'MMM dd'),
        appointments: dayAppointments.length,
        tasks: dayTasks.length,
      };
    });
    return last7Days;
  }, [appointments, tasks]);

  // Priority distribution for tasks
  const taskPriorityData = useMemo(() => {
    const highPriority = tasks.filter(t => t.priority === 'High').length;
    const mediumPriority = tasks.filter(t => t.priority === 'Medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'Low').length;
    
    return [
      { name: 'High', value: highPriority },
      { name: 'Medium', value: mediumPriority },
      { name: 'Low', value: lowPriority },
    ].filter(item => item.value > 0);
  }, [tasks]);

  // Top active users
  const topUsers = useMemo(() => {
    const userActivity = adminService.getUserActivity(appointments, tasks);
    return userActivity.slice(0, 5);
  }, [appointments, tasks]);

  const statCards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: <EventIcon fontSize="large" />,
      color: '#1976d2',
      trend: `${stats.scheduledAppointments} scheduled`,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <PeopleIcon fontSize="large" />,
      color: '#2e7d32',
      trend: 'Active users',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: <TaskIcon fontSize="large" />,
      color: '#ed6c02',
      trend: `${stats.inProgressTasks} in progress`,
    },
    {
      title: 'Completed',
      value: stats.completedAppointments + stats.completedTasks,
      icon: <CheckCircleIcon fontSize="large" />,
      color: '#2e7d32',
      trend: 'Total completed items',
    },
    {
      title: 'Overdue Items',
      value: stats.overdueAppointments + stats.overdueTasks,
      icon: <AssignmentLateIcon fontSize="large" />,
      color: '#d32f2f',
      trend: 'Requires attention',
    },
    {
      title: 'Pending Review',
      value: stats.scheduledAppointments,
      icon: <PendingActionsIcon fontSize="large" />,
      color: '#ed6c02',
      trend: 'Awaiting approval',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
            Admin Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of appointments, tasks, and user activity
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: card.color, width: 48, height: 48 }}>
                      {card.icon}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="h4" component="div" fontWeight="600">
                        {card.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {card.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {card.trend}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3}>
          {/* Activity Trend Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Activity Trend (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={activityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="appointments" 
                    stackId="1" 
                    stroke="#1976d2" 
                    fill="#1976d2" 
                    name="Appointments"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tasks" 
                    stackId="1" 
                    stroke="#ed6c02" 
                    fill="#ed6c02" 
                    name="Tasks"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Top Active Users */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: 400, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Top Active Users
              </Typography>
              <List>
                {topUsers.map((user, index) => (
                  <React.Fragment key={user.userId}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>
                          <PersonAddIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.username}
                        secondary={
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                            <Chip 
                              label={`${user.totalAppointments} apt`} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                            <Chip 
                              label={`${user.totalTasks} tasks`} 
                              size="small" 
                              color="secondary" 
                              variant="outlined" 
                            />
                          </Stack>
                        }
                      />
                    </ListItem>
                    {index < topUsers.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
                {topUsers.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No user data available
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Appointment Status Distribution */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, height: 350 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Appointment Status
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={appointmentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {appointmentStatusData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Task Status Distribution */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, height: 350 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Task Status
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskStatusData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Task Priority Distribution */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, height: 350 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Task Priority
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={taskPriorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Tasks">
                    {taskPriorityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'High' ? '#d32f2f' : entry.name === 'Medium' ? '#ed6c02' : '#1976d2'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Quick Actions
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Chip
                  label="View All Appointments"
                  onClick={() => navigate('/admin/appointments')}
                  color="primary"
                  icon={<EventIcon />}
                  sx={{ cursor: 'pointer', justifyContent: 'flex-start', py: 2.5, fontSize: '0.95rem' }}
                />
                <Chip
                  label="View All Tasks"
                  onClick={() => navigate('/admin/tasks')}
                  color="secondary"
                  icon={<TaskIcon />}
                  sx={{ cursor: 'pointer', justifyContent: 'flex-start', py: 2.5, fontSize: '0.95rem' }}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* System Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                System Overview
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate (Appointments)
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {stats.totalAppointments > 0 
                        ? `${Math.round((stats.completedAppointments / stats.totalAppointments) * 100)}%`
                        : '0%'
                      }
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate (Tasks)
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {stats.totalTasks > 0 
                        ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%`
                        : '0%'
                      }
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Cancellation Rate
                    </Typography>
                    <Typography variant="body1" fontWeight="600" color="error.main">
                      {stats.totalAppointments > 0 
                        ? `${Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100)}%`
                        : '0%'
                      }
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Overdue Rate
                    </Typography>
                    <Typography variant="body1" fontWeight="600" color="warning.main">
                      {(stats.totalAppointments + stats.totalTasks) > 0 
                        ? `${Math.round(((stats.overdueAppointments + stats.overdueTasks) / (stats.totalAppointments + stats.totalTasks)) * 100)}%`
                        : '0%'
                      }
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default AdminDashboard;
