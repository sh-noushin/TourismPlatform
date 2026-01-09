using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Configurations;

public sealed class PublicLearnMorePageConfiguration : IEntityTypeConfiguration<PublicLearnMorePage>
{
    public void Configure(EntityTypeBuilder<PublicLearnMorePage> builder)
    {
        builder.ToTable("PublicWebLearnMorePages");
        builder.HasKey(p => p.EntityId);
        builder.HasIndex(p => p.Locale).IsUnique();
        builder.Property(p => p.Locale).HasMaxLength(10).IsRequired();
        builder.Property(p => p.Title).HasMaxLength(256).IsRequired();
        builder.Property(p => p.Heading).HasMaxLength(512).IsRequired();
        builder.Property(p => p.Body).IsRequired();
        builder.Property(p => p.ImageUrl).HasMaxLength(1024);
        builder.Property(p => p.PrimaryButtonText).HasMaxLength(64);
        builder.Property(p => p.PrimaryButtonUrl).HasMaxLength(1024);
    }
}
