using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Tours.Domain.Tours;

namespace Server.Modules.Tours.Infrastructure.Configurations;

public sealed class TourPhotoConfiguration : IEntityTypeConfiguration<TourPhoto>
{
    public void Configure(EntityTypeBuilder<TourPhoto> builder)
    {
        builder.ToTable("TourPhotos");

        builder.HasKey(x => new { x.TourId, x.PhotoId });

        builder.Property(x => x.Label)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.SortOrder).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasIndex(x => new { x.TourId, x.SortOrder });
    }
}
