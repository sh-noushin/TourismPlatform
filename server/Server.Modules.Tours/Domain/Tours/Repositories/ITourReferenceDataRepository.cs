using Server.SharedKernel.Paging;

namespace Server.Modules.Tours.Domain.Tours.Repositories;

public interface ITourReferenceDataRepository
{
    Task<TourCategory> GetOrCreateTourCategoryAsync(string name, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<TourCategory>> GetTourCategoriesAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyCollection<TourCategory> Items, int Total)> GetTourCategoriesPagedAsync(
        PageQuery query,
        CancellationToken cancellationToken = default);
    Task<TourCategory?> GetTourCategoryByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TourCategory?> GetTourCategoryByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<TourCategory> CreateTourCategoryAsync(string name, string? nameEn, CancellationToken cancellationToken = default);
    Task<TourCategory?> UpdateTourCategoryAsync(Guid id, string name, string? nameEn, CancellationToken cancellationToken = default);
    Task<bool> DeleteTourCategoryAsync(Guid id, CancellationToken cancellationToken = default);
}
