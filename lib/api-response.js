/**
 * Centralized API response handler with error handling
 * Use this in all API routes for consistent responses
 */

import { apiLogger } from "@/lib/logger";

export class ApiResponse {
  static success(data, statusCode = 200, message = "Success") {
    return {
      success: true,
      message,
      data,
      statusCode,
    };
  }

  static error(message, statusCode = 400, errors = null) {
    return {
      success: false,
      message,
      errors,
      statusCode,
    };
  }

  static validationError(errors) {
    return this.error(
      "Validation failed",
      400,
      Array.isArray(errors) ? errors : [errors],
    );
  }

  static rateLimit(resetTime) {
    return this.error(`Rate limit exceeded. Reset at ${resetTime}`, 429);
  }

  static unauthorized(message = "Unauthorized") {
    return this.error(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return this.error(message, 403);
  }

  static notFound(message = "Not found") {
    return this.error(message, 404);
  }

  static internalError(message = "Internal server error") {
    return this.error(message, 500);
  }
}

/**
 * Wrapper for API routes with error handling
 * Usage: export const POST = withErrorHandler(async (req) => { ... })
 */
export function withErrorHandler(handler) {
  return async (req, context) => {
    const startTime = Date.now();
    const method = req.method;
    const pathname = req.nextUrl?.pathname || "";

    try {
      const response = await handler(req, context);
      const duration = Date.now() - startTime;

      // Log successful request
      apiLogger.logApiRequest(method, pathname, response.status, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      apiLogger.error(`API Error ${method} ${pathname}`, error, {
        duration,
      });

      // Return error response
      const errorResponse = ApiResponse.internalError(
        error?.message || "An error occurred",
      );

      return new Response(JSON.stringify(errorResponse), {
        status: errorResponse.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

/**
 * Helper to create JSON response
 */
export function jsonResponse(data, statusCode = 200) {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
