/**
 * A small speech bubble shown above the character. Purely presentational:
 * `say(text)` displays a line, auto-hiding after a duration proportional to its
 * length. A new line replaces whatever is showing. The bubble never intercepts
 * pointer events, so it can't interfere with dragging/clicking the pet.
 */
export class SpeechBubble {
  private readonly el: HTMLDivElement
  private hideTimer: ReturnType<typeof setTimeout> | null = null

  constructor(root: HTMLElement) {
    this.el = document.createElement('div')
    this.el.className = 'speech-bubble'
    this.el.setAttribute('aria-hidden', 'true')
    root.appendChild(this.el)
  }

  /**
   * Show a line. Empty text is ignored. Duration auto-scales with length
   * (min 1.8s, ~90ms per character, max 6s) unless `ms` is given.
   */
  say(text: string, ms?: number): void {
    const line = text.trim()
    if (!line) return

    this.el.textContent = line
    this.el.classList.add('speech-bubble--visible')
    this.el.setAttribute('aria-hidden', 'false')

    if (this.hideTimer) clearTimeout(this.hideTimer)
    const duration = ms ?? Math.min(6000, Math.max(1800, line.length * 90))
    this.hideTimer = setTimeout(() => this.hide(), duration)
  }

  hide(): void {
    this.el.classList.remove('speech-bubble--visible')
    this.el.setAttribute('aria-hidden', 'true')
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
  }

  get isVisible(): boolean {
    return this.el.classList.contains('speech-bubble--visible')
  }
}
