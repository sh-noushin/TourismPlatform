namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record CreateTourScheduleRequest(DateTime StartAtUtc, DateTime EndAtUtc, int Capacity);
