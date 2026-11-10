/** The Inn, `notes/rules.md` "Shops and inn": "For each night you stay you are healed 1 hit point." */
import { updateCharacter } from '../maps'
import type { GameSys } from '../types'

const FULL = 'You character is already up to full hit points.'

export const stayOneNight: GameSys = ctx => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  if (c.hp >= c.hpMax) return { err: FULL }
  // ASSUMPTION: the original refuses with no gold; its exact text was not recovered
  if (c.gold < 1) return { err: 'Sorry... You do not have enough gold to stay the night.' }

  updateCharacter(ctx.state.maps, c.id, { gold: c.gold - 1, hp: c.hp + 1 })
}

export const stayUntilHealed: GameSys = ctx => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  const nights = c.hpMax - c.hp
  if (nights <= 0) return { err: FULL }

  if (c.gold < nights) {
    // (bug) The original zeroes the gold before adding it to hp: all gold lost, nothing healed
    updateCharacter(ctx.state.maps, c.id, { gold: 0 })
    return { err: 'You did not have enough gold to heal fully.' }
  }
  updateCharacter(ctx.state.maps, c.id, { gold: c.gold - nights, hp: c.hpMax })
}
