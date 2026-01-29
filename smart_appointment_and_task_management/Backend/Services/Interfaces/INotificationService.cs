using Backend.DTOs.Notifications;

namespace Backend.Services.Interfaces;

public interface INotificationService
{
    Task<NotificationPreferencesDto> GetUserPreferencesAsync(int userId);
    Task<NotificationPreferencesDto> UpdateUserPreferencesAsync(int userId, NotificationPreferencesDto preferences);
    Task SendAppointmentRemindersAsync();
    Task SendTaskRemindersAsync();
    Task SavePushSubscriptionAsync(int userId, string subscription);
}
