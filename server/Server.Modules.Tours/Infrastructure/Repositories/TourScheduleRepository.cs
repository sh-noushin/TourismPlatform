using Microsoft.EntityFrameworkCore;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Domain.Tours.Repositories;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Tours.Infrastructure.Repositories;

public sealed class TourScheduleRepository : BaseRepository<TourSchedule>, ITourScheduleRepository
{
    public TourScheduleRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<IReadOnlyCollection<TourSchedule>> GetByTourIdAsync(Guid tourId, CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Where(s => s.TourId == tourId)
            .OrderBy(s => s.StartAtUtc)
            .ToListAsync(cancellationToken);
    }

    public Task<TourSchedule?> GetForUpdateAsync(Guid scheduleId, CancellationToken cancellationToken = default)
        => Set.FirstOrDefaultAsync(s => s.Id == scheduleId, cancellationToken);

    public async Task<TourSchedule?> GetDetailAsync(Guid scheduleId, CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == scheduleId, cancellationToken);
    }
}
