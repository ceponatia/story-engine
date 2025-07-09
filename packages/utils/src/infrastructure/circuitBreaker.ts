/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures by monitoring failures and temporarily stopping
 * requests to failing services, allowing them time to recover.
 */

export enum CircuitState {
  CLOSED = "closed", // Normal operation
  OPEN = "open", // Failing, rejecting requests
  HALF_OPEN = "half_open", // Testing recovery
}

export interface CircuitBreakerOptions {
  timeout: number; // Request timeout in ms
  errorThreshold: number; // Number of failures before opening circuit
  resetTimeout: number; // Time to wait before trying again in ms
  monitoringPeriod: number; // Time window to track failures in ms
  volumeThreshold: number; // Minimum requests needed before triggering
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number | null;
  nextAttemptTime: number | null;
  totalRequests: number;
  totalFailures: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number | null = null;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private readonly options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      timeout: 5000,
      errorThreshold: 5,
      resetTimeout: 60000,
      monitoringPeriod: 60000,
      volumeThreshold: 10,
      ...options,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error("Circuit breaker is OPEN - operation rejected");
      }
    }

    this.totalRequests++;

    try {
      const result = await this.executeWithTimeout(operation);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.options.timeout}ms`));
      }, this.options.timeout);

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

  private onSuccess(): void {
    this.failureCount = 0;
    this.successCount++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.nextAttemptTime = null;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.totalFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.options.resetTimeout;
    } else if (
      this.state === CircuitState.CLOSED &&
      this.failureCount >= this.options.errorThreshold &&
      this.totalRequests >= this.options.volumeThreshold
    ) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.options.resetTimeout;
    }
  }

  private shouldAttemptReset(): boolean {
    return this.nextAttemptTime !== null && Date.now() >= this.nextAttemptTime;
  }

  public getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
    };
  }

  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  public forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.options.resetTimeout;
  }

  public forceClose(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.nextAttemptTime = null;
  }
}
