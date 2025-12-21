using Server.Modules.Media.Contracts.Uploads.Dtos;
using Server.Modules.Media.Contracts.Uploads.Services;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Media.Domain.Uploads;
using Server.Tests.Common;
using System.Reflection;

namespace Server.Tests.Modules.Media;

public sealed class PhotoCommitServiceCoverageTests
{
    [Fact]
    public async Task CommitAsync_EmptyItems_ReturnsEmpty()
    {
        await using var db = new TestDb();

        var env = new FakeHostEnvironment { ContentRootPath = Path.GetTempPath() };
        var service = new PhotoCommitService(db.Context, env);

        var result = await service.CommitAsync(Array.Empty<CommitPhotoItem>());
        Assert.Empty(result);
    }

    [Fact]
    public async Task CommitAsync_ThrowsOnTargetTypeMismatch()
    {
        await using var db = new TestDb();

        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };

            var stagedId = Guid.NewGuid();
            var uuidFileName = $"{Guid.NewGuid():N}.jpg";
            var tempRelativePath = Path.Join("images", "houses", "Temp", uuidFileName).Replace(Path.DirectorySeparatorChar, '/');

            db.Context.Add(new StagedUpload
            {
                Id = stagedId,
                TargetType = StagedUploadTargetType.House,
                TempRelativePath = tempRelativePath,
                UuidFileName = uuidFileName,
                Extension = ".jpg",
                ContentType = "image/jpeg",
                FileSize = 1,
                CreatedAtUtc = DateTime.UtcNow,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
                UploadedByUserId = Guid.NewGuid(),
                OriginalFileName = "a.jpg"
            });
            await db.Context.SaveChangesAsync();

            var absoluteTempPath = Path.Combine(root, tempRelativePath.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(absoluteTempPath)!);
            await File.WriteAllBytesAsync(absoluteTempPath, new byte[] { 1 });

