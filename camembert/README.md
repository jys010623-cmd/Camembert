# Camembert Desktop Pet

Electron + Vite + TypeScript desktop pet. This stage builds the full runtime
**without any PNGs** — the pet appears on screen and is ready to play sprite
animations the moment frames are dropped into `assets/`.

## Requirements

- Node.js 18+ (tested on Node 22)

## Setup

```bash
npm install
npm run dev      # launch the pet in development
```

Other scripts:

```bash
npm run build      # production build into out/
npm run start      # preview the production build
npm run typecheck  # type-check main + renderer
```

## Adding animation PNGs

Drop frames into `assets/<category>/`. No code changes needed — the main process
scans the folder on launch (and on **Reload assets** from the tray menu).

Folder layouts supported (both a flat and a `character/` namespace work):

```
assets/character/idle/idle_01.png                  # namespaced, loose file
assets/idle/idle_default/0001.png, 0002.png, ...   # one clip per sub-folder
assets/idle/0001.png, 0002.png, ...                # single "default" clip
```

A single PNG (e.g. just `idle_01.png`) is valid — it loops as a static idle.
Categories with no PNGs fall back to the placeholder cheese while categories
that do have frames show the real character. The debug panel (F3) shows the
loaded PNG count.

Categories: `idle`, `emotion`, `music`, `dance`, `sleep`, `walk`, `turnaround`.
Frames are sorted naturally (`frame_2` before `frame_10`).

## Features implemented

- Transparent, frameless, always-on-top, click-through-capable window
- Manual drag-to-move (pointer events → window reposition over IPC)
- Left-click reaction, right-click native context menu
- System tray icon with menu: show/hide, play state, random actions,
  click-through, hide-from-taskbar, debug panel, reload assets, quit
- Custom `pet-asset://` protocol serving frames safely from `assets/`
- Animation engine: `SpriteLoader`, `AnimationPlayer`, `AnimationManager`

### Behaviour system

- **State machine** (`PetStateMachine`) with `IdleState`, `EmotionState`,
  `MusicState`, `DanceState`, `SleepState`, `WalkState`, `TurnaroundState`.
  Every action state returns to Idle automatically when it ends.
- **Random action loop**: while idle the pet spontaneously enters
  Emotion / Music / Dance / Sleep and cycles back to Idle.
- **Animation queue** (`AnimationQueue`) serialises clips so animations never
  overlap, with placeholder timing so the loop runs even with no PNGs.
- **Debug panel** (toggle with `F3` or the tray menu) showing live
  State / Animation / Frame / FPS / Queue.
- Empty-asset placeholder so the pet is visible and still cycles before any
  PNGs exist.

### Display size & hit-testing

- Size presets in the tray **Size** menu: Small 120px, Medium 160px (default),
  Large 220px. The choice is persisted in `settings.json` and restored on
  restart. The window wraps the character's bounding box (height auto).
- The character's opaque bounding box is auto-cropped from the 2048×2048 source,
  so transparent margins are never shown. Clicks/drags are alpha hit-tested on
  the visible pixels — empty space no longer grabs the pet. If pixel reads are
  unavailable, it falls back to a central elliptical hitbox (75%×85%).
- The debug panel (F3) shows the current display size and bounding box.

## Project structure

```
src/
  main/                 Electron main process
    config/appConfig.ts   window + behaviour config, asset root resolution
    assetScanner.ts       scans assets/ into an AssetManifest
    assetProtocol.ts      pet-asset:// protocol registration
    windowManager.ts      BrowserWindow lifecycle & window behaviours
    tray.ts / menu.ts     system tray + shared menu template
    index.ts              app bootstrap, IPC wiring
  preload/              contextBridge API (window.petApi)
  renderer/
    index.html
    src/
      main.ts             renderer entry
      pet/                Pet (orchestrator) + PetRenderer (DOM/pointer)
      engine/
        animation/        SpriteLoader, AnimationPlayer, AnimationManager,
                          AnimationQueue
        state/            StateManager (PetStateMachine + state classes)
        random/           RandomActionManager
      config/             animation timing / durations / random-action config
      ui/                 styles.css, DebugPanel
      types/
  shared/               types + IPC channel names shared across processes
assets/                 PNG frames (empty for now)
```

## Not yet implemented (intentionally out of scope)

AI, voice, music detection, OpenAI/Gemini, microphone, webcam.
