using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Modules.Properties.Application.Services;
using Server.Modules.Properties.Contracts.Houses.Dtos;
using Server.Modules.Properties.Domain.Houses;
using Server.SharedKernel.Auth;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/houses")]
public sealed class HousesController : ControllerBase
{
    private readonly IHouseService _houseService;

    public HousesController(IHouseService houseService)
    {
        _houseService = houseService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<HouseSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList([FromQuery] HouseListingType? listingType, CancellationToken cancellationToken)
    {
        var dto = await _houseService.GetListAsync(listingType, cancellationToken);
        return Ok(dto);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(HouseDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken cancellationToken)
    {
        var dto = await _houseService.GetDetailAsync(id, cancellationToken);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    [Authorize(PolicyNames.HousesManage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateHouseRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var houseId = await _houseService.CreateAsync(request, userId, cancellationToken);
        return CreatedAtAction(nameof(GetDetail), new { id = houseId }, new { houseId });
    }

    [HttpPut("{id:guid}")]
    [Authorize(PolicyNames.HousesManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateHouseRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var updated = await _houseService.UpdateAsync(id, request, userId, cancellationToken);
        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(PolicyNames.HousesManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _houseService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpDelete("{id:guid}/photos/{photoId:guid}")]
    [Authorize(PolicyNames.HousesManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeletePhoto(Guid id, Guid photoId, CancellationToken cancellationToken)
    {
        var deleted = await _houseService.UnlinkPhotoAsync(id, photoId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var userId) ? userId : null;
    }
}
