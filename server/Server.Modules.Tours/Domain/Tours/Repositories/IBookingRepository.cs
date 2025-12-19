using Server.SharedKernel.Repositories;

namespace Server.Modules.Tours.Domain.Tours.Repositories;

public interface IBookingRepository : IBaseRepository<Booking>
{
    Task<int> GetBookedSeatsAsync(Guid tourScheduleId, CancellationToken cancellationToken = default);
}
