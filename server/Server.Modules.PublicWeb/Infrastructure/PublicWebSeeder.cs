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
            var existing = await _sectionRepository.GetAsync(section.Id, cancellationToken);
            if (existing is null)
            {
                await _sectionRepository.CreateAsync(section, cancellationToken);
                isDirty = true;
                continue;
            }

            // A database seeded before the English columns existed keeps its
            // Persian-only rows, and this seeder only ever inserts. Fill the
            // blanks -- and only the blanks, so edits made in the dashboard
            // survive the next restart.
            if (existing.HeaderEn is null && section.HeaderEn is not null)
            {
                existing.HeaderEn = section.HeaderEn;
                isDirty = true;
            }

            if (existing.ContentEn is null && section.ContentEn is not null)
            {
                existing.ContentEn = section.ContentEn;
                isDirty = true;
            }
        }

        if (isDirty)
        {
            await _sectionRepository.SaveChangesAsync(cancellationToken);
        }
    }
}
