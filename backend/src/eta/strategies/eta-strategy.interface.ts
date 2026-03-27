/**
 * Strategy interface for ETA calculation.
 * Each implementation represents a different algorithm for estimating
 * patient wait times based on historical consultation durations.
 */
export interface IEtaStrategy {
  readonly name: string;

  /**
   * @param queuePosition  1-based position in the priority-sorted queue
   * @param durations      Last N consultation durations in seconds (oldest → newest)
   * @param defaultDuration Chamber's default consultation duration in seconds
   * @returns Estimated wait time in seconds
   */
  calculate(
    queuePosition: number,
    durations: number[],
    defaultDuration: number,
  ): number;
}
