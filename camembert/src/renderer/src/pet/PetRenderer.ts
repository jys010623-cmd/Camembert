export interface PetRendererCallbacks {
  /** A genuine click (pointer down + up without dragging) on the character. */
  onClick?: () => void
  /** Called continuously while dragging, with the frame-to-frame delta. */
  onDragMove?: (dx: number, dy: number) => void
  onDragEnd?: () => void
  /** Right-click / context-menu request (on the character). */
  onContextMenu?: () => void
  /** Fired after the canvas is resized (so the current frame can be redrawn). */
  onResize?: () => void
}

/** Movement in px beyond which a pointer gesture counts as a drag, not a click. */
const DRAG_THRESHOLD = 4

/** Alpha (0-255) at/above which a pixel counts as "solid" for hit-testing. */
const ALPHA_HIT_THRESHOLD = 10

/** Elliptical fallback hitbox as a fraction of the display box (per spec). */
const ELLIPSE_WIDTH_FRACTION = 0.75
const ELLIPSE_HEIGHT_FRACTION = 0.85

type HitMode = 'alpha' | 'ellipse'

/**
 * Owns the on-screen DOM: the canvas the animation is drawn to and a placeholder
 * shown when there is nothing to draw. Translates raw pointer events into
 * high-level click / drag / context-menu callbacks, and — importantly — rejects
 * gestures that land on transparent pixels so the pet is only interactive where
 * the character is actually visible.
 */
export class PetRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D

  private dragging = false
  private movedDistance = 0
  private lastScreenX = 0
  private lastScreenY = 0

  /** Alpha hit-testing needs canvas pixels; if reads fail we fall back to an ellipse. */
  private hitMode: HitMode = 'alpha'

  constructor(
    private readonly root: HTMLElement,
    private readonly callbacks: PetRendererCallbacks = {}
  ) {
    this.canvas = root.querySelector<HTMLCanvasElement>('#pet-canvas')!

    const ctx = this.canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('2D canvas context unavailable')
    this.ctx = ctx

    this.syncCanvasResolution()
    window.addEventListener('resize', () => {
      this.syncCanvasResolution()
      this.callbacks.onResize?.()
    })
    this.bindPointerEvents()
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx
  }

  /**
   * When there is no character to draw, hide the canvas so the window is fully
   * transparent (there is no placeholder graphic anymore). When there is a
   * character, show the canvas.
   */
  showPlaceholder(show: boolean): void {
    this.canvas.style.display = show ? 'none' : 'block'
  }

  /** No-op: kept for API compatibility since the placeholder was removed. */
  setStatusText(_text: string): void {
    /* intentionally empty */
  }

  /** Current on-screen display size (CSS px). */
  getDisplaySize(): { width: number; height: number } {
    const rect = this.canvas.getBoundingClientRect()
    return { width: Math.round(rect.width), height: Math.round(rect.height) }
  }

  /** Which hit-test strategy is currently in effect (for the debug panel). */
  getHitMode(): HitMode {
    return this.hitMode
  }

  /**
   * Match the canvas backing store to the window's inner size × devicePixelRatio.
   * Using the window size (not the canvas element's measured box) avoids any
   * layout feedback loop where the canvas's own size could influence the measure.
   */
  private syncCanvasResolution(): void {
    const dpr = window.devicePixelRatio || 1
    const width = window.innerWidth || this.root.clientWidth || 1
    const height = window.innerHeight || this.root.clientHeight || 1
    const nextW = Math.max(1, Math.round(width * dpr))
    const nextH = Math.max(1, Math.round(height * dpr))
    if (this.canvas.width !== nextW) this.canvas.width = nextW
    if (this.canvas.height !== nextH) this.canvas.height = nextH
  }

  private bindPointerEvents(): void {
    this.root.addEventListener('pointerdown', (e) => this.onPointerDown(e))
    this.root.addEventListener('pointermove', (e) => this.onPointerMove(e))
    this.root.addEventListener('pointerup', (e) => this.onPointerUp(e))
    this.root.addEventListener('pointercancel', () => this.endDrag())
    this.root.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      if (this.isInteractiveAt(e.clientX, e.clientY)) this.callbacks.onContextMenu?.()
    })
  }

  /**
   * True if the given screen point lands on a visible part of the character.
   * Uses per-pixel alpha when possible, otherwise a central elliptical hitbox.
   */
  private isInteractiveAt(clientX: number, clientY: number): boolean {
    const rect = this.canvas.getBoundingClientRect()
    const localX = clientX - rect.left
    const localY = clientY - rect.top
    if (localX < 0 || localY < 0 || localX >= rect.width || localY >= rect.height) {
      return false
    }

    if (this.hitMode === 'alpha') {
      const dpr = window.devicePixelRatio || 1
      const px = Math.min(this.canvas.width - 1, Math.max(0, Math.floor(localX * dpr)))
      const py = Math.min(this.canvas.height - 1, Math.max(0, Math.floor(localY * dpr)))
      try {
        const alpha = this.ctx.getImageData(px, py, 1, 1).data[3]
        return alpha >= ALPHA_HIT_THRESHOLD
      } catch {
        // Canvas tainted — switch permanently to the elliptical fallback.
        this.hitMode = 'ellipse'
      }
    }

    return this.isInEllipse(localX, localY, rect.width, rect.height)
  }

  private isInEllipse(px: number, py: number, w: number, h: number): boolean {
    const cx = w / 2
    const cy = h / 2
    const rx = (w * ELLIPSE_WIDTH_FRACTION) / 2
    const ry = (h * ELLIPSE_HEIGHT_FRACTION) / 2
    if (rx <= 0 || ry <= 0) return false
    const nx = (px - cx) / rx
    const ny = (py - cy) / ry
    return nx * nx + ny * ny <= 1
  }

  private onPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return // left button only for drag/click
    // Ignore clicks on transparent space so the pet isn't grabbed by empty pixels.
    if (!this.isInteractiveAt(e.clientX, e.clientY)) return
    this.dragging = true
    this.movedDistance = 0
    this.lastScreenX = e.screenX
    this.lastScreenY = e.screenY
    this.root.setPointerCapture(e.pointerId)
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.dragging) return
    const dx = e.screenX - this.lastScreenX
    const dy = e.screenY - this.lastScreenY
    this.lastScreenX = e.screenX
    this.lastScreenY = e.screenY
    this.movedDistance += Math.abs(dx) + Math.abs(dy)
    if (dx !== 0 || dy !== 0) this.callbacks.onDragMove?.(dx, dy)
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.dragging) return
    if (this.root.hasPointerCapture(e.pointerId)) {
      this.root.releasePointerCapture(e.pointerId)
    }
    const wasDrag = this.movedDistance > DRAG_THRESHOLD
    this.endDrag()
    if (wasDrag) this.callbacks.onDragEnd?.()
    else this.callbacks.onClick?.()
  }

  private endDrag(): void {
    this.dragging = false
    this.movedDistance = 0
  }
}
