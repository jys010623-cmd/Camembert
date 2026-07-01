import type { AnimationCategory, PetState } from '@shared/types'

/** Fallback playback speed when a category has no explicit value. */
export const DEFAULT_FPS = 12

/** Per-category frames-per-second. Tune to taste once real PNGs are in. */
export const CATEGORY_FPS: Record<AnimationCategory, number> = {
  idle: 8,
  emotion: 12,
  music: 12,
  dance: 14,
  sleep: 6,
  walk: 10,
  turnaround: 12
}

/**
 * Whether a category loops forever (true) or plays once and then returns to
 * idle (false). One-shot categories are reactions/transitions.
 */
export const CATEGORY_LOOPS: Record<AnimationCategory, boolean> = {
  idle: true,
  emotion: false,
  music: true,
  dance: true,
  sleep: true,
  walk: true,
  turnaround: false
}

/** Map a behaviour state to the animation category it plays. */
export const STATE_TO_CATEGORY: Record<PetState, AnimationCategory> = {
  idle: 'idle',
  emotion: 'emotion',
  music: 'music',
  dance: 'dance',
  sleep: 'sleep',
  walk: 'walk',
  turnaround: 'turnaround'
}

/** The resting state the pet returns to after a one-shot animation. */
export const IDLE_STATE: PetState = 'idle'

export interface DurationRange {
  minMs: number
  maxMs: number
}

/**
 * How long looping (timed) states run before returning to idle. States not
 * listed here are one-shot and end when their animation finishes.
 */
export const STATE_DURATIONS: Partial<Record<PetState, DurationRange>> = {
  music: { minMs: 6000, maxMs: 12000 },
  dance: { minMs: 6000, maxMs: 12000 },
  sleep: { minMs: 8000, maxMs: 16000 },
  walk: { minMs: 5000, maxMs: 10000 }
}

/** Fallback clip length used when a category has no PNGs yet (placeholder). */
export const PLACEHOLDER_ACTION_MS = 1600

/** Random-action scheduler: while idle, spontaneously enter one of these. */
export const RANDOM_ACTION = {
  minDelayMs: 6000,
  maxDelayMs: 14000,
  /** States the pet may spontaneously transition into from idle. */
  actions: ['emotion', 'music', 'dance', 'sleep'] as PetState[]
}
