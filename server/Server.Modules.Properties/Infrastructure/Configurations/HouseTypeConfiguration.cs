using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Properties.Domain;

namespace Server.Modules.Properties.Infrastructure.Configurations;

public sealed class HouseTypeConfiguration : IEntityTypeConfiguration<HouseType>
{
    public void Configure(EntityTypeBuilder<HouseType> builder)
    {
        builder.ToTable("HouseTypes");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("HouseTypeId")
            .ValueGeneratedNever();

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(128);

        builder.HasIndex(x => x.Name)
            .IsUnique();
    }
}
