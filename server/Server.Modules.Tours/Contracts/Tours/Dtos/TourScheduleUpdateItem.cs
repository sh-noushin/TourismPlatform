namespace Server.Modules.Tours.Contracts.Tours.Dtos;

/// <summary>
/// Represents a schedule item in an update request.
/// If Id is null, a new schedule will be created.
/// If Id is provided, the existing schedule will be updated.
/// </summary>
public sealed record TourScheduleUpdateItem(
    Guid? Id,
    DateTime StartAtUtc,
    DateTime EndAtUtc,
    int Capacity);
