using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class NewDashboardProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PublicWebCallToActions",
                columns: table => new
                {
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Id = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Locale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Text = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicWebCallToActions", x => x.EntityId);
                });

            migrationBuilder.CreateTable(
                name: "PublicWebContactInfos",
                columns: table => new
                {
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Locale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicWebContactInfos", x => x.EntityId);
                });

            migrationBuilder.CreateTable(
                name: "PublicWebLearnMorePages",
                columns: table => new
                {
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Locale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Heading = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false),
                    PrimaryButtonText = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    PrimaryButtonUrl = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicWebLearnMorePages", x => x.EntityId);
                });

            migrationBuilder.CreateTable(
                name: "PublicWebSections",
                columns: table => new
                {
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Locale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Id = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Tagline = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    Heading = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    PrimaryCtaText = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    PrimaryCtaUrl = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    SecondaryCtaText = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    SecondaryCtaUrl = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicWebSections", x => x.EntityId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PublicWebCallToActions_Locale_Id",
                table: "PublicWebCallToActions",
                columns: new[] { "Locale", "Id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PublicWebContactInfos_Locale",
                table: "PublicWebContactInfos",
                column: "Locale",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PublicWebLearnMorePages_Locale",
                table: "PublicWebLearnMorePages",
                column: "Locale",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PublicWebSections_Locale_Id",
                table: "PublicWebSections",
                columns: new[] { "Locale", "Id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PublicWebCallToActions");

            migrationBuilder.DropTable(
                name: "PublicWebContactInfos");

            migrationBuilder.DropTable(
                name: "PublicWebLearnMorePages");

            migrationBuilder.DropTable(
                name: "PublicWebSections");
        }
    }
}
