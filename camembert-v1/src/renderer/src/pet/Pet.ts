import type { DebugInfo, PetCommand, PetState } from '@shared/types'
import { DEFAULT_SIZE, sizeToPx, type PetSize } from '@shared/config'
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
 * Behaviour loop: Idle → (random) Emotion / Music / Dance / Sleep → Idle. The
 * queue guarantees animations never overlap; the machine guarantees each action
 * returns to Idle when it finishes. Everything keeps working before any PNGs
 * exist thanks to placeholder timing in the queue.
 */
export class Pet {
  private readonly renderer: PetRenderer
  private readonly animations: AnimationManager
  private readonly queue: AnimationQueue
  private readonly machine = new PetStateMachine()
  private readonly random: RandomActionManager
  private readonly walk: WalkController
  private readonly debug: DebugPanel

  private hasAssets = false
  private hasIdle = false
  private randomEnabled = true

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
      onDragMove: (dx, dy) => window.petApi.moveWindowBy(dx, dy),
      onContextMenu: () => window.petApi.showContextMenu(),
      onResize: () => this.animations.redraw()
    })

    this.animations = new AnimationManager(this.renderer.getContext())
    this.queue = new AnimationQueue(this.animations, PLACEHOLDER_ACTION_MS)
    this.queue.onDrained = () => this.onQueueDrained()

    const services: StateServices = {
      playIdleLoop: () => void this.animations.play('idle'),
      enqueueState: (state) => this.enqueueState(state),
      startRandom: () => {
        if (this.randomEnabled) this.random.start()
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
      () => this.machine.is('idle'),
      (state) => this.machine.transition(state),
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
  }

  private async loadAssets(): Promise<void> {
    const manifest = await window.petApi.getAssetManifest()
    this.animations.setManifest(manifest)
    this.hasAssets = this.animations.hasAnyClips()
    this.hasIdle = this.animations.hasCategory('idle')

    // Measure the idle character so the window can wrap its bounding box. This
    // gives an immediate, close-enough size; the global box refines it below.
    this.idleBBox = this.hasIdle ? await this.animations.computeBBoxFor('idle') : null
    this.globalBBox = null
    this.applyWindowSize()

    // (Re)start the cycle from idle. onStateChanged handles placeholder visibility.
    this.queue.clear()
    this.machine.force('idle')

    // Refine to a single crop box shared by every clip (consistent scale, no
    // cropped motion). Runs in the background so launch isn't stalled; when it
    // lands it resizes the window to the true character aspect and redraws.
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
   * the idle bounding-box aspect (height: auto). Falls back to a square when the
   * bounding box is unknown.
   */
  private applyWindowSize(): void {
    const w = this.presetPx
    // Prefer the global (all-clip) box so the window fits every pose; fall back
    // to the idle box until it's measured, then a square as a last resort.
    const box = this.globalBBox ?? this.idleBBox
    const aspect = box ? box.h / box.w : 1
    const h = Math.round(w * aspect)
    this.displayW = w
    this.displayH = h
    window.petApi.setWindowSize(w, h)
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
    if (!this.machine.is('idle')) this.machine.transition('idle')
  }

  /** A click plays a quick emotion reaction — but only from idle (no interrupts). */
  private onClick(): void {
    if (this.machine.is('idle')) this.machine.transition('emotion')
  }

  /**
   * Placeholder is shown ONLY when there is nothing to draw: no idle frames and
   * no frames for the current category either. As long as an idle PNG exists the
   * character stays on screen — missing categories fall back to the idle
   * animation (handled in the queue) instead of the placeholder.
   */
  private onStateChanged(state: PetState): void {
    const category = STATE_TO_CATEGORY[state]
    const willShowCharacter = this.hasIdle || this.animations.hasCategory(category)
    this.renderer.showPlaceholder(!willShowCharacter)
    if (!willShowCharacter) {
      this.renderer.setStatusText(`상태: ${state} · PNG 대기 중`)
    }

    // Walk the window across the desktop while in the walk state; stop (and
    // un-mirror) on any other state. The queue returns us to idle when the
    // walk's timed duration elapses, which stops the motion here.
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
        if (cmd.enabled && this.machine.is('idle')) this.random.start()
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
    }
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
