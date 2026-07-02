/** Centralised IPC channel names, shared between main and preload. */
export const IpcChannels = {
  /** renderer -> main (invoke): scan /assets and return an AssetManifest. */
  GetAssetManifest: 'assets:getManifest',
  /** renderer -> main (send): move the window by a relative delta while dragging. */
  WindowMoveBy: 'window:moveBy',
  /** renderer -> main (send): enable/disable click-through (mouse ignore). */
  WindowSetIgnoreMouse: 'window:setIgnoreMouse',
  /** renderer -> main (send): resize the window to a specific content size. */
  WindowSetSize: 'window:setSize',
  /** renderer -> main (invoke): get window position + horizontal walk limits. */
  WindowGetWalkBounds: 'window:getWalkBounds',
  /** renderer -> main (send): move the window to an absolute top-left position. */
  WindowMoveTo: 'window:moveTo',
  /** renderer -> main (send): show the native right-click context menu. */
  ShowContextMenu: 'ui:showContextMenu',
  /** renderer -> main (send): quit the app. */
  AppQuit: 'app:quit',
  /** main -> renderer (send): push a command to the pet. */
  PetCommand: 'pet:command'
} as const

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels]
