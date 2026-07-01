import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/ipc'
import type { AssetManifest, PetCommand } from '@shared/types'

/** The typed API surface exposed to the renderer as `window.petApi`. */
const petApi = {
  /** Scan the assets folder and return the current manifest. */
  getAssetManifest: (): Promise<AssetManifest> =>
    ipcRenderer.invoke(IpcChannels.GetAssetManifest),

  /** Move the window by a relative delta (used while dragging the pet). */
  moveWindowBy: (dx: number, dy: number): void =>
    ipcRenderer.send(IpcChannels.WindowMoveBy, dx, dy),

  /** Enable/disable click-through. */
  setIgnoreMouseEvents: (ignore: boolean): void =>
    ipcRenderer.send(IpcChannels.WindowSetIgnoreMouse, ignore),

  /** Resize the pet window to a specific content size (CSS px). */
  setWindowSize: (width: number, height: number): void =>
    ipcRenderer.send(IpcChannels.WindowSetSize, width, height),

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
