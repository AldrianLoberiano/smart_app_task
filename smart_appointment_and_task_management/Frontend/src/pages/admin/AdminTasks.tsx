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
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  Checkbox,
  IconButton,
  Tooltip,
  TablePagination,
  Stack,
} from '@mui/material';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import Layout from '../../components/common/Layout';
import { adminService } from '../../services/adminService';
import type { Task } from '../../types';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import PeopleIcon from '@mui/icons-material/People';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningIcon from '@mui/icons-material/Warning';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DoneAllIcon from '@mui/icons-material/DoneAll';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const AdminTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [tabValue, setTabValue] = useState(0);
  
  // Selection and bulk operations
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllTasks();
      setTasks(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Get unique users
  const users = useMemo(() => {
    const uniqueUsers = Array.from(new Set(tasks.map(t => JSON.stringify({ id: t.userId, name: t.username }))))
      .map(str => JSON.parse(str));
    return uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Tab filter
    if (tabValue === 1) filtered = filtered.filter(t => t.status === 'Pending');
    else if (tabValue === 2) filtered = filtered.filter(t => t.status === 'InProgress');
    else if (tabValue === 3) filtered = filtered.filter(t => t.status === 'Completed');
    else if (tabValue === 4) filtered = filtered.filter(t => t.priority === 'High' && !t.isCompleted);
    else if (tabValue === 5) {
      const now = new Date();
      filtered = filtered.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !t.isCompleted);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // User filter
    if (selectedUser !== 'all') {
      filtered = filtered.filter(t => t.userId.toString() === selectedUser);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === selectedPriority);
    }

    return filtered;
  }, [tasks, tabValue, searchQuery, selectedUser, selectedStatus, selectedPriority]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'InProgress').length,
      completed: tasks.filter(t => t.isCompleted).length,
      highPriority: tasks.filter(t => t.priority === 'High' && !t.isCompleted).length,
      overdue: tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !t.isCompleted).length,
      users: new Set(tasks.map(t => t.userId)).size,
    };
  }, [tasks]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedTasks(paginatedTasks.map(t => t.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: number) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedTasks.length === 0) return;

    try {
      setBulkUpdating(true);
      await adminService.bulkUpdateTaskStatus(selectedTasks, status);
      await fetchTasks();
      setSelectedTasks([]);
      setSuccessMessage(`Successfully updated ${selectedTasks.length} task(s) to ${status}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update tasks');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleQuickStatusUpdate = async (taskId: number, status: string) => {
    try {
      await adminService.updateTaskStatus(taskId, status);
      await fetchTasks();
      setSuccessMessage(`Task updated to ${status}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleExport = () => {
    adminService.exportTasksToCsv(filteredTasks);
  };

  const getStatusColor = (status: string): 'warning' | 'info' | 'success' | 'default' => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'InProgress': return 'info';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  // Pagination
  const paginatedTasks = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredTasks.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredTasks, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    setSelectedTasks([]);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setSelectedTasks([]);
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Task Management (Admin)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all user tasks
          </Typography>
        </Box>

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

        {/* Statistics Dashboard */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AssignmentIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Tasks
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PendingActionsIcon color="warning" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.pending}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PlayCircleOutlineIcon color="info" />
                  <Typography variant="subtitle2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.inProgress}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.completed}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PriorityHighIcon color="error" />
                  <Typography variant="subtitle2" color="text.secondary">
                    High Priority
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.highPriority}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <WarningIcon color="error" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Overdue
                  </Typography>
                </Box>
                <Typography variant="h4">{stats.overdue}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => {
              setTabValue(newValue);
              setPage(0);
              setSelectedTasks([]);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${tasks.length})`} />
            <Tab label={`Pending (${stats.pending})`} />
            <Tab label={`In Progress (${stats.inProgress})`} />
            <Tab label={`Completed (${stats.completed})`} />
            <Tab label={`High Priority (${stats.highPriority})`} />
            <Tab label={`Overdue (${stats.overdue})`} />
          </Tabs>
        </Paper>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tasks..."
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

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="User"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <MenuItem value="all">All Users</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="InProgress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="Priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
                disabled={filteredTasks.length === 0}
              >
                Export CSV
              </Button>
            </Grid>
          </Grid>

          {/* Bulk Actions */}
          {selectedTasks.length > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {selectedTasks.length} task(s) selected
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={() => handleBulkStatusUpdate('Pending')}
                  disabled={bulkUpdating}
                >
                  Set Pending
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="info"
                  onClick={() => handleBulkStatusUpdate('InProgress')}
                  disabled={bulkUpdating}
                >
                  Set In Progress
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={() => handleBulkStatusUpdate('Completed')}
                  disabled={bulkUpdating}
                >
                  Complete
                </Button>
                {bulkUpdating && <CircularProgress size={20} />}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Tasks Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={paginatedTasks.length > 0 && selectedTasks.length === paginatedTasks.length}
                    indeterminate={selectedTasks.length > 0 && selectedTasks.length < paginatedTasks.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="center">Priority</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No tasks found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTasks.map((task) => {
                  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.isCompleted;
                  
                  return (
                    <TableRow 
                      key={task.id} 
                      hover
                      sx={{ 
                        backgroundColor: isOverdue ? 'error.50' : 'inherit',
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => handleSelectTask(task.id)}
                        />
                      </TableCell>
                      <TableCell>{task.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {task.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {task.userId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography variant="caption" color="text.secondary">
                            {task.description.length > 50
                              ? `${task.description.substring(0, 50)}...`
                              : task.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <Box>
                            <Typography variant="body2">
                              {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color={isOverdue ? 'error' : 'text.secondary'}
                              fontWeight={isOverdue ? 'bold' : 'normal'}
                            >
                              {isOverdue ? '⚠️ ' : ''}
                              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No due date
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={task.priority}
                          color={getPriorityColor(task.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={task.status.replace('InProgress', 'In Progress')}>
                          {task.status === 'Pending' ? (
                            <HourglassEmptyIcon color="warning" />
                          ) : task.status === 'InProgress' ? (
                            <PlayArrowIcon color="info" />
                          ) : (
                            <DoneAllIcon color="success" />
                          )}
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {task.status === 'Pending' && (
                            <Tooltip title="Start Task">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleQuickStatusUpdate(task.id, 'InProgress')}
                              >
                                <PlayCircleOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {task.status !== 'Completed' && (
                            <Tooltip title="Complete Task">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleQuickStatusUpdate(task.id, 'Completed')}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={filteredTasks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Container>
    </Layout>
  );
};

export default AdminTasks;
