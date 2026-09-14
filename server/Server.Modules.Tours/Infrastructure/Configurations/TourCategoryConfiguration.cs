using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Tours.Domain.Tours;

namespace Server.Modules.Tours.Infrastructure.Configurations;

public sealed class TourCategoryConfiguration : IEntityTypeConfiguration<TourCategory>
{
    public void Configure(EntityTypeBuilder<TourCategory> builder)
    {
        builder.ToTable("TourCategories");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("TourCategoryId")
            .ValueGeneratedNever();

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(128);

        // Not unique: two categories may share an English name while their
        // Persian names differ, and an empty translation is not a collision.
        builder.Property(x => x.NameEn)
            .HasMaxLength(128);

        builder.HasIndex(x => x.Name).IsUnique();
    }
}
