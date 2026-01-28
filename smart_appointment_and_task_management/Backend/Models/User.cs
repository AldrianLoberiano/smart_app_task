namespace Backend.Models;

/// <summary>
/// User entity representing application users
/// </summary>
public class User
{
    public int Id { get; set; }
    
    public string Username { get; set; } = string.Empty;
    
    public string Email { get; set; } = string.Empty;
    
    public string PasswordHash { get; set; } = string.Empty;
    
    /// <summary>
    /// User role: "Admin" or "User"
    /// </summary>
    public string Role { get; set; } = "User";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
