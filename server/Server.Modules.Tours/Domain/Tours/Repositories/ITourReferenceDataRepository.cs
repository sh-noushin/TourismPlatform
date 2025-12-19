namespace Server.Modules.Tours.Domain.Tours.Repositories;

public interface ITourReferenceDataRepository
{
    Task<TourCategory> GetOrCreateTourCategoryAsync(string name, CancellationToken cancellationToken = default);
}
