/**
 * Metrics Collection System
 *
 * Collects and manages application metrics including counters, timers, gauges, and histograms.
 */

export interface MetricValue {
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface CounterMetric extends MetricValue {
  type: "counter";
}

export interface GaugeMetric extends MetricValue {
  type: "gauge";
}

export interface TimerMetric extends MetricValue {
  type: "timer";
  duration: number;
}

export interface HistogramMetric extends MetricValue {
  type: "histogram";
  buckets: number[];
}

export type Metric = CounterMetric | GaugeMetric | TimerMetric | HistogramMetric;

export interface MetricsSnapshot {
  timestamp: number;
  counters: Record<string, number>;
  gauges: Record<string, number>;
  timers: Record<string, { count: number; sum: number; avg: number; min: number; max: number }>;
  histograms: Record<string, { count: number; buckets: Record<string, number> }>;
}

export class MetricsCollector {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private timers: Map<string, number[]> = new Map();
  private histograms: Map<string, { buckets: number[]; values: number[] }> = new Map();
  private tags: Map<string, Record<string, string>> = new Map();

  /**
   * Increment a counter metric
   */
  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);

    if (tags) {
      this.tags.set(name, { ...this.tags.get(name), ...tags });
    }
  }

  /**
   * Decrement a counter metric
   */
  decrement(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.increment(name, -value, tags);
  }

  /**
   * Set a gauge metric to a specific value
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.gauges.set(name, value);

    if (tags) {
      this.tags.set(name, { ...this.tags.get(name), ...tags });
    }
  }

  /**
   * Record a timing measurement
   */
  timing(name: string, duration: number, tags?: Record<string, string>): void {
    const timings = this.timers.get(name) || [];
    timings.push(duration);
    this.timers.set(name, timings);

    if (tags) {
      this.tags.set(name, { ...this.tags.get(name), ...tags });
    }
  }

  /**
   * Record a histogram value
   */
  histogram(
    name: string,
    value: number,
    buckets: number[] = [1, 5, 10, 50, 100, 500, 1000],
    tags?: Record<string, string>
  ): void {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, { buckets, values: [] });
    }

    const histogram = this.histograms.get(name)!;
    histogram.values.push(value);

    if (tags) {
      this.tags.set(name, { ...this.tags.get(name), ...tags });
    }
  }

  /**
   * Time a function execution
   */
  time<T>(name: string, fn: () => T, tags?: Record<string, string>): T;
  time<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T>;
  time<T>(name: string, fn: () => T | Promise<T>, tags?: Record<string, string>): T | Promise<T> {
    const start = Date.now();

    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = Date.now() - start;
        this.timing(name, duration, tags);
      });
    } else {
      const duration = Date.now() - start;
      this.timing(name, duration, tags);
      return result;
    }
  }

  /**
   * Get current counter value
   */
  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  /**
   * Get current gauge value
   */
  getGauge(name: string): number | undefined {
    return this.gauges.get(name);
  }

  /**
   * Get timer statistics
   */
  getTimerStats(
    name: string
  ): { count: number; sum: number; avg: number; min: number; max: number } | undefined {
    const timings = this.timers.get(name);
    if (!timings || timings.length === 0) {
      return undefined;
    }

    const sum = timings.reduce((a, b) => a + b, 0);
    const avg = sum / timings.length;
    const min = Math.min(...timings);
    const max = Math.max(...timings);

    return { count: timings.length, sum, avg, min, max };
  }

  /**
   * Get histogram statistics
   */
  getHistogramStats(name: string): { count: number; buckets: Record<string, number> } | undefined {
    const histogram = this.histograms.get(name);
    if (!histogram || histogram.values.length === 0) {
      return undefined;
    }

    const buckets: Record<string, number> = {};

    for (const bucket of histogram.buckets) {
      const count = histogram.values.filter((value) => value <= bucket).length;
      buckets[`le_${bucket}`] = count;
    }

    // Add infinity bucket
    buckets["le_inf"] = histogram.values.length;

    return { count: histogram.values.length, buckets };
  }

  /**
   * Get a snapshot of all metrics
   */
  getSnapshot(): MetricsSnapshot {
    const snapshot: MetricsSnapshot = {
      timestamp: Date.now(),
      counters: {},
      gauges: {},
      timers: {},
      histograms: {},
    };

    // Counters
    for (const [name, value] of this.counters) {
      snapshot.counters[name] = value;
    }

    // Gauges
    for (const [name, value] of this.gauges) {
      snapshot.gauges[name] = value;
    }

    // Timers
    for (const [name] of this.timers) {
      const stats = this.getTimerStats(name);
      if (stats) {
        snapshot.timers[name] = stats;
      }
    }

    // Histograms
    for (const [name] of this.histograms) {
      const stats = this.getHistogramStats(name);
      if (stats) {
        snapshot.histograms[name] = stats;
      }
    }

    return snapshot;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.timers.clear();
    this.histograms.clear();
    this.tags.clear();
  }

  /**
   * Reset specific metric
   */
  resetMetric(name: string): void {
    this.counters.delete(name);
    this.gauges.delete(name);
    this.timers.delete(name);
    this.histograms.delete(name);
    this.tags.delete(name);
  }
}

// Global metrics collector instance
export const metrics = new MetricsCollector();
