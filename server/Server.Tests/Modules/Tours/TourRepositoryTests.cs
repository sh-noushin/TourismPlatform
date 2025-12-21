using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Infrastructure.Repositories;
using Server.Tests.Common;

namespace Server.Tests.Modules.Tours;

public sealed class TourRepositoryTests
{
    [Fact]
    public async Task GetListAsync_ReturnsOrderedWithCategoryIncluded()
    {
        await using var db = new TestDb();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "Cat" };
        var a = new Tour { Id = Guid.NewGuid(), Name = "A", TourCategoryId = category.Id, TourCategory = category, CreatedAtUtc = DateTime.UtcNow };
        var b = new Tour { Id = Guid.NewGuid(), Name = "B", TourCategoryId = category.Id, TourCategory = category, CreatedAtUtc = DateTime.UtcNow };

        db.Context.AddRange(category, b, a);
        await db.Context.SaveChangesAsync();

        var repo = new TourRepository(db.Context);
        var list = await repo.GetListAsync();

        Assert.Equal(new[] { "A", "B" }, list.Select(x => x.Name).ToArray());
        Assert.All(list, x => Assert.NotNull(x.TourCategory));
    }

    [Fact]
    public async Task GetDetailAsync_ReturnsNullWhenMissing()
    {
        await using var db = new TestDb();
        var repo = new TourRepository(db.Context);

        var tour = await repo.GetDetailAsync(Guid.NewGuid());
        Assert.Null(tour);
    }

    [Fact]
    public async Task GetForUpdateAsync_ReturnsTrackedEntityOrNull()
    {
        await using var db = new TestDb();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "Cat" };
        var tourId = Guid.NewGuid();
        db.Context.AddRange(category, new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, TourCategory = category, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var repo = new TourRepository(db.Context);

        var found = await repo.GetForUpdateAsync(tourId);
        Assert.NotNull(found);

        var missing = await repo.GetForUpdateAsync(Guid.NewGuid());
        Assert.Null(missing);
    }
}
