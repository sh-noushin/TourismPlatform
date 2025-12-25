using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Modules.Media.Application.Services;
using Server.Modules.Media.Contracts.Uploads.Dtos;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/photos")]
[Authorize]
public class PhotosController : ControllerBase
{
    private readonly IStagedUploadService _stagedUploadService;

    public PhotosController(IStagedUploadService stagedUploadService)
    {
        _stagedUploadService = stagedUploadService;
    }

    [HttpPost("stage")]
    [ProducesResponseType(typeof(StageUploadResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Stage([FromForm] StageUploadRequest request)
    {
        var result = await _stagedUploadService.StageAsync(request, GetCurrentUserId());
        if (!result.IsSuccess || result.Response == null)
        {
            return BadRequest(new { message = result.ErrorMessage ?? "Invalid request." });
        }

        return CreatedAtAction(nameof(Get), new { id = result.Response.StagedUploadId }, result.Response);
    }

    [HttpDelete("stage")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Cleanup([FromBody] CleanupStageUploadsRequest request)
    {
        if (request?.StagedUploadIds == null || request.StagedUploadIds.Count() == 0)
        {
            return BadRequest(new { message = "At least one staged upload ID must be provided." });
        }

        var deletedIds = await _stagedUploadService.DeleteAsync(request.StagedUploadIds, GetCurrentUserId());
        return Ok(new { deletedStagedUploadIds = deletedIds });
    }

    [HttpGet("stage/{id:guid}")]
    [ProducesResponseType(typeof(StageUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Get(Guid id)
    {
        var response = await _stagedUploadService.GetAsync(id);
        return response == null ? NotFound() : Ok(response);
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(claim, out var userId)) return userId;
        return null;
    }
}
