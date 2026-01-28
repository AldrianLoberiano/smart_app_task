namespace Backend.Models;

/// <summary>
/// Appointment entity for scheduling meetings and events
/// </summary>
public class Appointment
{
    public int Id { get; set; }
    
    public string Title { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public DateTime StartDateTime { get; set; }
    
    public DateTime EndDateTime { get; set; }
    
    public string? Location { get; set; }
    
    /// <summary>
    /// Status: Scheduled, Completed, Cancelled
    /// </summary>
    public string Status { get; set; } = "Scheduled";
    
    // Foreign key
    public int UserId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public User User { get; set; } = null!;
}
