/**
 * Fallback Manager
 *
 * Provides fallback strategies and graceful degradation when services fail.
 */

export enum FallbackStrategy {
  CACHE = "cache",
  DEFAULT_VALUE = "default_value",
  ALTERNATIVE_SERVICE = "alternative_service",
  QUEUE_FOR_RETRY = "queue_for_retry",
  FAIL_FAST = "fail_fast",
  SILENT_FAIL = "silent_fail",
}

export interface FallbackOptions<T> {
  strategy: FallbackStrategy;
  cacheKey?: string;
  cacheTTL?: number;
  defaultValue?: T;
  alternativeOperation?: () => Promise<T>;
  retryQueue?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeoutMs?: number;
}

export interface FallbackResult<T> {
  success: boolean;
  value?: T;
  usedFallback: boolean;
  fallbackStrategy?: FallbackStrategy;
  error?: Error;
  metadata?: Record<string, unknown>;
}

export class FallbackManager {
  private cache: Map<string, { value: unknown; expiry: number }> = new Map();
  private retryQueue: Map<
    string,
    { operation: () => Promise<unknown>; attempts: number; nextRetry: number }
  > = new Map();
  private defaultCacheTTL: number = 300000; // 5 minutes

  /**
   * Execute an operation with fallback strategies
   */
  async executeWithFallback<T>(
    operation: () => Promise<T>,
    options: FallbackOptions<T>
  ): Promise<FallbackResult<T>> {
    try {
      // Try the primary operation first
      const result = await this.executeWithTimeout(operation, options.timeoutMs || 5000);

      // Cache successful results if cache strategy is enabled
      if (options.strategy === FallbackStrategy.CACHE && options.cacheKey) {
        this.setCache(options.cacheKey, result, options.cacheTTL);
      }

      return {
        success: true,
        value: result,
        usedFallback: false,
      };
    } catch (error) {
      // Primary operation failed, apply fallback strategy
      return this.applyFallbackStrategy(operation, options, error as Error);
    }
  }

  /**
   * Apply the specified fallback strategy
   */
  private async applyFallbackStrategy<T>(
    operation: () => Promise<T>,
    options: FallbackOptions<T>,
    error: Error
  ): Promise<FallbackResult<T>> {
    switch (options.strategy) {
      case FallbackStrategy.CACHE:
        return this.applyCacheFallback(options, error);

      case FallbackStrategy.DEFAULT_VALUE:
        return this.applyDefaultValueFallback(options, error);

      case FallbackStrategy.ALTERNATIVE_SERVICE:
        return this.applyAlternativeServiceFallback(options, error);

      case FallbackStrategy.QUEUE_FOR_RETRY:
        return this.applyQueueForRetryFallback(operation, options, error);

      case FallbackStrategy.FAIL_FAST:
        return this.applyFailFastFallback(error);

      case FallbackStrategy.SILENT_FAIL:
        return this.applySilentFailFallback(error);

      default:
        return {
          success: false,
          usedFallback: false,
          error,
        };
    }
  }

  /**
   * Try to get value from cache
   */
  private async applyCacheFallback<T>(
    options: FallbackOptions<T>,
    error: Error
  ): Promise<FallbackResult<T>> {
    if (options.cacheKey) {
      const cached = this.getCache<T>(options.cacheKey);
      if (cached !== null) {
        return {
          success: true,
          value: cached,
          usedFallback: true,
          fallbackStrategy: FallbackStrategy.CACHE,
          metadata: { originalError: error.message },
        };
      }
    }

    // If no cache available, fall back to default value if provided
    if (options.defaultValue !== undefined) {
      return this.applyDefaultValueFallback(options, error);
    }

    return {
      success: false,
      usedFallback: true,
      fallbackStrategy: FallbackStrategy.CACHE,
      error,
    };
  }

  /**
   * Return a default value
   */
  private async applyDefaultValueFallback<T>(
    options: FallbackOptions<T>,
    error: Error
  ): Promise<FallbackResult<T>> {
    if (options.defaultValue !== undefined) {
      return {
        success: true,
        value: options.defaultValue,
        usedFallback: true,
        fallbackStrategy: FallbackStrategy.DEFAULT_VALUE,
        metadata: { originalError: error.message },
      };
    }

    return {
      success: false,
      usedFallback: true,
      fallbackStrategy: FallbackStrategy.DEFAULT_VALUE,
      error,
    };
  }

