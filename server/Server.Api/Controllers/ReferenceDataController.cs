using Microsoft.AspNetCore.Mvc;
using Server.Modules.Exchange.Application.Services;
using Server.Modules.Exchange.Contracts.Exchange.Dtos;
using Server.Modules.Properties.Application.Services;
using Server.SharedKernel.ReferenceData;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/reference")]
public sealed class ReferenceDataController : ControllerBase
{
    private readonly ICountryService _countryService;
    private readonly IExchangeService _exchangeService;

    public ReferenceDataController(ICountryService countryService, IExchangeService exchangeService)
    {
        _countryService = countryService;
        _exchangeService = exchangeService;
    }

    [HttpGet("countries")]
    [ProducesResponseType(typeof(IEnumerable<CountryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCountries(CancellationToken cancellationToken)
    {
        var countries = await _countryService.GetCountriesAsync(cancellationToken);
        return Ok(countries);
    }

    [HttpGet("currencies")]
    [ProducesResponseType(typeof(IEnumerable<CurrencyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurrencies(CancellationToken cancellationToken)
    {
        var currencies = await _exchangeService.GetCurrenciesAsync(cancellationToken);
        return Ok(currencies);
    }
}
