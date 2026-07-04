/**
 * Lightweight Tamagotchi-style needs model. Three stats in [0,100]:
 *   hunger  100 = full,      0 = starving
 *   energy  100 = rested,    0 = exhausted
 *   mood    100 = delighted, 0 = miserable
 *
 * Stats drift over real time. Feeding and playing top them up. When a stat
 * crosses into its "low" band the model emits a one-shot `need` event (throttled
 * so it doesn't nag), which the pet turns into speech / behaviour. Kept in
 * memory for the session (resets on restart) to avoid any persistence coupling.
 */

export type PetNeed = 'hungry' | 'sleepy' | 'bored'

export interface StatsSnapshot {
  hunger: number
  energy: number
  mood: number
}

const LOW = 30 // threshold that counts as "needs attention"
const CLAMP = (v: number): number => Math.max(0, Math.min(100, v))

/** How much each stat drifts per minute under normal (awake) conditions. */
const DECAY_PER_MIN = { hunger: 6, energy: 4, mood: 3 }

/** Minimum gap between repeated nags for the same need. */
const NEED_COOLDOWN_MS = 45_000

export class PetStats {
  private hunger = 85
  private energy = 90
  private mood = 80
  private sleeping = false

  private timer: ReturnType<typeof setInterval> | null = null
  private readonly lastNeedAt: Record<PetNeed, number> = { hungry: 0, sleepy: 0, bored: 0 }

  constructor(
    /** Emitted (throttled) when a stat drops into its low band. */
    private readonly onNeed: (need: PetNeed) => void,
    /** Tick period in ms (default 15s). */
    private readonly tickMs = 15_000
  ) {}

  start(): void {
    if (this.timer) return
    this.timer = setInterval(() => this.tick(), this.tickMs)
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  /** Tell the model whether the pet is currently asleep (energy recovers). */
  setSleeping(sleeping: boolean): void {
    this.sleeping = sleeping
  }

  snapshot(): StatsSnapshot {
    return {
      hunger: Math.round(this.hunger),
      energy: Math.round(this.energy),
      mood: Math.round(this.mood)
    }
  }

  /** Restore persisted values (clamped); ignores anything malformed. */
  restore(snapshot: Partial<StatsSnapshot> | null | undefined): void {
    if (!snapshot) return
    if (typeof snapshot.hunger === 'number') this.hunger = CLAMP(snapshot.hunger)
    if (typeof snapshot.energy === 'number') this.energy = CLAMP(snapshot.energy)
    if (typeof snapshot.mood === 'number') this.mood = CLAMP(snapshot.mood)
  }

  feed(): void {
    this.hunger = CLAMP(this.hunger + 40)
    this.mood = CLAMP(this.mood + 12)
  }

  playWith(): void {
    this.mood = CLAMP(this.mood + 30)
    this.energy = CLAMP(this.energy - 8)
    this.hunger = CLAMP(this.hunger - 4)
  }

  /** True while the pet is low on energy — the pet should favour sleeping. */
  get wantsSleep(): boolean {
    return this.energy < LOW
  }

  /** True while hungry — pet should look for food / complain. */
  get isHungry(): boolean {
    return this.hunger < LOW
  }

  /** Bias for the random-action pool, so needs shape spontaneous behaviour. */
  actionBias(): { sleep: number; dance: number; music: number; emotion: number } {
    return {
      // Tired → more sleep, less energetic play.
      sleep: this.energy < LOW ? 3 : 1,
      dance: this.mood > 60 && this.energy > 40 ? 2 : 1,
      music: 1,
      emotion: 1
    }
  }

  private tick(): void {
    const factor = this.tickMs / 60_000
    this.hunger = CLAMP(this.hunger - DECAY_PER_MIN.hunger * factor)
    if (this.sleeping) {
      this.energy = CLAMP(this.energy + DECAY_PER_MIN.energy * factor * 3)
    } else {
      this.energy = CLAMP(this.energy - DECAY_PER_MIN.energy * factor)
    }
    // Mood sags when hungry or exhausted, otherwise drifts gently down.
    const strain = (this.isHungry ? 1.5 : 0) + (this.energy < LOW ? 1.5 : 0)
    this.mood = CLAMP(this.mood - (DECAY_PER_MIN.mood * factor + strain))

    this.maybeEmitNeed()
  }

  private maybeEmitNeed(): void {
    const now = Date.now()
    const fire = (need: PetNeed): void => {
      if (now - this.lastNeedAt[need] < NEED_COOLDOWN_MS) return
      this.lastNeedAt[need] = now
      this.onNeed(need)
    }
    // Emit at most one need per tick, most urgent first.
    if (this.hunger < LOW) fire('hungry')
    else if (this.energy < LOW) fire('sleepy')
    else if (this.mood < LOW) fire('bored')
  }
}
