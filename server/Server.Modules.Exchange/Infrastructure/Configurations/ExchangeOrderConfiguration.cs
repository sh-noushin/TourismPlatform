using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Exchange.Domain.Orders;

namespace Server.Modules.Exchange.Infrastructure.Configurations;

public sealed class ExchangeOrderConfiguration : IEntityTypeConfiguration<ExchangeOrder>
{
    public void Configure(EntityTypeBuilder<ExchangeOrder> builder)
    {
        builder.ToTable("ExchangeOrders");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("ExchangeOrderId")
            .ValueGeneratedNever();

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.BaseAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Rate)
            .HasPrecision(18, 8)
            .IsRequired();

        builder.Property(x => x.QuoteAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();

        builder.HasOne(x => x.BaseCurrency)
            .WithMany()
            .HasForeignKey(x => x.BaseCurrencyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.QuoteCurrency)
            .WithMany()
            .HasForeignKey(x => x.QuoteCurrencyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.CreatedAtUtc);
    }
}
