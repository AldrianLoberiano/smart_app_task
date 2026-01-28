using System.Security.Claims;
using Backend.DTOs.Auth;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

/// <summary>
/// Authentication controller
/// Handles user registration, login, and profile retrieval
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    
    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }
    
    /// <summary>
    /// Register a new user
    /// </summary>
    /// <param name="registerDto">Registration details</param>
    /// <returns>Authentication response with JWT token</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        var response = await _authService.RegisterAsync(registerDto);
        return CreatedAtAction(nameof(GetProfile), new { }, response);
    }
    
    /// <summary>
    /// Login user
    /// </summary>
    /// <param name="loginDto">Login credentials</param>
    /// <returns>Authentication response with JWT token</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        var response = await _authService.LoginAsync(loginDto);
        return Ok(response);
    }
    
    /// <summary>
    /// Get current user profile
    /// </summary>
    /// <returns>User profile information</returns>
    [HttpGet("profile")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserIdFromClaims();
        var profile = await _authService.GetUserProfileAsync(userId);
        return Ok(profile);
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
