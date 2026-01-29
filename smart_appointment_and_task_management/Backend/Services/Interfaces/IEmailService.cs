namespace Backend.Services.Interfaces;

public interface IEmailService
{
    Task SendAppointmentReminderAsync(string toEmail, string userName, string appointmentTitle, DateTime startDateTime);
    Task SendTaskReminderAsync(string toEmail, string userName, string taskTitle, DateTime? dueDate);
    Task SendEmailAsync(string toEmail, string subject, string body);
}
