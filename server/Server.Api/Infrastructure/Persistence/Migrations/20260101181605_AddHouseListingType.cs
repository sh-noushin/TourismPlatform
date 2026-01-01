using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHouseListingType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ListingType",
                table: "Houses",
                type: "int",
                nullable: false,
                defaultValue: 2);

            migrationBuilder.CreateIndex(
                name: "IX_Houses_ListingType",
                table: "Houses",
                column: "ListingType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Houses_ListingType",
                table: "Houses");

            migrationBuilder.DropColumn(
                name: "ListingType",
                table: "Houses");
        }
    }
}
