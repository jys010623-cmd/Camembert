import type { DebugInfo, PetCommand, PetState } from '@shared/types'
import { DEFAULT_SIZE, sizeToPx, SPEECH_HEADROOM_PX, type PetSize } from '@shared/config'
import { AnimationManager } from '@renderer/engine/animation/AnimationManager'
import { AnimationQueue, type QueueItem } from '@renderer/engine/animation/AnimationQueue'
import type { BBox } from '@renderer/engine/animation/ImageAnalyzer'
import {
  PetStateMachine,
  IdleState,
  EmotionState,
  MusicState,
  DanceState,
  SleepState,
  WalkState,
  TurnaroundState,
  type StateServices
} from '@renderer/engine/state/StateManager'
import { RandomActionManager } from '@renderer/engine/random/RandomActionManager'
import { WalkController } from '@renderer/engine/walk/WalkController'
import { PetRenderer } from '@renderer/pet/PetRenderer'
import { DebugPanel } from '@renderer/ui/DebugPanel'
import { SpeechBubble } from '@renderer/ui/SpeechBubble'
import { pickLine, type SpeechTrigger } from '@renderer/config/speechLines'
import { PetStats, type PetNeed } from '@renderer/engine/stats/PetStats'
import { MicDanceDetector } from '@renderer/engine/audio/MicDanceDetector'
import {
  CATEGORY_FPS,
  CATEGORY_LOOPS,
  PLACEHOLDER_ACTION_MS,
  RANDOM_ACTION,
  STATE_DURATIONS,
  STATE_TO_CATEGORY
} from '@renderer/config/animationConfig'

/**
 * Top-level controller. Wires the renderer, animation engine, animation queue,
 * state machine, and random-action scheduler together, and reacts to user input
 * (drag / click) and menu commands.
 *
 * Behaviour loop: Idle → (random) Emotion / Music / Dance / Sleep → Idle. On top
 * of that it layers the "personality" features: speech bubbles, a Tamagotchi
 * needs model that biases random actions, microphone-driven dancing, and two
 * window-motion modes (follow cursor / perch on edge) that main drives while the
 * renderer just plays the matching pose. Autonomy is suspended while a motion
 * mode or mic-dance is active so the layers never fight.
 */
export class Pet {
  private readonly renderer: PetRenderer
  private readonly animations: AnimationManager
  private readonly queue: AnimationQueue
  private readonly machine = new PetStateMachine()
  private readonly random: RandomActionManager
  private readonly walk: WalkController
  private readonly debug: DebugPanel
  private readonly speech: SpeechBubble
  private readonly stats: PetStats
  private readonly mic: MicDanceDetector

  private hasAssets = false
  private hasIdle = false
  private randomEnabled = true

  // Personality-layer runtime flags.
  private motionMode: 'none' | 'follow' | 'perch' = 'none'
  private micDancing = false
  private beatTimer: ReturnType<typeof setTimeout> | null = null

  // Display sizing.
  private sizeLabel: PetSize = DEFAULT_SIZE
  private presetPx = sizeToPx(DEFAULT_SIZE)
  private idleBBox: BBox | null = null
  /** Union crop box across all clips; drives a stable window aspect once known. */
  private globalBBox: BBox | null = null
  private displayW = sizeToPx(DEFAULT_SIZE)
  private displayH = sizeToPx(DEFAULT_SIZE)

  constructor(root: HTMLElement) {
    this.renderer = new PetRenderer(root, {
      onClick: () => this.onClick(),
      onDragStart: () => window.petApi.beginWindowDrag(),
      onDragMove: () => window.petApi.dragWindow(),
      onDragEnd: () => window.petApi.endWindowDrag(),
      onContextMenu: () => window.petApi.showContextMenu(),
      onResize: () => this.animations.redraw()
    })

    this.speech = new SpeechBubble(root)
    this.stats = new PetStats((need) => this.onNeed(need))
    this.mic = new MicDanceDetector({
      onMusicStart: () => this.onMusicStart(),
      onMusicStop: () => this.onMusicStop(),
      onBeat: (intensity) => this.onBeat(intensity),
      onError: (msg) => console.warn('[mic] ', msg)
    })

    this.animations = new AnimationManager(this.renderer.getContext())
    this.queue = new AnimationQueue(this.animations, PLACEHOLDER_ACTION_MS)
    this.queue.onDrained = () => this.onQueueDrained()

    const services: StateServices = {
      playIdleLoop: () => void this.animations.play('idle'),
      enqueueState: (state) => this.enqueueState(state),
      startRandom: () => {
        if (this.randomEnabled && !this.autonomySuspended()) this.random.start()
      },
      stopRandom: () => this.random.stop()
    }

    this.machine
      .register(new IdleState(services))
      .register(new EmotionState(services))
      .register(new MusicState(services))
      .register(new DanceState(services))
      .register(new SleepState(services))
      .register(new WalkState(services))
      .register(new TurnaroundState(services))

    this.random = new RandomActionManager(
      () => this.machine.is('idle') && !this.autonomySuspended(),
      // The suggested state is ignored; we pick a needs-weighted action instead.
      () => this.machine.transition(this.pickRandomAction()),
      { actions: RANDOM_ACTION.actions }
    )

    this.walk = new WalkController(
      {
        getBounds: () => window.petApi.getWalkBounds(),
        moveTo: (x, y) => window.petApi.moveWindowTo(x, y),
        setFlipped: (flipped) => this.renderer.setFlipped(flipped),
        setBounce: (offsetY, scaleY) => this.renderer.setBounce(offsetY, scaleY)
      },
      CATEGORY_FPS.walk
    )

    this.machine.onChange((state) => this.onStateChanged(state))
    this.debug = new DebugPanel(() => this.getDebugInfo())
  }

