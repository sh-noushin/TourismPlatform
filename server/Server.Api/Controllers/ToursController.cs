using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Modules.Tours.Application.Services;
using Server.Modules.Tours.Contracts.Tours.Dtos;
using SharedCountryDto = Server.SharedKernel.ReferenceData.CountryDto;
using Server.Modules.Properties.Application.Services;
using Server.SharedKernel.Auth;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/tours")]
public sealed class ToursController : ControllerBase
{
    private readonly ITourService _tourService;
    private readonly ICountryService _countryService;

    public ToursController(ITourService tourService, ICountryService countryService)
    {
        _tourService = tourService;
        _countryService = countryService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TourSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList(CancellationToken cancellationToken)
    {
        var dto = await _tourService.GetListAsync(cancellationToken);
        return Ok(dto);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TourDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken cancellationToken)
    {
        var dto = await _tourService.GetDetailAsync(id, cancellationToken);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpGet("countries")]
    [ProducesResponseType(typeof(IEnumerable<SharedCountryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCountries(CancellationToken cancellationToken)
    {
        var countries = await _countryService.GetCountriesAsync(cancellationToken);
        return Ok(countries);
    }

    [HttpPost]
    [Authorize(PolicyNames.ToursManage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateTourRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var tourId = await _tourService.CreateAsync(request, userId, cancellationToken);
        return CreatedAtAction(nameof(GetDetail), new { id = tourId }, new { tourId });
    }

    [HttpPut("{id:guid}")]
    [Authorize(PolicyNames.ToursManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTourRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var updated = await _tourService.UpdateAsync(id, request, userId, cancellationToken);
        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(PolicyNames.ToursManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _tourService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpDelete("{id:guid}/photos/{photoId:guid}")]
    [Authorize(PolicyNames.ToursManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeletePhoto(Guid id, Guid photoId, CancellationToken cancellationToken)
    {
        var deleted = await _tourService.UnlinkPhotoAsync(id, photoId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{tourId:guid}/schedules")]
    [Authorize(PolicyNames.ToursManage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateSchedule(Guid tourId, [FromBody] CreateTourScheduleRequest request, CancellationToken cancellationToken)
    {
        if (request.Capacity <= 0) return BadRequest();
        if (request.EndAtUtc <= request.StartAtUtc) return BadRequest();

        var tour = await _tourService.GetDetailAsync(tourId, cancellationToken);
        if (tour == null) return NotFound();

        var scheduleId = await _tourService.CreateScheduleAsync(tourId, request, cancellationToken);
        return scheduleId == null
            ? BadRequest()
            : StatusCode(StatusCodes.Status201Created, new { scheduleId });
    }

    [HttpPut("schedules/{scheduleId:guid}")]
    [Authorize(PolicyNames.ToursManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateSchedule(Guid scheduleId, [FromBody] UpdateTourScheduleRequest request, CancellationToken cancellationToken)
    {
        if (request.Capacity <= 0) return BadRequest();
        if (request.EndAtUtc <= request.StartAtUtc) return BadRequest();

        var updated = await _tourService.UpdateScheduleAsync(scheduleId, request, cancellationToken);
        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("schedules/{scheduleId:guid}")]
    [Authorize(PolicyNames.ToursManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteSchedule(Guid scheduleId, CancellationToken cancellationToken)
    {
        var deleted = await _tourService.DeleteScheduleAsync(scheduleId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{tourId:guid}/bookings")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Book(Guid tourId, [FromBody] CreateBookingRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _tourService.BookAsync(tourId, userId.Value, request, cancellationToken);
        if (result.IsSuccess)
        {
            return StatusCode(StatusCodes.Status201Created, new { bookingId = result.BookingId });
        }

        return result.Error switch
        {
            BookTourError.Invalid => BadRequest(),
            BookTourError.CapacityExceeded => Conflict(),
            BookTourError.NotFound => NotFound(),
            _ => BadRequest()
        };
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var userId) ? userId : null;
    }
}
