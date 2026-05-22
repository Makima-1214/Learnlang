/**
 * Centralized logging utility for debugging and monitoring
 * Use this instead of console.log/error for consistency
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Control via environment variable
const LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || "INFO"];

class Logger {
  constructor(namespace = "app") {
    this.namespace = namespace;
  }

  /**
   * Format log message with timestamp and namespace
   */
  format(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const dataStr =
      Object.keys(data).length > 0 ? ` | ${JSON.stringify(data)}` : "";
    return `[${timestamp}] [${this.namespace}] [${level}] ${message}${dataStr}`;
  }

  debug(message, data) {
    if (LOG_LEVEL <= LOG_LEVELS.DEBUG) {
      console.log(this.format("DEBUG", message, data));
    }
  }

  info(message, data) {
    if (LOG_LEVEL <= LOG_LEVELS.INFO) {
      console.log(this.format("INFO", message, data));
    }
  }

  warn(message, data) {
    if (LOG_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(this.format("WARN", message, data));
    }
  }

  error(message, error, data = {}) {
    if (LOG_LEVEL <= LOG_LEVELS.ERROR) {
      const errorData = {
        ...data,
        error: error?.message || String(error),
        stack: error?.stack,
      };
      console.error(this.format("ERROR", message, errorData));
    }
  }

  /**
   * Log API request
   */
  logApiRequest(method, path, statusCode, duration, userId = null) {
    const level = statusCode >= 400 ? "warn" : "info";
    this[level](`API ${method} ${path}`, {
      statusCode,
      durationMs: duration,
      userId,
    });
  }

  /**
   * Log database query
   */
  logDbQuery(operation, model, duration, error = null) {
    const level = error ? "error" : "debug";
    this[level](`DB ${operation} ${model}`, {
      durationMs: duration,
      error: error?.message,
    });
  }

  /**
   * Log Socket.IO event
   */
  logSocketEvent(event, socketId, roomId = null, data = {}) {
    this.info(`Socket ${event}`, {
      socketId,
      roomId,
      ...data,
    });
  }

  /**
   * Log rate limit hit
   */
  logRateLimit(key, limit, resetTime) {
    this.warn("Rate limit exceeded", {
      key,
      limit,
      resetAt: resetTime,
    });
  }

  /**
   * Log validation error
   */
  logValidationError(errors, endpoint = "") {
    this.warn(`Validation error at ${endpoint}`, {
      errors: Array.isArray(errors) ? errors : [errors],
    });
  }
}

// Create singleton loggers for different modules
export const appLogger = new Logger("app");
export const apiLogger = new Logger("api");
export const dbLogger = new Logger("db");
export const socketLogger = new Logger("socket");
export const authLogger = new Logger("auth");

// Export for custom namespaces
export function getLogger(namespace) {
  return new Logger(namespace);
}
