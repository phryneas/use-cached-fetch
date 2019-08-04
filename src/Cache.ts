export type CacheKey = string;

export interface CacheOptions {
  lifetime: number;
}

export interface SubscriptionResult<Item> {
  currentValue: Item;
  unsubscribe: UnsubscribeFn;
}

export type UnsubscribeFn = () => void;

export interface ICache<Item> {
  subscribe(
    cacheKey: CacheKey,
    init: () => Item,
    onUpdate: (item: Item) => void
  ): SubscriptionResult<Item>;
  updateItem(cacheKey: CacheKey, value: Item): void;

  options: CacheOptions;
}

export interface CacheEntry<Item> {
  value: Item;
  subscriptions: Set<Function>;
  validUntil: number;
}

export class Cache<T> implements ICache<T> {
  private _options: CacheOptions;
  private _map: Map<CacheKey, CacheEntry<T>>;
  private nextPurge?: ReturnType<typeof setTimeout>;

  constructor(cacheOptions: CacheOptions) {
    this._map = new Map();
    this._options = cacheOptions;
  }

  subscribe(
    cacheKey: CacheKey,
    init: () => T,
    onUpdate: (item: T) => void
  ): SubscriptionResult<T> {
    if (!this._map.has(cacheKey)) {
      this._map.set(cacheKey, {
        value: init(),
        subscriptions: new Set(),
        validUntil: Number.POSITIVE_INFINITY,
      });
    }

    const cacheEntry = this._map.get(cacheKey)!;
    const subscription = (item: T) => onUpdate(item);
    cacheEntry.subscriptions.add(subscription);

    return {
      currentValue: cacheEntry.value,
      unsubscribe: () => {
        cacheEntry.subscriptions.delete(subscription);
        this.updateValidity(cacheEntry);
      },
    };
  }

  updateItem(cacheKey: CacheKey, value: T) {
    const cacheEntry = this._map.get(cacheKey);
    if (!cacheEntry) {
      throw new Error('item not in cache, will not update');
    }
    cacheEntry.value = value;
    this.updateValidity(cacheEntry);
    cacheEntry.subscriptions.forEach(update => update(cacheEntry.value));
  }

  public set options(value: CacheOptions) {
    this._options = value;
    // TODO: maybe adjust running timers?
  }
  public get options(): CacheOptions {
    return this._options;
  }

  private updateValidity(cacheEntry: CacheEntry<T>) {
    cacheEntry.validUntil =
      cacheEntry.subscriptions.size > 0
        ? Number.POSITIVE_INFINITY
        : Date.now() + this.options.lifetime;
    if (cacheEntry.subscriptions.size === 0) {
      this.rescheduleNextPurge();
    }
  }

  private rescheduleNextPurge() {
    if (this.nextPurge) {
      clearTimeout(this.nextPurge);
      this.nextPurge = undefined;
    }
    const nextPurgeTime = Array.from(this._map.values()).reduce(
      (time, value) => Math.min(value.validUntil, time),
      Number.POSITIVE_INFINITY
    );
    if (nextPurgeTime < Date.now()) {
      this.purgeOutdatedItems();
    } else if (nextPurgeTime !== Number.POSITIVE_INFINITY) {
      this.nextPurge = setTimeout(
        this.purgeOutdatedItems.bind(this),
        nextPurgeTime - Date.now()
      );
    }
  }

  private purgeOutdatedItems() {
    const now = Date.now();
    for (const [cacheKey, item] of Array.from(this._map.entries())) {
      if (item.validUntil < now) {
        this._map.delete(cacheKey);
      }
    }
    this.rescheduleNextPurge();
  }
}
