/**
 * Loads and caches frame images for animation clips.
 *
 * Frames are served over the `pet-asset://` protocol registered in the main
 * process. The loader is purely renderer-side and knows nothing about the
 * filesystem — it just turns URLs into decoded `HTMLImageElement`s.
 */
export class SpriteLoader {
  private readonly cache = new Map<string, HTMLImageElement[]>()
  private readonly inFlight = new Map<string, Promise<HTMLImageElement[]>>()

  /** Load (or return cached) frames for a clip, keyed by a stable id. */
  load(key: string, urls: string[]): Promise<HTMLImageElement[]> {
    const cached = this.cache.get(key)
    if (cached) return Promise.resolve(cached)

    const pending = this.inFlight.get(key)
    if (pending) return pending

    const promise = Promise.all(urls.map(loadImage))
      .then((images) => {
        this.cache.set(key, images)
        this.inFlight.delete(key)
        return images
      })
      .catch((err) => {
        this.inFlight.delete(key)
        throw err
      })

    this.inFlight.set(key, promise)
    return promise
  }

  isLoaded(key: string): boolean {
    return this.cache.has(key)
  }

  /** Drop all cached images (e.g. after assets are reloaded). */
  clear(): void {
    this.cache.clear()
    this.inFlight.clear()
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  // Prefer an anonymous-CORS load so the canvas stays untainted (enables alpha
  // hit-testing + bbox crop). If that fails for any reason, fall back to a plain
  // load so the character is always displayed — hit-testing then uses the
  // elliptical fallback and cropping is skipped.
  return loadWith(url, 'anonymous').catch(() => loadWith(url, null))
}

function loadWith(url: string, crossOrigin: string | null): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (crossOrigin !== null) img.crossOrigin = crossOrigin
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load frame: ${url}`))
    img.src = url
  })
}
