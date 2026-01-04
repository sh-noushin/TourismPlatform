using System.Linq;
using Server.Modules.Properties.Application.Services;
using Server.Modules.Properties.Domain.Countries.Repositories;
using Server.SharedKernel.ReferenceData;

namespace Server.Modules.Properties.Contracts.ReferenceData.Services;

public sealed class CountryService : ICountryService
{
    private readonly ICountryRepository _countryRepository;

    public CountryService(ICountryRepository countryRepository)
    {
        _countryRepository = countryRepository;
    }

    public async Task<IReadOnlyCollection<CountryDto>> GetCountriesAsync(CancellationToken cancellationToken = default)
    {
        var countries = await _countryRepository.GetListAsync(cancellationToken);
        return countries
            .Select(c => new CountryDto(c.Id, c.Code, c.Name))
            .ToList();
    }
}
