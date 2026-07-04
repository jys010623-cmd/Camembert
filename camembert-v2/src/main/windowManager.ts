import { BrowserWindow, screen, shell } from 'electron'
import { join } from 'node:path'
import { appConfig } from '@main/config/appConfig'
import type { WalkBounds } from '@shared/types'

/** Owns the single pet BrowserWindow and its window-level behaviours. */
export class WindowManager {
  private win: BrowserWindow | null = null

  // The size we intend the window to be. Re-asserted on every move to work
  // around a Windows bug where transparent frameless windows grow by the DPI
  // factor each time they are repositioned.
  private intended = { width: appConfig.window.width, height: appConfig.window.height }

  // Offset (in DIP screen coords) between the cursor and the window's top-left,
  // captured at the start of a manual drag. Non-null only while dragging.
  private dragOffset: { x: number; y: number } | null = null

  create(initial?: { x: number; y: number }): BrowserWindow {
    const { window: cfg } = appConfig
    const { x, y } = initial ?? this.resolveInitialPosition(cfg.width, cfg.height)
    this.intended = { width: cfg.width, height: cfg.height }

    this.win = new BrowserWindow({
      title: 'Camembert',
      width: cfg.width,
      height: cfg.height,
      x,
      y,
      transparent: cfg.transparent,
      frame: cfg.frame,
      alwaysOnTop: cfg.alwaysOnTop,
      resizable: cfg.resizable,
      hasShadow: cfg.hasShadow,
      skipTaskbar: cfg.skipTaskbar,
      show: false,
      fullscreenable: false,
      maximizable: false,
      minimizable: false,
      // Transparent + frameless windows must not paint a background.
      backgroundColor: '#00000000',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    // Keep it pinned above normal windows even over fullscreen apps.
    this.win.setAlwaysOnTop(cfg.alwaysOnTop, 'screen-saver')
    this.win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

    // Allow microphone access (used by the optional music-detection dance) while
    // denying every other sensitive permission the renderer might request.
    this.win.webContents.session.setPermissionRequestHandler((_wc, permission, callback) => {
      callback(permission === 'media')
    })

    this.win.once('ready-to-show', () => this.win?.show())

    // F12 toggles DevTools (frameless windows have no menu accelerator).
    this.win.webContents.on('before-input-event', (_e, input) => {
      if (input.type === 'keyDown' && input.key === 'F12') {
        this.win?.webContents.toggleDevTools()
      }
    })

    // Open external links in the default browser, never inside the pet window.
    this.win.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })

    this.loadRenderer(this.win)
    return this.win
  }

  private loadRenderer(win: BrowserWindow): void {
    // electron-vite injects ELECTRON_RENDERER_URL in dev.
    const devUrl = process.env['ELECTRON_RENDERER_URL']
    if (devUrl) {
      win.loadURL(devUrl)
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  private resolveInitialPosition(w: number, h: number): { x: number; y: number } {
    const { window: cfg } = appConfig
    if (cfg.x !== null && cfg.y !== null) {
      return { x: cfg.x, y: cfg.y }
    }
    const area = screen.getPrimaryDisplay().workArea
    return {
      x: Math.round(area.x + area.width - w - 24),
      y: Math.round(area.y + area.height - h - 24)
    }
  }

  getWindow(): BrowserWindow | null {
    return this.win
  }

  /** Current window rectangle in screen px, or null if there is no window. */
  getWindowRect(): { x: number; y: number; width: number; height: number } | null {
    if (!this.win) return null
    const b = this.win.getBounds()
    return { x: b.x, y: b.y, width: b.width, height: b.height }
  }

  /** True while a manual drag is in progress (motion drivers stand down). */
  isDragging(): boolean {
    return this.dragOffset !== null
  }

  /**
   * Move the window by a relative delta (used during manual drag).
   * Uses setBounds with the intended width/height so the window position changes
   * without the transparent-window-grows-on-move bug on Windows.
   */
  moveBy(dx: number, dy: number): void {
    if (!this.win) return
    const [x, y] = this.win.getPosition()
    this.win.setBounds({
      x: Math.round(x + dx),
      y: Math.round(y + dy),
      width: this.intended.width,
      height: this.intended.height
    })
  }

  /**
   * Begin a manual drag. Captures the offset between the OS cursor and the
   * window's top-left, both in DIP screen coordinates. Repositioning during the
   * drag is then computed from the live cursor position (see {@link dragMove}),
   * which is drift-free and immune to display-scaling mismatches — unlike
   * accumulating per-frame deltas measured in the renderer's CSS pixels.
   */
  beginDrag(): void {
    if (!this.win) return
    const cursor = screen.getCursorScreenPoint()
    const [x, y] = this.win.getPosition()
    this.dragOffset = { x: cursor.x - x, y: cursor.y - y }
  }

  /**
   * Reposition the window to follow the live cursor, keeping the grabbed point
   * locked under the pointer. No-op if a drag isn't in progress.
   */
  dragMove(): void {
    if (!this.win || !this.dragOffset) return
    const cursor = screen.getCursorScreenPoint()
    this.moveTo(cursor.x - this.dragOffset.x, cursor.y - this.dragOffset.y)
  }

  /** End a manual drag. */
  endDrag(): void {
    this.dragOffset = null
  }

  /**
   * Move the window to an absolute top-left position. Like {@link moveBy}, it
   * re-asserts the intended size via setBounds to avoid the transparent-window
   * grow-on-move bug on Windows.
   */
  moveTo(x: number, y: number): void {
    if (!this.win) return
    this.win.setBounds({
      x: Math.round(x),
      y: Math.round(y),
      width: this.intended.width,
      height: this.intended.height
    })
  }

  /**
   * Report the window's current position and the horizontal range its left edge
   * may occupy within the work area of the display it currently sits on.
   */
  getWalkBounds(): WalkBounds | null {
    if (!this.win) return null
    const [x, y] = this.win.getPosition()
    const area = screen.getDisplayMatching(this.win.getBounds()).workArea
    const width = this.intended.width
    const minX = Math.round(area.x)
    const maxX = Math.round(area.x + area.width - width)
    return { x, y, minX: Math.min(minX, maxX), maxX: Math.max(minX, maxX) }
  }

  /** Toggle click-through. When ignored, clicks pass to windows underneath. */
  setIgnoreMouseEvents(ignore: boolean): void {
    this.win?.setIgnoreMouseEvents(ignore, { forward: true })
  }

  setSkipTaskbar(skip: boolean): void {
    this.win?.setSkipTaskbar(skip)
  }

  /**
   * Resize the window content to the given size (keeps the top-left corner).
   * Clamped to sane bounds and a no-op when unchanged, so it can never grow
   * without limit or churn on repeated identical requests.
   */
  setSize(width: number, height: number): void {
    if (!this.win) return
    const w = clamp(Math.round(width), 48, 512)
    const h = clamp(Math.round(height), 48, 600)
    this.intended = { width: w, height: h }
    const b = this.win.getBounds()
    // Anchor the BOTTOM edge: the character is bottom-anchored in the window, so
    // keeping the bottom fixed means resizing (or adding headroom for the speech
    // bubble) grows/shrinks the window upward and the character stays grounded.
    const y = b.y + (b.height - h)
    this.win.setBounds({ x: b.x, y, width: w, height: h })
  }

  toggleVisible(): void {
    if (!this.win) return
    if (this.win.isVisible()) this.win.hide()
    else this.win.show()
  }

  isVisible(): boolean {
    return this.win?.isVisible() ?? false
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}
