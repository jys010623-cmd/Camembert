import { Menu, type MenuItemConstructorOptions } from 'electron'
import type { AnimationCategory, PetCommand } from '@shared/types'
import { PET_SIZES, SIZE_PRESETS, type PetSize } from '@shared/config'

/** Everything the menu needs from the rest of the app. */
export interface MenuContext {
  isVisible: () => boolean
  toggleVisible: () => void
  clickThrough: boolean
  setClickThrough: (v: boolean) => void
  skipTaskbar: boolean
  setSkipTaskbar: (v: boolean) => void
  randomActions: boolean
  setRandomActions: (v: boolean) => void
  debug: boolean
  setDebug: (v: boolean) => void
  size: PetSize
  setSize: (v: PetSize) => void
  sendCommand: (cmd: PetCommand) => void
  reloadAssets: () => void
  quit: () => void
}

const PLAY_ITEMS: { label: string; category: AnimationCategory }[] = [
  { label: 'Idle', category: 'idle' },
  { label: 'Emotion', category: 'emotion' },
  { label: 'Music', category: 'music' },
  { label: 'Dance', category: 'dance' },
  { label: 'Sleep', category: 'sleep' },
  { label: 'Walk', category: 'walk' },
  { label: 'Turnaround', category: 'turnaround' }
]

const SIZE_LABELS: Record<PetSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large'
}

/** Build the menu shown both from the tray and on right-click. */
export function buildAppMenu(ctx: MenuContext): Menu {
  const playSubmenu: MenuItemConstructorOptions[] = PLAY_ITEMS.map((item) => ({
    label: item.label,
    click: () => ctx.sendCommand({ type: 'play', category: item.category })
  }))

  const sizeSubmenu: MenuItemConstructorOptions[] = PET_SIZES.map((size) => ({
    label: `${SIZE_LABELS[size]} (${SIZE_PRESETS[size]}px)`,
    type: 'radio',
    checked: ctx.size === size,
    click: () => ctx.setSize(size)
  }))

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Camembert',
      enabled: false
    },
    { type: 'separator' },
    {
      label: ctx.isVisible() ? 'Hide' : 'Show',
      click: () => ctx.toggleVisible()
    },
    {
      label: 'Play',
      submenu: playSubmenu
    },
    {
      label: 'Size',
      submenu: sizeSubmenu
    },
    { type: 'separator' },
    {
      label: 'Random Actions',
      type: 'checkbox',
      checked: ctx.randomActions,
      click: (item) => ctx.setRandomActions(item.checked)
    },
    {
      label: 'Click-through',
      type: 'checkbox',
      checked: ctx.clickThrough,
      click: (item) => ctx.setClickThrough(item.checked)
    },
    {
      label: 'Hide from taskbar',
      type: 'checkbox',
      checked: ctx.skipTaskbar,
      click: (item) => ctx.setSkipTaskbar(item.checked)
    },
    {
      label: 'Debug panel',
      type: 'checkbox',
      checked: ctx.debug,
      accelerator: 'F3',
      click: (item) => ctx.setDebug(item.checked)
    },
    { type: 'separator' },
    {
      label: 'Reload assets',
      click: () => ctx.reloadAssets()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => ctx.quit()
    }
  ]

  return Menu.buildFromTemplate(template)
}
