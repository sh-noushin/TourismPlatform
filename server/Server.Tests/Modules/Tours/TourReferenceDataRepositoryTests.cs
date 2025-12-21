using Microsoft.EntityFrameworkCore;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Infrastructure.Repositories;
using Server.Tests.Common;

namespace Server.Tests.Modules.Tours;

public sealed class TourReferenceDataRepositoryTests
{
    [Fact]
    public async Task GetOrCreateTourCategoryAsync_CreatesOnceAndReturnsExisting()
    {
        await using var db = new TestDb();

        var repo = new TourReferenceDataRepository(db.Context);

        var first = await repo.GetOrCreateTourCategoryAsync("  Adventure ");
        var second = await repo.GetOrCreateTourCategoryAsync("Adventure");

        Assert.Equal(first.Id, second.Id);

        var count = await db.Context.Set<TourCategory>().CountAsync();
        Assert.Equal(1, count);
    }
}
