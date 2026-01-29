import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, PaletteMode } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Appointments from './pages/user/Appointments';
import Tasks from './pages/user/Tasks';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminTasks from './pages/admin/AdminTasks';

const App: React.FC = () => {
  const [themeMode, setThemeMode] = useState<PaletteMode>('light');

  useEffect(() => {
    // Load theme from localStorage
    const loadTheme = () => {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          let mode: PaletteMode = 'light';
          
          if (settings.theme === 'dark') {
            mode = 'dark';
          } else if (settings.theme === 'auto') {
            // Use system preference
            mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          } else {
            mode = 'light';
          }
          
          setThemeMode(mode);
        } catch (error) {
          console.error('Failed to parse theme settings:', error);
        }
      }
    };

    loadTheme();

    // Listen for storage changes (when settings are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'appSettings') {
        loadTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event within the same window
    const handleSettingsChange = () => {
      loadTheme();
    };
    window.addEventListener('settingsChanged', handleSettingsChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsChanged', handleSettingsChange);
    };
  }, []);

  // Create Material-UI theme dynamically
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      }),
    [themeMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute>
                  <AdminAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tasks"
              element={
                <ProtectedRoute>
                  <AdminTasks />
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect for authenticated users */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
