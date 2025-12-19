using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Server.Modules.Media.Application.Services;
using Server.Modules.Media.Contracts.Uploads.Dtos;
using Server.Modules.Media.Domain.Uploads;

namespace Server.Modules.Media.Contracts.Uploads.Services;

public sealed class StagedUploadService : IStagedUploadService
{
    private static readonly IReadOnlyDictionary<StagedUploadTargetType, string> TempFolders = new Dictionary<StagedUploadTargetType, string>
    {
        [StagedUploadTargetType.House] = Path.Combine("images", "houses", "Temp"),
        [StagedUploadTargetType.Tour] = Path.Combine("images", "tours", "Temp")
    };

    private readonly DbContext _dbContext;
    private readonly IHostEnvironment _environment;

    public StagedUploadService(DbContext dbContext, IHostEnvironment environment)
    {
        _dbContext = dbContext;
        _environment = environment;
    }

    public async Task<StageUploadServiceResult> StageAsync(
        StageUploadRequest request,
        Guid? uploadedByUserId,
        CancellationToken cancellationToken = default)
    {
        if (request.File == null || request.File.Length == 0)
        {
            return new StageUploadServiceResult(false, null, "A file must be provided.");
        }

        if (!TempFolders.TryGetValue(request.TargetType, out var relativeFolder))
        {
            return new StageUploadServiceResult(false, null, "Invalid target type.");
        }

        var extension = Path.GetExtension(request.File.FileName)?.ToLowerInvariant() ?? string.Empty;
        var uuidFileName = $"{Guid.NewGuid():N}{extension}";
        var tempDirectory = Path.Combine(_environment.ContentRootPath, relativeFolder);
        Directory.CreateDirectory(tempDirectory);
        var tempFilePath = Path.Combine(tempDirectory, uuidFileName);

        await using (var stream = File.Create(tempFilePath))
        {
            await request.File.CopyToAsync(stream, cancellationToken);
        }

        var relativePath = Path.Join(relativeFolder, uuidFileName).Replace(Path.DirectorySeparatorChar, '/');
        var stagedUpload = new StagedUpload
        {
            Id = Guid.NewGuid(),
            TargetType = request.TargetType,
            TempRelativePath = relativePath,
            UuidFileName = uuidFileName,
            Extension = extension,
            ContentType = request.File.ContentType,
            FileSize = request.File.Length,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddHours(6),
            UploadedByUserId = uploadedByUserId,
            OriginalFileName = request.File.FileName
        };

        _dbContext.Add(stagedUpload);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = new StageUploadResponse(
            stagedUpload.Id,
            stagedUpload.TempRelativePath,
            stagedUpload.UuidFileName,
            stagedUpload.Extension,
            stagedUpload.ContentType,
            stagedUpload.FileSize,
            stagedUpload.CreatedAtUtc,
            stagedUpload.ExpiresAtUtc,
            stagedUpload.TargetType);

        return new StageUploadServiceResult(true, response, null);
    }

    public async Task<StageUploadResponse?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var staged = await _dbContext.Set<StagedUpload>().FindAsync([id], cancellationToken);
        if (staged == null) return null;

        return new StageUploadResponse(
            staged.Id,
            staged.TempRelativePath,
            staged.UuidFileName,
            staged.Extension,
            staged.ContentType,
            staged.FileSize,
            staged.CreatedAtUtc,
            staged.ExpiresAtUtc,
            staged.TargetType);
    }
}
