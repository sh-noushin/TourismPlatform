using System.Threading;
using Server.Modules.PublicWeb.Domain;
using Server.Modules.PublicWeb.Infrastructure.Defaults;
using Server.Modules.PublicWeb.Infrastructure.Repositories;

namespace Server.Modules.PublicWeb.Infrastructure;

public sealed class PublicWebSeeder
{
    private readonly IPublicSectionRepository _sectionRepository;

    public PublicWebSeeder(
        IPublicSectionRepository sectionRepository)
    {
        _sectionRepository = sectionRepository;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await EnsureSectionsAsync(cancellationToken);
    }

    private async Task EnsureSectionsAsync(CancellationToken cancellationToken)
    {
        var defaults = PublicWebDefaults.Sections;
        var isDirty = false;
        foreach (var section in defaults)
        {
            var existing = await _sectionRepository.GetAsync(section.Locale, section.Id, cancellationToken);
            if (existing is null)
            {
                await _sectionRepository.CreateAsync(section, cancellationToken);
                isDirty = true;
            }
        }

        if (isDirty)
        {
            await _sectionRepository.SaveChangesAsync(cancellationToken);
        }
    }
}
