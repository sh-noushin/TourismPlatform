using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Properties.Domain;

namespace Server.Modules.Properties.Infrastructure.Configurations;

public sealed class HouseConfiguration : IEntityTypeConfiguration<House>
{
    public void Configure(EntityTypeBuilder<House> builder)
    {
        builder.ToTable("Houses");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("HouseId")
            .ValueGeneratedNever();

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.Description)
            .HasMaxLength(4000);

        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.UpdatedAtUtc);
        builder.Property(x => x.CreatedByUserId);
        builder.Property(x => x.UpdatedByUserId);

        builder.HasOne(x => x.HouseType)
            .WithMany()
            .HasForeignKey(x => x.HouseTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Address)
            .WithMany()
            .HasForeignKey(x => x.AddressId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Photos)
            .WithOne(x => x.House!)
            .HasForeignKey(x => x.HouseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.Name);
    }
}
