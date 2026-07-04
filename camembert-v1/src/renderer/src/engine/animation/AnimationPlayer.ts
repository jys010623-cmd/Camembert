import type { BBox } from './ImageAnalyzer'

export interface PlayOptions {
  fps?: number
  loop?: boolean
  /** Called once when a non-looping animation reaches its last frame. */
  onEnd?: () => void
}

/**
 * Plays a sequence of frames onto a 2D canvas using a fixed-timestep loop
 * driven by requestAnimationFrame. Frame timing is decoupled from the display
 * refresh rate, so playback speed stays correct on 60/120/144 Hz screens.
 */
export class AnimationPlayer {
  private frames: HTMLImageElement[] = []
  private frameIndex = 0
  private frameDurationMs = 1000 / 12
  private loop = true
  private onEnd?: () => void

  private rafId = 0
  private lastTimestamp = 0
  private accumulatorMs = 0
  private playing = false

  // Telemetry (for the debug panel).
  private fpsEma = 0
  private lastAdvanceAt = 0

  /** When set, only this source rectangle is drawn, scaled to fill the canvas. */
  private sourceRect: BBox | null = null

  constructor(private readonly ctx: CanvasRenderingContext2D) {}

  /**
   * Crop the drawn region to this source rectangle (in image px). The canvas is
   * expected to share the rectangle's aspect ratio, so no distortion occurs.
   * Pass null to draw the whole frame with contain-fit.
   */
  setSourceRect(rect: BBox | null): void {
    this.sourceRect = rect
  }

  /** Redraw the current frame (e.g. after the canvas is resized). */
  redraw(): void {
    this.drawCurrent()
  }

  play(frames: HTMLImageElement[], options: PlayOptions = {}): void {
    this.stop()
    if (frames.length === 0) return

    this.frames = frames
    this.frameIndex = 0
    this.frameDurationMs = 1000 / (options.fps ?? 12)
    this.loop = options.loop ?? true
    this.onEnd = options.onEnd

    this.accumulatorMs = 0
    this.lastTimestamp = 0
    this.fpsEma = 0
    this.lastAdvanceAt = 0
    this.playing = true

    this.drawCurrent()
    this.rafId = requestAnimationFrame(this.tick)
  }

  /** Current frame position, for telemetry. */
  getFrameInfo(): { index: number; total: number } {
    return { index: this.frames.length ? this.frameIndex : 0, total: this.frames.length }
  }

  /** Measured playback rate in frames/sec (0 when not playing). */
  getMeasuredFps(): number {
    return this.playing ? Math.round(this.fpsEma) : 0
  }

  stop(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = 0
    this.playing = false
  }

  pause(): void {
    if (!this.playing) return
    this.stop()
    this.playing = false
  }

  resume(): void {
    if (this.playing || this.frames.length === 0) return
    this.playing = true
    this.lastTimestamp = 0
    this.rafId = requestAnimationFrame(this.tick)
  }

  get isPlaying(): boolean {
    return this.playing
  }

  private tick = (timestamp: number): void => {
    if (!this.playing) return
    if (this.lastTimestamp === 0) this.lastTimestamp = timestamp

    const delta = timestamp - this.lastTimestamp
    this.lastTimestamp = timestamp
    this.accumulatorMs += delta

    while (this.accumulatorMs >= this.frameDurationMs) {
      this.accumulatorMs -= this.frameDurationMs
      if (!this.advance()) return // stopped on the final frame of a one-shot
    }

    this.rafId = requestAnimationFrame(this.tick)
  }

  /** Advance one frame. Returns false when a non-looping clip has finished. */
  private advance(): boolean {
    this.measureFps()
    const next = this.frameIndex + 1

    if (next >= this.frames.length) {
      if (this.loop) {
        this.frameIndex = 0
        this.drawCurrent()
        return true
      }
      // One-shot: hold the last frame, stop, and fire the callback.
      this.frameIndex = this.frames.length - 1
      this.drawCurrent()
      this.stop()
      this.onEnd?.()
      return false
    }

    this.frameIndex = next
    this.drawCurrent()
    return true
  }

  /** Update the measured-FPS EMA from the wall-clock gap between advances. */
  private measureFps(): void {
    const now = performance.now()
    if (this.lastAdvanceAt) {
      const dt = now - this.lastAdvanceAt
      if (dt > 0) {
        const instantaneous = 1000 / dt
        this.fpsEma = this.fpsEma ? this.fpsEma * 0.8 + instantaneous * 0.2 : instantaneous
      }
    }
    this.lastAdvanceAt = now
  }

  private drawCurrent(): void {
    const img = this.frames[this.frameIndex]
    if (!img) return

    const canvas = this.ctx.canvas
    const cw = canvas.width
    const ch = canvas.height
    this.ctx.clearRect(0, 0, cw, ch)
    // High-quality downscale of the high-res source art.
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'

    const rect = this.sourceRect
    if (rect) {
      // Draw only the character's bounding box, scaled to fill the canvas
      // (canvas aspect matches the box aspect, so this stays undistorted).
      this.ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, cw, ch)
      return
    }

    // Contain: preserve aspect ratio, centre within the canvas.
    const scale = Math.min(cw / img.width, ch / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    const dx = (cw - dw) / 2
    const dy = (ch - dh) / 2
    this.ctx.drawImage(img, dx, dy, dw, dh)
  }
}
