namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record TourScheduleDto(Guid TourScheduleId, DateTime StartAtUtc, DateTime EndAtUtc, int Capacity);
