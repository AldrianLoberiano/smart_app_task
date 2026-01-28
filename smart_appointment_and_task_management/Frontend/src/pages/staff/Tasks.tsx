import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Layout from '../../components/common/Layout';
import TaskList from '../../components/tasks/TaskList';
import TaskDialog from '../../components/tasks/TaskDialog';
import { taskService } from '../../services/taskService';
import { getErrorMessage } from '../../services/api';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types';
import AddIcon from '@mui/icons-material/Add';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
      } else {
        // Mark as complete
        await taskService.markAsComplete(task.id);
      }
      await fetchTasks();
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

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Tasks</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            New Task
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleComplete={handleToggleComplete}
          />
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
