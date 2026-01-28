using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Appointments;

public class CreateAppointmentDto
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    [Required(ErrorMessage = "Start date and time is required")]
    public DateTime StartDateTime { get; set; }
    
    [Required(ErrorMessage = "End date and time is required")]
    public DateTime EndDateTime { get; set; }
    
    [MaxLength(200)]
    public string? Location { get; set; }
}
