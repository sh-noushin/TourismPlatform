using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Server.Modules.Media.Application.Services;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Media.Domain.Uploads;

namespace Server.Modules.Media.Contracts.Uploads.Services;

public sealed class PhotoCommitService : IPhotoCommitService
{
    private static readonly IReadOnlyDictionary<StagedUploadTargetType, string> PermanentFolders = new Dictionary<StagedUploadTargetType, string>
    {
        [StagedUploadTargetType.House] = Path.Combine("images", "houses", "photos"),
        [StagedUploadTargetType.Tour] = Path.Combine("images", "tours", "photos")
    };

    private readonly DbContext _dbContext;
    private readonly IHostEnvironment _environment;

    public PhotoCommitService(DbContext dbContext, IHostEnvironment environment)
    {
        _dbContext = dbContext;
        _environment = environment;
    }

    public async Task<IReadOnlyCollection<PhotoCommitResult>> CommitAsync(
        IReadOnlyCollection<CommitPhotoItem> items,
        CancellationToken cancellationToken = default)
    {
        if (items == null || items.Count == 0)
        {
            return Array.Empty<PhotoCommitResult>();
        }

        var itemMap = items.ToDictionary(i => i.StagedUploadId);

        var stagedUploads = await _dbContext.Set<StagedUpload>()
            .Where(s => itemMap.ContainsKey(s.Id))
            .ToListAsync(cancellationToken);

        if (stagedUploads.Count != items.Count)
        {
            var missing = items.Select(i => i.StagedUploadId).Except(stagedUploads.Select(s => s.Id)).ToArray();
            throw new InvalidOperationException($"Missing staged uploads: {string.Join(',', missing)}");
        }

        var results = new List<PhotoCommitResult>(items.Count);
        var now = DateTime.UtcNow;

        foreach (var staged in stagedUploads)
        {
            var request = itemMap[staged.Id];

            if (staged.TargetType != request.TargetType)
            {
                throw new InvalidOperationException("Staged upload target type mismatch.");
            }

            if (staged.ExpiresAtUtc < now)
            {
                throw new InvalidOperationException("Staged upload has expired.");
            }

            var tempPath = Path.Combine(_environment.ContentRootPath, staged.TempRelativePath.Replace('/', Path.DirectorySeparatorChar));
            if (!File.Exists(tempPath))
            {
                throw new FileNotFoundException("Staged upload file missing.", tempPath);
            }

            var permanentDir = GetPermanentDirectory(staged.TargetType);
            var destinationPath = Path.Combine(permanentDir, staged.UuidFileName);
            Directory.CreateDirectory(Path.GetDirectoryName(destinationPath)!);
            File.Move(tempPath, destinationPath, overwrite: true);

            var photo = new Photo
            {
                Id = Guid.NewGuid(),
                UuidFileName = staged.UuidFileName,
                PermanentRelativePath = Path.Join(GetPermanentRelativePath(staged.TargetType), staged.UuidFileName)
                    .Replace(Path.DirectorySeparatorChar, '/'),
                ContentType = staged.ContentType,
                FileSize = staged.FileSize,
                CreatedAtUtc = now,
                UploadedByUserId = staged.UploadedByUserId,
                OriginalFileName = staged.OriginalFileName
            };

            _dbContext.Add(photo);
            _dbContext.Remove(staged);

            results.Add(new PhotoCommitResult(photo.Id, request.Label, request.SortOrder, photo.PermanentRelativePath, staged.TargetType));
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return results;
    }

    private string GetPermanentDirectory(StagedUploadTargetType targetType)
    {
        if (!PermanentFolders.TryGetValue(targetType, out var relative))
            throw new InvalidOperationException("Unknown target type for permanent folder.");

        var absolute = Path.Combine(_environment.ContentRootPath, relative);
        Directory.CreateDirectory(absolute);
        return absolute;
    }

    private static string GetPermanentRelativePath(StagedUploadTargetType targetType)
        => targetType switch
        {
            StagedUploadTargetType.House => Path.Combine("images", "houses", "photos"),
            StagedUploadTargetType.Tour => Path.Combine("images", "tours", "photos"),
            _ => throw new InvalidOperationException("Unknown target type for permanent path.")
        };
}
