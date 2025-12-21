using Microsoft.AspNetCore.Hosting;
using Server.Api.Extensions;
using System.Diagnostics;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

if (string.IsNullOrWhiteSpace(builder.Environment.EnvironmentName) &&
	string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")))
{
	builder.Environment.EnvironmentName = Environments.Development;
}

builder.Services.AddControllers();
builder.Services.AddApiCors();
builder.Services.AddOpenApiDocumentation();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddMediaServices();
builder.Services.AddPropertiesServices();
builder.Services.AddToursServices();
builder.Services.AddExchangeServices();

var app = builder.Build();

if (app.Environment.IsDevelopment())
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

await app.SeedIdentityAsync();

app.UseApiDocumentation();
app.UseApiPipeline();

app.MapControllers();

app.Run();
