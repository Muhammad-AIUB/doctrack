/**
 * Generic Min-Heap implementation.
 *
 * The comparator returns a negative number if a < b (a has higher priority),
 * zero if equal, positive if a > b. Default: numeric ascending.
 */
export class MinHeap<T> {
  private heap: T[] = [];
  private readonly comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  get size(): number {
    return this.heap.length;
  }

  peek(): T | null {
    return this.heap[0] ?? null;
  }

  insert(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): T | null {
    if (this.heap.length === 0) return null;
    const min = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return min;
  }

  /**
   * Remove a specific element by predicate. O(n) scan + O(log n) heapify.
   * Returns true if the element was found and removed.
   */
  remove(predicate: (value: T) => boolean): boolean {
    const index = this.heap.findIndex(predicate);
    if (index === -1) return false;

    if (index === this.heap.length - 1) {
      this.heap.pop();
      return true;
    }

    const last = this.heap.pop()!;
    this.heap[index] = last;

    // Try both directions — the replacement could be smaller or larger
    this.bubbleUp(index);
    this.sinkDown(index);
    return true;
  }

  /**
   * Returns all elements as a sorted array (drains a copy of the heap).
   * Does NOT mutate the original heap.
   */
  toSortedArray(): T[] {
    const copy = new MinHeap<T>(this.comparator);
    copy.heap = [...this.heap];
    const result: T[] = [];
    while (copy.size > 0) {
      result.push(copy.extractMin()!);
    }
    return result;
  }

  /**
   * Rebuild from an array of items. O(n) heapify.
   */
  static fromArray<T>(items: T[], comparator: (a: T, b: T) => number): MinHeap<T> {
    const heap = new MinHeap<T>(comparator);
    heap.heap = [...items];
    // Floyd's algorithm — heapify from the last parent down to root
    for (let i = Math.floor(heap.heap.length / 2) - 1; i >= 0; i--) {
      heap.sinkDown(i);
    }
    return heap;
  }

  clear(): void {
    this.heap = [];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.comparator(this.heap[index]!, this.heap[parentIndex]!) >= 0) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex]!, this.heap[index]!];
      index = parentIndex;
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.comparator(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left;
      }
      if (right < length && this.comparator(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right;
      }

      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest]!, this.heap[index]!];
      index = smallest;
    }
  }
}
