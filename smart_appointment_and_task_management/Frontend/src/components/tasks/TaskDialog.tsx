import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types';
import { getErrorMessage } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

interface TaskDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  task,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'Pending' as 'Pending' | 'InProgress' | 'Completed',
    isCompleted: false,
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
        priority: task.priority,
        status: task.status,
        isCompleted: task.isCompleted,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Pending',
        isCompleted: false,
      });
    }
    setError('');
    setFieldErrors({});
  }, [task, open]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }

    // Due date validation
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      
      if (isNaN(dueDate.getTime())) {
        errors.dueDate = 'Invalid date format';
      } else if (!task && dueDate < now) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const getTimeUntilDue = (): string | null => {
    if (!formData.dueDate) return null;
    const dueDate = new Date(formData.dueDate);
    const now = new Date();
    if (dueDate < now) {
      return `Overdue by ${formatDistanceToNow(dueDate)}`;
    }
    return `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        priority: formData.priority,
      };

      if (task) {
        data.status = formData.status;
        data.isCompleted = formData.isCompleted;
      }

      await onSave(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {task ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
            error={Boolean(fieldErrors.title)}
            helperText={fieldErrors.title || `${formData.title.length}/100 characters`}
            inputProps={{ maxLength: 100 }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            error={Boolean(fieldErrors.description)}
            helperText={fieldErrors.description || `${formData.description.length}/500 characters`}
            inputProps={{ maxLength: 500 }}
          />

          <TextField
            fullWidth
            label="Due Date & Time"
            name="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            error={Boolean(fieldErrors.dueDate)}
            helperText={fieldErrors.dueDate}
          />

          {formData.dueDate && !fieldErrors.dueDate && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {getTimeUntilDue()}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            margin="normal"
            required
          >
            <MenuItem value="Low">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Low Priority
                <Chip label="Low" color="info" size="small" />
              </Box>
            </MenuItem>
            <MenuItem value="Medium">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Medium Priority
                <Chip label="Medium" color="warning" size="small" />
              </Box>
            </MenuItem>
            <MenuItem value="High">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                High Priority
                <Chip label="High" color="error" size="small" />
              </Box>
            </MenuItem>
          </TextField>

          {task && (
            <>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                margin="normal"
                required
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="InProgress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>

              <FormControlLabel
                control={
                  <Checkbox
                    name="isCompleted"
                    checked={formData.isCompleted}
                    onChange={handleChange}
                  />
                }
                label="Mark as completed"
                sx={{ mt: 1 }}
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskDialog;
