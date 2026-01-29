using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Auth;

public class UpdateProfileDto
{
    [Required(ErrorMessage = "Username is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
    public string? NewPassword { get; set; }

    [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
    public string? ConfirmPassword { get; set; }
}
