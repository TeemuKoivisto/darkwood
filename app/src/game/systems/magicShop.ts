/** The Magic Item Shop, `notes/rules.md` "Shops and inn". */
import { magicItemByName } from '../data'
import { updateCharacter } from '../maps'
import { initialCharges, MAX_MAGIC_ITEMS, sellPrice } from '../rules'
import type { GameSys } from '../types'

// ASSUMPTION: the shop's refusal texts were not recovered; these follow the "Sorry..." alerts
export const NOT_ENOUGH_GOLD = 'Sorry... You do not have enough gold to buy this item.'
export const TOO_MANY_ITEMS = 'Sorry... You can not carry any more magic items.'
export const ALREADY_OWNED = 'Sorry... You already own this item.'
export const ONE_AC_ITEM = 'Sorry... You can only own one item that alters your armor class.'

export const buyMagicItem: GameSys<{ name: string }> = (ctx, { name }) => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  const item = magicItemByName(name)

  if (item.cost > c.gold) return { err: NOT_ENOUGH_GOLD }
  if (c.magicItems.length >= MAX_MAGIC_ITEMS) return { err: TOO_MANY_ITEMS }
  if (c.magicItems.some(owned => owned.name === name)) return { err: ALREADY_OWNED }
  if (item.ac_bonus > 0 && c.magicItems.some(owned => owned.ac_bonus > 0)) {
    return { err: ONE_AC_ITEM }
  }

  updateCharacter(ctx.state.maps, c.id, {
    gold: c.gold - item.cost,
    magicItems: [...c.magicItems, { ...item, charges: initialCharges(item) }],
  })
}

export const sellMagicItem: GameSys<{ name: string }> = (ctx, { name }) => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  const item = c.magicItems.find(owned => owned.name === name)
  if (!item) return { err: 'No such item' }

  updateCharacter(ctx.state.maps, c.id, {
    gold: c.gold + sellPrice(item.cost),
    magicItems: c.magicItems.filter(owned => owned !== item),
  })
}
