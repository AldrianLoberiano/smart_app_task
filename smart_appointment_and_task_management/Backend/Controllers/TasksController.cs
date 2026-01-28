using System.Security.Claims;
using Backend.DTOs.Tasks;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

/// <summary>
/// Tasks controller
/// Handles CRUD operations for tasks
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly ILogger<TasksController> _logger;
    
    public TasksController(ITaskService taskService, ILogger<TasksController> logger)
    {
        _taskService = taskService;
        _logger = logger;
    }
    
    /// <summary>
    /// Get all tasks for current user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserIdFromClaims();
        var tasks = await _taskService.GetAllByUserAsync(userId);
        return Ok(tasks);
    }
    
    /// <summary>
    /// Get task by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserIdFromClaims();
        var task = await _taskService.GetByIdAsync(id, userId);
        return Ok(task);
    }
    
    /// <summary>
    /// Get tasks by status
    /// </summary>
    [HttpGet("status/{status}")]
    [ProducesResponseType(typeof(IEnumerable<TaskDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByStatus(string status)
    {
        var userId = GetUserIdFromClaims();
        var tasks = await _taskService.GetByStatusAsync(status, userId);
        return Ok(tasks);
    }
    
    /// <summary>
    /// Get tasks by priority
    /// </summary>
    [HttpGet("priority/{priority}")]
    [ProducesResponseType(typeof(IEnumerable<TaskDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByPriority(string priority)
    {
        var userId = GetUserIdFromClaims();
        var tasks = await _taskService.GetByPriorityAsync(priority, userId);
        return Ok(tasks);
    }
    
    /// <summary>
    /// Get overdue tasks
    /// </summary>
    [HttpGet("overdue")]
    [ProducesResponseType(typeof(IEnumerable<TaskDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOverdue()
    {
        var userId = GetUserIdFromClaims();
        var tasks = await _taskService.GetOverdueTasksAsync(userId);
        return Ok(tasks);
    }
    
    /// <summary>
    /// Create new task
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        var userId = GetUserIdFromClaims();
        var task = await _taskService.CreateAsync(createDto, userId);
        
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }
    
    /// <summary>
    /// Update existing task
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        var userId = GetUserIdFromClaims();
        var task = await _taskService.UpdateAsync(id, updateDto, userId);
        
        return Ok(task);
    }
    
    /// <summary>
    /// Mark task as complete
    /// </summary>
    [HttpPatch("{id}/complete")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsComplete(int id)
    {
        var userId = GetUserIdFromClaims();
        var task = await _taskService.MarkAsCompleteAsync(id, userId);
        
        return Ok(task);
    }
    
    /// <summary>
    /// Delete task
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserIdFromClaims();
        await _taskService.DeleteAsync(id, userId);
        
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
