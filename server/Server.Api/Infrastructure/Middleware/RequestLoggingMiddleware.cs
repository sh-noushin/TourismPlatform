using System.Diagnostics;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace Server.Api.Infrastructure.Middleware;

public sealed class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        await _next(context);

        stopwatch.Stop();

        var userId = context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";
        var correlationId = CorrelationIdMiddleware.GetCorrelationId(context) ?? "missing";
        var statusCode = context.Response.StatusCode;

        _logger.LogInformation(
            "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs} ms (user {UserId}, correlation {CorrelationId})",
            context.Request.Method,
            context.Request.Path,
            statusCode,
            stopwatch.ElapsedMilliseconds,
            userId,
            correlationId);
    }
}
