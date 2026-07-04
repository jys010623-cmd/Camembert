/**
 * Listens to the microphone and turns ambient sound / music into dance cues.
 *
 * It measures short-term loudness (RMS) to decide when "music" is playing, and
 * detects beats as energy spikes above a rolling average. All Web Audio; no
 * native code. Everything is best-effort and fails soft: if permission is
 * denied or audio isn't available, `onError` fires and the detector stays off.
 */
export interface MicDanceCallbacks {
  /** Sustained sound began (start dancing). */
  onMusicStart?: () => void
  /** Sustained silence (stop dancing). */
  onMusicStop?: () => void
  /** A beat was detected; `intensity` in ~[0,1] for bounce strength. */
  onBeat?: (intensity: number) => void
  /** Permission denied or audio unavailable. */
  onError?: (message: string) => void
}

/** Loudness (RMS, 0..1) above which sound counts as "present". */
const SOUND_FLOOR = 0.045
/** Consecutive quiet seconds before we declare music stopped. */
const SILENCE_HOLD_MS = 1500
/** Minimum gap between beats (debounce ~ max 260 BPM). */
const BEAT_MIN_GAP_MS = 230

export class MicDanceDetector {
  private ctx: AudioContext | null = null
  private stream: MediaStream | null = null
  private analyser: AnalyserNode | null = null
  private timeBuf: Uint8Array | null = null
  private freqBuf: Uint8Array | null = null
  private rafId = 0

  private running = false
  private musicOn = false
  private lastLoudAt = 0
  private lastBeatAt = 0
  private energyAvg = 0

  constructor(private readonly cb: MicDanceCallbacks = {}) {}

  get isRunning(): boolean {
    return this.running
  }

  async start(): Promise<void> {
    if (this.running) return
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      })
    } catch (err) {
      this.cb.onError?.(err instanceof Error ? err.message : 'microphone unavailable')
      return
    }

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Ctx()
    const source = this.ctx.createMediaStreamSource(this.stream)
    this.analyser = this.ctx.createAnalyser()
    this.analyser.fftSize = 1024
    this.analyser.smoothingTimeConstant = 0.6
    source.connect(this.analyser)

    this.timeBuf = new Uint8Array(this.analyser.fftSize)
    this.freqBuf = new Uint8Array(this.analyser.frequencyBinCount)

    this.running = true
    this.musicOn = false
    this.lastLoudAt = 0
    this.energyAvg = 0
    this.rafId = requestAnimationFrame(this.tick)
  }

  stop(): void {
    this.running = false
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = 0
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    void this.ctx?.close().catch(() => undefined)
    this.ctx = null
    this.analyser = null
    if (this.musicOn) {
      this.musicOn = false
      this.cb.onMusicStop?.()
    }
  }

  private tick = (): void => {
    if (!this.running || !this.analyser || !this.timeBuf || !this.freqBuf) return
    const now = performance.now()

    // --- Loudness (RMS) from the time-domain waveform ---
    this.analyser.getByteTimeDomainData(this.timeBuf)
    let sumSq = 0
    for (let i = 0; i < this.timeBuf.length; i++) {
      const v = (this.timeBuf[i] - 128) / 128
      sumSq += v * v
    }
    const rms = Math.sqrt(sumSq / this.timeBuf.length)

    // --- Music present / stopped hysteresis ---
    if (rms > SOUND_FLOOR) {
      this.lastLoudAt = now
      if (!this.musicOn) {
        this.musicOn = true
        this.cb.onMusicStart?.()
      }
    } else if (this.musicOn && now - this.lastLoudAt > SILENCE_HOLD_MS) {
      this.musicOn = false
      this.cb.onMusicStop?.()
    }

    // --- Beat detection on low-frequency energy flux ---
    if (this.musicOn) {
      this.analyser.getByteFrequencyData(this.freqBuf)
      const bins = Math.max(1, Math.floor(this.freqBuf.length * 0.15)) // bass-ish band
      let energy = 0
      for (let i = 0; i < bins; i++) energy += this.freqBuf[i]
      energy /= bins * 255 // normalise ~[0,1]

      this.energyAvg = this.energyAvg === 0 ? energy : this.energyAvg * 0.9 + energy * 0.1
      const isSpike = energy > this.energyAvg * 1.35 && energy > 0.15
      if (isSpike && now - this.lastBeatAt > BEAT_MIN_GAP_MS) {
        this.lastBeatAt = now
        this.cb.onBeat?.(Math.min(1, energy))
      }
    }

    this.rafId = requestAnimationFrame(this.tick)
  }
}
