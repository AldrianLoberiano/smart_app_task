namespace Backend.Models;

/// <summary>
/// Task entity for managing to-do items
/// Note: Named TaskItem to avoid conflict with System.Threading.Tasks.Task
/// </summary>
public class TaskItem
{
    public int Id { get; set; }
    
    public string Title { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    /// <summary>
    /// Priority: Low, Medium, High
    /// </summary>
    public string Priority { get; set; } = "Medium";
    
    /// <summary>
    /// Status: Pending, InProgress, Completed
    /// </summary>
    public string Status { get; set; } = "Pending";
    
    public bool IsCompleted { get; set; } = false;
    
    // Foreign key
    public int UserId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public User User { get; set; } = null!;
}
