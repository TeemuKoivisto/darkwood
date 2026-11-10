/** `newGame` opens a fresh Derek on the main screen; `openScreen` moves between screens. */
import { bootGame } from '../../__tests__/boot'
import { newGame, openScreen } from '../newGame'

describe('newGame', () => {
  it('starts the fixed character and opens it', () => {
    const g = bootGame()

    expect(g.state.screen).toBe('main')
    expect(g.state.character).toMatchObject({
      name: 'Derek',
      level: 1,
      xp: 0,
      hp: 10,
      hpMax: 10,
      strength: 16,
      dexterity: 15,
      constitution: 15,
      thac0: 20,
      attacksPerRound: 1,
      gold: 10,
      currentWeapon: 0,
      armor: null,
      magicItems: [],
    })
    expect(g.state.weapon?.name).toBe('Dagger')
    expect(g.state.armorClass).toBe(9)
  })

  it('keeps the old character in the maps and opens the new one', () => {
    const g = bootGame()
    const first = g.state.characterId
    g.state.screen = 'inn'

    newGame(g.ctx, { name: 'nakki' })

    expect(g.state.characterId).not.toBe(first)
    expect(g.state.character?.name).toBe('nakki')
    expect(g.state.screen).toBe('main')
    expect(g.maps.characters.size).toBe(2)
  })
})

describe('openScreen', () => {
  it('opens a shop and refuses combat without a fight', () => {
    const g = bootGame()

    expect(openScreen(g.ctx, { screen: 'armorer' })).toBeUndefined()
    expect(g.state.screen).toBe('armorer')

    expect(openScreen(g.ctx, { screen: 'combat' })).toEqual({ err: 'No fight to show' })
    expect(g.state.screen).toBe('armorer')
  })
})
