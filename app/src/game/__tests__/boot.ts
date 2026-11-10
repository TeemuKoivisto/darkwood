/**
 * Shared ground for the system tests: fresh maps, a `GameData` as the app would hold it, a fixed
 * `Rng`, and a new character opened through `newGame`.
 */
import { GameData } from '../GameData.svelte'
import { createGameMaps, updateCharacter } from '../maps'
import { seqRng } from '../rng'
import { newGame } from '../systems/newGame'
import type { Character, GameCtx } from '../types'

/** `rng` values are floats in [0, 1); `randomNumber(lo, hi)` maps 0 to `lo`. */
export function bootGame({ rng = [0] }: { rng?: number[] } = {}) {
  const maps = createGameMaps()
  const state = new GameData(maps)
  const ctx: GameCtx = { state, rng: seqRng(rng) }
  newGame(ctx, {})

  const character = (): Character => maps.characters.get(state.characterId)!
  const patch = (fields: Partial<Character>) => updateCharacter(maps, state.characterId, fields)
  return { maps, state, ctx, character, patch }
}
