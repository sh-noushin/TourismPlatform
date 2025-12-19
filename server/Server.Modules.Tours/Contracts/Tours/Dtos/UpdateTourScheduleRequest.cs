namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record UpdateTourScheduleRequest(DateTime StartAtUtc, DateTime EndAtUtc, int Capacity);
