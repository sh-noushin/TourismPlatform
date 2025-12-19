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

        builder.HasIndex(x => new { x.BaseCurrencyId, x.QuoteCurrencyId, x.CapturedAtUtc });
    }
}
