using Server.Modules.Media.Contracts.Uploads.Dtos;
using Server.Modules.Media.Contracts.Uploads.Services;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Media.Domain.Uploads;
using Server.Tests.Common;

namespace Server.Tests.Modules.Media;

public sealed class PhotoCommitServiceTests
{
    [Fact]
    public async Task CommitAsync_MovesFile_CreatesPhoto_DeletesStagedUpload()
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

            var staged = new StagedUpload
            {
                Id = stagedId,
                TargetType = StagedUploadTargetType.House,
                TempRelativePath = tempRelativePath,
                UuidFileName = uuidFileName,
                Extension = ".jpg",
                ContentType = "image/jpeg",
                FileSize = 4,
                CreatedAtUtc = DateTime.UtcNow,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
                UploadedByUserId = Guid.NewGuid(),
                OriginalFileName = "hello.jpg"
            };

            db.Context.Add(staged);
            await db.Context.SaveChangesAsync();

            var absoluteTempPath = Path.Combine(root, tempRelativePath.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(absoluteTempPath)!);
            await File.WriteAllBytesAsync(absoluteTempPath, new byte[] { 1, 2, 3, 4 });

            var service = new PhotoCommitService(db.Context, env);
            var results = await service.CommitAsync(new[] { new CommitPhotoItem(stagedId, "Front", 0, StagedUploadTargetType.House) });

            Assert.Single(results);

            var committed = results.Single();
            var photo = await db.Context.Set<Photo>().FindAsync(committed.PhotoId);
            Assert.NotNull(photo);

            var stillStaged = await db.Context.Set<StagedUpload>().FindAsync(stagedId);
            Assert.Null(stillStaged);

            Assert.False(File.Exists(absoluteTempPath));

            var absolutePermanentPath = Path.Combine(root, photo!.PermanentRelativePath.Replace('/', Path.DirectorySeparatorChar));
            Assert.True(File.Exists(absolutePermanentPath));
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public async Task CommitAsync_ThrowsWhenStagedUploadMissing()
    {
        await using var db = new TestDb();
        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };
            var service = new PhotoCommitService(db.Context, env);

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CommitAsync(new[] { new CommitPhotoItem(Guid.NewGuid(), "X", 0, StagedUploadTargetType.House) }));

            Assert.Contains("Missing staged uploads", ex.Message, StringComparison.OrdinalIgnoreCase);
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }
}
