/**
 * The arena, `notes/rules.md` "Combat". Each button on the combat screen is one round system;
 * they share the attack helpers below and end with `summarize`, which writes the Messages box
 * lines and the round's sounds. Notices the original showed in an alert (level drain, magic
 * weapon needed) go to `state.alerts`.
 */
import { creatureByName } from '../data'
import { updateCharacter, updateFight } from '../maps'
import { randomNumber } from '../rng'
import {
  armorClass,
  attacksPerRound,
  conHitPoints,
  currentWeapon,
  levelEarned,
  MAX_LEVEL,
  minXpForLevel,
  surrenderPenalty,
  thac0,
  toDamageBonus,
  toHitBonus,
} from '../rules'
import type { Character, Err, Fight, GameCtx, GameSys, Sound } from '../types'
import { useMagicItem } from './items'

export const NEED_MAGIC_WEAPON =
  'You need a more powerful magical weapon to hit this creature. Your only chance is to surrender.'
export const CANNOT_PAY_SURRENDER =
  'You do not have enough gold to pay for the surrender penalty. The fight continues.'
export const LEVEL_DRAINED =
  'You have been level drained by the undead creature. Your level and hit points have been reduced.'
export const DRAINED_TO_UNDEAD =
  'You have been level drained by the undead creature. You have been reduced so far that you are now an undead.'
export const STRIKE_FIRST = 'You strike first'
export const CREATURE_FIRST = 'The creature strikes first'
const GAME_WINNER = 'Dragon, Red'

/** Puts a fresh copy of the creature in the ring and opens the combat screen. */
export const startFight: GameSys<{ creature: string }> = (ctx, { creature }) => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  ctx.state.maps.fights.set(c.id, {
    characterId: c.id,
    creature: { ...creatureByName(creature) },
    defensiveBonus: 0,
    messages: [],
    sounds: [],
    round: 0,
    outcome: 'ongoing',
  })
  ctx.state.screen = 'combat'
}

/** Leaves the arena: the fight is gone and the town is back. */
export const endFight: GameSys = ctx => {
  ctx.state.maps.fights.delete(ctx.state.characterId)
  ctx.state.screen = 'main'
}

/** The four counters `DoRound` clears before each round, plus the sounds played on the way. */
type Round = {
  playerHits: number
  playerDamage: number
  creatureHits: number
  creatureDamage: number
  sounds: Sound[]
}

const newRound = (): Round => ({
  playerHits: 0,
  playerDamage: 0,
  creatureHits: 0,
  creatureDamage: 0,
  sounds: [],
})

/** The character and the fight of a round, or the refusal when there is no fight going on. */
function inFight(ctx: GameCtx): { c: Character; fight: Fight } | Err {
  const c = ctx.state.character
  const fight = ctx.state.fight
  if (!c || !fight) return { err: 'No fight' }
  if (fight.outcome !== 'ongoing') return { err: 'The fight is over.' }
  return { c, fight }
}

function notice(ctx: GameCtx, text: string) {
  ctx.state.alerts = [...ctx.state.alerts, text]
}

/** A d20 hit: the number or better, or a 20, but never a 1 (and 20s practically never come). */
function hits(roll: number, needed: number) {
  return (roll >= needed || roll === 20) && roll !== 1
}

/** Initiative: true when the player strikes first. */
function rollInitiative(ctx: GameCtx): boolean {
  const c = ctx.state.character!
  const weapon = currentWeapon(c)
  // ASSUMPTION: bare-handed counts as speed 0, no magic bonus
  const player = randomNumber(ctx.rng, 1, 10) + (weapon?.speed ?? 0) - (weapon?.magic_bonus ?? 0)
  const creature = randomNumber(ctx.rng, 1, 10) + ctx.state.fight!.creature.level
  return player <= creature
}

