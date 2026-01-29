using Backend.Services.Interfaces;

namespace Backend.Services;

/// <summary>
/// Background service that sends reminders every 5 minutes
/// </summary>
public class ReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReminderBackgroundService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(5);

    public ReminderBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<ReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Reminder Background Service is starting");

        // Wait for 10 seconds before starting to avoid startup concurrency
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessReminders();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing reminders");
            }

            await Task.Delay(_interval, stoppingToken);
        }

        _logger.LogInformation("Reminder Background Service is stopping");
    }

    private async Task ProcessReminders()
    {
        using var scope = _serviceProvider.CreateScope();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        _logger.LogInformation("Processing reminders at {Time}", DateTime.UtcNow);

        // Process sequentially to avoid DbContext concurrency issues
        await notificationService.SendAppointmentRemindersAsync();
        await notificationService.SendTaskRemindersAsync();
    }
}
