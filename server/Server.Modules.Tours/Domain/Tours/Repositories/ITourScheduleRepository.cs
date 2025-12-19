using Server.SharedKernel.Repositories;

namespace Server.Modules.Tours.Domain.Tours.Repositories;

public interface ITourScheduleRepository : IBaseRepository<TourSchedule>
{
    Task<IReadOnlyCollection<TourSchedule>> GetByTourIdAsync(Guid tourId, CancellationToken cancellationToken = default);
    Task<TourSchedule?> GetForUpdateAsync(Guid scheduleId, CancellationToken cancellationToken = default);
    Task<TourSchedule?> GetDetailAsync(Guid scheduleId, CancellationToken cancellationToken = default);
}
