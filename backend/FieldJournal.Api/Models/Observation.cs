namespace FieldJournal.Api.Models;

public class Observation
{
    public int Id { get; set; }
    public string Species { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public DateTime ObservedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
