using Backend.DTOs.Auth;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using BCrypt.Net;

namespace Backend.Services;

/// <summary>
/// Implementation of IAuthService
/// Handles user registration, login, and authentication logic
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<AuthService> _logger;
    
    public AuthService(
        IUserRepository userRepository, 
        JwtHelper jwtHelper,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _jwtHelper = jwtHelper;
        _logger = logger;
    }
    
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        _logger.LogInformation("Attempting to register user: {Username}", registerDto.Username);
        
        // Check if username already exists
        if (await _userRepository.UsernameExistsAsync(registerDto.Username))
        {
            throw new InvalidOperationException("Username already exists");
        }
        
        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(registerDto.Email))
        {
            throw new InvalidOperationException("Email already exists");
        }
        
        // Hash password using BCrypt
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
        
        // Create user entity
        var user = new User
        {
            Username = registerDto.Username,
            Email = registerDto.Email,
            PasswordHash = passwordHash,
            Role = string.IsNullOrWhiteSpace(registerDto.Role) ? "User" : registerDto.Role,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        // Save to database
        var createdUser = await _userRepository.CreateAsync(user);
        
        // Generate JWT token
        var token = _jwtHelper.GenerateToken(createdUser);
        var expiresAt = _jwtHelper.GetTokenExpiration();
        
        _logger.LogInformation("User registered successfully: {Username}", createdUser.Username);
        
        return new AuthResponseDto
        {
            Token = token,
            Username = createdUser.Username,
            Email = createdUser.Email,
            Role = createdUser.Role,
            ExpiresAt = expiresAt
        };
    }
    
    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        _logger.LogInformation("Attempting to login user: {UsernameOrEmail}", loginDto.UsernameOrEmail);
        
        // Find user by username or email
        var user = await _userRepository.GetByUsernameOrEmailAsync(loginDto.UsernameOrEmail);
        
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }
        
        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }
        
        // Generate JWT token
        var token = _jwtHelper.GenerateToken(user);
        var expiresAt = _jwtHelper.GetTokenExpiration();
        
        _logger.LogInformation("User logged in successfully: {Username}", user.Username);
        
        return new AuthResponseDto
        {
            Token = token,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            ExpiresAt = expiresAt
        };
    }
    
    public async Task<UserProfileDto> GetUserProfileAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }
        
        return new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }
}
