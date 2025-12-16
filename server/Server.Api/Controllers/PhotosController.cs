using System.IO;
using System.Security.Claims;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Api.Infrastructure.Persistence;
using Server.Modules.Media.Contracts.Uploads.Dtos;
using Server.Modules.Media.Domain.Uploads;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/photos")]
[Authorize]
public class PhotosController : ControllerBase
{
    private static readonly IReadOnlyDictionary<StagedUploadTargetType, string> TempFolders = new Dictionary<StagedUploadTargetType, string>
    {
        [StagedUploadTargetType.House] = Path.Combine("images", "houses", "Temp"),
        [StagedUploadTargetType.Tour] = Path.Combine("images", "tours", "Temp")
    };

    private readonly ApplicationDbContext _dbContext;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<PhotosController> _logger;

    public PhotosController(ApplicationDbContext dbContext, IWebHostEnvironment environment, ILogger<PhotosController> logger)
    {
        _dbContext = dbContext;
        _environment = environment;
        _logger = logger;
    }

    [HttpPost("stage")]
    public async Task<IActionResult> Stage([FromForm] StageUploadRequest request)
    {
        if (request.File == null || request.File.Length == 0)
        {
            return BadRequest(new { message = "A file must be provided." });
        }

        if (!TempFolders.TryGetValue(request.TargetType, out var relativeFolder))
        {
            return BadRequest(new { message = "Invalid target type." });
        }

        var extension = Path.GetExtension(request.File.FileName)?.ToLowerInvariant() ?? string.Empty;
        var uuidFileName = $"{Guid.NewGuid():N}{extension}";
        var tempDirectory = Path.Combine(_environment.ContentRootPath, relativeFolder);
        Directory.CreateDirectory(tempDirectory);
        var tempFilePath = Path.Combine(tempDirectory, uuidFileName);

        await using (var stream = System.IO.File.Create(tempFilePath))
        {
            await request.File.CopyToAsync(stream);
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
            UploadedByUserId = GetCurrentUserId()
        };

        _dbContext.Add(stagedUpload);
        await _dbContext.SaveChangesAsync();

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

        return CreatedAtAction(nameof(Get), new { id = stagedUpload.Id }, response);
    }

    [HttpGet("stage/{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var staged = await _dbContext.Set<StagedUpload>().FindAsync(id);
        if (staged == null) return NotFound();

        var response = new StageUploadResponse(
            staged.Id,
            staged.TempRelativePath,
            staged.UuidFileName,
            staged.Extension,
            staged.ContentType,
            staged.FileSize,
            staged.CreatedAtUtc,
            staged.ExpiresAtUtc,
            staged.TargetType);

        return Ok(response);
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(claim, out var userId)) return userId;
        return null;
    }
}
