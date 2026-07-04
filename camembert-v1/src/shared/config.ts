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

export function sizeToPx(size: PetSize): number {
  return SIZE_PRESETS[size] ?? SIZE_PRESETS[DEFAULT_SIZE]
}
