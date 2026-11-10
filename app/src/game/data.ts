/** The game's tables, typed. See `notes/tables.md` for what each field means. */
import tables from './tables.json'
import type { Armor, Creature, MagicItem, Weapon } from './types'

export const WEAPONS: readonly Weapon[] = tables.Weapons
export const ARMORS: readonly Armor[] = tables.Armor
export const MAGIC_ITEMS: readonly MagicItem[] = tables['Magic items']
export const CREATURES: readonly Creature[] = tables.Creatures

function byName<T extends { name: string }>(what: string, list: readonly T[]) {
  return (name: string): T => {
    const found = list.find(x => x.name === name)
    if (!found) throw Error(`No ${what} named '${name}'`)
    return found
  }
}

export const weaponByName = byName('weapon', WEAPONS)
export const armorByName = byName('armor', ARMORS)
export const magicItemByName = byName('magic item', MAGIC_ITEMS)
export const creatureByName = byName('creature', CREATURES)
