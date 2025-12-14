using Server.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddApiCors();
builder.Services.AddOpenApiDocumentation();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

var app = builder.Build();

await app.SeedIdentityAsync();

app.UseApiDocumentation();
app.UseApiPipeline();

app.MapControllers();

app.Run();
