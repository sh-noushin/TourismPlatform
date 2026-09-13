using Microsoft.AspNetCore.Mvc;
using Server.Modules.Tours.Application.Services;
using Server.Modules.Tours.Contracts.Tours.Dtos;
using Server.SharedKernel.Paging;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/tour-categories")]
public sealed class TourCategoriesController : ControllerBase
{
    private readonly ITourCategoryService _tourCategoryService;

    public TourCategoriesController(ITourCategoryService tourCategoryService)
    {
        _tourCategoryService = tourCategoryService;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var categories = await _tourCategoryService.GetTourCategoriesAsync(cancellationToken);
        return Ok(categories);
    }

    [HttpGet("paged")]
    [ProducesResponseType(typeof(PagedResult<TourCategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page,
        [FromQuery] int pageSize,
        [FromQuery] string? search,
        [FromQuery] string? sort,
        CancellationToken cancellationToken)
    {
        var result = await _tourCategoryService.GetTourCategoriesPagedAsync(
            new PageQuery(page, pageSize, search, sort),
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TourCategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var category = await _tourCategoryService.GetTourCategoryAsync(id, cancellationToken);
        return category is null ? NotFound() : Ok(category);
    }

    [HttpPost]
    [ProducesResponseType(typeof(TourCategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(CreateTourCategoryRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await _tourCategoryService.CreateTourCategoryAsync(request, cancellationToken);
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
    public async Task<IActionResult> Update(Guid id, UpdateTourCategoryRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _tourCategoryService.UpdateTourCategoryAsync(id, request, cancellationToken);
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
            await _tourCategoryService.DeleteTourCategoryAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
