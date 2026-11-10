/** The arena: starting and ending a fight, and every branch of a round in `rules.md` "Combat". */
import { bootGame } from '../../__tests__/boot'
import { endFight, startFight } from '../combat'

describe('startFight / endFight', () => {
  it('puts a fresh copy of the creature in a fight and opens combat', () => {
    const g = bootGame()

    expect(startFight(g.ctx, { creature: 'Kobold' })).toBeUndefined()

    expect(g.state.screen).toBe('combat')
    expect(g.state.fight).toMatchObject({
      characterId: g.state.characterId,
      creature: { name: 'Kobold', hp: 4 },
      defensiveBonus: 0,
      messages: [],
      outcome: 'ongoing',
    })
    expect(g.state.surrenderPenalty).toBe(2)
  })

  it('removes the fight and returns to main', () => {
    const g = bootGame()
    startFight(g.ctx, { creature: 'Kobold' })

    endFight(g.ctx)

    expect(g.maps.fights.size).toBe(0)
    expect(g.state.fight).toBeUndefined()
    expect(g.state.screen).toBe('main')
  })
})
