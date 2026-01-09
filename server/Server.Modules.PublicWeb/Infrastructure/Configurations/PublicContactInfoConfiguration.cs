using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Configurations;

public sealed class PublicContactInfoConfiguration : IEntityTypeConfiguration<PublicContactInfo>
{
    public void Configure(EntityTypeBuilder<PublicContactInfo> builder)
    {
        builder.ToTable("PublicWebContactInfos");
        builder.HasKey(c => c.EntityId);
        builder.HasIndex(c => c.Locale).IsUnique();
        builder.Property(c => c.Locale).HasMaxLength(10).IsRequired();
        builder.Property(c => c.Title).HasMaxLength(256).IsRequired();
        builder.Property(c => c.Description).IsRequired();
        builder.Property(c => c.Email).HasMaxLength(256);
        builder.Property(c => c.Phone).HasMaxLength(64);
        builder.Property(c => c.Address).HasMaxLength(512);
    }
}
