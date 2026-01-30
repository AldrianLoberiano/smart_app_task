import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  AccountCircle,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import Layout from '../components/common/Layout';
import { authService, UpdateProfileDto } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profile, setProfile] = useState({
    id: 0,
    username: '',
    email: '',
    role: '',
    createdAt: '',
  });

  const [formData, setFormData] = useState<UpdateProfileDto>({
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfile(data);
      setFormData({
        username: data.username,
        email: data.email,
        newPassword: '',
        confirmPassword: '',
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords if provided
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.newPassword || !formData.confirmPassword) {
        setError('Please fill in both password fields');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    try {
      setSaving(true);
      const updateData: UpdateProfileDto = {
        username: formData.username,
        email: formData.email,
      };

      // Only include password if provided
      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
        updateData.confirmPassword = formData.confirmPassword;
      }

      const updatedProfile = await authService.updateProfile(updateData);
      setProfile(updatedProfile);
      
      // Update local storage with new username
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        authService.storeAuth({
          token: localStorage.getItem('token') || '',
          username: updatedProfile.username,
          email: updatedProfile.email,
          role: updatedProfile.role,
          expiresAt: new Date().toISOString(),
        });
        
        // Update auth context - login function uses token-based auth
        // The user context will be updated automatically on next profile fetch
      }

      setSuccess('Profile updated successfully!');
      setEditing(false);
      setFormData({
        username: updatedProfile.username,
        email: updatedProfile.email,
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile.username,
      email: profile.email,
      newPassword: '',
      confirmPassword: '',
    });
    setEditing(false);
    setError('');
    setSuccess('');
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              {profile.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h4" fontWeight="600">
                {profile.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.role}
              </Typography>
            </Box>
            {!editing && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {!editing ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <AccountCircle color="primary" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Username
                      </Typography>
                    </Box>
                    <Typography variant="h6">{profile.username}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Email color="primary" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                    </Box>
                    <Typography variant="h6">{profile.email}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                      Role
                    </Typography>
                    <Typography variant="h6">{profile.role}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" mb={1}>
                      Member Since
                    </Typography>
                    <Typography variant="h6">
                      {format(new Date(profile.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider>
                    <Typography variant="body2" color="text.secondary">
                      Change Password (Optional)
                    </Typography>
                  </Divider>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleChange}
                    helperText="Leave blank to keep current password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>
      </Container>
    </Layout>
  );
};

export default Profile;
