import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Task as TaskIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService, type Notification } from '../../services/notificationService';

const NotificationPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (user) {
      notificationService.setUserRole(user.role);
    }
    fetchNotifications();
    
    // Refresh notifications every 1 minute for admins, 5 minutes for users
    const interval = setInterval(fetchNotifications, user?.role === 'Admin' ? 60 * 1000 : 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await notificationService.getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Refresh on open
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'appointment') {
      navigate('/appointments');
    } else {
      navigate('/tasks');
    }
    handleClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="notifications"
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h6">Notifications</Typography>
          <Typography variant="caption" color="text.secondary">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        
        <Divider />

        {loading ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  borderLeft: 4,
                  borderColor: `${getPriorityColor(notification.priority)}.main`,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  {notification.type === 'appointment' ? (
                    <EventIcon color={getPriorityColor(notification.priority)} />
                  ) : (
                    <TaskIcon color={getPriorityColor(notification.priority)} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {notification.title}
                      </Typography>
                      {notification.priority === 'high' && (
                        <WarningIcon fontSize="small" color="error" />
                      )}
                    </Box>
                  }
                  secondary={notification.message}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    sx: { mt: 0.5 },
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                onClick={() => {
                  handleClose();
                  fetchNotifications();
                }}
              >
                Refresh
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationPanel;
