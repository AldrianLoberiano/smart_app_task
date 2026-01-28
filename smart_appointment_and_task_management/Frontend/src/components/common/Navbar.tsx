import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TaskIcon from '@mui/icons-material/Task';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationPanel from './NotificationPanel';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Smart Management System
        </Typography>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              Welcome, {user.username} {user.role === 'Admin' && '(Admin)'}
            </Typography>
            
            <NotificationPanel />
            
            {user.role !== 'Admin' && (
              <>
                <Button 
                  color="inherit" 
                  startIcon={<EventNoteIcon />}
                  onClick={() => navigate('/appointments')}
                >
                  Appointments
                </Button>
                
                <Button 
                  color="inherit" 
                  startIcon={<TaskIcon />}
                  onClick={() => navigate('/tasks')}
                >
                  Tasks
                </Button>
              </>
            )}
            
            {user.role === 'Admin' && (
              <>
                <Button 
                  color="inherit" 
                  startIcon={<AdminPanelSettingsIcon />}
                  onClick={() => navigate('/admin/dashboard')}
                  sx={{ ml: 2, borderLeft: '1px solid rgba(255,255,255,0.3)', pl: 2 }}
                >
                  Admin Dashboard
                </Button>
                
                <Button 
                  color="inherit" 
                  startIcon={<AdminPanelSettingsIcon />}
                  onClick={() => navigate('/admin/appointments')}
                >
                  Appointments
                </Button>
                
                <Button 
                  color="inherit" 
                  startIcon={<AdminPanelSettingsIcon />}
                  onClick={() => navigate('/admin/tasks')}
                >
                  Tasks
                </Button>
              </>
            )}
            
            <Button 
              color="inherit" 
              startIcon={<LogoutIcon />}
              onClick={handleLogoutClick}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>

      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout? You will be redirected to the homepage.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" variant="contained" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;
