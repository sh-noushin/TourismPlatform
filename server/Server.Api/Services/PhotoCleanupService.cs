using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Tours.Domain.Tours;
using Server.SharedKernel.Media;

namespace Server.Api.Services;

public sealed class PhotoCleanupService : IPhotoCleanupService
{
    private readonly DbContext _dbContext;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<PhotoCleanupService> _logger;

    public PhotoCleanupService(
        DbContext dbContext,
        IHostEnvironment environment,
        ILogger<PhotoCleanupService> logger)
    {
        _dbContext = dbContext;
        _environment = environment;
        _logger = logger;
    }

    public async Task<IReadOnlyCollection<Guid>> CleanupOrphanedPhotosAsync(
        IReadOnlyCollection<Guid> photoIds,
        CancellationToken cancellationToken = default)
    {
        if (photoIds == null || photoIds.Count == 0)
        {
            return Array.Empty<Guid>();
        }

        var distinctPhotoIds = photoIds.Distinct().ToList();
        var toRemove = new List<Photo>();
        var deleted = new List<Guid>();

        foreach (var photoId in distinctPhotoIds)
        {
            if (await IsPhotoLinkedAsync(photoId, cancellationToken))
            {
                continue;
            }

            var photo = await _dbContext.Set<Photo>().FindAsync(new object[] { photoId }, cancellationToken);
            if (photo == null)
            {
                continue;
            }

            toRemove.Add(photo);
            deleted.Add(photoId);
        }

        if (toRemove.Count == 0)
        {
            return Array.Empty<Guid>();
        }

        foreach (var photo in toRemove)
        {
            DeleteFile(photo);
        }

        _dbContext.RemoveRange(toRemove);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return deleted;
    }

    private async Task<bool> IsPhotoLinkedAsync(Guid photoId, CancellationToken cancellationToken)
    {
        if (await _dbContext.Set<HousePhoto>().AnyAsync(x => x.PhotoId == photoId, cancellationToken))
        {
            return true;
        }

        if (await _dbContext.Set<TourPhoto>().AnyAsync(x => x.PhotoId == photoId, cancellationToken))
        {
            return true;
        }

        return false;
    }

    private void DeleteFile(Photo photo)
    {
        if (string.IsNullOrWhiteSpace(photo.PermanentRelativePath))
        {
            return;
        }

        var relative = photo.PermanentRelativePath.Replace('/', Path.DirectorySeparatorChar);
        var absolute = Path.Combine(_environment.ContentRootPath, relative);
        if (!File.Exists(absolute))
        {
            return;
        }

        try
        {
            File.Delete(absolute);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete orphaned photo file {Path}", absolute);
        }
    }
}
