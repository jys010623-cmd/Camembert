import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/ipc'
import type { AssetManifest, PetCommand, WalkBounds } from '@shared/types'

/** The typed API surface exposed to the renderer as `window.petApi`. */
const petApi = {
  /** Scan the assets folder and return the current manifest. */
  getAssetManifest: (): Promise<AssetManifest> =>
    ipcRenderer.invoke(IpcChannels.GetAssetManifest),

  /** Move the window by a relative delta (used while dragging the pet). */
  moveWindowBy: (dx: number, dy: number): void =>
    ipcRenderer.send(IpcChannels.WindowMoveBy, dx, dy),

  /** Begin a manual drag; main captures the cursor→window offset. */
  beginWindowDrag: (): void => ipcRenderer.send(IpcChannels.WindowBeginDrag),

  /** Drag tick; main snaps the window to the live cursor position. */
  dragWindow: (): void => ipcRenderer.send(IpcChannels.WindowDragMove),

  /** End a manual drag. */
  endWindowDrag: (): void => ipcRenderer.send(IpcChannels.WindowEndDrag),

  /** Enable/disable click-through. */
  setIgnoreMouseEvents: (ignore: boolean): void =>
    ipcRenderer.send(IpcChannels.WindowSetIgnoreMouse, ignore),

  /** Resize the pet window to a specific content size (CSS px). */
  setWindowSize: (width: number, height: number): void =>
    ipcRenderer.send(IpcChannels.WindowSetSize, width, height),

  /** Get the window position and the horizontal limits for walking. */
  getWalkBounds: (): Promise<WalkBounds | null> =>
    ipcRenderer.invoke(IpcChannels.WindowGetWalkBounds),

  /** Move the window to an absolute top-left position (used while walking). */
  moveWindowTo: (x: number, y: number): void =>
    ipcRenderer.send(IpcChannels.WindowMoveTo, x, y),

  /** Read persisted Tamagotchi stats (or null to start fresh). */
  getInitialStats: (): Promise<{ hunger: number; energy: number; mood: number } | null> =>
    ipcRenderer.invoke(IpcChannels.GetInitialStats),

  /** Persist the current Tamagotchi stats. */
  saveStats: (stats: { hunger: number; energy: number; mood: number }): void =>
    ipcRenderer.send(IpcChannels.SaveStats, stats),

  /** Ask the main process to show the native right-click menu. */
  showContextMenu: (): void => ipcRenderer.send(IpcChannels.ShowContextMenu),

  /** Quit the application. */
  quit: (): void => ipcRenderer.send(IpcChannels.AppQuit),

  /** Subscribe to commands pushed from the tray / context menu. */
  onCommand: (handler: (cmd: PetCommand) => void): (() => void) => {
    const listener = (_e: unknown, cmd: PetCommand): void => handler(cmd)
    ipcRenderer.on(IpcChannels.PetCommand, listener)
    return () => ipcRenderer.removeListener(IpcChannels.PetCommand, listener)
  }
}

export type PetApi = typeof petApi

contextBridge.exposeInMainWorld('petApi', petApi)
