using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Media.Domain.Uploads;

namespace Server.Modules.Media.Infrastructure.Configurations;

public sealed class StagedUploadConfiguration : IEntityTypeConfiguration<StagedUpload>
{
    public void Configure(EntityTypeBuilder<StagedUpload> builder)
    {
        builder.ToTable("StagedUploads");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("StagedUploadId")
            .ValueGeneratedNever();

        builder.Property(s => s.TargetType)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(s => s.TempRelativePath)
            .IsRequired()
            .HasMaxLength(512);

        builder.Property(s => s.UuidFileName)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(s => s.Extension)
            .IsRequired()
            .HasMaxLength(16);

        builder.Property(s => s.ContentType)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(s => s.FileSize).IsRequired();
        builder.Property(s => s.CreatedAtUtc).IsRequired();
        builder.Property(s => s.ExpiresAtUtc).IsRequired();
        builder.Property(s => s.UploadedByUserId)
            .IsRequired(false);
    }
}
