using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Properties.Domain.Countries;

namespace Server.Modules.Properties.Infrastructure.Configurations;

public sealed class CountryConfiguration : IEntityTypeConfiguration<Country>
{
    public void Configure(EntityTypeBuilder<Country> builder)
    {
        builder.ToTable("Countries");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("CountryId")
            .ValueGeneratedNever();

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(2)
            .HasColumnType("nvarchar(2)");

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(256)
            .HasColumnType("nvarchar(256)");

        builder.HasIndex(x => x.Code)
            .IsUnique();
    }
}
