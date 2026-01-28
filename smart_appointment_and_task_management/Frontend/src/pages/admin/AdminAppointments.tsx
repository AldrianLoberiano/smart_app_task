import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Tooltip,
  Stack,
  Menu,
  Tabs,
  Tab,
  TablePagination,
} from '@mui/material';
import { format, formatDistance, isFuture, isPast, isToday } from 'date-fns';
import Layout from '../../components/common/Layout';
import { adminService } from '../../services/adminService';
import type { Appointment } from '../../types';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EventIcon from '@mui/icons-material/Event';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BlockIcon from '@mui/icons-material/Block';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonIcon from '@mui/icons-material/Person';

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [tabValue, setTabValue] = useState(0);
  
  // Bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllAppointments();
      setAppointments(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAppointment(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedAppointment) return;

    try {
      setUpdating(true);
      await adminService.updateAppointmentStatus(selectedAppointment.id, newStatus);
      setSuccessMessage('Status updated successfully');
      await fetchAppointments();
      handleCloseDialog();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Bulk operations
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(new Set(filteredAppointments.map(apt => apt.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkApprove = async () => {
    try {
      setUpdating(true);
      await adminService.bulkUpdateAppointmentStatus(Array.from(selectedIds), 'Approved');
      setSuccessMessage(`${selectedIds.size} appointments approved`);
      setSelectedIds(new Set());
      await fetchAppointments();
      setBulkMenuAnchor(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to bulk approve');
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkReject = async () => {
    try {
      setUpdating(true);
      await adminService.bulkUpdateAppointmentStatus(Array.from(selectedIds), 'Cancelled');
      setSuccessMessage(`${selectedIds.size} appointments cancelled`);
      setSelectedIds(new Set());
      await fetchAppointments();
      setBulkMenuAnchor(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to bulk reject');
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickApprove = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await adminService.approveAppointment(id);
      setSuccessMessage('Appointment approved');
      await fetchAppointments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleQuickReject = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await adminService.rejectAppointment(id);
      setSuccessMessage('Appointment rejected');
      await fetchAppointments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleExport = () => {
    adminService.exportAppointmentsToCsv(filteredAppointments);
  };

  // Filter and search logic
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Tab filter
    if (tabValue === 1) {
      filtered = filtered.filter(apt => apt.status === 'Scheduled' && isFuture(new Date(apt.startDateTime)));
    } else if (tabValue === 2) {
      filtered = filtered.filter(apt => apt.status === 'Approved');
    } else if (tabValue === 3) {
      filtered = filtered.filter(apt => apt.status === 'Completed');
    } else if (tabValue === 4) {
      filtered = filtered.filter(apt => apt.status === 'Cancelled');
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(apt =>
        apt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(apt => apt.username === userFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'upcoming') {
      filtered = filtered.filter(apt => isFuture(new Date(apt.startDateTime)));
    } else if (dateFilter === 'past') {
      filtered = filtered.filter(apt => isPast(new Date(apt.startDateTime)));
    } else if (dateFilter === 'today') {
      filtered = filtered.filter(apt => isToday(new Date(apt.startDateTime)));
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [appointments, searchQuery, statusFilter, userFilter, dateFilter, tabValue]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter(apt => apt.status === 'Scheduled' && isFuture(new Date(apt.startDateTime))).length,
      approved: appointments.filter(apt => apt.status === 'Approved').length,
      completed: appointments.filter(apt => apt.status === 'Completed').length,
      cancelled: appointments.filter(apt => apt.status === 'Cancelled').length,
      users: new Set(appointments.map(apt => apt.username)).size,
    };
  }, [appointments]);

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(appointments.map(apt => apt.username))).sort();
  }, [appointments]);

  // Pagination
  const paginatedAppointments = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAppointments, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    setSelectedIds(new Set());
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setSelectedIds(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Appointment Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all user appointments across the system
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedIds.size > 0 && (
              <Button
                variant="outlined"
                color="primary"
                onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                startIcon={<FilterListIcon />}
              >
                Bulk Actions ({selectedIds.size})
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              disabled={filteredAppointments.length === 0}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {/* Statistics Cards */}
        {!loading && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <EventIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <PendingIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5">{stats.pending}</Typography>
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <CheckCircleIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5">{stats.approved}</Typography>
                  <Typography variant="body2" color="text.secondary">Approved</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <DoneAllIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5">{stats.completed}</Typography>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <CancelIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5">{stats.cancelled}</Typography>
                  <Typography variant="body2" color="text.secondary">Cancelled</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <PersonIcon color="action" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5">{stats.users}</Typography>
                  <Typography variant="body2" color="text.secondary">Users</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        {!loading && (
          <Paper sx={{ mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
              <Tab label={`All (${appointments.length})`} />
              <Tab label={`Pending (${stats.pending})`} />
              <Tab label={`Approved (${stats.approved})`} />
              <Tab label={`Completed (${stats.completed})`} />
              <Tab label={`Cancelled (${stats.cancelled})`} />
            </Tabs>
          </Paper>
        )}

        {/* Search and Filter Controls */}
        {!loading && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by title, user, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="User"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  {uniqueUsers.map(user => (
                    <MenuItem key={user} value={user}>{user}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="all">All Dates</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="past">Past</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={1}>
                <Typography variant="body2" color="text.secondary" align="right">
                  {filteredAppointments.length} result{filteredAppointments.length !== 1 ? 's' : ''}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedIds.size > 0 && selectedIds.size < filteredAppointments.length}
                        checked={filteredAppointments.length > 0 && selectedIds.size === filteredAppointments.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          No appointments found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAppointments.map((appointment) => {
                      const isSelected = selectedIds.has(appointment.id);
                      const startDate = new Date(appointment.startDateTime);
                      const endDate = new Date(appointment.endDateTime);
                      const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
                      const hours = Math.floor(duration / 60);
                      const mins = duration % 60;
                      const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                      const isPending = appointment.status === 'Scheduled' && isFuture(startDate);

                      return (
                        <TableRow 
                          key={appointment.id} 
                          hover 
                          selected={isSelected}
                          sx={{ 
                            bgcolor: isPending ? 'warning.lighter' : undefined,
                            '&:hover': { cursor: 'pointer' }
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleSelectOne(appointment.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              #{appointment.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {appointment.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {appointment.userId}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ maxWidth: 200 }}>
                              <Typography variant="body2" fontWeight="medium" noWrap>
                                {appointment.title}
                              </Typography>
                              {appointment.description && (
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {appointment.description.length > 40
                                    ? `${appointment.description.substring(0, 40)}...`
                                    : appointment.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {format(startDate, 'MMM dd, yyyy')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={durationText} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {appointment.location || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                              <Tooltip title={appointment.status}>
                                {appointment.status === 'Scheduled' ? (
                                  <ScheduleIcon color="primary" />
                                ) : appointment.status === 'Approved' ? (
                                  <ThumbUpIcon color="success" />
                                ) : appointment.status === 'Completed' ? (
                                  <DoneAllIcon color="success" />
                                ) : (
                                  <BlockIcon color="error" />
                                )}
                              </Tooltip>
                              {isPending && (
                                <Tooltip title="Pending Review">
                                  <HourglassEmptyIcon color="warning" fontSize="small" />
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={format(new Date(appointment.createdAt), 'PPp')}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDistance(new Date(appointment.createdAt), new Date(), { addSuffix: true })}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              {appointment.status === 'Scheduled' && (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={(e) => handleQuickApprove(appointment.id, e)}
                                    >
                                      <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={(e) => handleQuickReject(appointment.id, e)}
                                    >
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              <Tooltip title="More options">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(appointment)}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={filteredAppointments.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
          </>
        )}

        {/* Bulk Actions Menu */}
        <Menu
          anchorEl={bulkMenuAnchor}
          open={Boolean(bulkMenuAnchor)}
          onClose={() => setBulkMenuAnchor(null)}
        >
          <MenuItem onClick={handleBulkApprove} disabled={updating}>
            <CheckCircleIcon sx={{ mr: 1 }} color="success" />
            Approve Selected
          </MenuItem>
          <MenuItem onClick={handleBulkReject} disabled={updating}>
            <CancelIcon sx={{ mr: 1 }} color="error" />
            Reject Selected
          </MenuItem>
        </Menu>

        {/* Status Update Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Update Appointment Status</DialogTitle>
          <DialogContent>
            {selectedAppointment && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  {selectedAppointment.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>User:</strong> {selectedAppointment.username} (ID: {selectedAppointment.userId})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Date:</strong> {format(new Date(selectedAppointment.startDateTime), 'PPp')}
                </Typography>
                {selectedAppointment.description && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Description:</strong> {selectedAppointment.description}
                  </Typography>
                )}
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="Status"
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleUpdateStatus}
              variant="contained"
              disabled={updating || !newStatus || newStatus === selectedAppointment?.status}
            >
              {updating ? <CircularProgress size={24} /> : 'Update Status'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default AdminAppointments;
