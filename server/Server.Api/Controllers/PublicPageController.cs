using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Services;
using Server.SharedKernel.Auth;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/public-page")]
public sealed class PublicPageController : ControllerBase
{
    private readonly IPublicSectionService _sectionService;
    private readonly IPublicCallToActionService _ctaService;

    public PublicPageController(IPublicSectionService sectionService, IPublicCallToActionService ctaService)
    {
        _sectionService = sectionService;
        _ctaService = ctaService;
    }

    [HttpGet("sections")]
    public async Task<IActionResult> GetSections([FromQuery(Name = "lang")] string? locale)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var sections = await _sectionService.GetSectionsAsync(normalized);
        return Ok(sections);
    }

    [HttpPut("sections/{locale}/{id}")]
    [Authorize(PolicyNames.SuperUserOnly)]
    public async Task<IActionResult> UpsertSection(string locale, string id, [FromBody] UpsertPublicSectionRequest request)
    {
        var normalizedLocale = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var section = await _sectionService.UpsertSectionAsync(normalizedLocale, id, request);
        return Ok(section);
    }

    [HttpGet("ctas")]
    public async Task<IActionResult> GetCallToActions([FromQuery(Name = "lang")] string? locale)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var actions = await _ctaService.GetCallToActionsAsync(normalized);
        return Ok(actions);
    }

    [HttpPut("ctas/{locale}/{id}")]
    [Authorize(PolicyNames.SuperUserOnly)]
    public async Task<IActionResult> UpsertCallToAction(string locale, string id, [FromBody] UpsertPublicCallToActionRequest request)
    {
        var normalizedLocale = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var action = await _ctaService.UpsertCallToActionAsync(normalizedLocale, id, request);
        return Ok(action);
    }
}