/** "PLAYERHA": `attacks_per_round` swings at the creature. */
function playerAttacks(ctx: GameCtx, round: Round) {
  const c = ctx.state.character!
  const fight = ctx.state.fight!
  const weapon = currentWeapon(c)
  const bonus = weapon?.magic_bonus ?? 0
  const creature = { ...fight.creature }

  // (quirk) the magic bonus is added to the target number, not subtracted
  const needed = c.thac0 - toHitBonus(c.strength, c.strengthPct) + bonus - creature.ac
  for (let i = 0; i < c.attacksPerRound; i++) {
    const roll = randomNumber(ctx.rng, 1, 20)
    if (hits(roll, needed) && bonus >= creature.needs_magic_weapon) {
      const damage =
        (weapon
          ? randomNumber(ctx.rng, weapon.dmg_min, weapon.dmg_max) + bonus
          : randomNumber(ctx.rng, 1, 2)) + toDamageBonus(c.strength, c.strengthPct)
      creature.hp -= damage
      round.playerHits += 1
      round.playerDamage += damage
      round.sounds.push('hit-on-creature')
    } else round.sounds.push('missed')
  }
  updateFight(ctx.state.maps, c.id, { creature })
  if (bonus < creature.needs_magic_weapon) notice(ctx, NEED_MAGIC_WEAPON)
}

/** "DOLEVELD": (quirk) one level whatever `n`, and THAC0 / attacks are not recalculated. */
function levelDrain(ctx: GameCtx, n: number) {
  const c = ctx.state.character!
  if (c.level - n < 1) {
    updateCharacter(ctx.state.maps, c.id, { level: c.level - 1, hp: 0 })
    notice(ctx, DRAINED_TO_UNDEAD)
    return
  }
  const level = c.level - 1
  let { hp, hpMax } = c
  for (let i = 0; i < n; i++) {
    const d = randomNumber(ctx.rng, 1, 10)
    hpMax -= d
    hp -= d
  }
  updateCharacter(ctx.state.maps, c.id, { level, xp: minXpForLevel(level), hp, hpMax })
  notice(ctx, LEVEL_DRAINED)
}

/** "CREATURE": the creature's attacks against the player. Returns false when the player died. */
function creatureAttacks(ctx: GameCtx, round: Round): boolean {
  const fight = ctx.state.fight!
  const creature = fight.creature
  const needed = creature.thac0 - (armorClass(ctx.state.character!) - fight.defensiveBonus)

  for (let i = 0; i < creature.attacks; i++) {
    const roll = randomNumber(ctx.rng, 1, 20)
    if (!hits(roll, needed)) continue
    round.sounds.push('hit-on-player')
    const damage = randomNumber(ctx.rng, creature.dmg_min, creature.dmg_max)
    const c = ctx.state.character!
    updateCharacter(ctx.state.maps, c.id, { hp: c.hp - damage })
    round.creatureHits += 1
    round.creatureDamage += damage
    if (creature.level_drain > 0) levelDrain(ctx, creature.level_drain)

    const after = ctx.state.character!
    if (after.hp <= 0) {
      updateCharacter(ctx.state.maps, after.id, { hp: 0 })
      updateFight(ctx.state.maps, after.id, { outcome: 'died' })
      round.sounds.push('oouch')
      return false
    }
  }
  return true
}

/** The creature attacks unless the player's blow or item already killed it. */
function creatureTurn(ctx: GameCtx, round: Round) {
  if (ctx.state.fight!.creature.hp <= 0) creatureDeath(ctx)
  else creatureAttacks(ctx, round)
}

/** The Messages box: the lead lines, the player's line, then the creature's from the counters. */
function summarize(ctx: GameCtx, round: Round, lines: string[]) {
  const fight = ctx.state.fight!
  const creatureLine = round.creatureHits
    ? `The creature hit ${round.creatureHits} time for ${round.creatureDamage} points.`
    : 'The creature missed'
  updateFight(ctx.state.maps, fight.characterId, {
    messages: [...lines, creatureLine],
    // The round starts with no sounds; a level-up during it has already added its own
    sounds: [...round.sounds, ...fight.sounds],
    round: fight.round + 1,
  })
}

const playerLine = (round: Round) =>
  round.playerHits
    ? `You hit ${round.playerHits} time for ${round.playerDamage} points.`
    : 'You missed'

