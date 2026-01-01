using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHousePriceCurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "Houses",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "USD");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Houses",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Houses");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Houses");
        }
    }
}
