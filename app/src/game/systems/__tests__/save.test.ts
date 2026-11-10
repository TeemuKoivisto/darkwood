/** The save round trip, `loadGame` and the alert queue. */
import { bootGame } from '../../__tests__/boot'
import { creatureByName } from '../../data'
import { deserializeMaps, SAVE_VERSION, serializeMaps } from '../../save'
import { dismissAlert, loadGame } from '../newGame'

describe('serializeMaps / deserializeMaps', () => {
  it('round-trips the characters, the fights and the open character', () => {
    const g = bootGame()
    g.patch({ gold: 123 })
    g.maps.fights.set(g.state.characterId, {
      characterId: g.state.characterId,
      creature: { ...creatureByName('Kobold') },
      defensiveBonus: 0,
      messages: [],
      sounds: [],
      round: 0,
      outcome: 'ongoing',
    })

    const json = serializeMaps(g.maps, g.state.characterId)
    expect(JSON.parse(json).version).toBe(SAVE_VERSION)

    const { maps, characterId } = deserializeMaps(json)
    expect(characterId).toBe(g.state.characterId)
    expect(maps.characters.get(characterId)).toEqual(g.character())
    expect(maps.fights.get(characterId)?.creature.name).toBe('Kobold')
  })

  it('rejects other versions and junk', () => {
    expect(() => deserializeMaps('{"version":99,"characters":[]}')).toThrow()
    expect(() => deserializeMaps('null')).toThrow()
    expect(() => deserializeMaps('nope')).toThrow()
  })
})

describe('loadGame', () => {
  it('replaces the maps and opens the saved character', () => {
    const saved = bootGame()
    saved.patch({ name: 'Saved', gold: 500 })
    const json = serializeMaps(saved.maps, saved.state.characterId)

    const g = bootGame()
    g.state.screen = 'inn'
    expect(loadGame(g.ctx, { json })).toBeUndefined()

    expect(g.maps.characters.size).toBe(1)
    expect(g.state.character).toMatchObject({ name: 'Saved', gold: 500 })
    expect(g.state.screen).toBe('main')
  })

  it('refuses a file that is not a save, keeping the game', () => {
    const g = bootGame()
    const id = g.state.characterId

    expect(loadGame(g.ctx, { json: '{}' })).toEqual({
      err: 'This file is not a Darkwood character file.',
    })
    expect(g.state.characterId).toBe(id)
  })
})

describe('alerts', () => {
  it('shows the oldest text first and dismisses one at a time', () => {
    const g = bootGame()
    expect(g.state.alert).toBeNull()

    g.state.alerts = ['one', 'two']
    expect(g.state.alert).toBe('one')
    dismissAlert(g.ctx)
    expect(g.state.alert).toBe('two')
    dismissAlert(g.ctx)
    expect(g.state.alert).toBeNull()
  })
})
