using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemovePublicSectionLocale : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PublicWebSections_Locale_SectionType",
                table: "PublicWebSections");

            // Collapse per-locale duplicates before dropping the Locale column.
            // After this migration, SectionType and Id must be globally unique.
            migrationBuilder.Sql(@"
-- Keep a single row per SectionType, preferring 'fa' then 'en', then oldest EntityId.
WITH sectionTypeDuplicates AS (
    SELECT EntityId,
           ROW_NUMBER() OVER (
               PARTITION BY SectionType
               ORDER BY CASE
                   WHEN LOWER(LTRIM(RTRIM(Locale))) = 'fa' THEN 0
                   WHEN LOWER(LTRIM(RTRIM(Locale))) = 'en' THEN 1
                   ELSE 2
               END,
               EntityId
           ) AS rn
    FROM dbo.PublicWebSections
)
DELETE FROM dbo.PublicWebSections
WHERE EntityId IN (SELECT EntityId FROM sectionTypeDuplicates WHERE rn > 1);

-- Defensive: keep a single row per Id as well.
WITH idDuplicates AS (
    SELECT EntityId,
           ROW_NUMBER() OVER (
               PARTITION BY Id
               ORDER BY CASE
                   WHEN LOWER(LTRIM(RTRIM(Locale))) = 'fa' THEN 0
                   WHEN LOWER(LTRIM(RTRIM(Locale))) = 'en' THEN 1
                   ELSE 2
               END,
               EntityId
           ) AS rn
    FROM dbo.PublicWebSections
)
DELETE FROM dbo.PublicWebSections
WHERE EntityId IN (SELECT EntityId FROM idDuplicates WHERE rn > 1);
");

            migrationBuilder.DropColumn(
                name: "Locale",
                table: "PublicWebSections");

            migrationBuilder.CreateIndex(
                name: "IX_PublicWebSections_Id",
                table: "PublicWebSections",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PublicWebSections_SectionType",
                table: "PublicWebSections",
                column: "SectionType",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PublicWebSections_Id",
                table: "PublicWebSections");

            migrationBuilder.DropIndex(
                name: "IX_PublicWebSections_SectionType",
                table: "PublicWebSections");

            migrationBuilder.AddColumn<string>(
                name: "Locale",
                table: "PublicWebSections",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_PublicWebSections_Locale_SectionType",
                table: "PublicWebSections",
                columns: new[] { "Locale", "SectionType" },
                unique: true);
        }
    }
}
