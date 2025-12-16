using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Properties.Domain.Houses;

namespace Server.Api.Infrastructure.Persistence.Configurations;

public sealed class HousePhotoToPhotoConfiguration : IEntityTypeConfiguration<HousePhoto>
{
    public void Configure(EntityTypeBuilder<HousePhoto> builder)
    {
        builder.HasOne<Photo>()
            .WithMany()
            .HasForeignKey(x => x.PhotoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
