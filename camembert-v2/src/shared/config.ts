/** Shared display-size configuration used by both main and renderer. */

export type PetSize = 'small' | 'medium' | 'large'

/** Character display width (px) for each preset. Height follows the aspect. */
export const SIZE_PRESETS: Record<PetSize, number> = {
  small: 120,
  medium: 160,
  large: 220
}

export const PET_SIZES: PetSize[] = ['small', 'medium', 'large']

export const DEFAULT_SIZE: PetSize = 'medium'

/**
 * Empty vertical space (CSS px) reserved ABOVE the character inside the window,
 * so the speech bubble can float over the head instead of overlapping the body.
 * The character canvas occupies the window minus this headroom, anchored to the
 * bottom; the bubble lives in the headroom band and grows upward.
 */
export const SPEECH_HEADROOM_PX = 130

export function sizeToPx(size: PetSize): number {
  return SIZE_PRESETS[size] ?? SIZE_PRESETS[DEFAULT_SIZE]
}
