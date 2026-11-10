/** The Weapon Shop, `notes/rules.md` "Shops and inn". Owned weapons are addressed by index. */
import { weaponByName } from '../data'
import { updateCharacter } from '../maps'
import { MAX_WEAPONS, sellPrice } from '../rules'
import type { GameSys } from '../types'
import { NOT_ENOUGH_GOLD } from './magicShop'

// ASSUMPTION: the original's text for a full weapon rack was not recovered
export const TOO_MANY_WEAPONS = 'Sorry... You can not carry any more weapons.'

export const buyWeapon: GameSys<{ name: string }> = (ctx, { name }) => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  const weapon = weaponByName(name)
  if (weapon.cost > c.gold) return { err: NOT_ENOUGH_GOLD }
  if (c.weapons.length >= MAX_WEAPONS) return { err: TOO_MANY_WEAPONS }

  updateCharacter(ctx.state.maps, c.id, {
    gold: c.gold - weapon.cost,
    weapons: [...c.weapons, { ...weapon }],
    // ASSUMPTION: a weapon bought while bare-handed is taken up at once
    currentWeapon: c.currentWeapon < 0 ? c.weapons.length : c.currentWeapon,
  })
}

/** Half the cost, so the cost-1 weapons (Club, Dagger, Hand Axe, Quarterstaff) fetch nothing. */
export const sellWeapon: GameSys<{ index: number }> = (ctx, { index }) => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  const weapon = c.weapons[index]
  if (!weapon) return { err: 'No such weapon' }

  const weapons = c.weapons.filter((_, i) => i !== index)
  // Selling the current weapon makes weapon 1 current; otherwise the current one stays current
  let current = c.currentWeapon
  if (index === current) current = 0
  else if (index < current) current -= 1
  if (!weapons.length) current = -1

  updateCharacter(ctx.state.maps, c.id, {
    gold: c.gold + sellPrice(weapon.cost),
    weapons,
    currentWeapon: current,
  })
}

export const setCurrentWeapon: GameSys<{ index: number }> = (ctx, { index }) => {
  const c = ctx.state.character
  if (!c) return { err: 'No character' }
  if (!c.weapons[index]) return { err: 'No such weapon' }
  updateCharacter(ctx.state.maps, c.id, { currentWeapon: index })
}
