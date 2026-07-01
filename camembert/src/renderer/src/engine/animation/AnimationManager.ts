import {
  EMPTY_MANIFEST,
  type AnimationCategory,
  type AnimationClip,
  type AnimationTelemetry,
  type AssetManifest
} from '@shared/types'
import { SpriteLoader } from './SpriteLoader'
import { AnimationPlayer } from './AnimationPlayer'
import { computeOpaqueBBox, type BBox } from './ImageAnalyzer'
import { CATEGORY_FPS, CATEGORY_LOOPS, DEFAULT_FPS } from '@renderer/config/animationConfig'

export interface PlayClipOptions {
  /** Specific clip name; if omitted a random clip in the category is chosen. */
  clip?: string
  /** Override loop behaviour (defaults to the category setting). */
  loop?: boolean
  /** Called when a one-shot clip finishes. */
  onEnd?: () => void
}

/**
 * Bridges the asset manifest and the low-level AnimationPlayer: it resolves a
 * (category, clip) request into loaded frames and starts playback.
 */
export class AnimationManager {
  private manifest: AssetManifest = EMPTY_MANIFEST
  private readonly loader = new SpriteLoader()
  private readonly player: AnimationPlayer
  private current: { category: AnimationCategory; clip: string } | null = null
  private currentBBox: BBox | null = null

  constructor(ctx: CanvasRenderingContext2D) {
    this.player = new AnimationPlayer(ctx)
  }

  /** Opaque bounding box of the currently playing clip's first frame. */
  getCurrentBBox(): BBox | null {
    return this.currentBBox
  }

  /** Redraw the current frame (after a resize). */
  redraw(): void {
    this.player.redraw()
  }

  /**
   * Load a category's first frame and compute its opaque bounding box, without
   * changing what is currently playing. Used to size the window to the idle
   * character. Returns null if the category has no frames or pixels are
   * unreadable.
   */
  async computeBBoxFor(category: AnimationCategory): Promise<BBox | null> {
    const clip = this.pickClip(category)
    if (!clip) return null
    try {
      const frames = await this.loader.load(`${category}/${clip.name}`, clip.frames)
      return frames.length ? computeOpaqueBBox(frames[0]) : null
    } catch {
      return null
    }
  }

  setManifest(manifest: AssetManifest): void {
    this.manifest = manifest
    this.loader.clear()
  }

  hasAnyClips(): boolean {
    return this.manifest.totalClips > 0
  }

  /** Total number of PNG frames loaded across all categories. */
  getTotalFrames(): number {
    return this.manifest.totalFrames
  }

  /** Total number of clips loaded across all categories. */
  getTotalClips(): number {
    return this.manifest.totalClips
  }

  hasCategory(category: AnimationCategory): boolean {
    return (this.manifest.categories[category]?.length ?? 0) > 0
  }

  getClips(category: AnimationCategory): AnimationClip[] {
    return this.manifest.categories[category] ?? []
  }

  getCurrent(): { category: AnimationCategory; clip: string } | null {
    return this.current
  }

  /**
   * Keep the idle animation on screen as a fallback when a requested category
   * has no frames. No-op if idle is already playing, or if there are no idle
   * frames at all (in which case the placeholder handles visibility).
   */
  playFallbackIdle(): void {
    if (!this.hasCategory('idle')) return
    if (this.current?.category === 'idle' && this.player.isPlaying) return
    void this.play('idle')
  }

  /** Snapshot of what's playing right now, for the debug panel. */
  getTelemetry(): AnimationTelemetry {
    const frame = this.player.getFrameInfo()
    return {
      category: this.current?.category ?? null,
      clip: this.current?.clip ?? null,
      frameIndex: frame.index,
      frameCount: frame.total,
      fps: this.player.getMeasuredFps(),
      playing: this.player.isPlaying
    }
  }

  /**
   * Resolve and play a clip. Returns true if playback started, false if the
   * requested category/clip has no frames (caller can fall back to idle).
   */
  async play(category: AnimationCategory, options: PlayClipOptions = {}): Promise<boolean> {
    const clip = this.pickClip(category, options.clip)
    if (!clip) return false

    const key = `${category}/${clip.name}`
    let frames: HTMLImageElement[]
    try {
      frames = await this.loader.load(key, clip.frames)
    } catch (err) {
      console.error(`[AnimationManager] ${key} failed to load`, err)
      return false
    }
    if (frames.length === 0) return false

    this.current = { category, clip: clip.name }
    // Crop to the character's opaque bounding box so transparent margins are
    // not displayed. Falls back to contain-fit if pixels can't be read.
    this.currentBBox = computeOpaqueBBox(frames[0])
    this.player.setSourceRect(this.currentBBox)
    this.player.play(frames, {
      fps: CATEGORY_FPS[category] ?? DEFAULT_FPS,
      loop: options.loop ?? CATEGORY_LOOPS[category],
      onEnd: options.onEnd
    })
    return true
  }

  stop(): void {
    this.player.stop()
  }

  pause(): void {
    this.player.pause()
  }

  resume(): void {
    this.player.resume()
  }

  private pickClip(category: AnimationCategory, name?: string): AnimationClip | null {
    const clips = this.getClips(category)
    if (clips.length === 0) return null
    if (name) return clips.find((c) => c.name === name) ?? null
    return clips[Math.floor(Math.random() * clips.length)]
  }
}
