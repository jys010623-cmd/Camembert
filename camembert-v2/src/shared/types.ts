/**
 * Cross-process type definitions shared by the main, preload, and renderer layers.
 */
import type { PetSize } from './config'

/** Animation categories. Each corresponds to a top-level folder under /assets. */
export type AnimationCategory =
  | 'idle'
  | 'emotion'
  | 'music'
  | 'dance'
  | 'sleep'
  | 'walk'
  | 'turnaround'

export const ANIMATION_CATEGORIES: AnimationCategory[] = [
  'idle',
  'emotion',
  'music',
  'dance',
  'sleep',
  'walk',
  'turnaround'
]

/** A single playable animation clip = one sub-folder of PNG frames. */
export interface AnimationClip {
  /** Clip name, taken from the sub-folder name (e.g. "idle_default"). */
  name: string
  /** Category the clip belongs to. */
  category: AnimationCategory
  /** Ordered list of frame URLs, served through the custom `pet-asset://` protocol. */
  frames: string[]
  /** Convenience: number of frames. */
  frameCount: number
}

/** The full set of clips discovered on disk, grouped by category. */
export interface AssetManifest {
  categories: Record<AnimationCategory, AnimationClip[]>
  totalClips: number
  totalFrames: number
  /** Epoch millis when the manifest was generated. */
  generatedAt: number
}

/** Window position and the horizontal travel limits for walking. */
export interface WalkBounds {
  /** Current window top-left, in screen px. */
  x: number
  y: number
  /** Leftmost / rightmost allowed window x within the display work area. */
  minX: number
  maxX: number
}

/** Visual hint for the two window-motion behaviours (follow cursor / perch). */
export type MotionVisualMode = 'follow' | 'perch' | 'none'

/** System events the main process observes and reports for the pet to react to. */
export type SystemEventKind = 'hour' | 'lowBattery' | 'charging'

/** Commands the main process (tray / context menu) can push to the renderer. */
export type PetCommand =
  | { type: 'play'; category: AnimationCategory; clip?: string }
  | { type: 'setState'; state: PetState }
  | { type: 'reloadAssets' }
  | { type: 'toggleRandomActions'; enabled: boolean }
  | { type: 'toggleDebug'; enabled: boolean }
  | { type: 'setSize'; size: PetSize; px: number }
  /** Window-motion visual hint (main drives the window; renderer sets the pose). */
  | { type: 'motionVisual'; mode: MotionVisualMode; moving?: boolean; dir?: 'left' | 'right' }
  /** A system event to react to (on-the-hour chime, battery changes). */
  | { type: 'systemEvent'; event: SystemEventKind; hour?: number }
  /** Enable/disable microphone-driven dance detection. */
  | { type: 'setMicDance'; enabled: boolean }
  /** Tamagotchi interactions from the menu. */
  | { type: 'feed' }
  | { type: 'playWith' }

/** Live playback telemetry, surfaced in the debug panel. */
export interface AnimationTelemetry {
  category: AnimationCategory | null
  clip: string | null
  frameIndex: number
  frameCount: number
  /** Measured playback rate (frames/sec); 0 when nothing is playing. */
  fps: number
  playing: boolean
}

/** Everything the debug panel needs to render one snapshot. */
export interface DebugInfo extends AnimationTelemetry {
  state: PetState
  queueLength: number
  hasAssets: boolean
  /** Total PNG frames currently loaded across all categories. */
  pngCount: number
  /** Total clips currently loaded. */
  clipCount: number
  /** Current size preset label (small/medium/large). */
  sizeLabel: PetSize
  /** On-screen display size in CSS px (window / character box). */
  displayW: number
  displayH: number
  /** Opaque bounding box of the character in native PNG px (0 if unknown). */
  bboxW: number
  bboxH: number
  /** Current window position while walking (screen px). */
  walkX: number
  walkY: number
  /** Walk direction, or null when not walking. */
  walkDir: 'left' | 'right' | null
  /** Walk speed in px/sec (0 when not walking). */
  walkSpeed: number
  /** Walk animation frame rate (fps) driving the step cadence. */
  walkFps: number
}

/** High-level behaviour states of the pet. */
export type PetState =
  | 'idle'
  | 'emotion'
  | 'music'
  | 'dance'
  | 'sleep'
  | 'walk'
  | 'turnaround'

export const EMPTY_MANIFEST: AssetManifest = {
  categories: {
    idle: [],
    emotion: [],
    music: [],
    dance: [],
    sleep: [],
    walk: [],
    turnaround: []
  },
  totalClips: 0,
  totalFrames: 0,
  generatedAt: 0
}
