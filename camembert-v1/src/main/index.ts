import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { WindowManager } from '@main/windowManager'
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
  private readonly tray = new TrayManager()
  private readonly settings = new SettingsStore()

  // Runtime-toggleable behaviour flags.
  private clickThrough = false
  private skipTaskbar: boolean = appConfig.window.skipTaskbar
  private randomActions: boolean = appConfig.pet.randomAction.enabled
  private debug = false
  private size: PetSize = 'medium'

  async start(): Promise<void> {
    this.size = this.settings.load().size
    registerAssetProtocol()
    this.registerIpc()
    this.windows.create()
    this.tray.create(this.menuContext())

    // Tell the renderer the persisted size once it has loaded, so it can size
    // the window to the character's bounding box.
    const win = this.windows.getWindow()
    win?.webContents.on('did-finish-load', () => this.pushSize())

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) this.windows.create()
    })
  }

  private pushSize(): void {
    this.sendCommand({ type: 'setSize', size: this.size, px: sizeToPx(this.size) })
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
        this.tray.refresh(this.menuContext())
      },
      skipTaskbar: this.skipTaskbar,
      setSkipTaskbar: (v) => {
        this.skipTaskbar = v
        this.windows.setSkipTaskbar(v)
        this.tray.refresh(this.menuContext())
      },
      randomActions: this.randomActions,
      setRandomActions: (v) => {
        this.randomActions = v
        this.sendCommand({ type: 'toggleRandomActions', enabled: v })
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
