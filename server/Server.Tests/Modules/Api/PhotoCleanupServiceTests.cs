using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Server.Api.Services;
using PhotoEntity = Server.Modules.Media.Domain.Photos.Photo;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Tours.Domain.Tours;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.Api;

public sealed class PhotoCleanupServiceTests
{
    [Fact]
    public async Task CleanupOrphanedPhotosAsync_EmptyOrNull_ReturnsEmpty()
    {
        await using var db = new TestDb();
        var env = new FakeHostEnvironment { ContentRootPath = Path.GetTempPath() };
        var logger = new Mock<ILogger<PhotoCleanupService>>();

        var service = new PhotoCleanupService(db.Context, env, logger.Object);

        Assert.Empty(await service.CleanupOrphanedPhotosAsync(Array.Empty<Guid>()));
        Assert.Empty(await service.CleanupOrphanedPhotosAsync(null!));
    }

    [Fact]
    public async Task CleanupOrphanedPhotosAsync_SkipsLinkedPhotos()
    {
        await using var db = new TestDb();

        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };
            var logger = new Mock<ILogger<PhotoCleanupService>>();

            var photoId = Guid.NewGuid();
            db.Context.Add(new PhotoEntity { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/houses/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });

            var houseId = Guid.NewGuid();
            var location = new Location { Id = Guid.NewGuid(), Country = "X", City = "Y" };
            var address = new Address { Id = Guid.NewGuid(), LocationId = location.Id, Line1 = "L1" };
            var type = new HouseType { Id = Guid.NewGuid(), Name = "Apartment" };
            var house = new House { Id = houseId, Name = "H", HouseTypeId = type.Id, AddressId = address.Id, CreatedAtUtc = DateTime.UtcNow };
            db.Context.AddRange(location, address, type, house);

            db.Context.Add(new HousePhoto { HouseId = houseId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
            await db.Context.SaveChangesAsync();

            var service = new PhotoCleanupService(db.Context, env, logger.Object);

            var deleted = await service.CleanupOrphanedPhotosAsync(new[] { photoId, photoId });
            Assert.Empty(deleted);

            Assert.NotNull(await db.Context.Set<PhotoEntity>().FindAsync(photoId));
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public async Task CleanupOrphanedPhotosAsync_DeletesUnlinkedPhotoAndFile()
    {
        await using var db = new TestDb();

        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };
            var logger = new Mock<ILogger<PhotoCleanupService>>();

            var relative = "images/houses/photos/p.jpg";
            var absolute = Path.Combine(root, relative.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(absolute)!);
            await File.WriteAllBytesAsync(absolute, new byte[] { 1, 2, 3 });

            var photoId = Guid.NewGuid();
            db.Context.Add(new PhotoEntity { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = relative, ContentType = "image/jpeg", FileSize = 3, CreatedAtUtc = DateTime.UtcNow });
            await db.Context.SaveChangesAsync();

            var service = new PhotoCleanupService(db.Context, env, logger.Object);
            var deleted = await service.CleanupOrphanedPhotosAsync(new[] { photoId });

            Assert.Single(deleted);
            Assert.Equal(photoId, deleted.Single());

            Assert.Null(await db.Context.Set<PhotoEntity>().FindAsync(photoId));
            Assert.False(File.Exists(absolute));
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public async Task CleanupOrphanedPhotosAsync_WhenFileDeleteFails_StillDeletesDbRowAndLogs()
    {
        await using var db = new TestDb();

        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        FileStream? lockStream = null;

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };
            var logger = new Mock<ILogger<PhotoCleanupService>>();

            var relative = "images/tours/photos/locked.jpg";
            var absolute = Path.Combine(root, relative.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(absolute)!);
            await File.WriteAllBytesAsync(absolute, new byte[] { 1 });

            // Lock the file so File.Delete reliably throws on Windows.
            lockStream = new FileStream(absolute, FileMode.Open, FileAccess.Read, FileShare.None);

            var photoId = Guid.NewGuid();
            db.Context.Add(new PhotoEntity { Id = photoId, UuidFileName = "locked.jpg", PermanentRelativePath = relative, ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });
            await db.Context.SaveChangesAsync();

            var service = new PhotoCleanupService(db.Context, env, logger.Object);
            var deleted = await service.CleanupOrphanedPhotosAsync(new[] { photoId });

            Assert.Single(deleted);
            Assert.Null(await db.Context.Set<PhotoEntity>().FindAsync(photoId));
            Assert.True(File.Exists(absolute));

            logger.Verify(
                x => x.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.IsAny<It.IsAnyType>(),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.AtLeastOnce);
        }
        finally
        {
            lockStream?.Dispose();
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public async Task CleanupOrphanedPhotosAsync_WhenPhotoIdNotInDb_ReturnsEmpty()
    {
        await using var db = new TestDb();
        var env = new FakeHostEnvironment { ContentRootPath = Path.GetTempPath() };
        var logger = new Mock<ILogger<PhotoCleanupService>>();

        var service = new PhotoCleanupService(db.Context, env, logger.Object);

        var deleted = await service.CleanupOrphanedPhotosAsync(new[] { Guid.NewGuid() });
        Assert.Empty(deleted);
    }

    [Fact]
    public async Task CleanupOrphanedPhotosAsync_WhenPermanentPathBlank_SkipsFileDelete()
    {
        await using var db = new TestDb();
        var env = new FakeHostEnvironment { ContentRootPath = Path.GetTempPath() };
        var logger = new Mock<ILogger<PhotoCleanupService>>();

        var photoId = Guid.NewGuid();
        db.Context.Add(new PhotoEntity { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = " ", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var service = new PhotoCleanupService(db.Context, env, logger.Object);

        var deleted = await service.CleanupOrphanedPhotosAsync(new[] { photoId });
        Assert.Single(deleted);
        Assert.Null(await db.Context.Set<PhotoEntity>().FindAsync(photoId));
    }

    [Fact]
    public async Task CleanupOrphanedPhotosAsync_WhenFileMissing_SkipsFileDelete()
    {
        await using var db = new TestDb();
        var env = new FakeHostEnvironment { ContentRootPath = Path.GetTempPath() };
        var logger = new Mock<ILogger<PhotoCleanupService>>();

        var photoId = Guid.NewGuid();
        db.Context.Add(new PhotoEntity { Id = photoId, UuidFileName = "missing.jpg", PermanentRelativePath = "images/houses/photos/missing.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var service = new PhotoCleanupService(db.Context, env, logger.Object);

        var deleted = await service.CleanupOrphanedPhotosAsync(new[] { photoId });
        Assert.Single(deleted);
        Assert.Null(await db.Context.Set<PhotoEntity>().FindAsync(photoId));
    }

    [Fact]
    public async Task CleanupOrphanedPhotosAsync_SkipsTourLinkedPhotos()
    {
        await using var db = new TestDb();
        var env = new FakeHostEnvironment { ContentRootPath = Path.GetTempPath() };
        var logger = new Mock<ILogger<PhotoCleanupService>>();

        var photoId = Guid.NewGuid();
        db.Context.Add(new PhotoEntity { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/tours/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });

        var tourId = Guid.NewGuid();
        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tour = new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow };
        db.Context.AddRange(category, tour);

        db.Context.Add(new TourPhoto { TourId = tourId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var service = new PhotoCleanupService(db.Context, env, logger.Object);

        var deleted = await service.CleanupOrphanedPhotosAsync(new[] { photoId });
        Assert.Empty(deleted);
    }
}
