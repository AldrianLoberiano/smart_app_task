using Backend.Data;
using Backend.DTOs.Notifications;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        ApplicationDbContext context,
        IEmailService emailService,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<NotificationPreferencesDto> GetUserPreferencesAsync(int userId)
    {
        var preferences = await _context.NotificationPreferences
            .FirstOrDefaultAsync(n => n.UserId == userId);

        if (preferences == null)
        {
            // Create default preferences
            preferences = new NotificationPreferences
            {
                UserId = userId,
                EmailNotifications = true,
                PushNotifications = true,
                AppointmentReminders = true,
                TaskReminders = true,
                ReminderTimeMinutes = 30
            };

            _context.NotificationPreferences.Add(preferences);
            await _context.SaveChangesAsync();
        }

        return new NotificationPreferencesDto
        {
            EmailNotifications = preferences.EmailNotifications,
            PushNotifications = preferences.PushNotifications,
            AppointmentReminders = preferences.AppointmentReminders,
            TaskReminders = preferences.TaskReminders,
            ReminderTimeMinutes = preferences.ReminderTimeMinutes
        };
    }

    public async Task<NotificationPreferencesDto> UpdateUserPreferencesAsync(int userId, NotificationPreferencesDto dto)
    {
        var preferences = await _context.NotificationPreferences
            .FirstOrDefaultAsync(n => n.UserId == userId);

        if (preferences == null)
        {
            preferences = new NotificationPreferences { UserId = userId };
            _context.NotificationPreferences.Add(preferences);
        }

        preferences.EmailNotifications = dto.EmailNotifications;
        preferences.PushNotifications = dto.PushNotifications;
        preferences.AppointmentReminders = dto.AppointmentReminders;
        preferences.TaskReminders = dto.TaskReminders;
        preferences.ReminderTimeMinutes = dto.ReminderTimeMinutes;
        preferences.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return dto;
    }

    public async Task SendAppointmentRemindersAsync()
    {
        var now = DateTime.UtcNow;

        // Get all users with their notification preferences
        var usersWithPreferences = await _context.NotificationPreferences
            .Where(n => n.EmailNotifications && n.AppointmentReminders)
            .Include(n => n.User)
            .AsNoTracking()
            .ToListAsync();

        foreach (var pref in usersWithPreferences)
        {
            var reminderTime = now.AddMinutes(pref.ReminderTimeMinutes);
            var startWindow = reminderTime.AddMinutes(-5);
            var endWindow = reminderTime.AddMinutes(5);

            // Get upcoming appointments within the reminder window
            var appointments = await _context.Appointments
                .Where(a => a.UserId == pref.UserId &&
                           a.Status == "Scheduled" &&
                           a.StartDateTime >= startWindow &&
                           a.StartDateTime <= endWindow)
                .AsNoTracking()
                .ToListAsync();

            foreach (var appointment in appointments)
            {
                try
                {
                    await _emailService.SendAppointmentReminderAsync(
                        pref.User.Email,
                        pref.User.Username,
                        appointment.Title,
                        appointment.StartDateTime
                    );

                    _logger.LogInformation(
                        "Sent appointment reminder to {Email} for appointment: {Title}",
                        pref.User.Email,
                        appointment.Title
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send appointment reminder to {Email}", pref.User.Email);
                }
            }
        }
    }

    public async Task SendTaskRemindersAsync()
    {
        var now = DateTime.UtcNow;

        // Get all users with their notification preferences
        var usersWithPreferences = await _context.NotificationPreferences
            .Where(n => n.EmailNotifications && n.TaskReminders)
            .Include(n => n.User)
            .AsNoTracking()
            .ToListAsync();

        foreach (var pref in usersWithPreferences)
        {
            var reminderTime = now.AddMinutes(pref.ReminderTimeMinutes);
            var startWindow = reminderTime.AddMinutes(-5);
            var endWindow = reminderTime.AddMinutes(5);

            // Get upcoming tasks within the reminder window
            var tasks = await _context.Tasks
                .Where(t => t.UserId == pref.UserId &&
                           !t.IsCompleted &&
                           t.DueDate.HasValue &&
                           t.DueDate.Value >= startWindow &&
                           t.DueDate.Value <= endWindow)
                .AsNoTracking()
                .ToListAsync();

            foreach (var task in tasks)
            {
                try
                {
                    await _emailService.SendTaskReminderAsync(
                        pref.User.Email,
                        pref.User.Username,
                        task.Title,
                        task.DueDate
                    );

                    _logger.LogInformation(
                        "Sent task reminder to {Email} for task: {Title}",
                        pref.User.Email,
                        task.Title
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send task reminder to {Email}", pref.User.Email);
                }
            }
        }
    }

    public async Task SavePushSubscriptionAsync(int userId, string subscription)
    {
        var preferences = await _context.NotificationPreferences
            .FirstOrDefaultAsync(n => n.UserId == userId);

        if (preferences == null)
        {
            preferences = new NotificationPreferences
            {
                UserId = userId,
                PushSubscription = subscription
            };
            _context.NotificationPreferences.Add(preferences);
        }
        else
        {
            preferences.PushSubscription = subscription;
            preferences.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }
}
