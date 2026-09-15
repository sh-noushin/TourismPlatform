using System.Diagnostics;
using System.IO;
using Microsoft.Extensions.FileProviders;
using Server.Api.Extensions;
using Server.Api.Infrastructure.Serialization;

var builder = WebApplication.CreateBuilder(args);

if (string.IsNullOrWhiteSpace(builder.Environment.EnvironmentName) &&
    string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")))
{
    builder.Environment.EnvironmentName = Environments.Development;
}

builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Stamp UTC on every DateTime leaving the API. Without it a bare
    // "2026-09-15T17:40:06" is read as local time by every browser, and the
    // exchange table showed navasan's UTC clock face as though it were the
    // reader's own.
    options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
    options.JsonSerializerOptions.Converters.Add(new UtcNullableDateTimeConverter());
});

builder.Services.AddApiCors();
builder.Services.AddOpenApiDocumentation();
builder.Services.AddPersistence(builder.Configuration);

builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

builder.Services.AddMediaServices();
builder.Services.AddPropertiesServices();
builder.Services.AddToursServices();
builder.Services.AddExchangeServices(builder.Configuration);
builder.Services.AddPublicWeb(builder.Configuration);

var app = builder.Build();

// Opening a browser makes no sense inside a container; the official .NET images set this.
var runningInContainer = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";

if (app.Environment.IsDevelopment() && !runningInContainer)
{
    app.Lifetime.ApplicationStarted.Register(() =>
    {
        var baseUrl = app.Urls.FirstOrDefault(u => u.StartsWith("https:"))
                      ?? app.Urls.FirstOrDefault();

        if (!string.IsNullOrEmpty(baseUrl))
        {
            var scalarUrl = baseUrl.TrimEnd('/') + "/scalar";
            try
            {
                Process.Start(new ProcessStartInfo(scalarUrl) { UseShellExecute = true });
            }
            catch
            {
            }
        }
    });
}

await app.MigrateDatabaseAsync();

await app.SeedIdentityAsync();
await app.SeedReferenceDataAsync();
await app.SeedPublicWebAsync();
await app.SeedDemoDataAsync();

app.UseApiDocumentation();

var imagesDirectory = Path.Combine(app.Environment.ContentRootPath, "images");
Directory.CreateDirectory(imagesDirectory);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(imagesDirectory),
    RequestPath = "/images"
});

app.UseApiPipeline();
app.MapControllers();
app.Run();
