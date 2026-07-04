import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { WindowManager } from '@main/windowManager'
import { MotionController } from '@main/motionController'
import { TrayManager } from '@main/tray'
import { buildAppMenu, type MenuContext } from '@main/menu'
import { registerAssetScheme, registerAssetProtocol } from '@main/assetProtocol'
import { scanAssets } from '@main/assetScanner'
import { appConfig } from '@main/config/appConfig'
import { SettingsStore } from '@main/settingsStore'
import { IpcChannels } from '@shared/ipc'
import type { PetCommand } from '@shared/types'
import { sizeToPx, type PetSize } from '@shared/config'

// App display name (tray, notifications, taskbar).
app.setName('Camembert')

// Privileged scheme must be registered before the app is ready.
registerAssetScheme()

class App {
  private readonly windows = new WindowManager()
  private readonly motion = new MotionController(this.windows, (v) =>
    this.sendCommand({ type: 'motionVisual', mode: v.mode, moving: v.moving, dir: v.dir })
  )
  private readonly tray = new TrayManager()
  private readonly settings = new SettingsStore()

  // Runtime-toggleable behaviour flags.
  private clickThrough = false
  private skipTaskbar: boolean = appConfig.window.skipTaskbar
  private randomActions: boolean = appConfig.pet.randomAction.enabled
  private followCursor = false
  private perchEdge = false
  private micDance = false
  private debug = false
  private size: PetSize = 'medium'

