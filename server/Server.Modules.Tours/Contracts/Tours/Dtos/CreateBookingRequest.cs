namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record CreateBookingRequest(Guid TourScheduleId, int Seats);
