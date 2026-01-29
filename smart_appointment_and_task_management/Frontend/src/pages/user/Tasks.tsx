import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Paper,
} from '@mui/material';
import Layout from '../../components/common/Layout';
import TaskList from '../../components/tasks/TaskList';
import TaskDialog from '../../components/tasks/TaskDialog';
import { taskService } from '../../services/taskService';
import { getErrorMessage } from '../../services/api';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dueDateFilter, setDueDateFilter] = useState<string>('all');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAll();
      setTasks(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.delete(id);
      await fetchTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      if (task.isCompleted) {
        // If already completed, update to mark as not completed
        await taskService.update(task.id, {
          ...task,
          isCompleted: false,
          status: 'Pending',
        });
        setSuccessMessage('Task marked as incomplete');
      } else {
        // Mark as complete
        await taskService.markAsComplete(task.id);
        setSuccessMessage('Task completed!');
      }
      await fetchTasks();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSave = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    try {
      if (editingTask) {
        await taskService.update(editingTask.id, data as UpdateTaskRequest);
      } else {
        await taskService.create(data as CreateTaskRequest);
      }
      setDialogOpen(false);
      await fetchTasks();
    } catch (err) {
      throw err;
    }
  };

  // Filter and search logic
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Due date filter
    const now = new Date();
    if (dueDateFilter === 'overdue') {
      filtered = filtered.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && !task.isCompleted
      );
    } else if (dueDateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      });
    } else if (dueDateFilter === 'week') {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= now && dueDate <= weekFromNow;
      });
    } else if (dueDateFilter === 'no-date') {
      filtered = filtered.filter(task => !task.dueDate);
    }

    // Sort: overdue first, then by due date, then by priority
    return filtered.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        const aDate = new Date(a.dueDate);
        const bDate = new Date(b.dueDate);
        const aOverdue = aDate < now && !a.isCompleted;
        const bOverdue = bDate < now && !b.isCompleted;
        
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        
        return aDate.getTime() - bDate.getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, dueDateFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'InProgress').length,
      completed: tasks.filter(t => t.isCompleted).length,
      overdue: tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < now && !t.isCompleted
      ).length,
      highPriority: tasks.filter(t => t.priority === 'High' && !t.isCompleted).length,
    };
  }, [tasks]);

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">My Tasks</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add Task
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
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
                      <WarningIcon color="error" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Overdue
                      </Typography>
                    </Box>
                    <Typography variant="h4">{stats.overdue}</Typography>
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
            </Grid>

            {/* Search and Filters */}
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
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Priority</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Due Date"
                    value={dueDateFilter}
                    onChange={(e) => setDueDateFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Dates</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                    <MenuItem value="today">Due Today</MenuItem>
                    <MenuItem value="week">Due This Week</MenuItem>
                    <MenuItem value="no-date">No Due Date</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            <TaskList
              tasks={filteredTasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          </>
        )}

        <TaskDialog
          open={dialogOpen}
          task={editingTask}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
        />
      </Box>
    </Layout>
  );
};

export default Tasks;
