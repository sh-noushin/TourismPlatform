using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Media.Domain;

namespace Server.Modules.Media.Infrastructure.Configurations;

public sealed class PhotoConfiguration : IEntityTypeConfiguration<Photo>
{
    public void Configure(EntityTypeBuilder<Photo> builder)
    {
        builder.ToTable("Photos");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Id)
                .HasColumnName("PhotoId")
                .ValueGeneratedNever();

        builder.Property(p => p.UuidFileName)
            .IsRequired()
            .HasMaxLength(128);

        builder.HasIndex(p => p.UuidFileName)
            .IsUnique();

        builder.Property(p => p.PermanentRelativePath)
            .IsRequired()
            .HasMaxLength(512);

        builder.Property(p => p.ContentType)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(p => p.FileSize).IsRequired();
        builder.Property(p => p.CreatedAtUtc).IsRequired();
            builder.Property(p => p.UploadedByUserId)
                .IsRequired(false);
        builder.Property(p => p.OriginalFileName)
            .HasMaxLength(256);
    }
}
