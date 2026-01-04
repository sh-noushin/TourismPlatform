using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Exchange.Domain.Currencies;
using Server.Modules.Exchange.Domain.Currencies.Repositories;
using Server.Modules.Properties.Domain.Countries;
using Server.Modules.Properties.Domain.Countries.Repositories;
using Server.SharedKernel.ReferenceData;

namespace Server.Api.Services;

public sealed class ReferenceDataSeeder
{
    private readonly ICountryRepository _countryRepository;
    private readonly ICurrencyRepository _currencyRepository;

    public ReferenceDataSeeder(ICountryRepository countryRepository, ICurrencyRepository currencyRepository)
    {
        _countryRepository = countryRepository;
        _currencyRepository = currencyRepository;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await SeedCurrenciesAsync(cancellationToken);
        await SeedCountriesAsync(cancellationToken);
    }

    private async Task SeedCurrenciesAsync(CancellationToken cancellationToken)
    {
        var existingCurrencies = await _currencyRepository.Query()
            .ToDictionaryAsync(c => c.Code, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var hasChanges = false;
        foreach (var info in CurrencyCodes.Known)
        {
            if (!existingCurrencies.TryGetValue(info.Code, out var currency))
            {
                await _currencyRepository.CreateAsync(new Currency
                {
                    Id = CreateGuid(info.Code),
                    Code = info.Code,
                    Name = info.Name
                }, cancellationToken);
                hasChanges = true;
                continue;
            }

            if (!string.Equals(currency.Name, info.Name, StringComparison.Ordinal))
            {
                currency.Name = info.Name;
                hasChanges = true;
            }
        }

        if (hasChanges)
        {
            await _currencyRepository.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task SeedCountriesAsync(CancellationToken cancellationToken)
    {
        var existingCountries = await _countryRepository.Query()
            .ToDictionaryAsync(c => c.Code, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var hasChanges = false;
        foreach (var info in CountryCodes.Known)
        {
            if (!existingCountries.TryGetValue(info.Code, out var country))
            {
                await _countryRepository.CreateAsync(new Country
                {
                    Id = CreateGuid(info.Code),
                    Code = info.Code,
                    Name = info.Name
                }, cancellationToken);
                hasChanges = true;
                continue;
            }

            if (!string.Equals(country.Name, info.Name, StringComparison.Ordinal))
            {
                country.Name = info.Name;
                hasChanges = true;
            }
        }

        if (hasChanges)
        {
            await _countryRepository.SaveChangesAsync(cancellationToken);
        }
    }

    private static Guid CreateGuid(string code)
    {
        using var md5 = MD5.Create();
        var hash = md5.ComputeHash(Encoding.UTF8.GetBytes(code));
        return new Guid(hash);
    }
}
