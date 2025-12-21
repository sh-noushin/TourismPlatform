using Microsoft.EntityFrameworkCore;
using Server.Modules.Media.Contracts.Uploads.Dtos;
using Server.Modules.Media.Contracts.Uploads.Services;
using Server.Modules.Media.Domain.Uploads;
using Server.Tests.Common;

namespace Server.Tests.Modules.Media;

public sealed class StagedUploadServiceCoverageTests
{
    [Fact]
    public async Task StageAsync_RejectsInvalidTargetType()
    {
        await using var db = new TestDb();

        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };
            var service = new StagedUploadService(db.Context, env);

            var file = FormFileFactory.Create("a.jpg", "image/jpeg", new byte[] { 1 });
            var request = new StageUploadRequest { File = file, TargetType = (StagedUploadTargetType)999 };

            var result = await service.StageAsync(request, Guid.NewGuid());

            Assert.False(result.IsSuccess);
            Assert.Contains("Invalid target type", result.ErrorMessage!, StringComparison.OrdinalIgnoreCase);
            Assert.Equal(0, await db.Context.Set<StagedUpload>().CountAsync());
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public async Task GetAsync_ReturnsNullWhenMissing_AndResponseWhenFound()
    {
        await using var db = new TestDb();

        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };
            var service = new StagedUploadService(db.Context, env);

            Assert.Null(await service.GetAsync(Guid.NewGuid()));

            var file = FormFileFactory.Create("a.jpg", "image/jpeg", new byte[] { 1, 2 });
            var staged = await service.StageAsync(new StageUploadRequest { File = file, TargetType = StagedUploadTargetType.House }, Guid.NewGuid());

            var fetched = await service.GetAsync(staged.Response!.StagedUploadId);
            Assert.NotNull(fetched);
            Assert.Equal(staged.Response!.StagedUploadId, fetched!.StagedUploadId);
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }
}
