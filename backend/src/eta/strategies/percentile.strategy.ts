import type { IEtaStrategy } from './eta-strategy.interface.js';

/**
 * Percentile Strategy (Conservative).
 *
 * Uses the P75 (75th percentile) of the last N consultation durations
 * instead of the mean. This intentionally overestimates slightly,
 * producing a "better to underpromise and overdeliver" patient experience.
 */
export class PercentileStrategy implements IEtaStrategy {
  readonly name = 'percentile';

  constructor(
    private readonly windowSize: number = 10,
    private readonly percentile: number = 0.75,
  ) {}

  calculate(
    queuePosition: number,
    durations: number[],
    defaultDuration: number,
  ): number {
    if (queuePosition <= 0) return 0;

    if (durations.length === 0) {
      return Math.round(queuePosition * defaultDuration);
    }

    const recent = durations.slice(-this.windowSize);
    const sorted = [...recent].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * this.percentile) - 1;
    const p75 = sorted[Math.max(0, index)]!;

    return Math.round(queuePosition * p75);
  }
}
