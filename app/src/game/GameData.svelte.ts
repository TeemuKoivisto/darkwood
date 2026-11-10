/**
 * The reactive state the UI binds to. Everything about the game itself is derived from the maps;
 * the `$state` fields are the navigation (which character, which screen) and the UI-only bits
 * (the open alert). Systems get this object as `ctx.state`.
 */
import type { GameMaps } from './maps'
import { armorClass, currentWeapon, surrenderPenalty } from './rules'
import type { GameState, Screen } from './types'

export class GameData implements GameState {
  characterId = $state('')
  screen = $state<Screen>('main')

  character = $derived.by(() => this.maps.characters.get(this.characterId))
  fight = $derived.by(() => this.maps.fights.get(this.characterId))

  // Values the screens show that the character record does not store
  armorClass = $derived(this.character ? armorClass(this.character) : 10)
  weapon = $derived(this.character ? currentWeapon(this.character) : undefined)
  surrenderPenalty = $derived(this.fight ? surrenderPenalty(this.fight.creature) : 0)

  // The generic alert box: a queue, so a round's notices show one after another
  alerts = $state<string[]>([])
  /** The text in the alert box, null when closed */
  alert = $derived(this.alerts[0] ?? null)

  constructor(public maps: GameMaps) {}
}
