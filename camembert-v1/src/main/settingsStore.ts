import { app } from 'electron'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DEFAULT_SIZE, PET_SIZES, type PetSize } from '@shared/config'

export interface Settings {
  size: PetSize
}

const DEFAULTS: Settings = {
  size: DEFAULT_SIZE
}

/**
 * Tiny JSON-file settings store in the app's userData folder, so preferences
 * (like the chosen size) survive restarts.
 */
export class SettingsStore {
  private readonly file = join(app.getPath('userData'), 'settings.json')
  private data: Settings = { ...DEFAULTS }

  load(): Settings {
    try {
      const parsed = JSON.parse(readFileSync(this.file, 'utf8')) as Partial<Settings>
      this.data = { ...DEFAULTS, ...parsed }
      if (!PET_SIZES.includes(this.data.size)) this.data.size = DEFAULT_SIZE
    } catch {
      this.data = { ...DEFAULTS }
    }
    return this.data
  }

  get(): Settings {
    return this.data
  }

  set(patch: Partial<Settings>): void {
    this.data = { ...this.data, ...patch }
    try {
      writeFileSync(this.file, JSON.stringify(this.data, null, 2), 'utf8')
    } catch (err) {
      console.error('[SettingsStore] failed to save', err)
    }
  }
}
