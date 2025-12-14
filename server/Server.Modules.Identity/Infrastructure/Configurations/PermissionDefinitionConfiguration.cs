using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Identity.Domain;

namespace Server.Modules.Identity.Infrastructure.Configurations;

public sealed class PermissionDefinitionConfiguration : IEntityTypeConfiguration<PermissionDefinition>
{
    public void Configure(EntityTypeBuilder<PermissionDefinition> builder)
    {
        builder.ToTable("PermissionDefinitions");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("PermissionId");

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(p => p.Description)
            .HasMaxLength(512);

        builder.HasIndex(p => p.Code).IsUnique();
    }
}
