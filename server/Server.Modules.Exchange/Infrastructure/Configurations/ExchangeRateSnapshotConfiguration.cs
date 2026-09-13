using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Exchange.Domain.Rates;

namespace Server.Modules.Exchange.Infrastructure.Configurations;

public sealed class ExchangeRateSnapshotConfiguration : IEntityTypeConfiguration<ExchangeRateSnapshot>
{
    public void Configure(EntityTypeBuilder<ExchangeRateSnapshot> builder)
    {
        builder.ToTable("ExchangeRateSnapshots");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("ExchangeRateSnapshotId")
            .ValueGeneratedNever();

        builder.Property(x => x.Rate)
            .HasPrecision(18, 8)
            .IsRequired();

        builder.Property(x => x.CapturedAtUtc)
            .IsRequired();

        builder.HasOne(x => x.BaseCurrency)
            .WithMany()
            .HasForeignKey(x => x.BaseCurrencyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.QuoteCurrency)
            .WithMany()
            .HasForeignKey(x => x.QuoteCurrencyId)
            .OnDelete(DeleteBehavior.Restrict);

        // Unique, not merely indexed: a pair can only have one reading for a
        // given capture time. Application-level checks cannot enforce this --
        // two API instances (as during a rolling restart) both pass a
        // check-then-insert and both write. The database has to be the arbiter.
        builder.HasIndex(x => new { x.BaseCurrencyId, x.QuoteCurrencyId, x.CapturedAtUtc })
            .IsUnique();
    }
}
