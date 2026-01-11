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
        builder.HasIndex(s => s.Id).IsUnique();
        builder.HasIndex(s => s.SectionType).IsUnique();
        builder.Property(s => s.Id).HasMaxLength(256).IsRequired();
        builder.Property(s => s.SectionType)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();
        builder.Property(s => s.Header).HasMaxLength(512).IsRequired();
        builder.Property(s => s.Content).IsRequired();
    }
}
