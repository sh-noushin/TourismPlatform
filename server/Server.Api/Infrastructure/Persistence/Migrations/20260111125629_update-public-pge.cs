using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class updatepublicpge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PublicWebCallToActions");

            migrationBuilder.DropTable(
                name: "PublicWebContactInfos");

            migrationBuilder.DropTable(
                name: "PublicWebLearnMorePages");

            migrationBuilder.DropIndex(
                name: "IX_PublicWebSections_Locale_Id",
                table: "PublicWebSections");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "PublicWebSections");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "PublicWebSections");

            migrationBuilder.DropColumn(
                name: "PrimaryCtaText",
                table: "PublicWebSections");

            migrationBuilder.DropColumn(
                name: "PrimaryCtaUrl",
                table: "PublicWebSections");

            migrationBuilder.DropColumn(
                name: "SecondaryCtaText",
                table: "PublicWebSections");

            migrationBuilder.DropColumn(
                name: "SecondaryCtaUrl",
                table: "PublicWebSections");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "PublicWebSections");

            migrationBuilder.DropColumn(
                name: "Tagline",
                table: "PublicWebSections");

            migrationBuilder.RenameColumn(
                name: "Heading",
                table: "PublicWebSections",
                newName: "Header");

            migrationBuilder.RenameColumn(
                name: "Body",
                table: "PublicWebSections",
                newName: "Content");

            migrationBuilder.AddColumn<string>(
                name: "SectionType",
                table: "PublicWebSections",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            // Backfill SectionType for existing rows and remove legacy sections.
            // The module now supports only 3 sections per locale: Tours, Houses, Infos.
            migrationBuilder.Sql(@"
UPDATE s
SET s.SectionType = CASE
    WHEN LOWER(LTRIM(RTRIM(s.Id))) = 'tours' THEN 'Tours'
    WHEN LOWER(LTRIM(RTRIM(s.Id))) = 'houses' THEN 'Houses'
    WHEN LOWER(LTRIM(RTRIM(s.Id))) = 'infos' THEN 'Infos'
    ELSE ''
END
FROM dbo.PublicWebSections AS s;

-- Drop any old/unknown sections so the unique index can be created.
DELETE FROM dbo.PublicWebSections
WHERE SectionType IS NULL OR LTRIM(RTRIM(SectionType)) = '';

-- If duplicates exist (same locale+sectionType), keep the first row.
WITH duplicates AS (
    SELECT EntityId,
           ROW_NUMBER() OVER (PARTITION BY Locale, SectionType ORDER BY EntityId) AS rn
    FROM dbo.PublicWebSections
)
DELETE FROM dbo.PublicWebSections
WHERE EntityId IN (SELECT EntityId FROM duplicates WHERE rn > 1);
");

            migrationBuilder.CreateIndex(
                name: "IX_PublicWebSections_Locale_SectionType",
                table: "PublicWebSections",
                columns: new[] { "Locale", "SectionType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PublicWebSections_Locale_SectionType",
                table: "PublicWebSections");

            migrationBuilder.DropColumn(
                name: "SectionType",
                table: "PublicWebSections");

            migrationBuilder.RenameColumn(
                name: "Header",
                table: "PublicWebSections",
                newName: "Heading");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "PublicWebSections",
                newName: "Body");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "PublicWebSections",
                type: "nvarchar(1024)",
                maxLength: 1024,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "PublicWebSections",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryCtaText",
                table: "PublicWebSections",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryCtaUrl",
                table: "PublicWebSections",
                type: "nvarchar(1024)",
                maxLength: 1024,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryCtaText",
                table: "PublicWebSections",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryCtaUrl",
                table: "PublicWebSections",
                type: "nvarchar(1024)",
                maxLength: 1024,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "PublicWebSections",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Tagline",
                table: "PublicWebSections",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PublicWebCallToActions",
                columns: table => new
                {
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Id = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Locale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false)
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
                    Address = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Locale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false)
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
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Heading = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Locale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    PrimaryButtonText = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    PrimaryButtonUrl = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicWebLearnMorePages", x => x.EntityId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PublicWebSections_Locale_Id",
                table: "PublicWebSections",
                columns: new[] { "Locale", "Id" },
                unique: true);

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
        }
    }
}
