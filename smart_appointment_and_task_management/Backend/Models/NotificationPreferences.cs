namespace Backend.Models;

public class NotificationPreferences
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool AppointmentReminders { get; set; } = true;
    public bool TaskReminders { get; set; } = true;
    public int ReminderTimeMinutes { get; set; } = 30;
    public string? PushSubscription { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User User { get; set; } = null!;
}
