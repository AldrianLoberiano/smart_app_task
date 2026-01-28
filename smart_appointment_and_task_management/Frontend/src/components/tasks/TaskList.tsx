import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Grid,
  Checkbox,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import type { Task } from '../../types';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string): 'success' | 'primary' | 'default' => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'InProgress':
        return 'primary';
      case 'Pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDueDate = (dueDate: string | null | undefined) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const isOverdue = isPast(date) && !isToday(date);
    
    let displayText = '';
    let color: 'error' | 'warning' | 'success' | 'default' = 'default';
    
    if (isOverdue) {
      displayText = `Overdue by ${formatDistanceToNow(date)}`;
      color = 'error';
    } else if (isToday(date)) {
      displayText = `Due today at ${format(date, 'h:mm a')}`;
      color = 'warning';
    } else if (isTomorrow(date)) {
      displayText = `Due tomorrow at ${format(date, 'h:mm a')}`;
      color = 'warning';
    } else {
      displayText = `Due ${formatDistanceToNow(date, { addSuffix: true })}`;
      color = 'success';
    }
    
    return { displayText, color, isOverdue };
  };

  if (tasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No tasks found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first task or adjust your filters
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {tasks.map((task) => {
        const dueDateInfo = formatDueDate(task.dueDate);
        const isOverdue = dueDateInfo?.isOverdue && !task.isCompleted;
        
        return (
          <Grid item xs={12} sm={6} lg={4} key={task.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                opacity: task.isCompleted ? 0.7 : 1,
                border: isOverdue ? '2px solid' : undefined,
                borderColor: isOverdue ? 'error.main' : undefined,
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 2 }}>
                  <Checkbox
                    checked={task.isCompleted}
                    onChange={() => onToggleComplete(task)}
                    sx={{ mt: -1 }}
                  />
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="div"
                      sx={{ 
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                        mb: 1,
                      }}
                    >
                      {task.title}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                      />
                      <Chip
                        label={task.status.replace('InProgress', 'In Progress')}
                        color={getStatusColor(task.status)}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    {task.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1 }} />

                    {dueDateInfo ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          color={`${dueDateInfo.color}.main`}
                          sx={{ fontWeight: isOverdue ? 'bold' : 'normal' }}
                        >
                          {dueDateInfo.displayText}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No due date
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>

              <Divider />

              <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                <Box>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(task)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(task.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                {!task.isCompleted && (
                  <Box>
                    {task.status === 'Pending' && (
                      <Tooltip title="Start Task">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => onToggleComplete(task)}
                        >
                          Start
                        </Button>
                      </Tooltip>
                    )}
                    {task.status === 'InProgress' && (
                      <Tooltip title="Complete Task">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckIcon />}
                          onClick={() => onToggleComplete(task)}
                          color="success"
                        >
                          Complete
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default TaskList;