  /** Load assets and start the behaviour loop. */
  async init(): Promise<void> {
    window.petApi.onCommand((cmd) => void this.handleCommand(cmd))
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F3') this.debug.toggle()
    })
    await this.loadAssets()
    // Restore persisted Tamagotchi stats, then run the needs model.
    try {
      this.stats.restore(await window.petApi.getInitialStats())
    } catch {
      /* no persisted stats; start fresh */
    }
    this.stats.start()
    this.setupSystemMonitors()
    // Persist stats periodically so they survive a restart.
    setInterval(() => window.petApi.saveStats(this.stats.snapshot()), 20_000)
    // Greet once things are on screen.
    setTimeout(() => this.speech.say(pickLine('greeting')), 600)
  }

  /**
   * Lightweight system-event reactions: an on-the-hour chime and battery
   * awareness (low / charging). Both are best-effort — the Battery API may be
   * unavailable on some platforms, in which case that half simply no-ops.
   */
  private setupSystemMonitors(): void {
    // On-the-hour chime.
    let lastHour = new Date().getHours()
    setInterval(() => {
      const h = new Date().getHours()
      if (h !== lastHour) {
        lastHour = h
        this.reactSystemEvent('hour', h)
      }
    }, 30_000)

    // Battery, via the (optional) Battery Status API.
    interface BatteryLike {
      level: number
      charging: boolean
      addEventListener(type: string, listener: () => void): void
    }
    const getBattery = (navigator as unknown as {
      getBattery?: () => Promise<BatteryLike>
    }).getBattery
    if (typeof getBattery !== 'function') return
    getBattery
      .call(navigator)
      .then((bat: BatteryLike) => {
        let warnedLow = false
        const check = (): void => {
          if (!bat.charging && bat.level <= 0.2 && !warnedLow) {
            warnedLow = true
            this.reactSystemEvent('lowBattery')
          }
          if (bat.charging || bat.level > 0.25) warnedLow = false
        }
        bat.addEventListener('levelchange', check)
        bat.addEventListener('chargingchange', () => {
          if (bat.charging) this.reactSystemEvent('charging')
          check()
        })
        check()
      })
      .catch(() => undefined)
  }

  private async loadAssets(): Promise<void> {
    const manifest = await window.petApi.getAssetManifest()
    this.animations.setManifest(manifest)
    this.hasAssets = this.animations.hasAnyClips()
    this.hasIdle = this.animations.hasCategory('idle')

    this.idleBBox = this.hasIdle ? await this.animations.computeBBoxFor('idle') : null
    this.globalBBox = null
    this.applyWindowSize()

    this.queue.clear()
    this.machine.force('idle')

    if (this.hasAssets) {
      void this.animations.computeGlobalBBox().then((box) => {
        if (!box) return
        this.globalBBox = box
        this.applyWindowSize()
        this.animations.redraw()
      })
    }
  }

  /**
   * Resize the window so the character is `presetPx` wide, with height following
   * the idle bounding-box aspect (height: auto).
   */
  private applyWindowSize(): void {
    const w = this.presetPx
    const box = this.globalBBox ?? this.idleBBox
    const aspect = box ? box.h / box.w : 1
    const h = Math.round(w * aspect)
    this.displayW = w
    this.displayH = h
    // Reserve headroom above the character for the speech bubble. The canvas
    // (character) occupies `h`; the window is `h + headroom`, bottom-anchored.
    window.petApi.setWindowSize(w, h + SPEECH_HEADROOM_PX)
  }

  /** Enqueue the animation for a state; the queue handles completion & timing. */
  private enqueueState(state: PetState): void {
    const category = STATE_TO_CATEGORY[state]
    const timed = CATEGORY_LOOPS[category]

    const item: QueueItem = {
      category,
      mode: timed ? 'timed' : 'once',
      placeholderMs: PLACEHOLDER_ACTION_MS
    }

    if (timed) {
      const range = STATE_DURATIONS[state]
      item.durationMs = range ? randomBetween(range.minMs, range.maxMs) : 6000
    }

    this.queue.enqueue(item)
  }

  /** When the queue empties, return to the resting idle state. */
  private onQueueDrained(): void {
    if (this.autonomySuspended()) return
    if (!this.machine.is('idle')) this.machine.transition('idle')
  }

  /** A click plays a quick emotion reaction (from idle) plus a line. */
  private onClick(): void {
    this.speech.say(pickLine('click'))
    if (this.autonomySuspended()) return
    if (this.machine.is('idle')) this.machine.transition('emotion')
  }

  private onStateChanged(state: PetState): void {
    const category = STATE_TO_CATEGORY[state]
    const willShowCharacter = this.hasIdle || this.animations.hasCategory(category)
    this.renderer.showPlaceholder(!willShowCharacter)
    if (!willShowCharacter) {
      this.renderer.setStatusText(`상태: ${state} · PNG 대기 중`)
    }

    // Feed the needs model so energy recovers while sleeping.
    this.stats.setSleeping(state === 'sleep')

    // Occasional chatter tied to the state (skipped while autonomy is suspended).
    if (!this.autonomySuspended()) {
      if (state === 'dance') this.speechMaybe('dance', 0.5)
      else if (state === 'music') this.speechMaybe('music', 0.5)
      else if (state === 'sleep') this.speechMaybe('sleep', 0.7)
      else if (state === 'emotion') this.speechMaybe('happy', 0.3)
      else if (state === 'idle') this.speechMaybe('idleChat', 0.15)
    }

    if (state === 'walk') void this.walk.start()
    else this.walk.stop()
  }

  /** Force a state from the tray menu, interrupting whatever is playing. */
  private forceState(state: PetState): void {
    this.queue.clear()
    this.machine.force(state)
  }

  private async handleCommand(cmd: PetCommand): Promise<void> {
    switch (cmd.type) {
      case 'play':
        this.forceState(cmd.category as PetState)
        break
      case 'setState':
        this.forceState(cmd.state)
        break
      case 'reloadAssets':
        await this.loadAssets()
        break
      case 'toggleRandomActions':
        this.randomEnabled = cmd.enabled
        if (cmd.enabled && this.machine.is('idle') && !this.autonomySuspended()) this.random.start()
        else this.random.stop()
        break
      case 'toggleDebug':
        this.debug.toggle(cmd.enabled)
        break
      case 'setSize':
        this.sizeLabel = cmd.size
        this.presetPx = cmd.px
        this.applyWindowSize()
        break
      case 'motionVisual':
        this.applyMotionVisual(cmd.mode, cmd.moving ?? false, cmd.dir)
        break
      case 'systemEvent':
        this.reactSystemEvent(cmd.event, cmd.hour)
        break
      case 'setMicDance':
        if (cmd.enabled) await this.mic.start()
        else this.mic.stop()
        break
      case 'feed':
        this.stats.feed()
        window.petApi.saveStats(this.stats.snapshot())
        this.speech.say(pickLine('fed'))
        this.flashEmotionIfIdle()
        break
      case 'playWith':
        this.stats.playWith()
        window.petApi.saveStats(this.stats.snapshot())
        this.speech.say(pickLine('played'))
        this.flashEmotionIfIdle()
        break
    }
  }

  /* ---------------- Personality layers ---------------- */

  /** True while a motion mode or mic-dance owns the pet's animation. */
  private autonomySuspended(): boolean {
    return this.motionMode !== 'none' || this.micDancing
  }

  private suspendAutonomy(): void {
    this.random.stop()
    this.queue.clear()
  }

  private resumeAutonomy(): void {
    this.renderer.setFlipped(false)
    this.renderer.setBounce(0, 1)
    this.machine.force('idle')
  }

  private speechMaybe(trigger: SpeechTrigger, probability: number): void {
    if (Math.random() < probability) this.speech.say(pickLine(trigger))
  }

  private flashEmotionIfIdle(): void {
    if (!this.autonomySuspended() && this.machine.is('idle')) this.machine.transition('emotion')
  }

  /** Weighted pick over the random-action pool, biased by current needs. */
  private pickRandomAction(): PetState {
    const bias = this.stats.actionBias()
    const pool: PetState[] = []
    const add = (state: PetState, weight: number): void => {
      for (let i = 0; i < Math.max(1, weight); i++) pool.push(state)
    }
    add('emotion', bias.emotion)
    add('music', bias.music)
    add('dance', bias.dance)
    add('sleep', bias.sleep)
    return pool[Math.floor(Math.random() * pool.length)] ?? 'emotion'
  }

  private onNeed(need: PetNeed): void {
    const line: Record<PetNeed, SpeechTrigger> = {
      hungry: 'hungry',
      sleepy: 'sleepy',
      bored: 'bored'
    }
    this.speech.say(pickLine(line[need]))
    if (need === 'sleepy' && !this.autonomySuspended() && this.machine.is('idle')) {
      this.machine.transition('sleep')
    }
  }

  /** Apply the window-motion visual pushed from main (follow / perch / off). */
  private applyMotionVisual(mode: 'follow' | 'perch' | 'none', moving: boolean, dir?: 'left' | 'right'): void {
    if (mode === 'none') {
      if (this.motionMode !== 'none') {
        this.motionMode = 'none'
        if (!this.micDancing) this.resumeAutonomy()
      }
      return
    }

    const entering = this.motionMode === 'none'
    this.motionMode = mode
    if (entering) this.suspendAutonomy()

    // Mic-dance visuals take precedence if both are somehow active.
    if (this.micDancing) return

    if (moving) {
      this.renderer.setFlipped(dir === 'left')
      void this.playOrIdle('walk')
    } else {
      this.renderer.setFlipped(false)
      this.renderer.setBounce(0, 1)
      void this.playOrIdle(mode === 'perch' ? 'sleep' : 'idle')
      if (mode === 'perch') this.speechMaybe('perch', 0.15)
    }
  }

  /** Play a category, falling back to the idle clip if it has no frames. */
  private async playOrIdle(category: PetState): Promise<void> {
    const ok = await this.animations.play(STATE_TO_CATEGORY[category])
    if (!ok) await this.animations.play('idle')
  }

  private reactSystemEvent(event: 'hour' | 'lowBattery' | 'charging', hour?: number): void {
    switch (event) {
      case 'hour':
        this.speech.say(pickLine('onHour', { hour: hour ?? '' }))
        this.flashEmotionIfIdle()
        break
      case 'lowBattery':
        this.speech.say(pickLine('lowBattery'))
        break
      case 'charging':
        this.speech.say(pickLine('charging'))
        break
    }
  }

  /* ---------------- Microphone dance ---------------- */

  private onMusicStart(): void {
    this.micDancing = true
    this.suspendAutonomy()
    this.speechMaybe('micDance', 0.6)
    void this.playOrIdle('dance')
  }

  private onMusicStop(): void {
    if (!this.micDancing) return
    this.micDancing = false
    if (this.beatTimer) {
      clearTimeout(this.beatTimer)
      this.beatTimer = null
    }
    this.renderer.setBounce(0, 1)
    if (this.motionMode === 'none') this.resumeAutonomy()
  }

  private onBeat(intensity: number): void {
    if (!this.micDancing) return
    const amp = 4 + intensity * 8
    this.renderer.setBounce(-amp, 1 - 0.05 * intensity)
    if (this.beatTimer) clearTimeout(this.beatTimer)
    this.beatTimer = setTimeout(() => this.renderer.setBounce(0, 1), 110)
  }

  private getDebugInfo(): DebugInfo {
    const telemetry = this.animations.getTelemetry()
    const bbox = this.animations.getCurrentBBox() ?? this.idleBBox
    const walk = this.walk.getState()
    return {
      ...telemetry,
      state: this.machine.currentName,
      queueLength: this.queue.length,
      hasAssets: this.hasAssets,
      pngCount: this.animations.getTotalFrames(),
      clipCount: this.animations.getTotalClips(),
      sizeLabel: this.sizeLabel,
      displayW: this.displayW,
      displayH: this.displayH,
      bboxW: bbox?.w ?? 0,
      bboxH: bbox?.h ?? 0,
      walkX: walk.x,
      walkY: walk.y,
      walkDir: walk.active ? (walk.direction === -1 ? 'left' : 'right') : null,
      walkSpeed: walk.speed,
      walkFps: walk.fps
    }
  }
}

function randomBetween(min: number, max: number): number {
  return Math.floor(min + Math.random() * Math.max(0, max - min))
}
