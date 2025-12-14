using Microsoft.Extensions.Logging;

namespace Server.Api.Infrastructure.Middleware;

public sealed class CorrelationIdMiddleware
{
    private const string HeaderName = "X-Correlation-ID";
    private const string ItemsKey = "CorrelationId";

    private readonly RequestDelegate _next;
    private readonly ILogger<CorrelationIdMiddleware> _logger;

    public CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = ResolveCorrelationId(context.Request.Headers);
        context.Items[ItemsKey] = correlationId;
        context.TraceIdentifier = correlationId;
        context.Response.Headers[HeaderName] = correlationId;

        using (_logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = correlationId }))
        {
            await _next(context);
        }
    }

    private static string ResolveCorrelationId(IHeaderDictionary headers)
    {
        if (headers.TryGetValue(HeaderName, out var values))
        {
            var provided = values.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(provided))
            {
                return provided;
            }
        }

        return Guid.NewGuid().ToString();
    }

    public static string? GetCorrelationId(HttpContext context)
    {
        if (context.Items.TryGetValue(ItemsKey, out var value) && value is string id)
        {
            return id;
        }

        return context.TraceIdentifier;
    }
}
