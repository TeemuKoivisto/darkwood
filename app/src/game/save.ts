/**
 * The save format: the maps as JSON with a version field, plus which character is open. `main.ts`
 * keeps one in `localStorage`; File > Save and File > Open move the same text in and out of a file.
 */
import { createGameMaps, type GameMaps } from './maps'
import type { Character, Fight } from './types'

export const SAVE_VERSION = 1
export const SAVE_KEY = 'darkwood-save'

export type SaveFile = {
  version: number
  characterId: string
  characters: Character[]
  fights: Fight[]
}

export function serializeMaps(maps: GameMaps, characterId: string): string {
  const save: SaveFile = {
    version: SAVE_VERSION,
    characterId,
    characters: [...maps.characters.values()],
    fights: [...maps.fights.values()],
  }
  return JSON.stringify(save)
}

/** Parses a save into fresh maps. Anything that is not a save of this version throws. */
export function deserializeMaps(json: string): { maps: GameMaps; characterId: string } {
  const save = JSON.parse(json) as Partial<SaveFile> | null
  if (!save || save.version !== SAVE_VERSION || !Array.isArray(save.characters)) {
    throw Error('Not a Darkwood save file')
  }
  const maps = createGameMaps()
  for (const c of save.characters) maps.characters.set(c.id, c)
  for (const f of save.fights ?? []) maps.fights.set(f.characterId, f)
  return { maps, characterId: save.characterId ?? '' }
}

/** Copies loaded maps into the live ones, so the `GameData` bound to them sees the change. */
export function replaceMaps(target: GameMaps, source: GameMaps) {
  target.characters.clear()
  target.fights.clear()
  for (const [id, c] of source.characters) target.characters.set(id, c)
  for (const [id, f] of source.fights) target.fights.set(id, f)
}
