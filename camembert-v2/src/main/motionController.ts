import { screen } from 'electron'
import type { WindowManager } from '@main/windowManager'

/** Visual hint pushed to the renderer while a motion mode is active. */
export interface MotionVisual {
  /** 'none' = motion fully off (renderer resumes autonomous behaviour). */
  mode: 'follow' | 'perch' | 'none'
  /** True while the window is actively easing toward its target. */
  moving?: boolean
  dir?: 'left' | 'right'
}

type MotionMode = 'off' | 'follow' | 'perch'

/** Update interval (ms) — ~30fps easing is smooth enough and cheap. */
const TICK_MS = 33
/** How far behind the cursor the pet trails (px), so it never covers it. */
const FOLLOW_GAP = 100
/** Easing factor per tick (0..1); higher = snappier. */
const EASE = 0.18
/** Distance (px) under which motion is considered "arrived" (visual rests). */
const ARRIVE_EPS = 3

/**
 * Main-process driver for the two window-motion behaviours:
 *  - "follow": the pet trails the OS cursor at a fixed gap.
 *  - "perch":  the pet eases to the nearest work-area edge and rests there
 *              (returning to it if nudged away).
 *
 * Both ease the window toward a target each tick and emit a visual hint so the
 * renderer can play a walk/rest pose and face the travel direction. Dragging the
 * pet always wins: while a manual drag is in progress the driver stands down.
 */
export class MotionController {
  private mode: MotionMode = 'off'
  private timer: ReturnType<typeof setInterval> | null = null
  private lastVisual: MotionVisual = { mode: 'none' }

  constructor(
    private readonly windows: WindowManager,
    private readonly sendVisual: (v: MotionVisual) => void
  ) {}

  get followEnabled(): boolean {
    return this.mode === 'follow'
  }
  get perchEnabled(): boolean {
    return this.mode === 'perch'
  }

  setFollow(on: boolean): void {
    this.setMode(on ? 'follow' : 'off')
  }
  setPerch(on: boolean): void {
    this.setMode(on ? 'perch' : 'off')
  }

  private setMode(mode: MotionMode): void {
    if (this.mode === mode) return
    this.mode = mode
    if (mode === 'off') {
      this.stopTimer()
      this.emit({ mode: 'none' })
      return
    }
    if (!this.timer) this.timer = setInterval(() => this.tick(), TICK_MS)
  }

  dispose(): void {
    this.stopTimer()
    this.mode = 'off'
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  private tick(): void {
    if (this.mode === 'off') return
    const activeMode = this.mode // 'follow' | 'perch'
    const rect = this.windows.getWindowRect()
    if (!rect) return
    // Never fight a manual drag: hold the rest pose, keep autonomy suspended.
    if (this.windows.isDragging()) {
      this.emit({ mode: activeMode, moving: false })
      return
    }

    const target = activeMode === 'follow' ? this.followTarget(rect) : this.perchTarget(rect)
    if (!target) return

    const dx = target.x - rect.x
    const dy = target.y - rect.y
    const dist = Math.hypot(dx, dy)
    if (dist <= ARRIVE_EPS) {
      this.emit({ mode: activeMode, moving: false })
      return
    }

    const nextX = Math.round(rect.x + dx * EASE)
    const nextY = Math.round(rect.y + dy * EASE)
    this.windows.moveTo(nextX, nextY)
    this.emit({ mode: activeMode, moving: true, dir: dx < 0 ? 'left' : 'right' })
  }

  /** Where the window's top-left should be to trail the cursor at FOLLOW_GAP. */
  private followTarget(rect: { x: number; y: number; width: number; height: number }): { x: number; y: number } | null {
    const cursor = screen.getCursorScreenPoint()
    const cx = rect.x + rect.width / 2
    const cy = rect.y + rect.height / 2
    const dx = cursor.x - cx
    const dy = cursor.y - cy
    const dist = Math.hypot(dx, dy)
    if (dist <= FOLLOW_GAP) return { x: rect.x, y: rect.y } // close enough; rest
    const ux = dx / dist
    const uy = dy / dist
    const targetCenterX = cursor.x - ux * FOLLOW_GAP
    const targetCenterY = cursor.y - uy * FOLLOW_GAP
    return { x: Math.round(targetCenterX - rect.width / 2), y: Math.round(targetCenterY - rect.height / 2) }
  }

  /** Nearest work-area edge position for the current window. */
  private perchTarget(rect: { x: number; y: number; width: number; height: number }): { x: number; y: number } {
    const area = screen.getDisplayMatching(rect).workArea
    const left = area.x
    const right = area.x + area.width - rect.width
    const top = area.y
    const bottom = area.y + area.height - rect.height
    const clampedX = Math.min(Math.max(rect.x, left), right)
    const clampedY = Math.min(Math.max(rect.y, top), bottom)

    // Distance to each of the four edges from the current position.
    const candidates = [
      { x: left, y: clampedY, d: Math.abs(rect.x - left) },
      { x: right, y: clampedY, d: Math.abs(rect.x - right) },
      { x: clampedX, y: top, d: Math.abs(rect.y - top) },
      { x: clampedX, y: bottom, d: Math.abs(rect.y - bottom) }
    ]
    candidates.sort((a, b) => a.d - b.d)
    return { x: candidates[0].x, y: candidates[0].y }
  }

  private emit(v: MotionVisual): void {
    if (
      v.mode === this.lastVisual.mode &&
      v.moving === this.lastVisual.moving &&
      v.dir === this.lastVisual.dir
    ) {
      return
    }
    this.lastVisual = v
    this.sendVisual(v)
  }
}
