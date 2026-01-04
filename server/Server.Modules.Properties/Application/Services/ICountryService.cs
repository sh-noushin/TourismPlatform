using Server.SharedKernel.ReferenceData;

namespace Server.Modules.Properties.Application.Services;

public interface ICountryService
{
    Task<IReadOnlyCollection<CountryDto>> GetCountriesAsync(CancellationToken cancellationToken = default);
}
