/** `buyArmor`: one slot, replaced on purchase, and the armor class follows. */
import { bootGame } from '../../__tests__/boot'
import { buyArmor } from '../armorer'
import { NOT_ENOUGH_GOLD } from '../magicShop'

describe('buyArmor', () => {
  it('puts the armor on and lowers the armor class', () => {
    const g = bootGame()
    expect(g.state.armorClass).toBe(9)

    expect(buyArmor(g.ctx, { name: 'Leather' })).toBeUndefined()

    expect(g.character()).toMatchObject({ gold: 5, armor: { name: 'Leather', ac_modifier: -2 } })
    expect(g.state.armorClass).toBe(7)
  })

  it('replaces the old armor without paying anything back', () => {
    const g = bootGame()
    g.patch({ gold: 100 })
    buyArmor(g.ctx, { name: 'Chain' })
    expect(g.state.armorClass).toBe(4)

    buyArmor(g.ctx, { name: 'Leather' })

    expect(g.character()).toMatchObject({ gold: 20, armor: { name: 'Leather' } })
    expect(g.state.armorClass).toBe(7)
  })

  it('refuses armor that costs more than the gold', () => {
    const g = bootGame()
    expect(buyArmor(g.ctx, { name: 'Studded Leather' })).toEqual({ err: NOT_ENOUGH_GOLD })
    expect(g.character()).toMatchObject({ gold: 10, armor: null })
  })
})
