/** `stayOneNight` and `stayUntilHealed`, including the original's gold-zeroing bug. */
import { bootGame } from '../../__tests__/boot'
import { stayOneNight, stayUntilHealed } from '../inn'

describe('stayOneNight', () => {
  it('heals 1 hp for 1 gold and closes the inn', () => {
    const g = bootGame()
    g.patch({ hp: 3 })
    g.state.screen = 'inn'

    expect(stayOneNight(g.ctx)).toBeUndefined()

    expect(g.character()).toMatchObject({ hp: 4, gold: 9 })
    expect(g.state.character).toBe(g.character())
    expect(g.state.screen).toBe('main')
  })

  it('refuses at full hp and with no gold, changing nothing and staying open', () => {
    const g = bootGame()
    g.state.screen = 'inn'
    expect(stayOneNight(g.ctx)).toEqual({ err: 'You character is already up to full hit points.' })
    expect(g.character()).toMatchObject({ hp: 10, gold: 10 })

    g.patch({ hp: 3, gold: 0 })
    expect(stayOneNight(g.ctx)).toMatchObject({ err: expect.stringContaining('enough gold') })
    expect(g.character()).toMatchObject({ hp: 3, gold: 0 })
    expect(g.state.screen).toBe('inn')
  })
})

describe('stayUntilHealed', () => {
  it('costs one gold per missing hit point and closes the inn', () => {
    const g = bootGame()
    g.patch({ hp: 4 })
    g.state.screen = 'inn'

    expect(stayUntilHealed(g.ctx)).toBeUndefined()

    expect(g.character()).toMatchObject({ hp: 10, gold: 4 })
    expect(g.state.screen).toBe('main')
  })

  it('refuses at full hp', () => {
    const g = bootGame()
    expect(stayUntilHealed(g.ctx)).toEqual({
      err: 'You character is already up to full hit points.',
    })
    expect(g.character().gold).toBe(10)
  })

  it('(bug) takes all the gold and heals nothing when it cannot be afforded', () => {
    const g = bootGame()
    g.patch({ hp: 2, gold: 5 })
    g.state.screen = 'inn'

    expect(stayUntilHealed(g.ctx)).toEqual({ err: 'You did not have enough gold to heal fully.' })

    expect(g.character()).toMatchObject({ hp: 2, gold: 0 })
    expect(g.state.screen).toBe('inn')
  })
})
