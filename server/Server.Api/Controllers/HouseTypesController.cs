using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var types = await _houseTypeService.GetHouseTypesAsync(cancellationToken);
        return Ok(types);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(HouseTypeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var type = await _houseTypeService.GetHouseTypeAsync(id, cancellationToken);
        return type is null ? NotFound() : Ok(type);
    }

    [HttpPost]
    [ProducesResponseType(typeof(HouseTypeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(CreateHouseTypeRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await _houseTypeService.CreateHouseTypeAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(Guid id, UpdateHouseTypeRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _houseTypeService.UpdateHouseTypeAsync(id, request, cancellationToken);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _houseTypeService.DeleteHouseTypeAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

}
