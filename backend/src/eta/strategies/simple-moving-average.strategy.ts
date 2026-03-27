import type { IEtaStrategy } from './eta-strategy.interface.js';

/**
 * Simple Moving Average (SMA) Strategy.
 *
 * ETA = position × average(last N durations)
 *
 * When fewer than N data points exist, blends available data with
 * the chamber's default duration to avoid wild estimates from small samples.
 */
export class SimpleMovingAverageStrategy implements IEtaStrategy {
  readonly name = 'simple-moving-average';

  constructor(private readonly windowSize: number = 10) {}

  calculate(
    queuePosition: number,
    durations: number[],
    defaultDuration: number,
  ): number {
    if (queuePosition <= 0) return 0;

    let avg: number;

    if (durations.length === 0) {
      avg = defaultDuration;
    } else if (durations.length < this.windowSize) {
      // Blend: real data + default fill for missing slots
      const sum = durations.reduce((a, b) => a + b, 0);
      const fillCount = this.windowSize - durations.length;
      avg = (sum + defaultDuration * fillCount) / this.windowSize;
    } else {
      const recent = durations.slice(-this.windowSize);
      avg = recent.reduce((a, b) => a + b, 0) / this.windowSize;
    }

    return Math.round(queuePosition * avg);
  }
}
