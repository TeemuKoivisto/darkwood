/** The arena, `notes/rules.md` "Combat". */
import { creatureByName } from '../data'
import type { GameSys } from '../types'

/** Puts a fresh copy of the creature in the ring and opens the combat screen. */
export const startFight: GameSys<{ creature: string }> = (ctx, { creature }) => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  ctx.state.maps.fights.set(c.id, {
    characterId: c.id,
    creature: { ...creatureByName(creature) },
    defensiveBonus: 0,
    messages: [],
    outcome: 'ongoing',
  })
  ctx.state.screen = 'combat'
}

/** Leaves the arena: the fight is gone and the town is back. */
export const endFight: GameSys = ctx => {
  ctx.state.maps.fights.delete(ctx.state.characterId)
  ctx.state.screen = 'main'
}
