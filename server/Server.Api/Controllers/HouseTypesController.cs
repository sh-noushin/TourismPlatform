using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Server.Modules.Properties.Application.Services;
using Server.Modules.Properties.Contracts.Houses.Dtos;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/house-types")]
public sealed class HouseTypesController : ControllerBase
{
    private readonly IHouseTypeService _houseTypeService;

    public HouseTypesController(IHouseTypeService houseTypeService)
    {
        _houseTypeService = houseTypeService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<HouseTypeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var types = await _houseTypeService.GetHouseTypesAsync(cancellationToken);
        return Ok(types);
    }
}
