using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Services.Interfaces;
using Backend.DTOs.Appointments;
using Backend.DTOs.Tasks;

namespace Backend.Controllers;

/// <summary>
/// Admin controller for managing all appointments and tasks
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;
    private readonly ITaskService _taskService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        IAppointmentService appointmentService,
        ITaskService taskService,
        ILogger<AdminController> logger)
    {
        _appointmentService = appointmentService;
        _taskService = taskService;
        _logger = logger;
    }

    /// <summary>
    /// Get all appointments from all users
    /// </summary>
    [HttpGet("appointments")]
    public async Task<IActionResult> GetAllAppointments()
    {
        try
        {
            _logger.LogInformation("Admin fetching all appointments");
            var appointments = await _appointmentService.GetAllAppointmentsForAdminAsync();
            return Ok(appointments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all appointments for admin");
            return StatusCode(500, new { message = "An error occurred while fetching appointments" });
        }
    }

    /// <summary>
    /// Get all tasks from all users
    /// </summary>
    [HttpGet("tasks")]
    public async Task<IActionResult> GetAllTasks()
    {
        try
        {
            _logger.LogInformation("Admin fetching all tasks");
            var tasks = await _taskService.GetAllTasksForAdminAsync();
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all tasks for admin");
            return StatusCode(500, new { message = "An error occurred while fetching tasks" });
        }
    }

    /// <summary>
    /// Update appointment status (for approval/rejection)
    /// </summary>
    [HttpPatch("appointments/{id}/status")]
    public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        try
        {
            _logger.LogInformation("Admin updating appointment {Id} status to {Status}", id, dto.Status);
            var appointment = await _appointmentService.UpdateAppointmentStatusAsync(id, dto.Status);
            return Ok(appointment);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating appointment status");
            return StatusCode(500, new { message = "An error occurred while updating appointment status" });
        }
    }

    /// <summary>
    /// Update task status (for approval/rejection)
    /// </summary>
    [HttpPatch("tasks/{id}/status")]
    public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        try
        {
            _logger.LogInformation("Admin updating task {Id} status to {Status}", id, dto.Status);
            var task = await _taskService.UpdateTaskStatusAsync(id, dto.Status);
            return Ok(task);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task status");
            return StatusCode(500, new { message = "An error occurred while updating task status" });
        }
    }
}

public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
}
