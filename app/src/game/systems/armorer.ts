/** The Armorer, `notes/rules.md` "Shops and inn": one slot, buying replaces it, no selling. */
import { armorByName } from '../data'
import { updateCharacter } from '../maps'
import type { GameSys } from '../types'
import { NOT_ENOUGH_GOLD } from './magicShop'

export const buyArmor: GameSys<{ name: string }> = (ctx, { name }) => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  const armor = armorByName(name)
  if (armor.cost > c.gold) return { err: NOT_ENOUGH_GOLD }

  // The old armor is simply replaced: the original has no trade-in or sell routine
  updateCharacter(ctx.state.maps, c.id, { gold: c.gold - armor.cost, armor: { ...armor } })
}
