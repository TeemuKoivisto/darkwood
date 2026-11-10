/** `stayOneNight` and `stayUntilHealed`, including the original's gold-zeroing bug. */
import { bootGame } from '../../__tests__/boot'
import { stayOneNight, stayUntilHealed } from '../inn'

describe('stayOneNight', () => {
  it('heals 1 hp for 1 gold', () => {
    const g = bootGame()
    g.patch({ hp: 3 })

    expect(stayOneNight(g.ctx)).toBeUndefined()

    expect(g.character()).toMatchObject({ hp: 4, gold: 9 })
    expect(g.state.character).toBe(g.character())
  })

  it('refuses at full hp and with no gold, changing nothing', () => {
    const g = bootGame()
    expect(stayOneNight(g.ctx)).toEqual({ err: 'You character is already up to full hit points.' })
    expect(g.character()).toMatchObject({ hp: 10, gold: 10 })

    g.patch({ hp: 3, gold: 0 })
    expect(stayOneNight(g.ctx)).toMatchObject({ err: expect.stringContaining('enough gold') })
    expect(g.character()).toMatchObject({ hp: 3, gold: 0 })
  })
})

describe('stayUntilHealed', () => {
  it('costs one gold per missing hit point', () => {
    const g = bootGame()
    g.patch({ hp: 4 })

    expect(stayUntilHealed(g.ctx)).toBeUndefined()

    expect(g.character()).toMatchObject({ hp: 10, gold: 4 })
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

    expect(stayUntilHealed(g.ctx)).toEqual({ err: 'You did not have enough gold to heal fully.' })

    expect(g.character()).toMatchObject({ hp: 2, gold: 0 })
  })
})
