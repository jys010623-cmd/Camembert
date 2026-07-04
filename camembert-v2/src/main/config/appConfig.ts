import { app } from 'electron'
import { join } from 'node:path'
import { DEFAULT_SIZE, sizeToPx } from '@shared/config'

/** Custom protocol scheme used to serve PNG frames to the renderer. */
export const ASSET_PROTOCOL = 'pet-asset'

/** Window + behaviour configuration for the desktop pet. */
export const appConfig = {
  window: {
    // Initial size is a square at the default preset; the renderer refines the
    // height to the character's bounding-box aspect once the idle PNG loads.
    width: sizeToPx(DEFAULT_SIZE),
    height: sizeToPx(DEFAULT_SIZE),
    /** Initial position; null = auto (bottom-right of primary display). */
    x: null as number | null,
    y: null as number | null,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    /** Hide from the OS taskbar / dock. Toggleable at runtime via the tray menu. */
    skipTaskbar: true
  },
  pet: {
    /** Default frames-per-second for animation playback. */
    fps: 12,
    /** Random-action idle timing (milliseconds). */
    randomAction: {
      enabled: true,
      minDelayMs: 8000,
      maxDelayMs: 20000
    }
  }
} as const

/**
 * Resolve the root folder that holds the animation PNGs.
 *
 * - In development the assets live next to the source at <projectRoot>/assets.
 * - When packaged they are shipped as an unpacked resource under resources/assets.
 *
 * Dropping PNGs into <root>/<category>/<clip>/*.png is all that is required for
 * them to be picked up automatically.
 */
export function getAssetsRoot(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'assets')
  }
  // electron-vite runs the main process from <projectRoot>/out, so go up one level.
  return join(app.getAppPath(), 'assets')
}
