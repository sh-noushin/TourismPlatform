using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Configurations;

public sealed class PublicSectionConfiguration : IEntityTypeConfiguration<PublicSection>
{
    public void Configure(EntityTypeBuilder<PublicSection> builder)
    {
        builder.ToTable("PublicWebSections");
        builder.HasKey(s => s.EntityId);
        builder.HasIndex(s => new { s.Locale, s.Id }).IsUnique();
        builder.Property(s => s.Id).HasMaxLength(256).IsRequired();
        builder.Property(s => s.Locale).HasMaxLength(10).IsRequired();
        builder.Property(s => s.Heading).HasMaxLength(512).IsRequired();
        builder.Property(s => s.Body).IsRequired();
        builder.Property(s => s.Tagline).HasMaxLength(128);
        builder.Property(s => s.ImageUrl).HasMaxLength(1024);
        builder.Property(s => s.PrimaryCtaText).HasMaxLength(64);
        builder.Property(s => s.PrimaryCtaUrl).HasMaxLength(1024);
        builder.Property(s => s.SecondaryCtaText).HasMaxLength(64);
        builder.Property(s => s.SecondaryCtaUrl).HasMaxLength(1024);
    }
}
