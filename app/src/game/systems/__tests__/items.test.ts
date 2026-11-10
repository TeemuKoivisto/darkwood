/** `useMagicItem`: potions, damage items, tomes and rings, and how charges run out. */
import { bootGame, roll } from '../../__tests__/boot'
import { magicItemByName } from '../../data'
import { initialCharges } from '../../rules'
import { startFight } from '../combat'
import { ATTRIBUTE_AT_MAX, COMBAT_ONLY, FULL_HP, NO_FUNCTION, useMagicItem } from '../items'

function owning(names: string[], rng: number[] = [0]) {
  const g = bootGame({ rng })
  g.patch({
    magicItems: names.map(name => {
      const item = magicItemByName(name)
      return { ...item, charges: initialCharges(item) }
    }),
  })
  return g
}

describe('potions of healing', () => {
  it('heal 1..heal_max-1, capped at full, and are used up', () => {
    const g = owning(['Potion of Extra Healing'], [roll(4, 24, 20)])
    g.patch({ hp: 2 })

    expect(useMagicItem(g.ctx, { item: 'Potion of Extra Healing' })).toBeUndefined()

    expect(g.character()).toMatchObject({ hp: 10, magicItems: [] })
    expect(g.state.alerts).toEqual(['You have been healed 20 hit points.'])
  })

  it('refuse at full hit points', () => {
    const g = owning(['Potion of Healing'])
    expect(useMagicItem(g.ctx, { item: 'Potion of Healing' })).toEqual({ err: FULL_HP })
    expect(g.character().magicItems).toHaveLength(1)
  })
})

describe('damage items', () => {
  it('only work in combat', () => {
    const g = owning(['Wand of Magic Missiles'])
    expect(useMagicItem(g.ctx, { item: 'Wand of Magic Missiles' })).toEqual({ err: COMBAT_ONLY })
  })

  it('always hit, and a wand loses one of its 10 charges', () => {
    const g = owning(['Wand of Magic Missiles'], [roll(8, 16, 12)])
    startFight(g.ctx, { creature: 'Hydra' })

    useMagicItem(g.ctx, { item: 'Wand of Magic Missiles' })

    expect(g.state.fight?.creature.hp).toBe(38)
    expect(g.character().magicItems[0].charges).toBe(9)
    expect(g.state.alerts).toEqual(['The creature took 12 hit points of damage.'])
  })

  it('the last charge takes the item away', () => {
    const g = owning(['Potion of Fiery Breath'], [roll(4, 24, 5)])
    startFight(g.ctx, { creature: 'Hydra' })
    useMagicItem(g.ctx, { item: 'Potion of Fiery Breath' })
    expect(g.character().magicItems).toEqual([])
  })
})

describe('tomes', () => {
  it('raise a stat below 18 by one', () => {
    const g = owning(['Tome of Dexterity'])
    useMagicItem(g.ctx, { item: 'Tome of Dexterity' })
    expect(g.character()).toMatchObject({ dexterity: 16, magicItems: [] })
    expect(g.state.armorClass).toBe(8)
    expect(g.state.alerts).toEqual(['Your dexterity has been increased.'])
  })

  it('at strength 18 add 10 percentile, capped at 100', () => {
    const g = owning(['Tome of Strength'])
    g.patch({ strength: 18, strengthPct: 95 })
    useMagicItem(g.ctx, { item: 'Tome of Strength' })
    expect(g.character()).toMatchObject({ strength: 18, strengthPct: 100 })
    expect(g.state.alerts).toEqual(['Your strength has been increased.'])
  })

  it('refuse a stat already at its maximum, keeping the tome', () => {
    const g = owning(['Tome of Strength', 'Tome of Constitution'])
    g.patch({ strength: 18, strengthPct: 100, constitution: 18 })
    expect(useMagicItem(g.ctx, { item: 'Tome of Strength' })).toEqual({ err: ATTRIBUTE_AT_MAX })
    expect(useMagicItem(g.ctx, { item: 'Tome of Constitution' })).toEqual({
      err: ATTRIBUTE_AT_MAX,
    })
    expect(g.character().magicItems).toHaveLength(2)
  })
})

describe('rings', () => {
  it('have no use beyond being owned', () => {
    const g = owning(['Ring of Protection +2'])
    expect(useMagicItem(g.ctx, { item: 'Ring of Protection +2' })).toEqual({ err: NO_FUNCTION })
    expect(g.state.armorClass).toBe(7)
  })
})
