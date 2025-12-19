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
        var normalized = name.Trim();

        var existing = await _dbContext.Set<TourCategory>()
            .FirstOrDefaultAsync(x => x.Name == normalized, cancellationToken);

        if (existing != null) return existing;

        var created = new TourCategory { Id = Guid.NewGuid(), Name = normalized };
        _dbContext.Add(created);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return created;
    }
}
