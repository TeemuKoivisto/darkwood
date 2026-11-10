/**
 * The entity tables, on `SvelteMap`s so reads inside `$derived` track every write. Systems write
 * them with the plain `Map` methods (`set`, `delete`) or the `update*` helpers; `GameData`
 * derives the UI's view from them, so the UI only re-renders when something it shows changed.
 */
import { SvelteMap } from 'svelte/reactivity'

import type { Character, Fight } from './types'

export type GameMaps = ReturnType<typeof createGameMaps>

export function createGameMaps() {
  return {
    /** Every character, by id. The original kept one character per save file. */
    characters: new SvelteMap<string, Character>(),
    /** The open fight of a character, by character id. At most one each. */
    fights: new SvelteMap<string, Fight>(),
  }
}

/** Replaces the character with a patched copy. A missing id is a bug, so it throws. */
export function updateCharacter(maps: GameMaps, id: string, patch: Partial<Character>): Character {
  const old = maps.characters.get(id)
  if (!old) throw Error(`updateCharacter: no character '${id}'`)
  const next = { ...old, ...patch }
  maps.characters.set(id, next)
  return next
}

/** Replaces the fight with a patched copy. A missing fight is a bug, so it throws. */
export function updateFight(maps: GameMaps, characterId: string, patch: Partial<Fight>): Fight {
  const old = maps.fights.get(characterId)
  if (!old) throw Error(`updateFight: no fight for character '${characterId}'`)
  const next = { ...old, ...patch }
  maps.fights.set(characterId, next)
  return next
}
