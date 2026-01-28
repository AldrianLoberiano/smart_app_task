using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

/// <summary>
/// Implementation of IAppointmentRepository
/// Handles all database operations for Appointment entity
/// </summary>
public class AppointmentRepository : IAppointmentRepository
{
    private readonly ApplicationDbContext _context;
    
    public AppointmentRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<Appointment?> GetByIdAsync(int id)
    {
        return await _context.Appointments
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == id);
    }
    
    public async Task<IEnumerable<Appointment>> GetAllAsync()
    {
        return await _context.Appointments
            .Include(a => a.User)
            .OrderBy(a => a.StartDateTime)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<Appointment>> GetByUserIdAsync(int userId)
    {
        return await _context.Appointments
            .Include(a => a.User)
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.StartDateTime)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<Appointment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int userId)
    {
        return await _context.Appointments
            .Include(a => a.User)
            .Where(a => a.UserId == userId && 
                       a.StartDateTime >= startDate && 
                       a.EndDateTime <= endDate)
            .OrderBy(a => a.StartDateTime)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<Appointment>> GetByStatusAsync(string status, int userId)
    {
        return await _context.Appointments
            .Include(a => a.User)
            .Where(a => a.UserId == userId && a.Status == status)
            .OrderBy(a => a.StartDateTime)
            .ToListAsync();
    }
    
    public async Task<Appointment> CreateAsync(Appointment appointment)
    {
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }
    
    public async Task UpdateAsync(Appointment appointment)
    {
        appointment.UpdatedAt = DateTime.UtcNow;
        _context.Appointments.Update(appointment);
        await _context.SaveChangesAsync();
    }
    
    public async Task DeleteAsync(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment != null)
        {
            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
        }
    }
    
    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Appointments.AnyAsync(a => a.Id == id);
    }
    
    public async Task<bool> HasConflictAsync(int userId, DateTime startDateTime, DateTime endDateTime, int? excludeId = null)
    {
        var query = _context.Appointments
            .Where(a => a.UserId == userId && 
                       a.Status != "Cancelled" &&
                       ((a.StartDateTime < endDateTime && a.EndDateTime > startDateTime)));
        
        if (excludeId.HasValue)
        {
            query = query.Where(a => a.Id != excludeId.Value);
        }
        
        return await query.AnyAsync();
    }
}
