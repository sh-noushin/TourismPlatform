using Server.Modules.Tours.Application.Services;
using Server.Modules.Tours.Contracts.Tours.Dtos;
using Server.Modules.Tours.Domain.Tours.Repositories;
using Server.SharedKernel.Paging;

namespace Server.Modules.Tours.Contracts.Tours.Services;

public sealed class TourCategoryService : ITourCategoryService
{
    private readonly ITourReferenceDataRepository _referenceDataRepository;

    public TourCategoryService(ITourReferenceDataRepository referenceDataRepository)
    {
        _referenceDataRepository = referenceDataRepository;
    }

    public async Task<IReadOnlyCollection<TourCategoryDto>> GetTourCategoriesAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _referenceDataRepository.GetTourCategoriesAsync(cancellationToken);
        return categories
            .Select(c => new TourCategoryDto(c.Id, c.Name, c.NameEn))
            .ToList();
    }

    public async Task<PagedResult<TourCategoryDto>> GetTourCategoriesPagedAsync(
        PageQuery query,
        CancellationToken cancellationToken = default)
    {
        query = query.Normalized();

        var (items, total) = await _referenceDataRepository.GetTourCategoriesPagedAsync(query, cancellationToken);

        return new PagedResult<TourCategoryDto>(
            items.Select(c => new TourCategoryDto(c.Id, c.Name, c.NameEn)).ToList(),
            total,
            query.Page,
            query.PageSize);
    }

    public async Task<TourCategoryDto?> GetTourCategoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _referenceDataRepository.GetTourCategoryByIdAsync(id, cancellationToken);
        if (category == null) return null;

        return new TourCategoryDto(category.Id, category.Name, category.NameEn);
    }

    public async Task<TourCategoryDto> CreateTourCategoryAsync(CreateTourCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var created = await _referenceDataRepository.CreateTourCategoryAsync(request.Name, request.NameEn, cancellationToken);
        return new TourCategoryDto(created.Id, created.Name, created.NameEn);
    }

    public async Task UpdateTourCategoryAsync(Guid id, UpdateTourCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var updated = await _referenceDataRepository.UpdateTourCategoryAsync(id, request.Name, request.NameEn, cancellationToken);
        if (updated == null)
        {
            throw new KeyNotFoundException($"Tour category '{id}' not found.");
        }
    }

    public async Task DeleteTourCategoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var deleted = await _referenceDataRepository.DeleteTourCategoryAsync(id, cancellationToken);
        if (!deleted)
        {
            throw new KeyNotFoundException($"Tour category '{id}' not found.");
        }
    }
}
