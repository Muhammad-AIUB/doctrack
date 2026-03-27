import type { IEtaStrategy } from './eta-strategy.interface.js';

/**
 * Weighted Moving Average (WMA) Strategy.
 *
 * Applies exponentially decaying weights so that more recent consultations
 * have a stronger influence on the ETA estimate.
 *
 * weight_i = decay^(N - i - 1)   // most recent gets weight 1.0
 * weighted_avg = Σ(duration_i × weight_i) / Σ(weight_i)
 */
export class WeightedMovingAverageStrategy implements IEtaStrategy {
  readonly name = 'weighted-moving-average';

  constructor(
    private readonly windowSize: number = 10,
    private readonly decay: number = 0.85,
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
    let weightedSum = 0;
    let weightTotal = 0;

    for (let i = 0; i < recent.length; i++) {
      const weight = Math.pow(this.decay, recent.length - i - 1);
      weightedSum += recent[i]! * weight;
      weightTotal += weight;
    }

    const weightedAvg = weightedSum / weightTotal;
    return Math.round(queuePosition * weightedAvg);
  }
}
