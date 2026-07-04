import type { AnimationCategory } from '@shared/types'
import type { AnimationManager } from './AnimationManager'

export interface QueueItem {
  category: AnimationCategory
  clip?: string
  /** 'once' plays through and ends on the last frame; 'timed' loops for a duration. */
  mode: 'once' | 'timed'
  /** For 'timed' items: how long to loop before completing. */
  durationMs?: number
  /** For items whose category has no PNGs yet: how long the placeholder "plays". */
  placeholderMs?: number
  /** Called when this item finishes (not called if the queue is cleared). */
  onComplete?: () => void
}

/**
 * Serialises animation playback so clips never overlap.
 *
 * Only one item is active at a time; further requests wait in FIFO order. Items
 * complete either when their one-shot animation ends, when their timed duration
 * elapses, or — when a category has no PNGs — after a short placeholder delay so
 * the behaviour cycle keeps running even before any art exists.
 */
export class AnimationQueue {
  private readonly items: QueueItem[] = []
  private active: QueueItem | null = null
  private timer: ReturnType<typeof setTimeout> | null = null

  /** Fired whenever the queue becomes empty (no active item, none pending). */
  onDrained: (() => void) | null = null

  constructor(
    private readonly manager: AnimationManager,
    private readonly placeholderDefaultMs = 1600
  ) {}

  enqueue(item: QueueItem): void {
    this.items.push(item)
    if (!this.active) void this.processNext()
  }

  /** Cancel the active item and drop all pending items (no onComplete fired). */
  clear(): void {
    this.items.length = 0
    this.clearTimer()
    this.active = null
  }

  get isBusy(): boolean {
    return this.active !== null
  }

  get length(): number {
    return this.items.length + (this.active ? 1 : 0)
  }

  get activeItem(): QueueItem | null {
    return this.active
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private async processNext(): Promise<void> {
    const item = this.items.shift()
    if (!item) {
      this.active = null
      this.onDrained?.()
      return
    }

    this.active = item
    const started = await this.manager.play(item.category, {
      clip: item.clip,
      loop: item.mode === 'timed',
      onEnd: item.mode === 'once' ? () => this.complete(item) : undefined
    })

    // Guard against a clear() that happened while play() was awaiting.
    if (this.active !== item) return

    if (!started) {
      // No frames for this category. Keep the idle animation on screen (so the
      // character stays visible) and hold briefly before returning to idle.
      this.manager.playFallbackIdle()
      this.timer = setTimeout(
        () => this.complete(item),
        item.placeholderMs ?? this.placeholderDefaultMs
      )
      return
    }

    if (item.mode === 'timed') {
      this.timer = setTimeout(() => this.complete(item), item.durationMs ?? 6000)
    }
  }

  /** Complete `item` if it is still the active one (ignores stale callbacks). */
  private complete(item: QueueItem): void {
    if (this.active !== item) return
    this.clearTimer()
    this.active = null
    item.onComplete?.()
    void this.processNext()
  }
}
