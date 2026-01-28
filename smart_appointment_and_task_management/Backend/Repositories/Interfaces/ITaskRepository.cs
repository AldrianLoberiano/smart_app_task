using Backend.Models;

namespace Backend.Repositories.Interfaces;

/// <summary>
/// Repository interface for TaskItem entity operations
/// </summary>
public interface ITaskRepository
{
    Task<TaskItem?> GetByIdAsync(int id);
    Task<IEnumerable<TaskItem>> GetAllAsync();
    Task<IEnumerable<TaskItem>> GetByUserIdAsync(int userId);
    Task<IEnumerable<TaskItem>> GetByStatusAsync(string status, int userId);
    Task<IEnumerable<TaskItem>> GetByPriorityAsync(string priority, int userId);
    Task<IEnumerable<TaskItem>> GetOverdueTasksAsync(int userId);
    Task<TaskItem> CreateAsync(TaskItem task);
    Task UpdateAsync(TaskItem task);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
