import type { PetState } from '@shared/types'

/**
 * Finite state machine for the pet's behaviour.
 *
 * The machine owns which state is active and notifies listeners on change.
 * Each concrete State implements its own `enter`/`exit` behaviour (playing an
 * animation, scheduling a return to idle, etc). States are intentionally thin —
 * all animation work is delegated back through the injected {@link StateServices}.
 */

export type StateChangeListener = (next: PetState, previous: PetState) => void

/** A single behaviour state. */
export interface State {
  readonly name: PetState
  /** Called when the machine enters this state. */
  enter(): void
  /** Called when the machine leaves this state. */
  exit(): void
}

/**
 * Services the states use to act on the rest of the app. Implemented by `Pet`,
 * so states never touch the animation engine or queue directly.
 */
export interface StateServices {
  /** Play the idle loop as the resting animation (bypasses the action queue). */
  playIdleLoop(): void
  /** Enqueue this state's finite action animation. */
  enqueueState(state: PetState): void
  /** Start the random-action scheduler (idle only). */
  startRandom(): void
  /** Stop the random-action scheduler. */
  stopRandom(): void
}

/** The state machine itself. */
export class PetStateMachine {
  private readonly states = new Map<PetState, State>()
  private current: State | null = null
  private readonly listeners = new Set<StateChangeListener>()

  register(state: State): this {
    this.states.set(state.name, state)
    return this
  }

  get currentName(): PetState {
    return this.current?.name ?? 'idle'
  }

  is(name: PetState): boolean {
    return this.currentName === name
  }

  /** Enter a state. No-op if it is already current (use {@link force} to re-enter). */
  transition(to: PetState): void {
    if (this.current?.name === to) return
    this.enterState(to)
  }

  /** Enter a state even if it is already current (menu-driven interrupts). */
  force(to: PetState): void {
    this.enterState(to)
  }

  onChange(listener: StateChangeListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private enterState(to: PetState): void {
    const next = this.states.get(to)
    if (!next) {
      console.warn(`[PetStateMachine] unknown state: ${to}`)
      return
    }
    const previous = this.current
    previous?.exit()
    this.current = next
    next.enter()
    const previousName = previous?.name ?? next.name
    for (const listener of this.listeners) listener(next.name, previousName)
  }
}

/* ------------------------------------------------------------------ */
/* Concrete states                                                     */
/* ------------------------------------------------------------------ */

/** Resting state: plays the idle loop and lets the random scheduler run. */
export class IdleState implements State {
  readonly name: PetState = 'idle'
  constructor(private readonly services: StateServices) {}
  enter(): void {
    this.services.playIdleLoop()
    this.services.startRandom()
  }
  exit(): void {
    this.services.stopRandom()
  }
}

/**
 * Base class for finite action states. Entering enqueues the state's animation;
 * the AnimationQueue returns the machine to idle once the queue drains.
 */
abstract class ActionState implements State {
  abstract readonly name: PetState
  constructor(protected readonly services: StateServices) {}
  enter(): void {
    this.services.enqueueState(this.name)
  }
  exit(): void {
    /* no teardown required; the queue handles completion */
  }
}

export class EmotionState extends ActionState {
  readonly name: PetState = 'emotion'
}
export class MusicState extends ActionState {
  readonly name: PetState = 'music'
}
export class DanceState extends ActionState {
  readonly name: PetState = 'dance'
}
export class SleepState extends ActionState {
  readonly name: PetState = 'sleep'
}
export class WalkState extends ActionState {
  readonly name: PetState = 'walk'
}
export class TurnaroundState extends ActionState {
  readonly name: PetState = 'turnaround'
}
