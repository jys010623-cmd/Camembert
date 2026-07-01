import type { DebugInfo } from '@shared/types'

export type DebugInfoProvider = () => DebugInfo

/**
 * Lightweight developer overlay showing live State / Animation / Frame / FPS.
 * Hidden by default; toggle with F3 or the tray menu. It creates its own DOM so
 * it needs no markup in index.html.
 */
export class DebugPanel {
  private readonly el: HTMLElement
  private readonly values: Record<string, HTMLElement> = {}
  private rafId = 0
  private visible = false

  constructor(private readonly provider: DebugInfoProvider) {
    this.el = document.createElement('div')
    this.el.className = 'debug-panel'
    this.el.style.display = 'none'

    const title = document.createElement('div')
    title.className = 'debug-panel__title'
    title.textContent = 'Camembert · debug'
    this.el.appendChild(title)

    for (const key of ['State', 'Animation', 'Frame', 'FPS', 'Queue', 'PNGs', 'Size', 'Win', 'BBox'] as const) {
      const row = document.createElement('div')
      row.className = 'debug-panel__row'

      const label = document.createElement('span')
      label.className = 'debug-panel__label'
      label.textContent = key

      const value = document.createElement('span')
      value.className = 'debug-panel__value'
      value.textContent = '—'

      row.append(label, value)
      this.el.appendChild(row)
      this.values[key] = value
    }

    document.body.appendChild(this.el)
  }

  get isVisible(): boolean {
    return this.visible
  }

  /** Show/hide the panel. Pass a boolean to force a specific state. */
  toggle(force?: boolean): boolean {
    this.visible = force ?? !this.visible
    this.el.style.display = this.visible ? 'block' : 'none'
    if (this.visible) this.startLoop()
    else this.stopLoop()
    return this.visible
  }

  private startLoop(): void {
    if (this.rafId) return
    const loop = (): void => {
      this.render(this.provider())
      this.rafId = requestAnimationFrame(loop)
    }
    this.rafId = requestAnimationFrame(loop)
  }

  private stopLoop(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = 0
  }

  private render(info: DebugInfo): void {
    const anim = info.category ? `${info.category}/${info.clip ?? '?'}` : '—'
    const frame = info.frameCount ? `${info.frameIndex + 1} / ${info.frameCount}` : '0 / 0'
    const assets = info.hasAssets ? '' : '  (no PNG)'

    this.values['State'].textContent = info.state + assets
    this.values['Animation'].textContent = anim
    this.values['Frame'].textContent = frame
    this.values['FPS'].textContent = String(info.fps)
    this.values['Queue'].textContent = String(info.queueLength)
    this.values['PNGs'].textContent = `${info.pngCount} (${info.clipCount} clips)`
    this.values['Size'].textContent = `${info.sizeLabel} · ${info.displayW}×${info.displayH}`
    this.values['Win'].textContent = `${window.innerWidth}×${window.innerHeight}`
    this.values['BBox'].textContent = info.bboxW ? `${info.bboxW}×${info.bboxH}` : '—'
  }
}
