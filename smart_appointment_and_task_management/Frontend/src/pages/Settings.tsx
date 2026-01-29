import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Notifications,
  DarkMode,
  Language,
  CalendarMonth,
  AccessTime,
  Email,
  Sms,
  Schedule,
  Save,
  RestartAlt,
} from '@mui/icons-material';
import Layout from '../components/common/Layout';
import { notificationService, NotificationPreferences } from '../services/notificationService';

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    push: boolean;
    appointmentReminders: boolean;
    taskReminders: boolean;
    reminderTime: number; // minutes before
  };
  appointments: {
    defaultDuration: number; // minutes
    autoApprove: boolean;
  };
  tasks: {
    defaultPriority: 'Low' | 'Medium' | 'High';
  };
}

const defaultSettings: Settings = {
  theme: 'light',
  language: 'en',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  notifications: {
    email: true,
    push: true,
    appointmentReminders: true,
    taskReminders: true,
    reminderTime: 30,
  },
  appointments: {
    defaultDuration: 60,
    autoApprove: false,
  },
  tasks: {
    defaultPriority: 'Medium',
  },
};

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load local settings
      const savedSettings = localStorage.getItem('appSettings');
      let localSettings = defaultSettings;
      
      if (savedSettings) {
        try {
          localSettings = JSON.parse(savedSettings);
        } catch (error) {
          console.error('Failed to parse local settings:', error);
        }
      }
      
      // Load notification preferences from backend
      try {
        const prefs = await notificationService.getPreferences();
        localSettings.notifications = {
          email: prefs.emailNotifications,
          push: prefs.pushNotifications,
          appointmentReminders: prefs.appointmentReminders,
          taskReminders: prefs.taskReminders,
          reminderTime: prefs.reminderTimeMinutes,
        };
      } catch (err) {
        console.error('Failed to load notification preferences:', err);
      }
      
      setSettings(localSettings);
    } catch (err: any) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (category: keyof Settings, key: string, value: any) => {
    setSettings((prev) => {
      if (category === 'notifications' || category === 'appointments' || category === 'tasks') {
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value,
          },
        };
      }
      return {
        ...prev,
        [key]: value,
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Save local settings
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      // Save notification preferences to backend
      const prefs: NotificationPreferences = {
        emailNotifications: settings.notifications.email,
        pushNotifications: settings.notifications.push,
        appointmentReminders: settings.notifications.appointmentReminders,
        taskReminders: settings.notifications.taskReminders,
        reminderTimeMinutes: settings.notifications.reminderTime,
      };
      
      await notificationService.updatePreferences(prefs);
      
      // Request push permission if enabled
      if (settings.notifications.push) {
        const permission = await notificationService.requestPushPermission();
        if (!permission) {
          setError('Push notification permission denied. Please enable in browser settings.');
        }
      }
      
      setShowSuccess(true);
      setHasChanges(false);
      setError('');
      
      // Notify the app about settings change
      window.dispatchEvent(new Event('settingsChanged'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    }
  };

  const handleReset = async () => {
    try {
      setSettings(defaultSettings);
      localStorage.removeItem('appSettings');
      
      // Reset backend preferences
      const prefs: NotificationPreferences = {
        emailNotifications: true,
        pushNotifications: true,
        appointmentReminders: true,
        taskReminders: true,
        reminderTimeMinutes: 30,
      };
      
      await notificationService.updatePreferences(prefs);
      
      setHasChanges(false);
      setShowSuccess(true);
      setError('');
      
      // Notify the app about settings change
      window.dispatchEvent(new Event('settingsChanged'));
    } catch (err: any) {
      setError('Failed to reset settings');
    }
  };

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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="700">
              Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Customize your application preferences
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RestartAlt />}
              onClick={handleReset}
              disabled={!hasChanges}
            >
              Reset to Default
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Appearance Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <DarkMode color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Appearance
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.theme}
                    label="Theme"
                    onChange={(e) => handleChange('theme', 'theme', e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto (System)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    label="Language"
                    onChange={(e) => handleChange('language', 'language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Date & Time Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CalendarMonth color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Date & Time
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={settings.dateFormat}
                    label="Date Format"
                    onChange={(e) => handleChange('dateFormat', 'dateFormat', e.target.value)}
                  >
                    <MenuItem value="MM/dd/yyyy">MM/DD/YYYY</MenuItem>
                    <MenuItem value="dd/MM/yyyy">DD/MM/YYYY</MenuItem>
                    <MenuItem value="yyyy-MM-dd">YYYY-MM-DD</MenuItem>
                    <MenuItem value="MMM dd, yyyy">MMM DD, YYYY</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    value={settings.timeFormat}
                    label="Time Format"
                    onChange={(e) => handleChange('timeFormat', 'timeFormat', e.target.value)}
                  >
                    <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                    <MenuItem value="24h">24-hour</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Notifications color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Notifications
                  </Typography>
                  <Chip label="Active" size="small" color="success" sx={{ ml: 1 }} />
                </Box>
                <Divider sx={{ mb: 2 }} />

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive notifications via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.email}
                        onChange={(e) =>
                          handleChange('notifications', 'email', e.target.checked)
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Sms />
                    </ListItemIcon>
                    <ListItemText
                      primary="Push Notifications"
                      secondary="Receive push notifications in browser"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.push}
                        onChange={(e) =>
                          handleChange('notifications', 'push', e.target.checked)
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <CalendarMonth />
                    </ListItemIcon>
                    <ListItemText
                      primary="Appointment Reminders"
                      secondary="Get notified about upcoming appointments"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.appointmentReminders}
                        onChange={(e) =>
                          handleChange('notifications', 'appointmentReminders', e.target.checked)
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Schedule />
                    </ListItemIcon>
                    <ListItemText
                      primary="Task Reminders"
                      secondary="Get notified about task deadlines"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.taskReminders}
                        onChange={(e) =>
                          handleChange('notifications', 'taskReminders', e.target.checked)
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText primary="Reminder Time" />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={settings.notifications.reminderTime}
                        onChange={(e) =>
                          handleChange('notifications', 'reminderTime', e.target.value)
                        }
                      >
                        <MenuItem value={15}>15 minutes before</MenuItem>
                        <MenuItem value={30}>30 minutes before</MenuItem>
                        <MenuItem value={60}>1 hour before</MenuItem>
                        <MenuItem value={120}>2 hours before</MenuItem>
                        <MenuItem value={1440}>1 day before</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Appointment Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CalendarMonth color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Appointments
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Default Duration</InputLabel>
                  <Select
                    value={settings.appointments.defaultDuration}
                    label="Default Duration"
                    onChange={(e) =>
                      handleChange('appointments', 'defaultDuration', e.target.value)
                    }
                  >
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={90}>1.5 hours</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appointments.autoApprove}
                      onChange={(e) =>
                        handleChange('appointments', 'autoApprove', e.target.checked)
                      }
                    />
                  }
                  label="Auto-approve appointments (Admin only)"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Task Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Schedule color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Tasks
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <FormControl fullWidth>
                  <InputLabel>Default Priority</InputLabel>
                  <Select
                    value={settings.tasks.defaultPriority}
                    label="Default Priority"
                    onChange={(e) =>
                      handleChange('tasks', 'defaultPriority', e.target.value)
                    }
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setShowSuccess(false)}>
            Settings saved successfully!
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default SettingsPage;
