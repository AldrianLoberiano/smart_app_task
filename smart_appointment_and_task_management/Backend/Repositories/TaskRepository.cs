using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

/// <summary>
/// Implementation of ITaskRepository
/// Handles all database operations for TaskItem entity
/// </summary>
public class TaskRepository : ITaskRepository
{
    private readonly ApplicationDbContext _context;
    
    public TaskRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        return await _context.Tasks
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == id);
    }
    
    public async Task<IEnumerable<TaskItem>> GetAllAsync()
    {
        return await _context.Tasks
            .Include(t => t.User)
            .OrderBy(t => t.DueDate)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<TaskItem>> GetByUserIdAsync(int userId)
    {
        return await _context.Tasks
            .Include(t => t.User)
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.DueDate)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<TaskItem>> GetByStatusAsync(string status, int userId)
    {
        return await _context.Tasks
            .Include(t => t.User)
            .Where(t => t.UserId == userId && t.Status == status)
            .OrderBy(t => t.DueDate)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<TaskItem>> GetByPriorityAsync(string priority, int userId)
    {
        return await _context.Tasks
            .Include(t => t.User)
            .Where(t => t.UserId == userId && t.Priority == priority)
            .OrderBy(t => t.DueDate)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<TaskItem>> GetOverdueTasksAsync(int userId)
    {
        var now = DateTime.UtcNow;
        return await _context.Tasks
            .Include(t => t.User)
            .Where(t => t.UserId == userId && 
                       t.DueDate.HasValue && 
                       t.DueDate < now && 
                       !t.IsCompleted)
            .OrderBy(t => t.DueDate)
            .ToListAsync();
    }
    
    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }
    
    public async Task UpdateAsync(TaskItem task)
    {
        task.UpdatedAt = DateTime.UtcNow;
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();
    }
    
    public async Task DeleteAsync(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task != null)
        {
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }
    }
    
    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Tasks.AnyAsync(t => t.Id == id);
    }
}
