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

        builder.HasIndex(x => x.Name).IsUnique();
    }
}
