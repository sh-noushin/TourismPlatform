using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Tours.Domain.Tours;

namespace Server.Modules.Tours.Infrastructure.Configurations;

public sealed class TourScheduleConfiguration : IEntityTypeConfiguration<TourSchedule>
{
    public void Configure(EntityTypeBuilder<TourSchedule> builder)
    {
        builder.ToTable("TourSchedules");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("TourScheduleId")
            .ValueGeneratedNever();

        builder.Property(x => x.StartAtUtc).IsRequired();
        builder.Property(x => x.EndAtUtc).IsRequired();
        builder.Property(x => x.Capacity).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();

        builder.HasIndex(x => new { x.TourId, x.StartAtUtc });
    }
}
