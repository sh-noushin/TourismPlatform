using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Server.Api.Infrastructure.Identity;
using Server.Api.Infrastructure.Middleware;
using Server.Api.Infrastructure.Persistence;
using Server.Api.Services;
using Server.Modules.PublicWeb.Infrastructure;

namespace Server.Api.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication UseApiDocumentation(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
            app.MapScalarApiReference();
        }

        return app;
    }

    public static WebApplication UseApiPipeline(this WebApplication app)
    {
        app.UseMiddleware<CorrelationIdMiddleware>();
        app.UseMiddleware<GlobalExceptionMiddleware>();

        app.UseHttpsRedirection();

        app.UseCors();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseMiddleware<RequestLoggingMiddleware>();

        app.UseMiddleware<SecurityHeadersMiddleware>();

        return app;
    }

    /// <summary>
    /// Applies pending EF migrations when <c>Database:AutoMigrate</c> is enabled.
    /// Off by default, so running locally still goes through `dotnet ef database update`;
    /// docker-compose turns it on because the seeders below need the schema to exist and
    /// there is no separate migration step in the container.
    /// </summary>
    public static async Task MigrateDatabaseAsync(this WebApplication app)
    {
        if (!app.Configuration.GetValue<bool>("Database:AutoMigrate"))
        {
            return;
        }

        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        // SQL Server in a sibling container can still be refusing connections after it
        // reports healthy, so retry rather than crash-looping the API.
        const int maxAttempts = 10;
        var delay = TimeSpan.FromSeconds(5);

        for (var attempt = 1; ; attempt++)
        {
            try
            {
                await dbContext.Database.MigrateAsync();
                logger.LogInformation("Database migrations applied.");
                return;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                logger.LogWarning(
                    ex,
                    "Migration attempt {Attempt}/{MaxAttempts} failed; retrying in {Delay}s.",
                    attempt,
                    maxAttempts,
                    delay.TotalSeconds);

                await Task.Delay(delay);
            }
        }
    }

    public static async Task SeedIdentityAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var seeder = scope.ServiceProvider.GetRequiredService<IdentitySeeder>();
        await seeder.SeedAsync();
    }

    public static async Task SeedReferenceDataAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var seeder = scope.ServiceProvider.GetRequiredService<ReferenceDataSeeder>();
        await seeder.SeedAsync();
    }

    public static async Task SeedPublicWebAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var seeder = scope.ServiceProvider.GetRequiredService<PublicWebSeeder>();
        await seeder.SeedAsync();
    }
}
