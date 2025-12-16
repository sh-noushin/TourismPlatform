using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Properties.Domain;

namespace Server.Modules.Properties.Infrastructure.Configurations;

public sealed class HousePhotoConfiguration : IEntityTypeConfiguration<HousePhoto>
{
    public void Configure(EntityTypeBuilder<HousePhoto> builder)
    {
        builder.ToTable("HousePhotos");

        builder.HasKey(x => new { x.HouseId, x.PhotoId });

        builder.Property(x => x.Label)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.SortOrder).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasIndex(x => new { x.HouseId, x.SortOrder });
    }
}
