import { Pet } from '@renderer/pet/Pet'

/** Renderer entry point: boot the pet once the DOM is ready. */
function bootstrap(): void {
  const root = document.getElementById('pet-root')
  if (!root) {
    console.error('[renderer] #pet-root not found')
    return
  }

  const pet = new Pet(root)
  pet.init().catch((err) => console.error('[renderer] pet init failed', err))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true })
} else {
  bootstrap()
}
