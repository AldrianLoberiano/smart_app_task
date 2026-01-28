using Backend.DTOs.Appointments;

namespace Backend.Services.Interfaces;

/// <summary>
/// Service interface for appointment business logic
/// </summary>
public interface IAppointmentService
{
    Task<AppointmentDto> GetByIdAsync(int id, int userId);
    Task<IEnumerable<AppointmentDto>> GetAllByUserAsync(int userId);
    Task<IEnumerable<AppointmentDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int userId);
    Task<IEnumerable<AppointmentDto>> GetByStatusAsync(string status, int userId);
    Task<AppointmentDto> CreateAsync(CreateAppointmentDto createDto, int userId);
    Task<AppointmentDto> UpdateAsync(int id, UpdateAppointmentDto updateDto, int userId);
    Task DeleteAsync(int id, int userId);
    Task<IEnumerable<AppointmentDto>> GetAllAppointmentsForAdminAsync();
    Task<AppointmentDto> UpdateAppointmentStatusAsync(int id, string status);
}
