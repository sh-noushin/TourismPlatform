using Moq;
using Server.Modules.Media.Application.Services;
using Server.Modules.Media.Contracts.Uploads.Dtos;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Media.Domain.Uploads;
using Server.Modules.Properties.Contracts.Houses.Dtos;
using Server.Modules.Properties.Contracts.Houses.Services;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Infrastructure.Repositories;
using Server.SharedKernel.Media;
using Server.Tests.Common;

namespace Server.Tests.Modules.Properties;

public sealed class HouseServiceCoverageTests
{
    private static AddressRequest Address() => new(
        Line1: "  123 Main ",
        Line2: null,
        City: "  Toronto ",
        Region: " ON ",
        Country: " ca ",
        PostalCode: " 123 ");

    [Fact]
    public async Task GetListAsync_ReturnsEmpty_WhenNoHouses()
    {
        await using var db = new TestDb();

        var service = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        var list = await service.GetListAsync();
        Assert.Empty(list);
    }

    [Fact]
    public async Task GetDetailAsync_ReturnsNull_WhenMissing()
    {
        await using var db = new TestDb();

        var service = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        Assert.Null(await service.GetDetailAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task GetListAndDetailAsync_ReturnsPhotos_WhenLinked()
    {
        await using var db = new TestDb();

        var service = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        var houseId = await service.CreateAsync(
            new CreateHouseRequest("H", "d", "T", Address(), Photos: null),
            currentUserId: null);

        var photoId = Guid.NewGuid();
        db.Context.Add(new Photo { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/houses/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });
        db.Context.Add(new HousePhoto { HouseId = houseId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var list = await service.GetListAsync();
        Assert.Single(list);
        Assert.Equal(houseId, list.Single().HouseId);
        Assert.Single(list.Single().Photos);

        var detail = await service.GetDetailAsync(houseId);
        Assert.NotNull(detail);
        Assert.Single(detail!.Photos);
        Assert.Equal("H", detail.Name);
    }

    [Fact]
    public async Task CreateAndUpdate_CoversReferenceData_AndPhotoLinkingBranches()
    {
        await using var db = new TestDb();

        var photoId = Guid.NewGuid();

        var photoCommit = new Mock<IPhotoCommitService>(MockBehavior.Strict);
        photoCommit
            .Setup(s => s.CommitAsync(It.IsAny<IReadOnlyCollection<CommitPhotoItem>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IReadOnlyCollection<CommitPhotoItem> items, CancellationToken _) =>
            {
                // Ensure the Photo row exists so the FK to HousePhoto succeeds.
                if (db.Context.Set<Photo>().Find(photoId) == null)
                {
                    db.Context.Add(new Photo
                    {
                        Id = photoId,
                        UuidFileName = "p.jpg",
                        PermanentRelativePath = "images/houses/photos/p.jpg",
                        ContentType = "image/jpeg",
                        FileSize = 1,
                        CreatedAtUtc = DateTime.UtcNow
                    });
                    db.Context.SaveChanges();
                }

                var only = items.Single();
                Assert.Equal(StagedUploadTargetType.House, only.TargetType);

                return new[]
                {
                    new PhotoCommitResult(photoId, only.Label, only.SortOrder, "images/houses/photos/p.jpg", only.TargetType)
                };
            });

        var cleanup = new Mock<IPhotoCleanupService>(MockBehavior.Loose);

        var service = new HouseService(
            db.Context,
            photoCommit.Object,
            cleanup.Object,
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        // Create with no photos -> exercises early return in CommitAndLinkPhotosAsync
        var houseId = await service.CreateAsync(
            new CreateHouseRequest(
                Name: "  My House ",
                Description: "d",
                HouseTypeName: "  Villa ",
                Address: Address(),
                Photos: null),
            currentUserId: Guid.NewGuid());

        var before = await db.Context.Set<House>().FindAsync(houseId);
        Assert.NotNull(before);
        Assert.Equal("My House", before!.Name);

        // Update with photos -> creates link
        var stagedUploadId = Guid.NewGuid();
        Assert.True(await service.UpdateAsync(
            houseId,
            new UpdateHouseRequest(
                Name: "  My House 2 ",
                Description: "d2",
                HouseTypeName: "Villa",
                Address: Address(),
                Photos: new[] { new HouseCommitPhotoItem(stagedUploadId, "L", 1) },
                DeletedPhotoIds: null),
            currentUserId: null));

        Assert.True(db.Context.Set<HousePhoto>().Any(x => x.HouseId == houseId && x.PhotoId == photoId));

        // Update again with the same committed photo -> link exists, so it should be skipped
        Assert.True(await service.UpdateAsync(
            houseId,
            new UpdateHouseRequest(
                Name: "My House 3",
                Description: "d3",
                HouseTypeName: "Villa",
                Address: Address(),
                Photos: new[] { new HouseCommitPhotoItem(Guid.NewGuid(), "L", 1) },
                DeletedPhotoIds: null),
            currentUserId: null));

        var links = db.Context.Set<HousePhoto>().Where(x => x.HouseId == houseId && x.PhotoId == photoId).ToList();
        Assert.Single(links);

        photoCommit.VerifyAll();
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFalse_WhenHouseMissing()
    {
        await using var db = new TestDb();

        var service = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        var ok = await service.UpdateAsync(
            Guid.NewGuid(),
            new UpdateHouseRequest("N", "d", "T", Address(), Photos: null, DeletedPhotoIds: null),
            currentUserId: null);

        Assert.False(ok);
    }

    [Fact]
    public async Task UpdateAsync_RemovesDeletedPhotos_AndCleansUpFiles()
    {
        await using var db = new TestDb();

        var serviceForCreate = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        var houseId = await serviceForCreate.CreateAsync(new CreateHouseRequest("H", "d", "T", Address(), Photos: null), currentUserId: null);

        var photoId = Guid.NewGuid();
        db.Context.Add(new Photo { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/houses/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });
        db.Context.Add(new HousePhoto { HouseId = houseId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var cleanup = new Mock<IPhotoCleanupService>(MockBehavior.Strict);
        cleanup
            .Setup(s => s.CleanupOrphanedPhotosAsync(It.Is<IReadOnlyCollection<Guid>>(ids => ids.Count == 1 && ids.Contains(photoId)), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Guid>());

        var service = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            cleanup.Object,
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        Assert.True(await service.UpdateAsync(
            houseId,
            new UpdateHouseRequest(
                Name: "H",
                Description: "d",
                HouseTypeName: "T",
                Address: Address(),
                Photos: null,
                DeletedPhotoIds: new[] { photoId }),
            currentUserId: null));

        Assert.False(db.Context.Set<HousePhoto>().Any(x => x.HouseId == houseId && x.PhotoId == photoId));
        cleanup.VerifyAll();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenHouseMissing()
    {
        await using var db = new TestDb();

        var cleanup = new Mock<IPhotoCleanupService>(MockBehavior.Strict);

        var service = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            cleanup.Object,
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        Assert.False(await service.DeleteAsync(Guid.NewGuid()));
        cleanup.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task DeleteAsync_DeletesHouse_AndCleansUpPhotos()
    {
        await using var db = new TestDb();

        // Create a house with a linked photo using the real reference-data repo.
        var serviceForCreate = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        var houseId = await serviceForCreate.CreateAsync(
            new CreateHouseRequest("H", "d", "T", Address(), Photos: null),
            currentUserId: null);

        var photoId = Guid.NewGuid();
        db.Context.Add(new Photo { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/houses/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });
        db.Context.Add(new HousePhoto { HouseId = houseId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var cleanup = new Mock<IPhotoCleanupService>(MockBehavior.Strict);
        cleanup
            .Setup(s => s.CleanupOrphanedPhotosAsync(It.Is<IReadOnlyCollection<Guid>>(ids => ids.Count == 1 && ids.Contains(photoId)), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Guid>());

        var service = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            cleanup.Object,
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        Assert.True(await service.DeleteAsync(houseId));
        Assert.Null(await db.Context.Set<House>().FindAsync(houseId));

        cleanup.VerifyAll();
    }

    [Fact]
    public async Task UnlinkPhotoAsync_ReturnsFalse_WhenHouseMissingOrLinkMissing()
    {
        await using var db = new TestDb();

        var cleanup = new Mock<IPhotoCleanupService>(MockBehavior.Strict);

        var service = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            cleanup.Object,
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        Assert.False(await service.UnlinkPhotoAsync(Guid.NewGuid(), Guid.NewGuid()));

        var houseId = await service.CreateAsync(new CreateHouseRequest("H", null, "T", Address(), Photos: null), currentUserId: null);
        Assert.False(await service.UnlinkPhotoAsync(houseId, Guid.NewGuid()));

        cleanup.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task UnlinkPhotoAsync_RemovesLink_AndCleansUpPhoto()
    {
        await using var db = new TestDb();

        var serviceForCreate = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        var houseId = await serviceForCreate.CreateAsync(new CreateHouseRequest("H", null, "T", Address(), Photos: null), currentUserId: null);

        var photoId = Guid.NewGuid();
        db.Context.Add(new Photo { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/houses/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });
        db.Context.Add(new HousePhoto { HouseId = houseId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var cleanup = new Mock<IPhotoCleanupService>(MockBehavior.Strict);
        cleanup
            .Setup(s => s.CleanupOrphanedPhotosAsync(It.Is<IReadOnlyCollection<Guid>>(ids => ids.Count == 1 && ids.Contains(photoId)), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Guid>());

        var service = new HouseService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            cleanup.Object,
            new HouseRepository(db.Context),
            new HouseReferenceDataRepository(db.Context),
            new HousePhotoRepository(db.Context));

        Assert.True(await service.UnlinkPhotoAsync(houseId, photoId));
        Assert.False(db.Context.Set<HousePhoto>().Any(x => x.HouseId == houseId && x.PhotoId == photoId));

        cleanup.VerifyAll();
    }
}
