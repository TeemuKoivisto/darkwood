/**
 * Pure rule functions from `notes/rules.md` "Character": tables and derived values. No state,
 * no randomness; the systems in `systems/` apply these to the maps.
 */
import type { Character, Creature, MagicItem, Weapon } from './types'

export const MAX_LEVEL = 15

/** Experience needed for each level, indexed by level (AD&D 2e fighter table). */
export const XP_FOR_LEVEL: readonly number[] = [
  0, 0, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 750000, 1000000, 1250000,
  1500000, 1750000,
]

export function thac0(level: number): number {
  if (level < 1 || level > MAX_LEVEL) throw Error('Can not determine THAC0')
  return 21 - level
}

export function attacksPerRound(level: number): number {
  return level <= 12 ? 1 : 2
}

export function toHitBonus(strength: number, pct: number): number {
  if (strength === 17) return 1
  if (strength === 18) return pct <= 50 ? 1 : pct <= 99 ? 2 : 3
  return 0
}

export function toDamageBonus(strength: number, pct: number): number {
  if (strength === 16 || strength === 17) return 1
  if (strength === 18) {
    if (pct === 0) return 2
    if (pct <= 75) return 3
    if (pct <= 90) return 4
    if (pct <= 99) return 5
    return 6
  }
  return 0
}

export function dexAcBonus(dexterity: number): number {
  return dexterity >= 15 && dexterity <= 18 ? dexterity - 14 : 0
}

export function conHitPoints(constitution: number): number {
  return constitution >= 15 && constitution <= 18 ? constitution - 14 : 0
}

export function armorClass(c: Character): number {
  const items = c.magicItems.reduce((sum, item) => sum + item.ac_bonus, 0)
  return 10 + (c.armor?.ac_modifier ?? 0) - dexAcBonus(c.dexterity) - items
}

export function minXpForLevel(level: number): number {
  return XP_FOR_LEVEL[Math.min(Math.max(level, 1), MAX_LEVEL)]
}

export function levelEarned(xp: number): number {
  let level = 1
  while (level < MAX_LEVEL && xp >= XP_FOR_LEVEL[level + 1]) level += 1
  return level
}

export function currentWeapon(c: Character): Weapon | undefined {
  return c.weapons[c.currentWeapon]
}

export function surrenderPenalty(creature: Creature): number {
  return Math.trunc(creature.gold * 0.1)
}

/** Magic item limits, `notes/rules.md` "Shops and inn". */
export const MAX_MAGIC_ITEMS = 10
export const MAX_WEAPONS = 6

/** What a shop pays for something: half the price, rounded down. */
export function sellPrice(cost: number): number {
  return Math.trunc(cost / 2)
}

/** Charges on a freshly bought copy: wands 10, potions and tomes 1, rings 0 (never used up). */
export function initialCharges(item: MagicItem): number {
  if (item.ac_bonus > 0) return 0
  if (item.attribute_raised > 0) return 1
  return item.charges
}
