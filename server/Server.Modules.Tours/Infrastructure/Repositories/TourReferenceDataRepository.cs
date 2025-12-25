using Microsoft.EntityFrameworkCore;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Domain.Tours.Repositories;

namespace Server.Modules.Tours.Infrastructure.Repositories;

public sealed class TourReferenceDataRepository : ITourReferenceDataRepository
{
    private readonly DbContext _dbContext;

    public TourReferenceDataRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TourCategory> GetOrCreateTourCategoryAsync(string name, CancellationToken cancellationToken = default)
    {
        var normalized = Normalize(name);

        var existing = await _dbContext.Set<TourCategory>()
            .FirstOrDefaultAsync(x => x.Name == normalized, cancellationToken);

        if (existing != null) return existing;

        var created = new TourCategory { Id = Guid.NewGuid(), Name = normalized };
        _dbContext.Add(created);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return created;
    }

    public async Task<IReadOnlyCollection<TourCategory>> GetTourCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<TourCategory>()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<TourCategory?> GetTourCategoryByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<TourCategory>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<TourCategory?> GetTourCategoryByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        var normalized = Normalize(name);
        return await _dbContext.Set<TourCategory>()
            .FirstOrDefaultAsync(x => x.Name == normalized, cancellationToken);
    }

    public async Task<TourCategory> CreateTourCategoryAsync(string name, CancellationToken cancellationToken = default)
    {
        var normalized = Normalize(name);
        var existing = await GetTourCategoryByNameAsync(normalized, cancellationToken);
        if (existing != null)
        {
            throw new InvalidOperationException($"Tour category '{normalized}' already exists.");
        }

        var created = new TourCategory { Id = Guid.NewGuid(), Name = normalized };
        _dbContext.Add(created);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return created;
    }

    public async Task<TourCategory?> UpdateTourCategoryAsync(Guid id, string name, CancellationToken cancellationToken = default)
    {
        var normalized = Normalize(name);

        var category = await GetTourCategoryByIdAsync(id, cancellationToken);
        if (category == null)
        {
            return null;
        }

        var conflict = await _dbContext.Set<TourCategory>()
            .FirstOrDefaultAsync(x => x.Name == normalized && x.Id != id, cancellationToken);
        if (conflict != null)
        {
            throw new InvalidOperationException($"Tour category '{normalized}' already exists.");
        }

        category.Name = normalized;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return category;
    }

    public async Task<bool> DeleteTourCategoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await GetTourCategoryByIdAsync(id, cancellationToken);
        if (category == null)
        {
            return false;
        }

        _dbContext.Remove(category);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static string Normalize(string value) => value.Trim();
}
