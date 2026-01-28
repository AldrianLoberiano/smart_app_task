import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Task as TaskIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CloudSync as CloudIcon,
} from '@mui/icons-material';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <CalendarIcon fontSize="large" />,
      title: 'Smart Appointments',
      description: 'Schedule and manage your appointments with ease. Never miss an important meeting.',
      color: theme.palette.primary.main,
    },
    {
      icon: <TaskIcon fontSize="large" />,
      title: 'Task Management',
      description: 'Organize your tasks efficiently. Track progress and meet your deadlines.',
      color: theme.palette.secondary.main,
    },
    {
      icon: <NotificationIcon fontSize="large" />,
      title: 'Smart Notifications',
      description: 'Get timely reminders for upcoming appointments and pending tasks.',
      color: theme.palette.success.main,
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with industry-standard security.',
      color: theme.palette.warning.main,
    },
    {
      icon: <SpeedIcon fontSize="large" />,
      title: 'Fast & Responsive',
      description: 'Lightning-fast performance on any device. Access from anywhere.',
      color: theme.palette.info.main,
    },
    {
      icon: <CloudIcon fontSize="large" />,
      title: 'Cloud Sync',
      description: 'Automatic synchronization across all your devices in real-time.',
      color: theme.palette.error.main,
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.9
          )} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                }}
              >
                Smart Appointment & Task Management
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.95,
                  fontWeight: 300,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                Streamline your schedule, boost productivity, and never miss a beat.
                The all-in-one solution for managing appointments and tasks effortlessly.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.9),
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#ffffff', 0.1),
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    bgcolor: alpha('#ffffff', 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        transform: 'scale(1)',
                      },
                      '50%': {
                        transform: 'scale(1.05)',
                      },
                    },
                  }}
                >
                  <CalendarIcon sx={{ fontSize: 150, opacity: 0.8 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
            }}
          >
            Everything You Need to Stay Organized
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', fontWeight: 300 }}
          >
            Powerful features designed to help you manage your time effectively
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(feature.color, 0.1),
                      color: feature.color,
                      width: 70,
                      height: 70,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.5rem' },
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, fontWeight: 300 }}
            >
              Join thousands of users who are already managing their time better
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: 3,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                },
                transition: 'all 0.3s',
              }}
            >
              Create Your Free Account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: theme.palette.grey[900],
          color: 'white',
          py: 3,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} Smart Appointment & Task Management System. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
