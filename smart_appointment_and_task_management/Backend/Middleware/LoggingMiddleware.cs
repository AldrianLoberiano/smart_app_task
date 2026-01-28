using System.Diagnostics;

namespace Backend.Middleware;

/// <summary>
/// Logging middleware for request/response logging
/// Tracks request duration and logs important information
/// </summary>
public class LoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoggingMiddleware> _logger;
    
    public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        
        // Log request
        _logger.LogInformation(
            "HTTP {Method} {Path} started",
            context.Request.Method,
            context.Request.Path
        );
        
        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            
            // Log response
            _logger.LogInformation(
                "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMilliseconds}ms",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                stopwatch.ElapsedMilliseconds
            );
        }
    }
}
