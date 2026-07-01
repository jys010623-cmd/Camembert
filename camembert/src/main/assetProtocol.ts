import { protocol } from 'electron'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, sep } from 'node:path'
import { ASSET_PROTOCOL, getAssetsRoot } from '@main/config/appConfig'

/**
 * Must be called BEFORE app `ready`. Registers `pet-asset://` as a privileged
 * scheme so the renderer can load frames from it like normal secure resources.
 */
export function registerAssetScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: ASSET_PROTOCOL,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
        bypassCSP: true,
        // Allow CORS so frames drawn to a canvas don't taint it — required for
        // alpha hit-testing and bounding-box computation in the renderer.
        corsEnabled: true
      }
    }
  ])
}

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
}

/**
 * Must be called AFTER app `ready`. Serves files from the assets root by reading
 * bytes directly and returning them with an explicit CORS header, so the
 * renderer can load frames cross-origin without tainting the canvas. Includes a
 * guard against path traversal outside the assets root.
 */
export function registerAssetProtocol(): void {
  const root = getAssetsRoot()

  protocol.handle(ASSET_PROTOCOL, async (request) => {
    try {
      const url = new URL(request.url)
      // URL form: pet-asset://frames/<relative-path>
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '')
      const target = normalize(join(root, relative))

      // Prevent escaping the assets root via ".." segments.
      if (target !== root && !target.startsWith(root + sep)) {
        return new Response('Forbidden', { status: 403 })
      }

      const data = await readFile(target)
      const mime = MIME_TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream'
      return new Response(new Uint8Array(data), {
        status: 200,
        headers: {
          'Content-Type': mime,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }
      })
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })
}
