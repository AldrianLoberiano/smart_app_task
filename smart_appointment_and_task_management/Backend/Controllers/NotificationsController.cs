using System.Security.Claims;
using Backend.DTOs.Notifications;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(
        INotificationService notificationService,
        ILogger<NotificationsController> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences()
    {
        var userId = GetUserIdFromClaims();
        var preferences = await _notificationService.GetUserPreferencesAsync(userId);
        return Ok(preferences);
    }

    [HttpPut("preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] NotificationPreferencesDto preferences)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetUserIdFromClaims();
        var updated = await _notificationService.UpdateUserPreferencesAsync(userId, preferences);
        return Ok(updated);
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] PushSubscriptionDto subscription)
    {
        var userId = GetUserIdFromClaims();
        await _notificationService.SavePushSubscriptionAsync(userId, subscription.Subscription);
        return Ok(new { message = "Push subscription saved successfully" });
    }

    private int GetUserIdFromClaims()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException("Invalid user token");
        }

        return userId;
    }
}

public class PushSubscriptionDto
{
    public string Subscription { get; set; } = string.Empty;
}
