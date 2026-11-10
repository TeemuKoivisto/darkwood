import { weaponByName } from '../data'
import { attacksPerRound, thac0 } from '../rules'
import { deserializeMaps, replaceMaps } from '../save'
import type { Character, GameSys, Screen } from '../types'

/** The fixed starting character from `notes/rules.md` "Character": there is no stat rolling. */
export function startingCharacter(id: string, name: string): Character {
  return {
    id,
    name,
    level: 1,
    xp: 0,
    hp: 10,
    hpMax: 10,
    strength: 16,
    strengthPct: 0,
    intelligence: 13,
    wisdom: 14,
    dexterity: 15,
    constitution: 15,
    charisma: 12,
    thac0: thac0(1),
    attacksPerRound: attacksPerRound(1),
    gold: 10,
    weapons: [weaponByName('Dagger')],
    currentWeapon: 0,
    armor: null,
    magicItems: [],
  }
}

/**
 * Starts a new character and opens it on the main screen. The character it replaces stays in
 * the maps (the original asked "abandon this character?" first; the UI does that).
 */
export const newGame: GameSys<{ name?: string }> = (ctx, { name = 'Derek' }) => {
  const { characters, fights } = ctx.state.maps
  const character = startingCharacter(crypto.randomUUID(), name)
  characters.set(character.id, character)
  fights.delete(character.id)
  ctx.state.characterId = character.id
  ctx.state.screen = 'main'
}

/** Navigation. A building on the map or a Shops menu item opens its screen with this. */
export const openScreen: GameSys<{ screen: Screen }> = (ctx, { screen }) => {
  if (!ctx.state.character) return { err: 'No character' }
  if (screen === 'combat' && !ctx.state.fight) return { err: 'No fight to show' }
  ctx.state.screen = screen
}

/** File > Open and the start-up load: replaces every map with the save's and opens its character. */
export const loadGame: GameSys<{ json: string }> = (ctx, { json }) => {
  let loaded
  try {
    loaded = deserializeMaps(json)
  } catch (_e) {
    return { err: 'This file is not a Darkwood character file.' }
  }
  if (!loaded.maps.characters.has(loaded.characterId)) {
    return { err: 'This file is not a Darkwood character file.' }
  }
  replaceMaps(ctx.state.maps, loaded.maps)
  ctx.state.characterId = loaded.characterId
  ctx.state.screen = ctx.state.fight ? 'combat' : 'main'
}

/** Closes the alert box's current text. */
export const dismissAlert: GameSys = ctx => {
  ctx.state.alerts = ctx.state.alerts.slice(1)
}
