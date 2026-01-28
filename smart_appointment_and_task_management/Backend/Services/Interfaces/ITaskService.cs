using Backend.DTOs.Tasks;

namespace Backend.Services.Interfaces;

/// <summary>
/// Service interface for task business logic
/// </summary>
public interface ITaskService
{
    Task<TaskDto> GetByIdAsync(int id, int userId);
    Task<IEnumerable<TaskDto>> GetAllByUserAsync(int userId);
    Task<IEnumerable<TaskDto>> GetByStatusAsync(string status, int userId);
    Task<IEnumerable<TaskDto>> GetByPriorityAsync(string priority, int userId);
    Task<IEnumerable<TaskDto>> GetOverdueTasksAsync(int userId);
    Task<TaskDto> CreateAsync(CreateTaskDto createDto, int userId);
    Task<TaskDto> UpdateAsync(int id, UpdateTaskDto updateDto, int userId);
    Task<TaskDto> MarkAsCompleteAsync(int id, int userId);
    Task DeleteAsync(int id, int userId);
    Task<IEnumerable<TaskDto>> GetAllTasksForAdminAsync();
    Task<TaskDto> UpdateTaskStatusAsync(int id, string status);
}
