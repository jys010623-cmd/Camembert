export interface BBox {
  x: number
  y: number
  w: number
  h: number
  /** Natural size of the source image the box was measured in. */
  imgW: number
  imgH: number
}

const ALPHA_THRESHOLD = 10
const cache = new WeakMap<HTMLImageElement, BBox | null>()

/**
 * Compute the opaque bounding box of an image (the tight rectangle around all
 * pixels with alpha above the threshold). Result is cached per image.
 *
 * Returns null if the image is empty/fully transparent, or if pixel data can't
 * be read (e.g. the canvas is tainted) — callers then fall back gracefully.
 */
export function computeOpaqueBBox(img: HTMLImageElement): BBox | null {
  if (cache.has(img)) return cache.get(img) ?? null

  const w = img.naturalWidth
  const h = img.naturalHeight
  if (!w || !h) return null

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0)

  let data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, 0, w, h).data
  } catch {
    cache.set(img, null) // tainted — remember so we don't retry every time
    return null
  }

  let minX = w
  let minY = h
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < h; y++) {
    const rowStart = y * w * 4
    for (let x = 0; x < w; x++) {
      if (data[rowStart + x * 4 + 3] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  const box: BBox | null =
    maxX < 0
      ? null
      : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, imgW: w, imgH: h }

  cache.set(img, box)
  return box
}
