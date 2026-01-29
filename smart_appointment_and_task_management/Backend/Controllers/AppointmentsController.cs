using System.Security.Claims;
using Backend.DTOs.Appointments;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

/// <summary>
/// Appointments controller
/// Handles CRUD operations for appointments
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;
    private readonly ILogger<AppointmentsController> _logger;

    public AppointmentsController(
        IAppointmentService appointmentService,
        ILogger<AppointmentsController> logger)
    {
        _appointmentService = appointmentService;
        _logger = logger;
    }

    /// <summary>
    /// Get all appointments for current user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AppointmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserIdFromClaims();
        var appointments = await _appointmentService.GetAllByUserAsync(userId);
        return Ok(appointments);
    }

    /// <summary>
    /// Check for scheduling conflicts
    /// </summary>
    [HttpGet("conflicts")]
    [ProducesResponseType(typeof(IEnumerable<AppointmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckConflicts(
        [FromQuery] DateTime startDateTime,
        [FromQuery] DateTime endDateTime,
        [FromQuery] int? excludeId = null)
    {
        var userId = GetUserIdFromClaims();
        var conflicts = await _appointmentService.GetConflictingAppointmentsAsync(
            startDateTime,
            endDateTime,
            userId,
            excludeId);
        return Ok(conflicts);
    }

    /// <summary>
    /// Get appointments by date range
    /// </summary>
    [HttpGet("filter")]
    [ProducesResponseType(typeof(IEnumerable<AppointmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByDateRange(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var userId = GetUserIdFromClaims();

        var start = startDate ?? DateTime.UtcNow.Date;
        var end = endDate ?? DateTime.UtcNow.Date.AddDays(30);

        var appointments = await _appointmentService.GetByDateRangeAsync(start, end, userId);
        return Ok(appointments);
    }

    /// <summary>
    /// Get appointments by status
    /// </summary>
    [HttpGet("status/{status}")]
    [ProducesResponseType(typeof(IEnumerable<AppointmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByStatus(string status)
    {
        var userId = GetUserIdFromClaims();
        var appointments = await _appointmentService.GetByStatusAsync(status, userId);
        return Ok(appointments);
    }

    /// <summary>
    /// Get appointment by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AppointmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserIdFromClaims();
        var appointment = await _appointmentService.GetByIdAsync(id, userId);
        return Ok(appointment);
    }

    /// <summary>
    /// Create new appointment
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(AppointmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetUserIdFromClaims();
        var appointment = await _appointmentService.CreateAsync(createDto, userId);

        return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, appointment);
    }

    /// <summary>
    /// Update existing appointment
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AppointmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAppointmentDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetUserIdFromClaims();
        var appointment = await _appointmentService.UpdateAsync(id, updateDto, userId);

        return Ok(appointment);
    }

    /// <summary>
    /// Delete appointment
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserIdFromClaims();
        await _appointmentService.DeleteAsync(id, userId);

        return NoContent();
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
