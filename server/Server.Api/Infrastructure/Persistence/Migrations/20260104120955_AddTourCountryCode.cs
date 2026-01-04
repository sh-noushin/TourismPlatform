using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTourCountryCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CountryCode",
                table: "Tours",
                type: "nvarchar(2)",
                maxLength: 2,
                nullable: false,
                defaultValue: "US");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CountryCode",
                table: "Tours");
        }
    }
}
