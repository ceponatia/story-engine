/**
 * Error Handling Utilities
 *
 * Provides consistent error handling, logging, and recovery strategies.
 */

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ErrorCategory {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NETWORK = "network",
  DATABASE = "database",
  EXTERNAL_SERVICE = "external_service",
  INTERNAL = "internal",
  RATE_LIMIT = "rate_limit",
  TIMEOUT = "timeout",
}

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
  timestamp?: number;
}

export interface StandardError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: ErrorContext;
  originalError?: Error;
  retryable?: boolean;
  userMessage?: string;
}

export interface ErrorHandlerOptions {
  logErrors: boolean;
  includeStackTrace: boolean;
  maxStackTraceLength: number;
  enableMetrics: boolean;
  sanitizeUserData: boolean;
}

export class ErrorHandler {
  private readonly options: ErrorHandlerOptions;
  private errorCounts: Map<string, number> = new Map();

  constructor(options: Partial<ErrorHandlerOptions> = {}) {
    this.options = {
      logErrors: true,
      includeStackTrace: false,
      maxStackTraceLength: 1000,
      enableMetrics: true,
      sanitizeUserData: true,
      ...options,
    };
  }

  /**
   * Handle and standardize an error
   */
  handle(error: Error | StandardError, context?: ErrorContext): StandardError {
    const standardError = this.standardizeError(error, context);

    if (this.options.logErrors) {
      this.logError(standardError);
    }

    if (this.options.enableMetrics) {
      this.trackError(standardError);
    }

    return standardError;
  }

  /**
   * Create a standardized error from various error types
   */
  standardizeError(error: Error | StandardError, context?: ErrorContext): StandardError {
    if (this.isStandardError(error)) {
      return {
        ...error,
        context: { ...error.context, ...context },
        timestamp: context?.timestamp || Date.now(),
      };
    }

    // Handle common error patterns
    if (error.message.includes("timeout")) {
      return this.createStandardError({
        code: "TIMEOUT_ERROR",
        message: "Operation timed out",
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.TIMEOUT,
        context,
        originalError: error,
        retryable: true,
      });
    }

    if (error.message.includes("network") || error.message.includes("fetch")) {
      return this.createStandardError({
        code: "NETWORK_ERROR",
        message: "Network operation failed",
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.NETWORK,
        context,
        originalError: error,
        retryable: true,
      });
    }

    if (error.message.includes("unauthorized") || error.message.includes("401")) {
      return this.createStandardError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.AUTHENTICATION,
        context,
        originalError: error,
        retryable: false,
        userMessage: "Please log in to continue",
      });
    }

    if (error.message.includes("forbidden") || error.message.includes("403")) {
      return this.createStandardError({
        code: "FORBIDDEN",
        message: "Access denied",
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.AUTHORIZATION,
        context,
        originalError: error,
        retryable: false,
        userMessage: "You do not have permission to perform this action",
      });
    }

    // Default error handling
    return this.createStandardError({
      code: "INTERNAL_ERROR",
      message: error.message || "An unexpected error occurred",
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.INTERNAL,
      context,
      originalError: error,
      retryable: false,
    });
  }

  /**
   * Create a new standardized error
   */
  createStandardError(params: {
    code: string;
    message: string;
    severity: ErrorSeverity;
    category: ErrorCategory;
    context?: ErrorContext;
    originalError?: Error;
    retryable?: boolean;
    userMessage?: string;
  }): StandardError {
    return {
      code: params.code,
      message: params.message,
      severity: params.severity,
      category: params.category,
      context: {
        ...params.context,
        timestamp: params.context?.timestamp || Date.now(),
      },
      originalError: params.originalError,
      retryable: params.retryable || false,
      userMessage: params.userMessage,
    };
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(error: StandardError): string {
    if (error.userMessage) {
      return error.userMessage;
    }

    switch (error.category) {
      case ErrorCategory.VALIDATION:
        return "The provided information is invalid. Please check your input and try again.";
      case ErrorCategory.AUTHENTICATION:
        return "Please log in to continue.";
      case ErrorCategory.AUTHORIZATION:
        return "You do not have permission to perform this action.";
      case ErrorCategory.NETWORK:
        return "Network error. Please check your connection and try again.";
      case ErrorCategory.TIMEOUT:
        return "The operation took too long. Please try again.";
      case ErrorCategory.RATE_LIMIT:
        return "Too many requests. Please wait a moment and try again.";
      default:
        return "An unexpected error occurred. Please try again later.";
    }
  }

  /**
   * Check if an error is retryable
   */
  isRetryable(error: StandardError): boolean {
    return error.retryable === true;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  /**
   * Reset error statistics
   */
  resetStats(): void {
    this.errorCounts.clear();
  }

  private isStandardError(error: Error | StandardError): error is StandardError {
    return "code" in error && "severity" in error && "category" in error;
  }

  private logError(error: StandardError): void {
    const logData = {
      code: error.code,
      message: error.message,
      severity: error.severity,
      category: error.category,
      context: this.options.sanitizeUserData ? this.sanitizeContext(error.context) : error.context,
      timestamp: new Date().toISOString(),
    };

    if (this.options.includeStackTrace && error.originalError?.stack) {
      logData["stack"] = error.originalError.stack.slice(0, this.options.maxStackTraceLength);
    }

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error("[CRITICAL]", logData);
        break;
      case ErrorSeverity.HIGH:
        console.error("[HIGH]", logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn("[MEDIUM]", logData);
        break;
      case ErrorSeverity.LOW:
        console.info("[LOW]", logData);
        break;
    }
  }

  private trackError(error: StandardError): void {
    const key = `${error.category}:${error.code}`;
    const current = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, current + 1);
  }

  private sanitizeContext(context?: ErrorContext): ErrorContext | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };

    // Remove sensitive fields
    if (sanitized.metadata) {
      const cleanMetadata = { ...sanitized.metadata };
      delete cleanMetadata["password"];
      delete cleanMetadata["token"];
      delete cleanMetadata["apiKey"];
      delete cleanMetadata["secret"];
      sanitized.metadata = cleanMetadata;
    }

    return sanitized;
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();
