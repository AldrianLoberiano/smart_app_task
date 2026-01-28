using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Tasks;

public class CreateTaskDto
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    [RegularExpression("^(Low|Medium|High)$", ErrorMessage = "Invalid priority")]
    public string Priority { get; set; } = "Medium";
}
