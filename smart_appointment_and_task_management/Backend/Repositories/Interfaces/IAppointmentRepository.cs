using Backend.Models;

namespace Backend.Repositories.Interfaces;

/// <summary>
/// Repository interface for Appointment entity operations
/// </summary>
public interface IAppointmentRepository
{
    Task<Appointment?> GetByIdAsync(int id);
    Task<IEnumerable<Appointment>> GetAllAsync();
    Task<IEnumerable<Appointment>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Appointment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int userId);
    Task<IEnumerable<Appointment>> GetByStatusAsync(string status, int userId);
    Task<Appointment> CreateAsync(Appointment appointment);
    Task UpdateAsync(Appointment appointment);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> HasConflictAsync(int userId, DateTime startDateTime, DateTime endDateTime, int? excludeId = null);
}