  async start(): Promise<void> {
    const s = this.settings.load()
    this.size = s.size
    this.clickThrough = s.clickThrough
    this.skipTaskbar = s.skipTaskbar
    this.randomActions = s.randomActions
    this.followCursor = s.followCursor
    this.perchEdge = s.perchEdge
    if (this.followCursor) this.perchEdge = false // mutually exclusive
    this.micDance = s.micDance

    registerAssetProtocol()
    this.registerIpc()

    // Restore the pet's last spot (x + bottom edge → grounded, headroom-safe).
    const initial =
      s.windowX != null && s.windowBottom != null
        ? { x: s.windowX, y: s.windowBottom - appConfig.window.height }
        : undefined
    this.windows.create(initial)

    // Re-apply persisted window behaviours.
    this.windows.setIgnoreMouseEvents(this.clickThrough)
    this.windows.setSkipTaskbar(this.skipTaskbar)
    if (this.followCursor) this.motion.setFollow(true)
    else if (this.perchEdge) this.motion.setPerch(true)

    this.tray.create(this.menuContext())

    // Push persisted size + toggle state once the renderer has loaded.
    const win = this.windows.getWindow()
    win?.webContents.on('did-finish-load', () => this.pushInitialState())

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) this.windows.create()
    })
  }

  private pushSize(): void {
    this.sendCommand({ type: 'setSize', size: this.size, px: sizeToPx(this.size) })
  }

  /** Sync persisted renderer-side state (size, random actions, mic) on load. */
  private pushInitialState(): void {
    this.pushSize()
    this.sendCommand({ type: 'toggleRandomActions', enabled: this.randomActions })
    if (this.micDance) this.sendCommand({ type: 'setMicDance', enabled: true })
  }

  /** Bring the existing pet window to the foreground (single-instance focus). */
  focusWindow(): void {
    this.windows.getWindow()?.show()
  }

  /** Context object shared by the tray menu and the right-click menu. */
  private menuContext(): MenuContext {
    return {
      isVisible: () => this.windows.isVisible(),
      toggleVisible: () => {
        this.windows.toggleVisible()
        this.tray.refresh(this.menuContext())
      },
      clickThrough: this.clickThrough,
      setClickThrough: (v) => {
        this.clickThrough = v
        this.windows.setIgnoreMouseEvents(v)
        this.settings.set({ clickThrough: v })
        this.tray.refresh(this.menuContext())
      },
      skipTaskbar: this.skipTaskbar,
      setSkipTaskbar: (v) => {
        this.skipTaskbar = v
        this.windows.setSkipTaskbar(v)
        this.settings.set({ skipTaskbar: v })
        this.tray.refresh(this.menuContext())
      },
      randomActions: this.randomActions,
      setRandomActions: (v) => {
        this.randomActions = v
        this.sendCommand({ type: 'toggleRandomActions', enabled: v })
        this.settings.set({ randomActions: v })
        this.tray.refresh(this.menuContext())
      },
      followCursor: this.followCursor,
      setFollowCursor: (v) => {
        this.followCursor = v
        if (v) this.perchEdge = false
        this.motion.setFollow(v)
        this.settings.set({ followCursor: v, perchEdge: this.perchEdge })
        this.tray.refresh(this.menuContext())
      },
      perchEdge: this.perchEdge,
      setPerchEdge: (v) => {
        this.perchEdge = v
        if (v) this.followCursor = false
        this.motion.setPerch(v)
        this.settings.set({ perchEdge: v, followCursor: this.followCursor })
        this.tray.refresh(this.menuContext())
      },
      micDance: this.micDance,
      setMicDance: (v) => {
        this.micDance = v
        this.sendCommand({ type: 'setMicDance', enabled: v })
        this.settings.set({ micDance: v })
        this.tray.refresh(this.menuContext())
      },
      debug: this.debug,
      setDebug: (v) => {
        this.debug = v
        this.sendCommand({ type: 'toggleDebug', enabled: v })
        this.tray.refresh(this.menuContext())
      },
      size: this.size,
      setSize: (v) => {
        this.size = v
        this.settings.set({ size: v })
        this.pushSize()
        this.tray.refresh(this.menuContext())
      },
      feed: () => this.sendCommand({ type: 'feed' }),
      playWith: () => this.sendCommand({ type: 'playWith' }),
      sendCommand: (cmd) => this.sendCommand(cmd),
      reloadAssets: () => this.sendCommand({ type: 'reloadAssets' }),
      quit: () => app.quit()
    }
  }

  private sendCommand(cmd: PetCommand): void {
    this.windows.getWindow()?.webContents.send(IpcChannels.PetCommand, cmd)
  }

  private registerIpc(): void {
    ipcMain.handle(IpcChannels.GetAssetManifest, () => scanAssets())

    ipcMain.on(IpcChannels.WindowMoveBy, (_e, dx: number, dy: number) => {
      this.windows.moveBy(dx, dy)
    })

    ipcMain.on(IpcChannels.WindowBeginDrag, () => this.windows.beginDrag())
    ipcMain.on(IpcChannels.WindowDragMove, () => this.windows.dragMove())
    ipcMain.on(IpcChannels.WindowEndDrag, () => {
      this.windows.endDrag()
      // Remember where the user parked the pet (x + bottom edge).
      const r = this.windows.getWindowRect()
      if (r) this.settings.set({ windowX: r.x, windowBottom: r.y + r.height })
    })

    ipcMain.handle(IpcChannels.GetInitialStats, () => this.settings.get().stats)
    ipcMain.on(IpcChannels.SaveStats, (_e, stats: { hunger: number; energy: number; mood: number }) => {
      this.settings.set({ stats })
    })

    ipcMain.on(IpcChannels.WindowSetIgnoreMouse, (_e, ignore: boolean) => {
      this.clickThrough = ignore
      this.windows.setIgnoreMouseEvents(ignore)
      this.tray.refresh(this.menuContext())
    })

    ipcMain.on(IpcChannels.WindowSetSize, (_e, width: number, height: number) => {
      this.windows.setSize(width, height)
    })

    ipcMain.handle(IpcChannels.WindowGetWalkBounds, () => this.windows.getWalkBounds())

    ipcMain.on(IpcChannels.WindowMoveTo, (_e, x: number, y: number) => {
      this.windows.moveTo(x, y)
    })

    ipcMain.on(IpcChannels.ShowContextMenu, (e) => {
      const menu = buildAppMenu(this.menuContext())
      const win = BrowserWindow.fromWebContents(e.sender) ?? undefined
      menu.popup({ window: win })
    })

    ipcMain.on(IpcChannels.AppQuit, () => app.quit())
  }
}

const instance = new App()

// Single-instance lock: focus/show the existing pet instead of spawning another.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    instance.focusWindow()
  })

  app.whenReady().then(() => {
    // No application menu bar for a frameless desktop pet.
    Menu.setApplicationMenu(null)
    instance.start()
  })

  // Keep running in the tray even when the window is hidden/closed.
  app.on('window-all-closed', () => {
    // Intentionally do NOT quit on non-macOS; the tray keeps the pet alive.
  })
}
