/** Buying and selling magic items: the four refusals, charges, AC and the half-price sale. */
import { bootGame } from '../../__tests__/boot'
import { MAGIC_ITEMS } from '../../data'
import {
  ALREADY_OWNED,
  buyMagicItem,
  NOT_ENOUGH_GOLD,
  ONE_AC_ITEM,
  sellMagicItem,
  TOO_MANY_ITEMS,
} from '../magicShop'

describe('buyMagicItem', () => {
  it('takes the cost and adds the item with its starting charges', () => {
    const g = bootGame()
    g.patch({ gold: 10000 })

    expect(buyMagicItem(g.ctx, { name: 'Wand of Fire' })).toBeUndefined()
    expect(buyMagicItem(g.ctx, { name: 'Potion of Healing' })).toBeUndefined()
    expect(buyMagicItem(g.ctx, { name: 'Tome of Strength' })).toBeUndefined()
    expect(buyMagicItem(g.ctx, { name: 'Ring of Protection +1' })).toBeUndefined()

    expect(g.character().gold).toBe(10000 - 1500 - 75 - 2000 - 800)
    expect(g.character().magicItems.map(i => [i.name, i.charges])).toEqual([
      ['Wand of Fire', 10],
      ['Potion of Healing', 1],
      ['Tome of Strength', 1],
      ['Ring of Protection +1', 0],
    ])
    expect(g.state.armorClass).toBe(8)
  })

  it('allows buying with exactly the cost and refuses one gold short', () => {
    const g = bootGame()
    g.patch({ gold: 74 })
    expect(buyMagicItem(g.ctx, { name: 'Potion of Healing' })).toEqual({ err: NOT_ENOUGH_GOLD })
    expect(g.character()).toMatchObject({ gold: 74, magicItems: [] })

    g.patch({ gold: 75 })
    expect(buyMagicItem(g.ctx, { name: 'Potion of Healing' })).toBeUndefined()
    expect(g.character().gold).toBe(0)
  })

  it('refuses a duplicate and a second ring', () => {
    const g = bootGame()
    g.patch({ gold: 10000 })
    buyMagicItem(g.ctx, { name: 'Potion of Healing' })
    buyMagicItem(g.ctx, { name: 'Ring of Protection +1' })

    expect(buyMagicItem(g.ctx, { name: 'Potion of Healing' })).toEqual({ err: ALREADY_OWNED })
    expect(buyMagicItem(g.ctx, { name: 'Ring of Protection +2' })).toEqual({ err: ONE_AC_ITEM })
    expect(g.character().magicItems).toHaveLength(2)
  })

  it('holds at most 10 items', () => {
    const g = bootGame()
    g.patch({ gold: 100000 })
    const notRings = MAGIC_ITEMS.filter(i => i.ac_bonus === 0)
    for (const item of notRings) buyMagicItem(g.ctx, { name: item.name })
    expect(g.character().magicItems).toHaveLength(10)

    expect(buyMagicItem(g.ctx, { name: 'Ring of Protection +1' })).toEqual({
      err: TOO_MANY_ITEMS,
    })
  })
})

describe('sellMagicItem', () => {
  it('pays half the cost, rounded down, and removes the item', () => {
    const g = bootGame()
    g.patch({ gold: 2000 })
    buyMagicItem(g.ctx, { name: 'Potion of Healing' })
    buyMagicItem(g.ctx, { name: 'Ring of Protection +1' })
    expect(g.state.armorClass).toBe(8)

    expect(sellMagicItem(g.ctx, { name: 'Potion of Healing' })).toBeUndefined()
    expect(g.character().gold).toBe(2000 - 75 - 800 + 37)

    sellMagicItem(g.ctx, { name: 'Ring of Protection +1' })
    expect(g.character().magicItems).toEqual([])
    expect(g.state.armorClass).toBe(9)
  })
})
