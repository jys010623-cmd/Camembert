import { Tray, nativeImage, type NativeImage } from 'electron'
import { buildAppMenu, type MenuContext } from '@main/menu'

/**
 * Tray icon, generated at runtime from an embedded base64 PNG so the app needs
 * no external icon file to run. Replace TRAY_ICON_PNG with your own artwork
 * later if desired.
 */
const TRAY_ICON_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAi0lEQVR42u2XUQqAMAxDcxzP4SE9' +
  '0y7kt/6NMVHrTFqRFvq7vJasEKCrtcybsnFWauFLEG/xA0QoQJR4hUgA9oNlmWq7A7TiVggwp5IA' +
  'PHk0HEDigZGp6L9AJZ6HKAFeAzDMCc+z6w5ggcPoiu8ArBuCakIXAIZHoDSZ1AN5iH6RDb4TzcLD' +
  'aWQ83wE/DWdFTvsudgAAAABJRU5ErkJggg=='

function createIcon(): NativeImage {
  const img = nativeImage.createFromDataURL(`data:image/png;base64,${TRAY_ICON_PNG}`)
  return img.isEmpty() ? nativeImage.createEmpty() : img
}

/** Owns the system tray icon and keeps its context menu in sync. */
export class TrayManager {
  private tray: Tray | null = null

  create(ctx: MenuContext): Tray {
    this.tray = new Tray(createIcon())
    this.tray.setToolTip('Camembert')
    this.refresh(ctx)

    // Left click toggles visibility for quick access.
    this.tray.on('click', () => ctx.toggleVisible())
    return this.tray
  }

  /** Rebuild the context menu so checkbox states stay current. */
  refresh(ctx: MenuContext): void {
    this.tray?.setContextMenu(buildAppMenu(ctx))
  }

  destroy(): void {
    this.tray?.destroy()
    this.tray = null
  }
}
