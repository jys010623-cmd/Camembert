import type { WalkBounds } from '@shared/types'

/**
 * How many animation frames make up one visual step. A step is one bounce, so
 * bounce cadence = walkFps / this. With an 8-frame walk clip this yields two
 * bounces per loop.
 */
const WALK_FRAMES_PER_STEP = 4

/** Horizontal distance (CSS px) travelled per step. Small = slow and cute. */
const WALK_STRIDE_PX = 14

/** Peak upward hop, in CSS px (translateY: 0 -> -AMP -> 0 each step). */
const BOUNCE_AMP_PX = 4

/** Peak vertical squash (scaleY: 1 -> 1 - SQUASH -> 1 each step). */
const BOUNCE_SQUASH = 0.02

/**
 * Whether the base walk art faces right. Frames are drawn facing this way, so
 * the sprite is mirrored when travelling the opposite direction. If the art
 * actually faces left, flip this constant (no other change needed).
 */
const ART_FACES_RIGHT = true

/** +1 = moving right, -1 = moving left. */
export type WalkDirection = 1 | -1

export interface WalkState {
  active: boolean
  x: number
  y: number
  direction: WalkDirection
  /** Horizontal speed in CSS px/sec (0 when stopped). */
  speed: number
  /** Walk animation frame rate (fps) driving the step cadence. */
  fps: number
}

export interface WalkDeps {
  /** Current window position + horizontal travel limits, or null if unavailable. */
  getBounds: () => Promise<WalkBounds | null>
  /** Move the window to an absolute top-left position. */
  moveTo: (x: number, y: number) => void
  /** Mirror the character horizontally (true = facing left). */
  setFlipped: (flipped: boolean) => void
  /** Apply the per-frame walk bounce (vertical offset px + vertical scale). */
  setBounce: (offsetY: number, scaleY: number) => void
}

/**
 * Walks the pet window horizontally across the current display and adds a small
 * code-driven bounce so the motion reads as steps rather than a slide.
 *
 * On {@link start} it samples the window position and the display work area,
 * picks a random direction, then each animation frame: advances a step-phase to
 * drive the bounce, and nudges the window horizontally. Horizontal speed is
 * derived from the walk fps (speed = stepsPerSec * stride), so movement and the
 * animation stay in step. It never leaves the work area — on reaching an edge it
 * reverses direction and flips the sprite. {@link stop} halts movement and
 * restores the resting (right-facing, un-bounced) pose.
 */
export class WalkController {
  private rafId = 0
  private active = false
  private x = 0
  private y = 0
  private minX = 0
  private maxX = 0
  private direction: WalkDirection = 1
  private lastTs = 0
  private carry = 0
  private phase = 0

  private readonly stepHz: number
  private readonly speedPxPerSec: number

  constructor(
    private readonly deps: WalkDeps,
    private readonly fps: number
  ) {
    this.stepHz = fps / WALK_FRAMES_PER_STEP
    this.speedPxPerSec = this.stepHz * WALK_STRIDE_PX
  }

  get isActive(): boolean {
    return this.active
  }

  getState(): WalkState {
    return {
      active: this.active,
      x: Math.round(this.x),
      y: Math.round(this.y),
      direction: this.direction,
      speed: this.active ? Math.round(this.speedPxPerSec) : 0,
      fps: this.fps
    }
  }

  /** Begin walking from the window's current position. No-op if already active. */
  async start(): Promise<void> {
    if (this.active) return
    const bounds = await this.deps.getBounds()
    if (!bounds) return
    // A late stop() may have arrived while awaiting bounds.
    if (this.rafId) return

    this.x = bounds.x
    this.y = bounds.y
    this.minX = Math.min(bounds.minX, bounds.maxX)
    this.maxX = Math.max(bounds.minX, bounds.maxX)

    // Random direction, but aim inward if we're already pinned to an edge.
    this.direction = Math.random() < 0.5 ? -1 : 1
    if (this.x <= this.minX) this.direction = 1
    else if (this.x >= this.maxX) this.direction = -1

    this.applyFacing()
    this.active = true
    this.lastTs = 0
    this.carry = 0
    this.phase = 0
    this.rafId = requestAnimationFrame(this.tick)
  }

  /** Stop walking and restore the resting (right-facing, un-bounced) pose. */
  stop(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = 0
    if (this.active) {
      this.deps.setBounce(0, 1)
      this.deps.setFlipped(false)
    }
    this.active = false
  }

  private applyFacing(): void {
    const facingLeft = this.direction === -1
    this.deps.setFlipped(ART_FACES_RIGHT ? facingLeft : !facingLeft)
  }

  private tick = (ts: number): void => {
    if (!this.active) return
    if (this.lastTs === 0) this.lastTs = ts
    // Clamp long frame gaps (e.g. tab was backgrounded) so the pet never jumps.
    const dt = Math.min(0.05, (ts - this.lastTs) / 1000)
    this.lastTs = ts

    // Step-phase in [0,1): one bounce per step. A half-sine gives 0 -> 1 -> 0.
    this.phase = (this.phase + this.stepHz * dt) % 1
    const s = Math.sin(this.phase * Math.PI)
    this.deps.setBounce(-BOUNCE_AMP_PX * s, 1 - BOUNCE_SQUASH * s)

    // Horizontal travel, integer px, reversing at the work-area edges.
    this.carry += this.speedPxPerSec * dt * this.direction
    const step = Math.trunc(this.carry)
    if (step !== 0) {
      this.carry -= step
      let nextX = this.x + step
      if (nextX <= this.minX) {
        nextX = this.minX
        this.direction = 1
        this.carry = 0
        this.applyFacing()
      } else if (nextX >= this.maxX) {
        nextX = this.maxX
        this.direction = -1
        this.carry = 0
        this.applyFacing()
      }
      if (nextX !== this.x) {
        this.x = nextX
        this.deps.moveTo(Math.round(this.x), Math.round(this.y))
      }
    }

    this.rafId = requestAnimationFrame(this.tick)
  }
}
