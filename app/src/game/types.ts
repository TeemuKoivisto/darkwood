/**
 * The game's entities and the shape every system has. Item and creature records keep the field
 * names of `tables.json` (snake_case, straight from `notes/tables.md`); the character and the
 * fight are this app's own records and use camelCase.
 */
import type { GameMaps } from './maps'
import type { Rng } from './rng'

export type Weapon = {
  name: string
  cost: number
  magic_bonus: number
  dmg_min: number
  dmg_max: number
  speed: number
}

export type Armor = {
  name: string
  cost: number
  ac_modifier: number
}

/**
 * `charges` is the live counter on an owned copy: wands 10, potions and tomes 1, rings 0 (passive).
 * `attribute_raised`: 0 none, 1 strength, 2 intelligence, 3 wisdom, 4 dexterity, 5 constitution,
 * 6 charisma (the order of the "has been increased" messages).
 */
export type MagicItem = {
  name: string
  cost: number
  ac_bonus: number
  unused: number
  dmg_min: number
  dmg_max: number
  heal_min: number
  heal_max: number
  charges: number
  attribute_raised: number
}

export type Creature = {
  name: string
  hp: number
  hp_max: number
  ac: number
  thac0: number
  level: number
  attacks: number
  dmg_min: number
  dmg_max: number
  xp: number
  gold: number
  level_drain: number
  needs_magic_weapon: number
}

export type Character = {
  id: string
  name: string
  level: number
  xp: number
  hp: number
  hpMax: number
  strength: number
  /** Strength percentile, 0..100; only moves via Tome of Strength at 18 */
  strengthPct: number
  intelligence: number
  wisdom: number
  dexterity: number
  constitution: number
  charisma: number
  /** Stored, not derived: the original only recomputes these on level-up (not after a drain) */
  thac0: number
  attacksPerRound: number
  gold: number
  /** Up to 6; `currentWeapon` indexes it, -1 when fighting bare-handed */
  weapons: Weapon[]
  currentWeapon: number
  armor: Armor | null
  /** Up to 10, each with its live `charges` */
  magicItems: MagicItem[]
}

export type FightOutcome = 'ongoing' | 'won' | 'died' | 'surrendered'

/** One arena fight: a live copy of the creature plus what the last round produced. */
export type Fight = {
  characterId: string
  creature: Creature
  /** Set by Defensive, cleared by the next Fight click (so it also covers Use rounds) */
  defensiveBonus: number
  /** The last round's lines, in order, for the Messages box */
  messages: string[]
  outcome: FightOutcome
  reward?: { gold: number; xp: number }
  levelUp?: { level: number; gained: number; maxed: boolean }
  gameWon?: boolean
}

export type Screen =
  'main' | 'magic-shop' | 'inn' | 'armorer' | 'weapon-shop' | 'opponent' | 'combat'

/** What systems read and write: the maps, which character is open, which screen is up. */
export interface GameState {
  maps: GameMaps
  characterId: string
  screen: Screen
  readonly character: Character | undefined
  readonly fight: Fight | undefined
}

export type GameCtx = {
  state: GameState
  rng: Rng
}

/** A refusal. The text is what the game shows in its alert box. */
export type Err = { err: string }

/**
 * Every system has this shape: `(ctx, payload)`, synchronous, returning nothing or an `Err`.
 * Systems call each other directly, `const failed = other(ctx, data); if (failed) return failed`.
 * A system with no payload is declared `GameSys` and called `system(ctx)`.
 */
export type GameSys<P = void> = (ctx: GameCtx, payload: P) => void | Err
