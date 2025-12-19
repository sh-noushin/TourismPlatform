using Microsoft.EntityFrameworkCore;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Domain.Tours.Repositories;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Tours.Infrastructure.Repositories;

public sealed class BookingRepository : BaseRepository<Booking>, IBookingRepository
{
    public BookingRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<int> GetBookedSeatsAsync(Guid tourScheduleId, CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Where(b => b.TourScheduleId == tourScheduleId)
            .SumAsync(b => b.Seats, cancellationToken);
    }
}
