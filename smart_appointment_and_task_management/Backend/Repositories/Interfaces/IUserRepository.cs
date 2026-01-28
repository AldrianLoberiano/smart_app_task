using Backend.Models;

namespace Backend.Repositories.Interfaces;

/// <summary>
/// Repository interface for User entity operations
/// Defines contract for data access layer
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail);
    Task<IEnumerable<User>> GetAllAsync();
    Task<User> CreateAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> UsernameExistsAsync(string username);
    Task<bool> EmailExistsAsync(string email);
}
