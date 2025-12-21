using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Tours.Domain.Tours;
using Server.SharedKernel.Repositories;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.SharedKernel;

public sealed class BaseRepositoryCoverageTests
{
    private sealed class TourCategoryRepo : BaseRepository<TourCategory>
    {
        public TourCategoryRepo(DbContext dbContext) : base(dbContext)
        {
        }
    }

    [Fact]
    public async Task BaseRepository_CoversCrudAndQueries()
    {
        await using var db = new TestDb();
        var repo = new TourCategoryRepo(db.Context);

        Assert.Empty(await repo.GetAllAsync());
        Assert.Equal(0, await repo.CountAsync());

        var id = Guid.NewGuid();
        await repo.CreateAsync(new TourCategory { Id = id, Name = "C" });
        await repo.SaveChangesAsync();

        Assert.Equal(1, await repo.CountAsync());

        var byId = await repo.GetByIdAsync(id);
        Assert.NotNull(byId);
        Assert.Equal("C", byId!.Name);

        var found = await repo.FindAsync(x => x.Name == "C");
        Assert.Single(found);

        // Query() returns tracked set - basic smoke that it composes.
        var q = repo.Query().Where(x => x.Id == id);
        Assert.Single(q);

        byId.Name = "C2";
        await repo.UpdateAsync(byId);
        await repo.SaveChangesAsync();

        Assert.Equal("C2", (await repo.GetByIdAsync(id))!.Name);

        await repo.DeleteAsync(byId);
        await repo.SaveChangesAsync();

        Assert.Null(await repo.GetByIdAsync(id));
        Assert.Equal(0, await repo.CountAsync());
    }
}
