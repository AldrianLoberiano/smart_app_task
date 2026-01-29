namespace Backend.DTOs.Notifications;

public class NotificationPreferencesDto
{
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool AppointmentReminders { get; set; } = true;
    public bool TaskReminders { get; set; } = true;
    public int ReminderTimeMinutes { get; set; } = 30;
}
