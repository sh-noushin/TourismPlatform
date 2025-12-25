using Server.Modules.Tours.Contracts.Tours.Dtos;

namespace Server.Modules.Tours.Application.Services;

public interface ITourCategoryService
{
    Task<IReadOnlyCollection<TourCategoryDto>> GetTourCategoriesAsync(CancellationToken cancellationToken = default);
    Task<TourCategoryDto?> GetTourCategoryAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TourCategoryDto> CreateTourCategoryAsync(CreateTourCategoryRequest request, CancellationToken cancellationToken = default);
    Task UpdateTourCategoryAsync(Guid id, UpdateTourCategoryRequest request, CancellationToken cancellationToken = default);
    Task DeleteTourCategoryAsync(Guid id, CancellationToken cancellationToken = default);
}
