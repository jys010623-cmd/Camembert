import type { PetState } from '@shared/types'
import { RANDOM_ACTION } from '@renderer/config/animationConfig'

export interface RandomActionOptions {
  minDelayMs?: number
  maxDelayMs?: number
  /** Pool of states the pet may spontaneously transition into. */
  actions?: PetState[]
}

/**
 * While the pet is idle, periodically picks a random action state and asks the
 * caller to transition into it. It only schedules timers — the "am I idle?"
 * check and the actual transition are delegated via callbacks, keeping this
 * class free of any animation/state-machine coupling.
 */
export class RandomActionManager {
  private timer: ReturnType<typeof setTimeout> | null = null
  private enabled = false

  private readonly minDelayMs: number
  private readonly maxDelayMs: number
  private readonly actions: PetState[]

  constructor(
    /** Returns true when it's OK to fire (e.g. the pet is idle). */
    private readonly canFire: () => boolean,
    /** Perform the chosen transition. */
    private readonly fire: (state: PetState) => void,
    options: RandomActionOptions = {}
  ) {
    this.minDelayMs = options.minDelayMs ?? RANDOM_ACTION.minDelayMs
    this.maxDelayMs = options.maxDelayMs ?? RANDOM_ACTION.maxDelayMs
    this.actions = options.actions ?? RANDOM_ACTION.actions
  }

  start(): void {
    if (this.enabled) return
    this.enabled = true
    this.scheduleNext()
  }

  stop(): void {
    this.enabled = false
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
  }

  get isEnabled(): boolean {
    return this.enabled
  }

  private scheduleNext(): void {
    if (!this.enabled) return
    const delay = this.randomBetween(this.minDelayMs, this.maxDelayMs)
    this.timer = setTimeout(() => this.onTick(), delay)
  }

  private onTick(): void {
    if (!this.enabled) return
    if (this.canFire() && this.actions.length > 0) {
      const state = this.actions[Math.floor(Math.random() * this.actions.length)]
      this.fire(state)
    }
    this.scheduleNext()
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(min + Math.random() * Math.max(0, max - min))
  }
}
