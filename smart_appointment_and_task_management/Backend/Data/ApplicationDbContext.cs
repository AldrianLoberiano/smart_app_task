using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

/// <summary>
/// Database context for the Smart Appointment & Task Management System
/// Configures entity relationships and database schema
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<TaskItem> Tasks { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            
            entity.Property(e => e.Username)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.PasswordHash)
                .IsRequired();
            
            entity.Property(e => e.Role)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("User");
            
            // Configure one-to-many relationship with Appointments
            entity.HasMany(e => e.Appointments)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Configure one-to-many relationship with Tasks
            entity.HasMany(e => e.Tasks)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        // Configure Appointment entity
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.Description)
                .HasMaxLength(1000);
            
            entity.Property(e => e.Location)
                .HasMaxLength(200);
            
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Scheduled");
            
            entity.HasIndex(e => e.StartDateTime);
            entity.HasIndex(e => e.Status);
        });
        
        // Configure TaskItem entity
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.Description)
                .HasMaxLength(1000);
            
            entity.Property(e => e.Priority)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Medium");
            
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => e.Priority);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.IsCompleted);
        });
    }
}
