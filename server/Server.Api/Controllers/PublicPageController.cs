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
    private readonly IPublicCallToActionService _ctaService;
    private readonly IPublicContactInfoService _contactInfoService;
    private readonly IPublicLearnMorePageService _learnMorePageService;

    public PublicPageController(
        IPublicSectionService sectionService,
        IPublicCallToActionService ctaService,
        IPublicContactInfoService contactInfoService,
        IPublicLearnMorePageService learnMorePageService)
    {
        _sectionService = sectionService;
        _ctaService = ctaService;
        _contactInfoService = contactInfoService;
        _learnMorePageService = learnMorePageService;
    }

    [HttpGet("sections")]
    [ProducesResponseType(typeof(IEnumerable<PublicSectionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSections([FromQuery(Name = "lang")] string? locale)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var sections = await _sectionService.GetSectionsAsync(normalized);
        return Ok(sections);
    }

    [HttpPut("sections/{locale}/{id}")]
    [ProducesResponseType(typeof(PublicSectionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(PolicyNames.SuperUserOnly)]
    public async Task<IActionResult> UpsertSection(string locale, string id, [FromBody] UpsertPublicSectionRequest request)
    {
        var normalizedLocale = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var section = await _sectionService.UpsertSectionAsync(normalizedLocale, id, request);
        return Ok(section);
    }

    [HttpGet("ctas")]
    [ProducesResponseType(typeof(IEnumerable<PublicCallToActionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCallToActions([FromQuery(Name = "lang")] string? locale)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var actions = await _ctaService.GetCallToActionsAsync(normalized);
        return Ok(actions);
    }

    [HttpPut("ctas/{locale}/{id}")]
    [ProducesResponseType(typeof(PublicCallToActionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(PolicyNames.SuperUserOnly)]
    public async Task<IActionResult> UpsertCallToAction(string locale, string id, [FromBody] UpsertPublicCallToActionRequest request)
    {
        var normalizedLocale = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var action = await _ctaService.UpsertCallToActionAsync(normalizedLocale, id, request);
        return Ok(action);
    }

    [HttpGet("contact-info")]
    [ProducesResponseType(typeof(PublicContactInfoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetContactInfo([FromQuery(Name = "lang")] string? locale)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var info = await _contactInfoService.GetByLocaleAsync(normalized);
        return info == null ? NotFound() : Ok(info);
    }

    [HttpPut("contact-info/{locale}")]
    [ProducesResponseType(typeof(PublicContactInfoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(PolicyNames.SuperUserOnly)]
    public async Task<IActionResult> UpsertContactInfo(string locale, [FromBody] UpsertPublicContactInfoRequest request)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var info = await _contactInfoService.UpsertAsync(normalized, request);
        return Ok(info);
    }

    [HttpGet("learn-more")]
    [ProducesResponseType(typeof(PublicLearnMorePageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLearnMorePage([FromQuery(Name = "lang")] string? locale)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var page = await _learnMorePageService.GetByLocaleAsync(normalized);
        return page == null ? NotFound() : Ok(page);
    }

    [HttpPut("learn-more/{locale}")]
    [ProducesResponseType(typeof(PublicLearnMorePageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(PolicyNames.SuperUserOnly)]
    public async Task<IActionResult> UpsertLearnMorePage(string locale, [FromBody] UpsertPublicLearnMorePageRequest request)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var page = await _learnMorePageService.UpsertAsync(normalized, request);
        return Ok(page);
    }
}
