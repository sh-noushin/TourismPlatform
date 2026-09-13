using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UniqueExchangeRateSnapshotIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ExchangeRateSnapshots_BaseCurrencyId_QuoteCurrencyId_CapturedAtUtc",
                table: "ExchangeRateSnapshots");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateSnapshots_BaseCurrencyId_QuoteCurrencyId_CapturedAtUtc",
                table: "ExchangeRateSnapshots",
                columns: new[] { "BaseCurrencyId", "QuoteCurrencyId", "CapturedAtUtc" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ExchangeRateSnapshots_BaseCurrencyId_QuoteCurrencyId_CapturedAtUtc",
                table: "ExchangeRateSnapshots");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateSnapshots_BaseCurrencyId_QuoteCurrencyId_CapturedAtUtc",
                table: "ExchangeRateSnapshots",
                columns: new[] { "BaseCurrencyId", "QuoteCurrencyId", "CapturedAtUtc" });
        }
    }
}