/** Fight: initiative, then both sides attack, the first one first. Clears the defensive bonus. */
export const fightRound: GameSys = ctx => {
  const found = inFight(ctx)
  if ('err' in found) return found
  updateFight(ctx.state.maps, found.c.id, { defensiveBonus: 0, sounds: [] })
  const round = newRound()

  const first = rollInitiative(ctx)
  if (first) {
    playerAttacks(ctx, round)
    creatureTurn(ctx, round)
  } else if (creatureAttacks(ctx, round)) {
    playerAttacks(ctx, round)
    if (ctx.state.fight!.creature.hp <= 0) creatureDeath(ctx)
  }
  summarize(ctx, round, [first ? STRIKE_FIRST : CREATURE_FIRST, playerLine(round)])
}

/** Defensive: initiative is rolled and announced, the player does not attack, the creature does
 * against an armor class better by `max(1, level div 2)`. (quirk) The bonus stays until the
 * next Fight, so it also covers Use rounds. */
export const defensiveRound: GameSys = ctx => {
  const found = inFight(ctx)
  if ('err' in found) return found
  const defensiveBonus = Math.max(1, Math.trunc(found.c.level / 2))
  updateFight(ctx.state.maps, found.c.id, { defensiveBonus, sounds: [] })
  const round = newRound()

  const first = rollInitiative(ctx)
  creatureAttacks(ctx, round)
  summarize(ctx, round, [first ? STRIKE_FIRST : CREATURE_FIRST, 'You are defensive'])
}

/** Use: the item works first (a wand can kill), then the creature attacks. A refusal from the
 * item (full hit points, a ring) costs no round. */
export const useItemRound: GameSys<{ item: string }> = (ctx, { item }) => {
  const found = inFight(ctx)
  if ('err' in found) return found
  const failed = useMagicItem(ctx, { item })
  if (failed) return failed
  updateFight(ctx.state.maps, found.c.id, { sounds: [] })
  const round = newRound()

  creatureTurn(ctx, round)
  summarize(ctx, round, ['You use an item'])
}

/** Surrender: pay a tenth of the creature's gold and leave; too poor and nothing happens. */
export const surrender: GameSys = ctx => {
  const found = inFight(ctx)
  if ('err' in found) return found
  const { c, fight } = found
  const penalty = surrenderPenalty(fight.creature)
  const round = newRound()
  updateFight(ctx.state.maps, c.id, { sounds: [] })

  if (penalty > c.gold) {
    // ASSUMPTION: the summary still prints the creature's (empty) line, as after every round
    summarize(ctx, round, ['You attempted to surrender.'])
    return { err: CANNOT_PAY_SURRENDER }
  }
  updateCharacter(ctx.state.maps, c.id, { gold: c.gold - penalty })
  updateFight(ctx.state.maps, c.id, { outcome: 'surrendered' })
  summarize(ctx, round, ['You surrender'])
  notice(ctx, `You pay ${penalty} gold pieces to surrender.`)
}

/** "DOCREATU": the reward, the win, and then level advancement. */
export const creatureDeath: GameSys = ctx => {
  const c = ctx.state.character
  const fight = ctx.state.fight
  if (!c || !fight) return { err: 'No fight' }
  const { gold, xp, name } = fight.creature
  updateCharacter(ctx.state.maps, c.id, { gold: c.gold + gold, xp: c.xp + xp })
  updateFight(ctx.state.maps, c.id, {
    outcome: 'won',
    reward: { gold, xp },
    gameWon: name === GAME_WINNER,
  })
  return checkAndAdvanceLevel(ctx)
}

/** "CHECKAND": every level the experience now earns adds 1..9 + constitution bonus hit points. */
export const checkAndAdvanceLevel: GameSys = ctx => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  const level = levelEarned(c.xp)
  if (level <= c.level || c.level >= MAX_LEVEL) return

  let gained = 0
  for (let l = c.level; l < level; l++) {
    gained += randomNumber(ctx.rng, 1, 10) + conHitPoints(c.constitution)
  }
  updateCharacter(ctx.state.maps, c.id, {
    level,
    hp: c.hp + gained,
    hpMax: c.hpMax + gained,
    thac0: thac0(level),
    attacksPerRound: attacksPerRound(level),
  })
  const fight = ctx.state.fight
  if (fight) {
    updateFight(ctx.state.maps, c.id, {
      levelUp: { level, gained, maxed: level === MAX_LEVEL },
      sounds: [...fight.sounds, 'new-level'],
    })
  }
}