            var service = new PhotoCommitService(db.Context, env);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CommitAsync(new[] { new CommitPhotoItem(stagedId, "L", 0, StagedUploadTargetType.Tour) }));
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public async Task CommitAsync_ThrowsOnExpiredStagedUpload()
    {
        await using var db = new TestDb();

        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };

            var stagedId = Guid.NewGuid();
            var uuidFileName = $"{Guid.NewGuid():N}.jpg";
            var tempRelativePath = Path.Join("images", "houses", "Temp", uuidFileName).Replace(Path.DirectorySeparatorChar, '/');

            db.Context.Add(new StagedUpload
            {
                Id = stagedId,
                TargetType = StagedUploadTargetType.House,
                TempRelativePath = tempRelativePath,
                UuidFileName = uuidFileName,
                Extension = ".jpg",
                ContentType = "image/jpeg",
                FileSize = 1,
                CreatedAtUtc = DateTime.UtcNow.AddHours(-10),
                ExpiresAtUtc = DateTime.UtcNow.AddMinutes(-1),
                UploadedByUserId = Guid.NewGuid(),
                OriginalFileName = "a.jpg"
            });
            await db.Context.SaveChangesAsync();

            var absoluteTempPath = Path.Combine(root, tempRelativePath.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(absoluteTempPath)!);
            await File.WriteAllBytesAsync(absoluteTempPath, new byte[] { 1 });

            var service = new PhotoCommitService(db.Context, env);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CommitAsync(new[] { new CommitPhotoItem(stagedId, "L", 0, StagedUploadTargetType.House) }));
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public async Task CommitAsync_ThrowsWhenTempFileMissing()
    {
        await using var db = new TestDb();

        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };

            var stagedId = Guid.NewGuid();
            var uuidFileName = $"{Guid.NewGuid():N}.jpg";
            var tempRelativePath = Path.Join("images", "houses", "Temp", uuidFileName).Replace(Path.DirectorySeparatorChar, '/');

            db.Context.Add(new StagedUpload
            {
                Id = stagedId,
                TargetType = StagedUploadTargetType.House,
                TempRelativePath = tempRelativePath,
                UuidFileName = uuidFileName,
                Extension = ".jpg",
                ContentType = "image/jpeg",
                FileSize = 1,
                CreatedAtUtc = DateTime.UtcNow,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
                UploadedByUserId = Guid.NewGuid(),
                OriginalFileName = "a.jpg"
            });
            await db.Context.SaveChangesAsync();

            var service = new PhotoCommitService(db.Context, env);

            await Assert.ThrowsAsync<FileNotFoundException>(() =>
                service.CommitAsync(new[] { new CommitPhotoItem(stagedId, "L", 0, StagedUploadTargetType.House) }));
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public async Task CommitAsync_MissingStagedUploads_Throws()
    {
        await using var db = new TestDb();

        var env = new FakeHostEnvironment { ContentRootPath = Path.GetTempPath() };

        var stagedId = Guid.NewGuid();
        db.Context.Add(new StagedUpload
        {
            Id = stagedId,
            TargetType = StagedUploadTargetType.House,
            TempRelativePath = "images/houses/Temp/a.jpg",
            UuidFileName = "a.jpg",
            Extension = ".jpg",
            ContentType = "image/jpeg",
            FileSize = 1,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
            UploadedByUserId = Guid.NewGuid(),
            OriginalFileName = "a.jpg"
        });
        await db.Context.SaveChangesAsync();

        var missingId = Guid.NewGuid();

        var service = new PhotoCommitService(db.Context, env);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CommitAsync(new[]
            {
                new CommitPhotoItem(stagedId, "L", 0, StagedUploadTargetType.House),
                new CommitPhotoItem(missingId, "L", 1, StagedUploadTargetType.House)
            }));

        Assert.Contains(missingId.ToString(), ex.Message);
    }

    [Fact]
    public async Task CommitAsync_UnknownTargetType_Throws()
    {
        await using var db = new TestDb();

        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };

            var stagedId = Guid.NewGuid();
            var uuidFileName = $"{Guid.NewGuid():N}.jpg";
            var tempRelativePath = Path.Join("images", "unknown", "Temp", uuidFileName).Replace(Path.DirectorySeparatorChar, '/');

            db.Context.Add(new StagedUpload
            {
                Id = stagedId,
                TargetType = (StagedUploadTargetType)999,
                TempRelativePath = tempRelativePath,
                UuidFileName = uuidFileName,
                Extension = ".jpg",
                ContentType = "image/jpeg",
                FileSize = 1,
                CreatedAtUtc = DateTime.UtcNow,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
                UploadedByUserId = Guid.NewGuid(),
                OriginalFileName = "a.jpg"
            });
            await db.Context.SaveChangesAsync();

            var absoluteTempPath = Path.Combine(root, tempRelativePath.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(absoluteTempPath)!);
            await File.WriteAllBytesAsync(absoluteTempPath, new byte[] { 1 });

            var service = new PhotoCommitService(db.Context, env);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CommitAsync(new[] { new CommitPhotoItem(stagedId, "L", 0, (StagedUploadTargetType)999) }));
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public async Task CommitAsync_Succeeds_CreatesPhotoAndDeletesStaged()
    {
        await using var db = new TestDb();

        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };

            var stagedId = Guid.NewGuid();
            var uuidFileName = $"{Guid.NewGuid():N}.jpg";
            var tempRelativePath = Path.Join("images", "houses", "Temp", uuidFileName).Replace(Path.DirectorySeparatorChar, '/');

            db.Context.Add(new StagedUpload
            {
                Id = stagedId,
                TargetType = StagedUploadTargetType.House,
                TempRelativePath = tempRelativePath,
                UuidFileName = uuidFileName,
                Extension = ".jpg",
                ContentType = "image/jpeg",
                FileSize = 1,
                CreatedAtUtc = DateTime.UtcNow,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
                UploadedByUserId = Guid.NewGuid(),
                OriginalFileName = "a.jpg"
            });
            await db.Context.SaveChangesAsync();

            var absoluteTempPath = Path.Combine(root, tempRelativePath.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(absoluteTempPath)!);
            await File.WriteAllBytesAsync(absoluteTempPath, new byte[] { 1 });

            var service = new PhotoCommitService(db.Context, env);
            var results = await service.CommitAsync(new[] { new CommitPhotoItem(stagedId, "L", 1, StagedUploadTargetType.House) });

            Assert.Single(results);

            var createdPhoto = await db.Context.Set<Photo>().FindAsync(results.Single().PhotoId);
            Assert.NotNull(createdPhoto);

            var staged = await db.Context.Set<StagedUpload>().FindAsync(stagedId);
            Assert.Null(staged);

            Assert.False(File.Exists(absoluteTempPath));
            var absolutePermanentPath = Path.Combine(root, createdPhoto!.PermanentRelativePath.Replace('/', Path.DirectorySeparatorChar));
            Assert.True(File.Exists(absolutePermanentPath));
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public async Task CommitAsync_Succeeds_ForTourTargetType()
    {
        await using var db = new TestDb();

        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };

            var stagedId = Guid.NewGuid();
            var uuidFileName = $"{Guid.NewGuid():N}.jpg";
            var tempRelativePath = Path.Join("images", "tours", "Temp", uuidFileName).Replace(Path.DirectorySeparatorChar, '/');

            db.Context.Add(new StagedUpload
            {
                Id = stagedId,
                TargetType = StagedUploadTargetType.Tour,
                TempRelativePath = tempRelativePath,
                UuidFileName = uuidFileName,
                Extension = ".jpg",
                ContentType = "image/jpeg",
                FileSize = 1,
                CreatedAtUtc = DateTime.UtcNow,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
                UploadedByUserId = Guid.NewGuid(),
                OriginalFileName = "a.jpg"
            });
            await db.Context.SaveChangesAsync();

            var absoluteTempPath = Path.Combine(root, tempRelativePath.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(absoluteTempPath)!);
            await File.WriteAllBytesAsync(absoluteTempPath, new byte[] { 1 });

            var service = new PhotoCommitService(db.Context, env);
            var results = await service.CommitAsync(new[] { new CommitPhotoItem(stagedId, "L", 1, StagedUploadTargetType.Tour) });

            var createdPhoto = await db.Context.Set<Photo>().FindAsync(results.Single().PhotoId);
            Assert.NotNull(createdPhoto);
            Assert.Contains("images/tours/photos", createdPhoto!.PermanentRelativePath);
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public void GetPermanentRelativePath_UnknownTarget_Throws()
    {
        var method = typeof(PhotoCommitService)
            .GetMethod("GetPermanentRelativePath", BindingFlags.NonPublic | BindingFlags.Static);

        Assert.NotNull(method);

        var ex = Assert.Throws<TargetInvocationException>(() =>
            method!.Invoke(null, new object[] { (StagedUploadTargetType)999 }));

        Assert.IsType<InvalidOperationException>(ex.InnerException);
        Assert.Contains("Unknown target type", ex.InnerException!.Message);
    }
}
