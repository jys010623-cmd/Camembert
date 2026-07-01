import type { PetApi } from './index'

declare global {
  interface Window {
    petApi: PetApi
  }
}

export {}
