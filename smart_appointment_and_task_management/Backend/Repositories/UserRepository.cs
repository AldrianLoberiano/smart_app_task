using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

/// <summary>
/// Implementation of IUserRepository
/// Handles all database operations for User entity
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;
    
    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.Appointments)
            .Include(u => u.Tasks)
            .FirstOrDefaultAsync(u => u.Id == id);
    }
    
    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username);
    }
    
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }
    
    public async Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Username == usernameOrEmail || u.Email == usernameOrEmail);
    }
    
    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users
            .Include(u => u.Appointments)
            .Include(u => u.Tasks)
            .ToListAsync();
    }
    
    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }
    
    public async Task UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }
    
    public async Task DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
    
    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Users.AnyAsync(u => u.Id == id);
    }
    
    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await _context.Users.AnyAsync(u => u.Username == username);
    }
    
    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email);
    }
}
