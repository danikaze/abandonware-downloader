export interface QueueOptions<T> {
  consumer(item: T, remaining: number): Promise<void>;
  threads?: number;
}

/**
 * Queue of items to be processed by arbitrary consumers
 */
export class Queue<T = any> {
  protected readonly options: QueueOptions<T>;
  protected readonly items: T[] = [];
  private active: number = 0;
  private running: boolean = true;

  constructor(options?: QueueOptions<T>) {
    this.options = {
      threads: 1,
      ...options,
    };
  }

  /**
   * Add one or more items, which will be processed (`options.threads` at a time) if the queue is running
   */
  public addItems(items: T | T[]): void {
    if (Array.isArray(items)) {
      Array.prototype.push.call(this.items, items);
    } else {
      this.items.push(items);
    }

    this.tryProcess();
  }

  /**
   * Stop the item processing.
   * If there's any item being processed at the moment, they will be finished
   * but no new item will be processed until `start` is called again
   */
  public stop(): void {
    this.running = false;
  }

  /**
   * Restart the item processing (`options.threads` at a time)
   */
  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.tryProcess();
  }

  /**
   * Internal method that manages the number of items being processed at a time.
   * It triggers the `consumer` call.
   */
  protected tryProcess(): void {
    if (!this.running || this.items.length <= 0 || this.active >= this.options.threads) {
      return;
    }

    this.active++;
    const item = this.items.shift();
    this.options
      .consumer(item, this.items.length)
      .finally(() => {
        this.active--;
        this.tryProcess();
      });

    this.tryProcess();
  }
}
