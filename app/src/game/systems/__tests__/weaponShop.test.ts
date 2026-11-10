/** Buying, selling and choosing weapons. */
import { bootGame } from '../../__tests__/boot'
import { NOT_ENOUGH_GOLD } from '../magicShop'
import { buyWeapon, sellWeapon, setCurrentWeapon, TOO_MANY_WEAPONS } from '../weaponShop'

const names = (g: ReturnType<typeof bootGame>) => g.character().weapons.map(w => w.name)

describe('buyWeapon', () => {
  it('adds the weapon and keeps the current one', () => {
    const g = bootGame()
    expect(buyWeapon(g.ctx, { name: 'Bardiche' })).toBeUndefined()

    expect(names(g)).toEqual(['Dagger', 'Bardiche'])
    expect(g.character()).toMatchObject({ gold: 3, currentWeapon: 0 })
    expect(g.state.weapon?.name).toBe('Dagger')
  })

  it('refuses when too poor or carrying 6', () => {
    const g = bootGame()
    expect(buyWeapon(g.ctx, { name: 'Flail' })).toEqual({ err: NOT_ENOUGH_GOLD })

    for (let i = 0; i < 5; i++) buyWeapon(g.ctx, { name: 'Club' })
    expect(names(g)).toHaveLength(6)
    expect(buyWeapon(g.ctx, { name: 'Club' })).toEqual({ err: TOO_MANY_WEAPONS })
    expect(g.character().gold).toBe(5)
  })

  it('takes up a weapon bought bare-handed', () => {
    const g = bootGame()
    g.patch({ weapons: [], currentWeapon: -1 })
    buyWeapon(g.ctx, { name: 'Club' })
    expect(g.state.weapon?.name).toBe('Club')
  })
})

describe('sellWeapon', () => {
  it('pays half the cost; a cost-1 weapon fetches nothing', () => {
    const g = bootGame()
    g.patch({ gold: 100 })
    buyWeapon(g.ctx, { name: 'Sword, Long' })

    sellWeapon(g.ctx, { index: 1 })
    expect(g.character().gold).toBe(100 - 15 + 7)

    sellWeapon(g.ctx, { index: 0 })
    expect(g.character()).toMatchObject({ gold: 92, weapons: [], currentWeapon: -1 })
    expect(g.state.weapon).toBeUndefined()
  })

  it('selling the current weapon makes weapon 1 current', () => {
    const g = bootGame()
    g.patch({ gold: 100 })
    buyWeapon(g.ctx, { name: 'Mace' })
    buyWeapon(g.ctx, { name: 'Flail' })
    setCurrentWeapon(g.ctx, { index: 2 })

    sellWeapon(g.ctx, { index: 2 })

    expect(g.state.weapon?.name).toBe('Dagger')
  })

  it('keeps the current weapon when an earlier one is sold', () => {
    const g = bootGame()
    g.patch({ gold: 100 })
    buyWeapon(g.ctx, { name: 'Mace' })
    setCurrentWeapon(g.ctx, { index: 1 })

    sellWeapon(g.ctx, { index: 0 })

    expect(g.character().currentWeapon).toBe(0)
    expect(g.state.weapon?.name).toBe('Mace')
  })
})

describe('setCurrentWeapon', () => {
  it('switches weapons and refuses an index out of range', () => {
    const g = bootGame()
    buyWeapon(g.ctx, { name: 'Club' })
    expect(setCurrentWeapon(g.ctx, { index: 1 })).toBeUndefined()
    expect(g.state.weapon?.name).toBe('Club')
    expect(setCurrentWeapon(g.ctx, { index: 5 })).toEqual({ err: 'No such weapon' })
  })
})
