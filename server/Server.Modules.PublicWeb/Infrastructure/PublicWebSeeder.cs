using System.Threading;
using Server.Modules.PublicWeb.Domain;
using Server.Modules.PublicWeb.Infrastructure.Defaults;
using Server.Modules.PublicWeb.Infrastructure.Repositories;

namespace Server.Modules.PublicWeb.Infrastructure;

public sealed class PublicWebSeeder
{
    private readonly IPublicSectionRepository _sectionRepository;
    private readonly IPublicCallToActionRepository _ctaRepository;
    private readonly IPublicContactInfoRepository _contactInfoRepository;
    private readonly IPublicLearnMorePageRepository _learnMorePageRepository;

    public PublicWebSeeder(
        IPublicSectionRepository sectionRepository,
        IPublicCallToActionRepository ctaRepository,
        IPublicContactInfoRepository contactInfoRepository,
        IPublicLearnMorePageRepository learnMorePageRepository)
    {
        _sectionRepository = sectionRepository;
        _ctaRepository = ctaRepository;
        _contactInfoRepository = contactInfoRepository;
        _learnMorePageRepository = learnMorePageRepository;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await EnsureSectionsAsync(cancellationToken);
        await EnsureCallToActionsAsync(cancellationToken);
        await EnsureContactInfosAsync(cancellationToken);
        await EnsureLearnMorePagesAsync(cancellationToken);
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

    private async Task EnsureCallToActionsAsync(CancellationToken cancellationToken)
    {
        var defaults = PublicWebDefaults.CallToActions;
        var isDirty = false;
        foreach (var action in defaults)
        {
            var existing = await _ctaRepository.GetAsync(action.Locale, action.Id, cancellationToken);
            if (existing is null)
            {
                await _ctaRepository.CreateAsync(action, cancellationToken);
                isDirty = true;
            }
        }

        if (isDirty)
        {
            await _ctaRepository.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task EnsureContactInfosAsync(CancellationToken cancellationToken)
    {
        var defaults = PublicWebDefaults.ContactInfos;
        var isDirty = false;
        foreach (var info in defaults)
        {
            var existing = await _contactInfoRepository.GetByLocaleAsync(info.Locale, cancellationToken);
            if (existing is null)
            {
                await _contactInfoRepository.CreateAsync(info, cancellationToken);
                isDirty = true;
            }
        }

        if (isDirty)
        {
            await _contactInfoRepository.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task EnsureLearnMorePagesAsync(CancellationToken cancellationToken)
    {
        var defaults = PublicWebDefaults.LearnMorePages;
        var isDirty = false;
        foreach (var page in defaults)
        {
            var existing = await _learnMorePageRepository.GetByLocaleAsync(page.Locale, cancellationToken);
            if (existing is null)
            {
                await _learnMorePageRepository.CreateAsync(page, cancellationToken);
                isDirty = true;
            }
        }

        if (isDirty)
        {
            await _learnMorePageRepository.SaveChangesAsync(cancellationToken);
        }
    }
}
