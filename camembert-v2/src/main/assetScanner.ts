import { promises as fs } from 'node:fs'
import { join, relative, sep } from 'node:path'
import {
  ANIMATION_CATEGORIES,
  EMPTY_MANIFEST,
  type AnimationCategory,
  type AnimationClip,
  type AssetManifest
} from '@shared/types'
import { ASSET_PROTOCOL, getAssetsRoot } from '@main/config/appConfig'

const FRAME_EXTENSIONS = new Set(['.png', '.webp', '.gif'])

/**
 * Base folders (relative to the assets root) searched for every category.
 * This supports both layouts transparently:
 *   assets/<category>/...              (flat)
 *   assets/character/<category>/...    (namespaced under a character)
 *
 * So `assets/character/idle/idle_01.png` is discovered as an `idle` clip.
 */
const SEARCH_BASES = ['', 'character']

/** Natural sort so frame_2.png comes before frame_10.png. */
function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function isFrameFile(name: string): boolean {
  const dot = name.lastIndexOf('.')
  if (dot < 0) return false
  return FRAME_EXTENSIONS.has(name.slice(dot).toLowerCase())
}

/** Build a `pet-asset://` URL from a file path relative to the assets root. */
function toAssetUrl(root: string, absFile: string): string {
  const encoded = relative(root, absFile).split(sep).map(encodeURIComponent).join('/')
  return `${ASSET_PROTOCOL}://frames/${encoded}`
}

async function listDirs(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return entries.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    return []
  }
}

async function listFrameFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return entries
      .filter((e) => e.isFile() && isFrameFile(e.name))
      .map((e) => e.name)
      .sort(naturalCompare)
  } catch {
    return []
  }
}

/** Ensure clip names are unique within a category. */
function uniqueName(seen: Set<string>, base: string): string {
  let name = base
  let i = 2
  while (seen.has(name)) name = `${base}_${i++}`
  seen.add(name)
  return name
}

/**
 * Collect all clips for one category across the supported base folders.
 * Two per-folder layouts are handled:
 *   <base>/<category>/<clip>/*.png  -> one clip per sub-folder
 *   <base>/<category>/*.png         -> a single "default" clip
 */
async function scanCategory(root: string, category: AnimationCategory): Promise<AnimationClip[]> {
  const clips: AnimationClip[] = []
  const seen = new Set<string>()

  for (const base of SEARCH_BASES) {
    const categoryDir = join(root, base, category)

    // Layout A: sub-folders, each = one clip.
    for (const clipName of (await listDirs(categoryDir)).sort(naturalCompare)) {
      const clipDir = join(categoryDir, clipName)
      const files = await listFrameFiles(clipDir)
      if (files.length === 0) continue
      clips.push({
        name: uniqueName(seen, clipName),
        category,
        frames: files.map((f) => toAssetUrl(root, join(clipDir, f))),
        frameCount: files.length
      })
    }

    // Layout B: loose PNGs directly under the category -> "default" clip.
    const looseFiles = await listFrameFiles(categoryDir)
    if (looseFiles.length > 0) {
      clips.push({
        name: uniqueName(seen, 'default'),
        category,
        frames: looseFiles.map((f) => toAssetUrl(root, join(categoryDir, f))),
        frameCount: looseFiles.length
      })
    }
  }

  return clips
}

/**
 * Walk the entire assets tree and build a manifest. Missing folders are treated
 * as empty rather than errors, so the app runs fine with zero, one, or many PNGs.
 */
export async function scanAssets(): Promise<AssetManifest> {
  const root = getAssetsRoot()

  let rootExists = true
  try {
    await fs.access(root)
  } catch {
    rootExists = false
  }
  if (!rootExists) {
    return { ...EMPTY_MANIFEST, generatedAt: Date.now() }
  }

  const manifest: AssetManifest = {
    categories: { ...EMPTY_MANIFEST.categories },
    totalClips: 0,
    totalFrames: 0,
    generatedAt: Date.now()
  }

  for (const category of ANIMATION_CATEGORIES) {
    const clips = await scanCategory(root, category)
    manifest.categories[category] = clips
    manifest.totalClips += clips.length
    manifest.totalFrames += clips.reduce((sum, c) => sum + c.frameCount, 0)
  }

  return manifest
}
