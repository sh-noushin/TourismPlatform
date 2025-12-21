using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Media.Contracts.Uploads.Dtos;
using Server.Modules.Media.Contracts.Uploads.Services;
using Server.Modules.Media.Domain.Uploads;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.Media;

public sealed class StagedUploadServiceTests
{
    [Fact]
    public async Task StageAsync_WritesTempFileAndPersistsStagedUpload()
    {
        await using var db = new TestDb();
        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };
            var service = new StagedUploadService(db.Context, env);

            var file = FormFileFactory.Create(
                fileName: "hello.jpg",
                contentType: "image/jpeg",
                content: new byte[] { 1, 2, 3, 4 });

            var request = new StageUploadRequest { File = file, TargetType = StagedUploadTargetType.House };

            var userId = Guid.NewGuid();
            var result = await service.StageAsync(request, userId);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Response);

            var stagedId = result.Response!.StagedUploadId;
            var staged = await db.Context.Set<StagedUpload>().FindAsync(stagedId);

            Assert.NotNull(staged);
            Assert.Equal(StagedUploadTargetType.House, staged!.TargetType);
            Assert.Equal(userId, staged.UploadedByUserId);

            var absoluteTempPath = Path.Combine(root, result.Response.TempRelativePath.Replace('/', Path.DirectorySeparatorChar));
            Assert.True(File.Exists(absoluteTempPath));

            var count = await db.Context.Set<StagedUpload>().CountAsync();
            Assert.Equal(1, count);
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }

    [Fact]
    public async Task StageAsync_RejectsMissingFile()
    {
        await using var db = new TestDb();
        var root = Path.Combine(Path.GetTempPath(), "TourismPlatformTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(root);

        try
        {
            var env = new FakeHostEnvironment { ContentRootPath = root };
            var service = new StagedUploadService(db.Context, env);

            var request = new StageUploadRequest { File = null, TargetType = StagedUploadTargetType.House };
            var result = await service.StageAsync(request, Guid.NewGuid());

            Assert.False(result.IsSuccess);
            Assert.Null(result.Response);
        }
        finally
        {
            try { Directory.Delete(root, recursive: true); } catch { }
        }
    }
}
