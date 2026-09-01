namespace FieldJournal.Api.DTOs;

public record CreateObservationRequest(
    string Species,
    string Location,
    string Notes,
    string? PhotoUrl,
    double? Latitude,
    double? Longitude,
    DateTime? ObservedAt);

public record UpdateObservationRequest(
    string Species,
    string Location,
    string Notes,
    string? PhotoUrl,
    double? Latitude,
    double? Longitude,
    DateTime? ObservedAt);

public record ObservationResponse(
    int Id,
    string Species,
    string Location,
    string Notes,
    string? PhotoUrl,
    double? Latitude,
    double? Longitude,
    DateTime ObservedAt,
    DateTime CreatedAt,
    int UserId,
    string Username);
