using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Modules.Properties.Application.Services;
using Server.Modules.Properties.Contracts.Houses;
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
    public async Task<IActionResult> GetList(CancellationToken cancellationToken)
    {
        var dto = await _houseService.GetListAsync(cancellationToken);
        return Ok(dto);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken cancellationToken)
    {
        var dto = await _houseService.GetDetailAsync(id, cancellationToken);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    [Authorize(PolicyNames.HousesManage)]
    public async Task<IActionResult> Create([FromBody] CreateHouseRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var houseId = await _houseService.CreateAsync(request, userId, cancellationToken);
        return CreatedAtAction(nameof(GetDetail), new { id = houseId }, new { houseId });
    }

    [HttpPut("{id:guid}")]
    [Authorize(PolicyNames.HousesManage)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateHouseRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var updated = await _houseService.UpdateAsync(id, request, userId, cancellationToken);
        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(PolicyNames.HousesManage)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _houseService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var userId) ? userId : null;
    }
}
