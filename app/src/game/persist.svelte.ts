/** Autosave: the maps go to storage on every change, and come back from it at start. */
import type { GameData } from './GameData.svelte'
import { SAVE_KEY, serializeMaps } from './save'
import { loadGame } from './systems/newGame'
import type { GameCtx } from './types'

/** Loads the saved game if there is one; returns whether a character was opened. */
export function loadSaved(ctx: GameCtx, storage: Storage): boolean {
  const json = storage.getItem(SAVE_KEY)
  return !!json && !loadGame(ctx, { json })
}

/** Writes the save on every change of the maps or the open character. Returns the cleanup. */
export function autosave(state: GameData, storage: Storage): () => void {
  return $effect.root(() => {
    $effect(() => {
      storage.setItem(SAVE_KEY, serializeMaps(state.maps, state.characterId))
    })
  })
}
