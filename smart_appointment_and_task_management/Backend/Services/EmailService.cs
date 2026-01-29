using Backend.Services.Interfaces;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace Backend.Services;

/// <summary>
/// Email service for sending notifications
/// Supports both SMTP (production) and console logging (development)
/// Configure via EmailSettings in appsettings.json
/// </summary>
public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;
    private readonly bool _emailEnabled;

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        _emailEnabled = _configuration.GetValue<bool>("EmailSettings:EnableEmailSending");
    }

    public async Task SendAppointmentReminderAsync(string toEmail, string userName, string appointmentTitle, DateTime startDateTime)
    {
        var subject = "Appointment Reminder";
        var body = $@"
            <h2>Hi {userName},</h2>
            <p>This is a reminder for your upcoming appointment:</p>
            <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                <h3 style='margin: 0 0 10px 0;'>{appointmentTitle}</h3>
                <p style='margin: 5px 0;'><strong>Date & Time:</strong> {startDateTime:MMMM dd, yyyy 'at' h:mm tt}</p>
            </div>
            <p>Please make sure to be on time!</p>
            <p>Best regards,<br/>Smart Management System</p>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendTaskReminderAsync(string toEmail, string userName, string taskTitle, DateTime? dueDate)
    {
        var subject = "Task Reminder";
        var dueDateText = dueDate.HasValue ? dueDate.Value.ToString("MMMM dd, yyyy 'at' h:mm tt") : "No due date";

        var body = $@"
            <h2>Hi {userName},</h2>
            <p>This is a reminder for your task:</p>
            <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                <h3 style='margin: 0 0 10px 0;'>{taskTitle}</h3>
                <p style='margin: 5px 0;'><strong>Due Date:</strong> {dueDateText}</p>
            </div>
            <p>Don't forget to complete this task!</p>
            <p>Best regards,<br/>Smart Management System</p>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        if (!_emailEnabled)
        {
            // Development mode: Log to console
            _logger.LogInformation("===== EMAIL SENT (Console Mode) =====");
            _logger.LogInformation("To: {ToEmail}", toEmail);
            _logger.LogInformation("Subject: {Subject}", subject);
            _logger.LogInformation("Body: {Body}", body);
            _logger.LogInformation("======================================");
            return;
        }

        try
        {
            // Production mode: Send actual email via SMTP
            var smtpHost = _configuration["EmailSettings:SmtpHost"];
            var smtpPort = _configuration.GetValue<int>("EmailSettings:SmtpPort");
            var enableSsl = _configuration.GetValue<bool>("EmailSettings:EnableSsl");
            var username = _configuration["EmailSettings:Username"];
            var password = _configuration["EmailSettings:Password"];
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var senderName = _configuration["EmailSettings:SenderName"];

            using var smtpClient = new SmtpClient
            {
                Host = smtpHost!,
                Port = smtpPort,
                EnableSsl = enableSsl,
                Credentials = new NetworkCredential(username, password)
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail!, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage);

            _logger.LogInformation("Email sent successfully to {ToEmail}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
            throw;
        }
    }
}
