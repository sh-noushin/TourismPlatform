using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Properties.Contracts.Houses.Dtos;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Infrastructure.Repositories;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.Properties;

public sealed class HouseReferenceDataRepositoryTests
{
    [Fact]
    public async Task GetOrCreateHouseTypeAsync_CreatesOnce()
    {
        await using var db = new TestDb();

        var repo = new HouseReferenceDataRepository(db.Context);

        var first = await repo.GetOrCreateHouseTypeAsync("  Villa ");
        var second = await repo.GetOrCreateHouseTypeAsync("Villa");

        Assert.Equal(first.Id, second.Id);
        Assert.Equal(1, await db.Context.Set<HouseType>().CountAsync());
    }

    [Fact]
    public async Task GetOrCreateLocationAndAddress_CreatesOnce_WithNormalization()
    {
        await using var db = new TestDb();

        var repo = new HouseReferenceDataRepository(db.Context);

        var addrReq = new AddressRequest(
            Line1: "  Line1  ",
            Line2: " ",
            City: " Tehran ",
            Region: " ",
            Country: " ir ",
            PostalCode: " ");

        var location1 = await repo.GetOrCreateLocationAsync(addrReq);
        var location2 = await repo.GetOrCreateLocationAsync(addrReq);
        Assert.Equal(location1.Id, location2.Id);

        var address1 = await repo.GetOrCreateAddressAsync(location1.Id, addrReq);
        var address2 = await repo.GetOrCreateAddressAsync(location1.Id, addrReq);
        Assert.Equal(address1.Id, address2.Id);

        Assert.Equal(1, await db.Context.Set<Location>().CountAsync());
        Assert.Equal(1, await db.Context.Set<Address>().CountAsync());
    }
}
