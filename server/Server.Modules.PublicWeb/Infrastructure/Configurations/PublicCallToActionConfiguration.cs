using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Configurations;

public sealed class PublicCallToActionConfiguration : IEntityTypeConfiguration<PublicCallToAction>
{
    public void Configure(EntityTypeBuilder<PublicCallToAction> builder)
    {
        builder.ToTable("PublicWebCallToActions");
        builder.HasKey(a => a.EntityId);
        builder.HasIndex(a => new { a.Locale, a.Id }).IsUnique();
        builder.Property(a => a.Id).HasMaxLength(128).IsRequired();
        builder.Property(a => a.Locale).HasMaxLength(10).IsRequired();
        builder.Property(a => a.Text).HasMaxLength(128).IsRequired();
        builder.Property(a => a.Url).HasMaxLength(1024).IsRequired();
    }
}
