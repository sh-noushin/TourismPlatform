using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Services;
using Server.SharedKernel.Auth;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/public-page")]
public sealed class PublicPageController : ControllerBase
{
    private readonly IPublicSectionService _sectionService;

    public PublicPageController(
        IPublicSectionService sectionService)
    {
        _sectionService = sectionService;
    }

    [HttpGet("sections")]
    [ProducesResponseType(typeof(IEnumerable<PublicSectionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSections([FromQuery(Name = "lang")] string? _)
    {
        var sections = await _sectionService.GetSectionsAsync();
        return Ok(sections);
    }

    [HttpPost("sections")]
    [ProducesResponseType(typeof(PublicSectionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [Authorize(PolicyNames.SuperUserOnly)]
    public async Task<IActionResult> CreateSection([FromBody] CreatePublicSectionRequest request)
    {
        try
        {
            var section = await _sectionService.CreateSectionAsync(request);
            var location = Url.Action(nameof(GetSections)) ?? string.Empty;
            return Created(location, section);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    [HttpPut("sections/{id}")]
    [ProducesResponseType(typeof(PublicSectionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(PolicyNames.SuperUserOnly)]
    public async Task<IActionResult> UpsertSection(string id, [FromBody] UpsertPublicSectionRequest request)
    {
        var section = await _sectionService.UpsertSectionAsync(id, request);
        return Ok(section);
    }
}
