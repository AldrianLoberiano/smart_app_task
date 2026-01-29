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
  DialogActions,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TaskIcon from '@mui/icons-material/Task';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationPanel from './NotificationPanel';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar sx={{ minHeight: 70 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 32, color: '#fff' }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Smart Management System
          </Typography>
        </Box>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationPanel />
            
            {user.role !== 'Admin' && (
              <>
                <Button 
                  color="inherit" 
                  startIcon={<EventNoteIcon />}
                  onClick={() => navigate('/appointments')}
                  sx={{ 
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Appointments
                </Button>
                
                <Button 
                  color="inherit" 
                  startIcon={<TaskIcon />}
                  onClick={() => navigate('/tasks')}
                  sx={{ 
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Tasks
                </Button>
              </>
            )}
            
            {user.role === 'Admin' && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                ml: 2,
                pl: 2,
                borderLeft: '2px solid rgba(255,255,255,0.2)'
              }}>
                <Chip 
                  label="ADMIN PANEL" 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 24,
                    mr: 1
                  }} 
                />
                
                <Button 
                  color="inherit" 
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/admin/dashboard')}
                  sx={{ 
                    textTransform: 'none',
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 500,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.25)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  Dashboard
                </Button>
                
                <Button 
                  color="inherit" 
                  startIcon={<EventNoteIcon />}
                  onClick={() => navigate('/admin/appointments')}
                  sx={{ 
                    textTransform: 'none',
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 500,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.25)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  Appointments
                </Button>
                
                <Button 
                  color="inherit" 
                  startIcon={<TaskIcon />}
                  onClick={() => navigate('/admin/tasks')}
                  sx={{ 
                    textTransform: 'none',
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 500,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.25)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  Tasks
                </Button>
              </Box>
            )}

            <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
            
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 600
              }}>
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user.username}
                </Typography>
                <Chip 
                  label={user.role} 
                  size="small" 
                  color={user.role === 'Admin' ? 'error' : 'primary'}
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Divider />
              <MenuItem onClick={() => {
                handleProfileMenuClose();
                navigate('/profile');
              }}>
                <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={() => {
                handleProfileMenuClose();
                navigate('/settings');
              }}>
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => {
                handleProfileMenuClose();
                handleLogoutClick();
              }}>
                <LogoutIcon sx={{ mr: 1, fontSize: 20, color: 'error.main' }} />
                <Typography color="error">Logout</Typography>
              </MenuItem>
            </Menu>
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
