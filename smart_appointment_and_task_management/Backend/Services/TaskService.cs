using Backend.DTOs.Tasks;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

/// <summary>
/// Implementation of ITaskService
/// Handles task business logic and validation
/// </summary>
public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<TaskService> _logger;
    
    public TaskService(
        ITaskRepository taskRepository,
        IUserRepository userRepository,
        ILogger<TaskService> logger)
    {
        _taskRepository = taskRepository;
        _userRepository = userRepository;
        _logger = logger;
    }
    
    public async Task<TaskDto> GetByIdAsync(int id, int userId)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        
        if (task == null)
        {
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }
        
        if (task.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to access this task");
        }
        
        return MapToDto(task);
    }
    
    public async Task<IEnumerable<TaskDto>> GetAllByUserAsync(int userId)
    {
        var tasks = await _taskRepository.GetByUserIdAsync(userId);
        return tasks.Select(MapToDto);
    }
    
    public async Task<IEnumerable<TaskDto>> GetByStatusAsync(string status, int userId)
    {
        var tasks = await _taskRepository.GetByStatusAsync(status, userId);
        return tasks.Select(MapToDto);
    }
    
    public async Task<IEnumerable<TaskDto>> GetByPriorityAsync(string priority, int userId)
    {
        var tasks = await _taskRepository.GetByPriorityAsync(priority, userId);
        return tasks.Select(MapToDto);
    }
    
    public async Task<IEnumerable<TaskDto>> GetOverdueTasksAsync(int userId)
    {
        var tasks = await _taskRepository.GetOverdueTasksAsync(userId);
        return tasks.Select(MapToDto);
    }
    
    public async Task<TaskDto> CreateAsync(CreateTaskDto createDto, int userId)
    {
        _logger.LogInformation("Creating task for user {UserId}", userId);
        
        // Validate user exists
        if (!await _userRepository.ExistsAsync(userId))
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }
        
        // Validate due date
        if (createDto.DueDate.HasValue && createDto.DueDate < DateTime.UtcNow)
        {
            throw new InvalidOperationException("Due date cannot be in the past");
        }
        
        var task = new TaskItem
        {
            Title = createDto.Title,
            Description = createDto.Description,
            DueDate = createDto.DueDate,
            Priority = createDto.Priority,
            Status = "Pending",
            IsCompleted = false,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        var createdTask = await _taskRepository.CreateAsync(task);
        
        // Reload to get user data
        createdTask = await _taskRepository.GetByIdAsync(createdTask.Id);
        
        _logger.LogInformation("Task created successfully: {TaskId}", createdTask!.Id);
        
        return MapToDto(createdTask);
    }
    
    public async Task<TaskDto> UpdateAsync(int id, UpdateTaskDto updateDto, int userId)
    {
        _logger.LogInformation("Updating task {TaskId} for user {UserId}", id, userId);
        
        var task = await _taskRepository.GetByIdAsync(id);
        
        if (task == null)
        {
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }
        
        if (task.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to update this task");
        }
        
        task.Title = updateDto.Title;
        task.Description = updateDto.Description;
        task.DueDate = updateDto.DueDate;
        task.Priority = updateDto.Priority;
        task.Status = updateDto.Status;
        task.IsCompleted = updateDto.IsCompleted;
        task.UpdatedAt = DateTime.UtcNow;
        
        // Auto-complete if status is Completed
        if (updateDto.Status == "Completed")
        {
            task.IsCompleted = true;
        }
        
        await _taskRepository.UpdateAsync(task);
        
        // Reload to get updated data
        task = await _taskRepository.GetByIdAsync(id);
        
        _logger.LogInformation("Task updated successfully: {TaskId}", id);
        
        return MapToDto(task!);
    }
    
    public async Task<TaskDto> MarkAsCompleteAsync(int id, int userId)
    {
        _logger.LogInformation("Marking task {TaskId} as complete for user {UserId}", id, userId);
        
        var task = await _taskRepository.GetByIdAsync(id);
        
        if (task == null)
        {
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }
        
        if (task.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to update this task");
        }
        
        task.IsCompleted = true;
        task.Status = "Completed";
        task.UpdatedAt = DateTime.UtcNow;
        
        await _taskRepository.UpdateAsync(task);
        
        // Reload to get updated data
        task = await _taskRepository.GetByIdAsync(id);
        
        _logger.LogInformation("Task marked as complete: {TaskId}", id);
        
        return MapToDto(task!);
    }
    
    public async Task DeleteAsync(int id, int userId)
    {
        _logger.LogInformation("Deleting task {TaskId} for user {UserId}", id, userId);
        
        var task = await _taskRepository.GetByIdAsync(id);
        
        if (task == null)
        {
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }
        
        if (task.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to delete this task");
        }
        
        await _taskRepository.DeleteAsync(id);
        
        _logger.LogInformation("Task deleted successfully: {TaskId}", id);
    }
    
    private static TaskDto MapToDto(TaskItem task)
    {
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            DueDate = task.DueDate,
            Priority = task.Priority,
            Status = task.Status,
            IsCompleted = task.IsCompleted,
            UserId = task.UserId,
            Username = task.User.Username,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };
    }
    
    public async Task<IEnumerable<TaskDto>> GetAllTasksForAdminAsync()
    {
        _logger.LogInformation("Admin fetching all tasks");
        var tasks = await _taskRepository.GetAllAsync();
        return tasks.Select(MapToDto);
    }
    
    public async Task<TaskDto> UpdateTaskStatusAsync(int id, string status)
    {
        _logger.LogInformation("Updating task {TaskId} status to {Status}", id, status);
        
        var task = await _taskRepository.GetByIdAsync(id);
        
        if (task == null)
        {
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }
        
        task.Status = status;
        task.IsCompleted = status == "Completed";
        task.UpdatedAt = DateTime.UtcNow;
        
        await _taskRepository.UpdateAsync(task);
        
        // Reload to get updated data
        task = await _taskRepository.GetByIdAsync(id);
        
        _logger.LogInformation("Task status updated successfully: {TaskId}", id);
        
        return MapToDto(task!);
    }
}
