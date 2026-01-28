using System.Net;
using System.Text.Json;

namespace Backend.Middleware;

/// <summary>
/// Global error handling middleware
/// Catches all unhandled exceptions and returns consistent error responses
/// </summary>
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    
    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }
    
    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        HttpStatusCode statusCode;
        string message;
        
        switch (exception)
        {
            case KeyNotFoundException:
                statusCode = HttpStatusCode.NotFound;
                message = exception.Message;
                break;
            
            case UnauthorizedAccessException:
                statusCode = HttpStatusCode.Unauthorized;
                message = exception.Message;
                break;
            
            case InvalidOperationException:
                statusCode = HttpStatusCode.BadRequest;
                message = exception.Message;
                break;
            
            case ArgumentException:
                statusCode = HttpStatusCode.BadRequest;
                message = exception.Message;
                break;
            
            default:
                statusCode = HttpStatusCode.InternalServerError;
                message = "An internal server error occurred";
                break;
        }
        
        var response = new
        {
            status = (int)statusCode,
            message,
            timestamp = DateTime.UtcNow
        };
        
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;
        
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        
        return context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}
