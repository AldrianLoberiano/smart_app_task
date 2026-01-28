using Backend.DTOs.Auth;

namespace Backend.Services.Interfaces;

/// <summary>
/// Service interface for authentication operations
/// </summary>
public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<UserProfileDto> GetUserProfileAsync(int userId);
}
