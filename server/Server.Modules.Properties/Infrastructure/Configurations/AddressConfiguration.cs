using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Server.Modules.Properties.Domain.Houses;

namespace Server.Modules.Properties.Infrastructure.Configurations;

public sealed class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.ToTable("Addresses");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("AddressId")
            .ValueGeneratedNever();

        builder.Property(x => x.Line1)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.Line2)
            .HasMaxLength(256);

        builder.Property(x => x.PostalCode)
            .HasMaxLength(32);

        builder.HasOne(x => x.Location)
            .WithMany()
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.LocationId, x.Line1, x.Line2, x.PostalCode })
            .IsUnique();
    }
}
