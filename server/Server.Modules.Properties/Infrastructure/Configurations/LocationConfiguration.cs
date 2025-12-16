using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Properties.Domain.Houses;

namespace Server.Modules.Properties.Infrastructure.Configurations;

public sealed class LocationConfiguration : IEntityTypeConfiguration<Location>
{
    public void Configure(EntityTypeBuilder<Location> builder)
    {
        builder.ToTable("Locations");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("LocationId")
            .ValueGeneratedNever();

        builder.Property(x => x.Country)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(x => x.City)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(x => x.Region)
            .HasMaxLength(128);

        builder.HasIndex(x => new { x.Country, x.City, x.Region })
            .IsUnique();
    }
}
