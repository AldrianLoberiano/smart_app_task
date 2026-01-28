using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Models;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Helpers;

/// <summary>
/// Helper class for JWT token generation and validation
/// Handles authentication token creation with user claims
/// </summary>
public class JwtHelper
{
    private readonly IConfiguration _configuration;
    
    public JwtHelper(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    /// <summary>
    /// Generates a JWT token for authenticated user
    /// </summary>
    /// <param name="user">User entity</param>
    /// <returns>JWT token string</returns>
    public string GenerateToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expirationHours = int.Parse(jwtSettings["ExpirationInHours"] ?? "1");
        
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        
        // Create claims
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        
        // Create token
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    /// <summary>
    /// Gets token expiration time
    /// </summary>
    public DateTime GetTokenExpiration()
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var expirationHours = int.Parse(jwtSettings["ExpirationInHours"] ?? "1");
        return DateTime.UtcNow.AddHours(expirationHours);
    }
}