  /**
   * Try alternative service/operation
   */
  private async applyAlternativeServiceFallback<T>(
    options: FallbackOptions<T>,
    error: Error
  ): Promise<FallbackResult<T>> {
    if (options.alternativeOperation) {
      try {
        const result = await this.executeWithTimeout(
          options.alternativeOperation,
          options.timeoutMs || 5000
        );
        return {
          success: true,
          value: result,
          usedFallback: true,
          fallbackStrategy: FallbackStrategy.ALTERNATIVE_SERVICE,
          metadata: { originalError: error.message },
        };
      } catch (altError) {
        return {
          success: false,
          usedFallback: true,
          fallbackStrategy: FallbackStrategy.ALTERNATIVE_SERVICE,
          error: altError as Error,
          metadata: { originalError: error.message },
        };
      }
    }

    return {
      success: false,
      usedFallback: true,
      fallbackStrategy: FallbackStrategy.ALTERNATIVE_SERVICE,
      error,
    };
  }

  /**
   * Queue operation for retry
   */
  private async applyQueueForRetryFallback<T>(
    operation: () => Promise<T>,
    options: FallbackOptions<T>,
    error: Error
  ): Promise<FallbackResult<T>> {
    if (options.retryQueue && options.cacheKey) {
      const maxRetries = options.maxRetries || 3;
      const retryDelay = options.retryDelay || 1000;

      const existing = this.retryQueue.get(options.cacheKey);
      const attempts = existing ? existing.attempts + 1 : 1;

      if (attempts <= maxRetries) {
        this.retryQueue.set(options.cacheKey, {
          operation,
          attempts,
          nextRetry: Date.now() + retryDelay * Math.pow(2, attempts - 1), // Exponential backoff
        });
      }

      // Return default value or cached value while queued for retry
      if (options.defaultValue !== undefined) {
        return {
          success: true,
          value: options.defaultValue,
          usedFallback: true,
          fallbackStrategy: FallbackStrategy.QUEUE_FOR_RETRY,
          metadata: {
            originalError: error.message,
            queuedForRetry: true,
            attempts,
          },
        };
      }
    }

    return {
      success: false,
      usedFallback: true,
      fallbackStrategy: FallbackStrategy.QUEUE_FOR_RETRY,
      error,
    };
  }

  /**
   * Fail immediately without attempting recovery
   */
  private async applyFailFastFallback<T>(error: Error): Promise<FallbackResult<T>> {
    return {
      success: false,
      usedFallback: true,
      fallbackStrategy: FallbackStrategy.FAIL_FAST,
      error,
    };
  }

  /**
   * Fail silently and return undefined
   */
  private async applySilentFailFallback<T>(error: Error): Promise<FallbackResult<T>> {
    return {
      success: true,
      value: undefined,
      usedFallback: true,
      fallbackStrategy: FallbackStrategy.SILENT_FAIL,
      metadata: { originalError: error.message },
    };
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      operation()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Process retry queue
   */
  async processRetryQueue(): Promise<void> {
    const now = Date.now();
    const toRetry: Array<
      [string, { operation: () => Promise<unknown>; attempts: number; nextRetry: number }]
    > = [];

    for (const [key, item] of this.retryQueue) {
      if (now >= item.nextRetry) {
        toRetry.push([key, item]);
      }
    }

    for (const [key, item] of toRetry) {
      try {
        const result = await item.operation();
        // Success - remove from queue and cache result
        this.retryQueue.delete(key);
        this.setCache(key, result);
      } catch (error) {
        // Still failing - will be handled on next processRetryQueue call
        console.warn(`Retry failed for ${key}:`, error);
      }
    }
  }

  /**
   * Set cache value
   */
  private setCache<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultCacheTTL;
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  /**
   * Get cache value
   */
  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  /**
   * Clear cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get retry queue status
   */
  getRetryQueueStatus(): Array<{ key: string; attempts: number; nextRetry: number }> {
    return Array.from(this.retryQueue.entries()).map(([key, item]) => ({
      key,
      attempts: item.attempts,
      nextRetry: item.nextRetry,
    }));
  }

  /**
   * Clear retry queue
   */
  clearRetryQueue(key?: string): void {
    if (key) {
      this.retryQueue.delete(key);
    } else {
      this.retryQueue.clear();
    }
  }
}

// Global fallback manager instance
export const fallbackManager = new FallbackManager();
