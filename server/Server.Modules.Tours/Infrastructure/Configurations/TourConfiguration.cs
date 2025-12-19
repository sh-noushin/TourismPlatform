using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Tours.Domain.Tours;

namespace Server.Modules.Tours.Infrastructure.Configurations;

public sealed class TourConfiguration : IEntityTypeConfiguration<Tour>
{
    public void Configure(EntityTypeBuilder<Tour> builder)
    {
        builder.ToTable("Tours");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("TourId")
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

        builder.HasOne(x => x.TourCategory)
            .WithMany()
            .HasForeignKey(x => x.TourCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Schedules)
            .WithOne(x => x.Tour)
            .HasForeignKey(x => x.TourId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Photos)
            .WithOne(x => x.Tour)
            .HasForeignKey(x => x.TourId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Bookings)
            .WithOne(x => x.Tour)
            .HasForeignKey(x => x.TourId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.Name);
    }
}
