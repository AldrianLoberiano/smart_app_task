using Backend.DTOs.Appointments;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

/// <summary>
/// Implementation of IAppointmentService
/// Handles appointment business logic and validation
/// </summary>
public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AppointmentService> _logger;

    public AppointmentService(
        IAppointmentRepository appointmentRepository,
        IUserRepository userRepository,
        ILogger<AppointmentService> logger)
    {
        _appointmentRepository = appointmentRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<AppointmentDto> GetByIdAsync(int id, int userId)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);

        if (appointment == null)
        {
            throw new KeyNotFoundException($"Appointment with ID {id} not found");
        }

        if (appointment.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to access this appointment");
        }

        return MapToDto(appointment);
    }

    public async Task<IEnumerable<AppointmentDto>> GetAllByUserAsync(int userId)
    {
        var appointments = await _appointmentRepository.GetByUserIdAsync(userId);
        return appointments.Select(MapToDto);
    }

    public async Task<IEnumerable<AppointmentDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int userId)
    {
        var appointments = await _appointmentRepository.GetByDateRangeAsync(startDate, endDate, userId);
        return appointments.Select(MapToDto);
    }

    public async Task<IEnumerable<AppointmentDto>> GetByStatusAsync(string status, int userId)
    {
        var appointments = await _appointmentRepository.GetByStatusAsync(status, userId);
        return appointments.Select(MapToDto);
    }

    public async Task<IEnumerable<AppointmentDto>> GetConflictingAppointmentsAsync(
        DateTime startDateTime,
        DateTime endDateTime,
        int userId,
        int? excludeId = null)
    {
        _logger.LogInformation(
            "Checking for conflicts for user {UserId} between {Start} and {End}",
            userId,
            startDateTime,
            endDateTime);

        var appointments = await _appointmentRepository.GetByUserIdAsync(userId);

        var conflicts = appointments.Where(a =>
        {
            // Exclude the appointment being edited
            if (excludeId.HasValue && a.Id == excludeId.Value)
                return false;

            // Skip cancelled appointments
            if (a.Status == "Cancelled")
                return false;

            // Check for overlap: appointment overlaps if it starts before the end time and ends after the start time
            return a.StartDateTime < endDateTime && a.EndDateTime > startDateTime;
        }).ToList();

        _logger.LogInformation("Found {ConflictCount} conflicting appointments", conflicts.Count);

        return conflicts.Select(MapToDto);
    }

    public async Task<AppointmentDto> CreateAsync(CreateAppointmentDto createDto, int userId)
    {
        _logger.LogInformation("Creating appointment for user {UserId}", userId);

        // Validate user exists
        if (!await _userRepository.ExistsAsync(userId))
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        // Validate dates
        if (createDto.EndDateTime <= createDto.StartDateTime)
        {
            throw new InvalidOperationException("End date must be after start date");
        }

        // Allow past dates for flexibility (user might want to record past appointments)
        // Removed: if (createDto.StartDateTime < DateTime.UtcNow)

        // Check for conflicts
        var hasConflict = await _appointmentRepository.HasConflictAsync(
            userId,
            createDto.StartDateTime,
            createDto.EndDateTime
        );

        if (hasConflict)
        {
            throw new InvalidOperationException("Appointment conflicts with existing appointment");
        }

        var appointment = new Appointment
        {
            Title = createDto.Title,
            Description = createDto.Description,
            StartDateTime = createDto.StartDateTime,
            EndDateTime = createDto.EndDateTime,
            Location = createDto.Location,
            Status = "Scheduled",
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdAppointment = await _appointmentRepository.CreateAsync(appointment);

        // Reload to get user data
        createdAppointment = await _appointmentRepository.GetByIdAsync(createdAppointment.Id);

        _logger.LogInformation("Appointment created successfully: {AppointmentId}", createdAppointment!.Id);

        return MapToDto(createdAppointment);
    }

    public async Task<AppointmentDto> UpdateAsync(int id, UpdateAppointmentDto updateDto, int userId)
    {
        _logger.LogInformation("Updating appointment {AppointmentId} for user {UserId}", id, userId);

        var appointment = await _appointmentRepository.GetByIdAsync(id);

        if (appointment == null)
        {
            throw new KeyNotFoundException($"Appointment with ID {id} not found");
        }

        if (appointment.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to update this appointment");
        }

        // Validate dates
        if (updateDto.EndDateTime <= updateDto.StartDateTime)
        {
            throw new InvalidOperationException("End date must be after start date");
        }

        // Check for conflicts (excluding current appointment)
        var hasConflict = await _appointmentRepository.HasConflictAsync(
            userId,
            updateDto.StartDateTime,
            updateDto.EndDateTime,
            id
        );

        if (hasConflict)
        {
            throw new InvalidOperationException("Appointment conflicts with existing appointment");
        }

        appointment.Title = updateDto.Title;
        appointment.Description = updateDto.Description;
        appointment.StartDateTime = updateDto.StartDateTime;
        appointment.EndDateTime = updateDto.EndDateTime;
        appointment.Location = updateDto.Location;
        appointment.Status = updateDto.Status;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _appointmentRepository.UpdateAsync(appointment);

        // Reload to get updated data
        appointment = await _appointmentRepository.GetByIdAsync(id);

        _logger.LogInformation("Appointment updated successfully: {AppointmentId}", id);

        return MapToDto(appointment!);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        _logger.LogInformation("Deleting appointment {AppointmentId} for user {UserId}", id, userId);

        var appointment = await _appointmentRepository.GetByIdAsync(id);

        if (appointment == null)
        {
            throw new KeyNotFoundException($"Appointment with ID {id} not found");
        }

        if (appointment.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have permission to delete this appointment");
        }

        await _appointmentRepository.DeleteAsync(id);

        _logger.LogInformation("Appointment deleted successfully: {AppointmentId}", id);
    }

    public async Task<IEnumerable<AppointmentDto>> GetAllAppointmentsForAdminAsync()
    {
        _logger.LogInformation("Admin fetching all appointments");
        var appointments = await _appointmentRepository.GetAllAsync();
        return appointments.Select(MapToDto);
    }

    public async Task<AppointmentDto> UpdateAppointmentStatusAsync(int id, string status)
    {
        _logger.LogInformation("Updating appointment {AppointmentId} status to {Status}", id, status);

        var appointment = await _appointmentRepository.GetByIdAsync(id);

        if (appointment == null)
        {
            throw new KeyNotFoundException($"Appointment with ID {id} not found");
        }

        appointment.Status = status;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _appointmentRepository.UpdateAsync(appointment);

        // Reload to get updated data
        appointment = await _appointmentRepository.GetByIdAsync(id);

        _logger.LogInformation("Appointment status updated successfully: {AppointmentId}", id);

        return MapToDto(appointment!);
    }

    private static AppointmentDto MapToDto(Appointment appointment)
    {
        return new AppointmentDto
        {
            Id = appointment.Id,
            Title = appointment.Title,
            Description = appointment.Description,
            StartDateTime = appointment.StartDateTime,
            EndDateTime = appointment.EndDateTime,
            Location = appointment.Location,
            Status = appointment.Status,
            UserId = appointment.UserId,
            Username = appointment.User.Username,
            CreatedAt = appointment.CreatedAt,
            UpdatedAt = appointment.UpdatedAt
        };
    }
}
