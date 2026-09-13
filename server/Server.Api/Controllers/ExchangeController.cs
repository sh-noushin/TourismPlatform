using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Modules.Exchange.Application.Services;
using Server.Modules.Exchange.Contracts.Exchange.Dtos;
using Server.Modules.Exchange.Infrastructure.RateFeed;
using Server.SharedKernel.Auth;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/exchange")]
public sealed class ExchangeController : ControllerBase
{
    private readonly IExchangeService _exchangeService;
    private readonly IRateFeedImporter _rateFeedImporter;

    public ExchangeController(IExchangeService exchangeService, IRateFeedImporter rateFeedImporter)
    {
        _exchangeService = exchangeService;
        _rateFeedImporter = rateFeedImporter;
    }

    [HttpGet("currencies")]
    [ProducesResponseType(typeof(IEnumerable<CurrencyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurrencies(CancellationToken cancellationToken)
    {
        var dto = await _exchangeService.GetCurrenciesAsync(cancellationToken);
        return Ok(dto);
    }

    [HttpGet("rates")]
    [ProducesResponseType(typeof(IEnumerable<ExchangeRateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLatestRates(CancellationToken cancellationToken)
    {
        var dto = await _exchangeService.GetLatestRatesAsync(cancellationToken);
        return Ok(dto);
    }

    [HttpGet("rates/summary")]
    [ProducesResponseType(typeof(IEnumerable<ExchangeRateSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRateSummaries([FromQuery] int days = 7, CancellationToken cancellationToken = default)
    {
        var dto = await _exchangeService.GetRateSummariesAsync(days, cancellationToken);
        return Ok(dto);
    }

    /// <summary>
    /// Pulls the rate feed on demand. Behind ExchangeManage because it spends
    /// the feed's request quota.
    /// </summary>
    [HttpPost("rates/sync")]
    [Authorize(PolicyNames.ExchangeManage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SyncRates(CancellationToken cancellationToken)
    {
        var result = await _rateFeedImporter.ImportAsync(cancellationToken);
        return Ok(new { imported = result.Imported, configured = result.Configured });
    }

    [HttpPost("orders")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateOrder([FromBody] CreateExchangeOrderRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _exchangeService.CreateOrderAsync(userId.Value, request, cancellationToken);
        if (result.IsSuccess)
        {
            return StatusCode(StatusCodes.Status201Created, new { orderId = result.OrderId });
        }

        return result.Error switch
        {
            CreateExchangeOrderError.Invalid => BadRequest(),
            CreateExchangeOrderError.CurrencyNotFound => NotFound(),
            CreateExchangeOrderError.RateNotFound => NotFound(),
            _ => BadRequest()
        };
    }

    [HttpPut("orders/{orderId:guid}/status")]
    [Authorize(PolicyNames.ExchangeManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateOrderStatus(Guid orderId, [FromBody] UpdateExchangeOrderStatusRequest request, CancellationToken cancellationToken)
    {
        var result = await _exchangeService.UpdateOrderStatusAsync(orderId, request.Status, cancellationToken);
        if (result.IsSuccess)
        {
            return NoContent();
        }

        return result.Error switch
        {
            UpdateExchangeOrderStatusError.NotFound => NotFound(),
            UpdateExchangeOrderStatusError.Invalid => BadRequest(),
            UpdateExchangeOrderStatusError.InvalidTransition => Conflict(),
            _ => BadRequest()
        };
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var userId) ? userId : null;
    }
}
