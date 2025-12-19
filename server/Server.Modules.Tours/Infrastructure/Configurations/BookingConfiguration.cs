using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Tours.Domain.Tours;

namespace Server.Modules.Tours.Infrastructure.Configurations;

public sealed class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("TourBookings");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("BookingId")
            .ValueGeneratedNever();

        builder.Property(x => x.UserId).IsRequired();
        builder.Property(x => x.Seats).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasOne(x => x.TourSchedule)
            .WithMany()
            .HasForeignKey(x => x.TourScheduleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Tour)
            .WithMany()
            .HasForeignKey(x => x.TourId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TourScheduleId, x.UserId });
    }
}
