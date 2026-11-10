/** The arena: starting and ending a fight, and every branch of a round in `rules.md` "Combat". */
import { bootGame, roll } from '../../__tests__/boot'
import { magicItemByName, weaponByName } from '../../data'
import { updateFight } from '../../maps'
import {
  CANNOT_PAY_SURRENDER,
  checkAndAdvanceLevel,
  defensiveRound,
  DRAINED_TO_UNDEAD,
  endFight,
  fightRound,
  LEVEL_DRAINED,
  NEED_MAGIC_WEAPON,
  startFight,
  surrender,
  useItemRound,
} from '../combat'
import { NO_FUNCTION } from '../items'

const d10 = (n: number) => roll(1, 10, n)
const d20 = (n: number) => roll(1, 20, n)
/** Initiative rolls that make the player (Dagger, speed 2) strike first or second. */
const PLAYER_FIRST = [d10(1), d10(9)]
const CREATURE_FIRST = [d10(9), d10(1)]

/** A fresh Derek in a fight with `creature`, rolling `rng` in order. */
function arena(creature: string, rng: number[]) {
  const g = bootGame({ rng })
  startFight(g.ctx, { creature })
  const fight = () => g.maps.fights.get(g.state.characterId)!
  return { ...g, fight }
}

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

describe('fightRound', () => {
  it('player strikes first and kills: reward, no counter-attack', () => {
    // Dagger vs Giant Rat (AC 9): needs 20 - 0 + 0 - 9 = 11; 1 damage + 1 strength = 2 = its hp
    const g = arena('Rat, Giant', [...PLAYER_FIRST, d20(11), roll(1, 4, 1)])

    expect(fightRound(g.ctx)).toBeUndefined()

    expect(g.fight()).toMatchObject({
      messages: ['You strike first', 'You hit 1 time for 2 points.', 'The creature missed'],
      sounds: ['hit-on-creature'],
      outcome: 'won',
      reward: { gold: 10, xp: 75 },
      gameWon: false,
      round: 1,
    })
    expect(g.fight().levelUp).toBeUndefined()
    expect(g.character()).toMatchObject({ gold: 20, xp: 75, hp: 10 })
  })

  it('creature strikes first and hits, then the player misses', () => {
    // Kobold needs 20 - (9 - 0) = 11; Derek needs 20 - 8 = 12
    const g = arena('Kobold', [...CREATURE_FIRST, d20(11), roll(1, 6, 4), d20(11)])

    fightRound(g.ctx)

    expect(g.fight()).toMatchObject({
      messages: [
        'The creature strikes first',
        'You missed',
        'The creature hit 1 time for 4 points.',
      ],
      sounds: ['hit-on-player', 'missed'],
      outcome: 'ongoing',
      creature: { hp: 4 },
    })
    expect(g.character().hp).toBe(6)
  })

  it('a creature that kills first leaves the player no swing (the death shot)', () => {
    const g = arena('Kobold', [...CREATURE_FIRST, d20(15), roll(1, 6, 4)])
    g.patch({ hp: 3 })

    fightRound(g.ctx)

    expect(g.character().hp).toBe(0)
    expect(g.fight()).toMatchObject({
      messages: [
        'The creature strikes first',
        'You missed',
        'The creature hit 1 time for 4 points.',
      ],
      sounds: ['hit-on-player', 'oouch'],
      outcome: 'died',
    })
    expect(fightRound(g.ctx)).toEqual({ err: 'The fight is over.' })
  })

  it('ties on initiative go to the player', () => {
    // 1 + 2 (Dagger speed) = 3 against 1 + 2 (Rat level)
    const g = arena('Rat, Giant', [d10(1), d10(1), d20(2), d20(2)])
    fightRound(g.ctx)
    expect(g.fight().messages[0]).toBe('You strike first')
  })

  it('a 1 always misses and a 20 always hits', () => {
    const g = arena('Quickling', [...PLAYER_FIRST, d20(20), roll(1, 4, 3), d20(1), d20(1)])
    // Quickling AC -7: needs 27, out of reach but for a 20
    fightRound(g.ctx)
    expect(g.fight().messages[1]).toBe('You hit 1 time for 4 points.')

    const easy = arena('Rat, Giant', [...PLAYER_FIRST, d20(1), d20(2)])
    easy.patch({ thac0: 1 })
    fightRound(easy.ctx)
    expect(easy.fight().messages[1]).toBe('You missed')
  })

  it('(quirk) a magic bonus makes hitting harder but adds to damage', () => {
    // Dagger +1: needs 20 + 1 - 9 = 12, so 11 misses where a plain dagger hits
    const g = arena('Kobold', [d10(1), d10(9), d20(11), d20(2)])
    g.patch({ weapons: [weaponByName('Dagger +1')] })
    fightRound(g.ctx)
    expect(g.fight().messages[1]).toBe('You missed')

    // 12 hits: 1 + 1 (magic) + 1 (strength) = 3
    const h = arena('Kobold', [d10(1), d10(9), d20(13), roll(1, 4, 1), d20(2)])
    h.patch({ weapons: [weaponByName('Dagger +1')] })
    fightRound(h.ctx)
    expect(h.fight().messages[1]).toBe('You hit 1 time for 3 points.')
  })

  it('without the magic weapon a creature needs, a hit does nothing and the game says so', () => {
    // Gargoyle needs +1; it attacks 3 times and needs 14 - 9 = 5
    const g = arena('Gargoyle', [...PLAYER_FIRST, d20(20), d20(2), d20(2), d20(2)])

    fightRound(g.ctx)

    expect(g.fight().creature.hp).toBe(24)
    expect(g.fight().messages[1]).toBe('You missed')
    expect(g.fight().sounds).toEqual(['missed'])
    expect(g.state.alerts).toEqual([NEED_MAGIC_WEAPON])
  })

  it('every attack of the round is made, even past the kill', () => {
    const g = arena('Rat, Giant', [...PLAYER_FIRST, d20(15), roll(1, 4, 1), d20(15), roll(1, 4, 1)])
    g.patch({ attacksPerRound: 2 })

    fightRound(g.ctx)

    expect(g.fight().messages[1]).toBe('You hit 2 time for 4 points.')
    expect(g.fight().creature.hp).toBe(-2)
    expect(g.fight().outcome).toBe('won')
  })

  it('bare-handed does 1 + strength bonus', () => {
    const g = arena('Rat, Giant', [d10(1), d10(9), d20(15), roll(1, 2, 1)])
    g.patch({ weapons: [], currentWeapon: -1 })
    fightRound(g.ctx)
    expect(g.fight().messages[1]).toBe('You hit 1 time for 2 points.')
  })
})

describe('defensiveRound', () => {
  it('the player does not attack and the creature needs more', () => {
    // Kobold needs 20 - (9 - 1) = 12 against a defensive Derek: 11 misses
    const g = arena('Kobold', [...CREATURE_FIRST, d20(11)])

    expect(defensiveRound(g.ctx)).toBeUndefined()

    expect(g.fight()).toMatchObject({
      defensiveBonus: 1,
      messages: ['The creature strikes first', 'You are defensive', 'The creature missed'],
      creature: { hp: 4 },
    })
    expect(g.character().hp).toBe(10)
  })

  it('the bonus is level div 2, at least 1', () => {
    const g = arena('Kobold', [d10(1)])
    g.patch({ level: 7 })
    defensiveRound(g.ctx)
    expect(g.fight().defensiveBonus).toBe(3)
  })

  it('(quirk) the bonus lasts through Use rounds and only Fight clears it', () => {
    const g = arena('Kobold', [...CREATURE_FIRST, d20(2), roll(1, 8, 1), d20(2), ...PLAYER_FIRST])
    g.patch({ hp: 5, magicItems: [{ ...magicItemByName('Potion of Healing') }] })
    defensiveRound(g.ctx)
    useItemRound(g.ctx, { item: 'Potion of Healing' })
    expect(g.fight().defensiveBonus).toBe(1)

    fightRound(g.ctx)
    expect(g.fight().defensiveBonus).toBe(0)
  })
})

describe('useItemRound', () => {
  it('uses the item, then the creature attacks', () => {
    const g = arena('Kobold', [roll(1, 8, 5), d20(15), roll(1, 6, 2)])
    g.patch({ hp: 3, magicItems: [{ ...magicItemByName('Potion of Healing') }] })

    expect(useItemRound(g.ctx, { item: 'Potion of Healing' })).toBeUndefined()

    expect(g.character()).toMatchObject({ hp: 3 + 5 - 2, magicItems: [] })
    expect(g.fight().messages).toEqual(['You use an item', 'The creature hit 1 time for 2 points.'])
    expect(g.state.alerts).toEqual(['You have been healed 5 hit points.'])
  })

  it('a wand that kills ends the fight before the creature attacks', () => {
    const g = arena('Kobold', [roll(4, 24, 10)])
    g.patch({ magicItems: [{ ...magicItemByName('Wand of Fire') }] })

    useItemRound(g.ctx, { item: 'Wand of Fire' })

    expect(g.fight()).toMatchObject({ outcome: 'won', creature: { hp: -6 } })
    expect(g.fight().messages).toEqual(['You use an item', 'The creature missed'])
    expect(g.character().magicItems[0].charges).toBe(9)
  })

  it('an item that refuses costs no round', () => {
    const g = arena('Kobold', [d20(15)])
    g.patch({ magicItems: [{ ...magicItemByName('Ring of Protection +1'), charges: 0 }] })

    expect(useItemRound(g.ctx, { item: 'Ring of Protection +1' })).toEqual({ err: NO_FUNCTION })

    expect(g.fight()).toMatchObject({ round: 0, messages: [] })
    expect(g.character().hp).toBe(10)
  })

  it('killing "Dragon, Red" wins the game', () => {
    const g = arena('Dragon, Red', [roll(6, 36, 20)])
    g.patch({ magicItems: [{ ...magicItemByName('Wand of Lightning') }] })
    updateFight(g.maps, g.state.characterId, { creature: { ...g.fight().creature, hp: 5 } })

    useItemRound(g.ctx, { item: 'Wand of Lightning' })

    expect(g.fight()).toMatchObject({ outcome: 'won', gameWon: true, reward: { gold: 5000 } })
  })
})

describe('surrender', () => {
  it('pays a tenth of the award money and ends the fight', () => {
    const g = arena('Kobold', [])

    expect(surrender(g.ctx)).toBeUndefined()

    expect(g.character().gold).toBe(8)
    expect(g.fight()).toMatchObject({
      outcome: 'surrendered',
      messages: ['You surrender', 'The creature missed'],
    })
    expect(g.state.alerts).toEqual(['You pay 2 gold pieces to surrender.'])
  })

  it('too poor: the alert, no attack from the creature, the fight goes on', () => {
    const g = arena('Dragon, Red', [d20(19)])

    expect(surrender(g.ctx)).toEqual({ err: CANNOT_PAY_SURRENDER })

    expect(g.character()).toMatchObject({ gold: 10, hp: 10 })
    expect(g.fight()).toMatchObject({
      outcome: 'ongoing',
      messages: ['You attempted to surrender.', 'The creature missed'],
    })
  })

  it('the Giant Rat costs 1 gold', () => {
    const g = arena('Rat, Giant', [])
    surrender(g.ctx)
    expect(g.character().gold).toBe(9)
  })
})

describe('level drain', () => {
  it('(quirk) takes one level, resets xp, loses hit points, keeps THAC0', () => {
    // Ghoul: drain 1, needs 16 - 9 = 7, 1..3 damage
    const g = arena('Ghoul', [...CREATURE_FIRST, d20(10), roll(1, 4, 2), d10(5), d20(2)])
    g.patch({ level: 3, xp: 5000, hp: 20, hpMax: 20, thac0: 18 })

    fightRound(g.ctx)

    expect(g.character()).toMatchObject({ level: 2, xp: 2000, hp: 13, hpMax: 15, thac0: 18 })
    expect(g.state.alerts).toEqual([LEVEL_DRAINED])
    expect(g.fight().outcome).toBe('ongoing')
  })

  it('drained below level 1 the character becomes an undead and dies', () => {
    const g = arena('Ghoul', [...CREATURE_FIRST, d20(10), roll(1, 4, 1)])

    fightRound(g.ctx)

    expect(g.character()).toMatchObject({ level: 0, hp: 0 })
    expect(g.state.alerts).toEqual([DRAINED_TO_UNDEAD])
    expect(g.fight()).toMatchObject({ outcome: 'died', sounds: ['hit-on-player', 'oouch'] })
  })
})

describe('creatureDeath / checkAndAdvanceLevel', () => {
  it('crossing a level boundary adds 1..9 + constitution bonus hit points', () => {
    const g = arena('Rat, Giant', [...PLAYER_FIRST, d20(15), roll(1, 4, 1), d10(6)])
    g.patch({ xp: 1950 })

    fightRound(g.ctx)

    expect(g.character()).toMatchObject({
      level: 2,
      xp: 2025,
      hp: 17,
      hpMax: 17,
      thac0: 19,
      attacksPerRound: 1,
    })
    expect(g.fight().levelUp).toEqual({ level: 2, gained: 7, maxed: false })
    expect(g.fight().sounds).toEqual(['hit-on-creature', 'new-level'])
  })

  it('several levels at once roll once per level', () => {
    const g = arena('Rat, Giant', [d10(2), d10(3), d10(4)])
    g.patch({ xp: 8000 })

    checkAndAdvanceLevel(g.ctx)

    expect(g.character()).toMatchObject({ level: 4, hpMax: 10 + 3 + 4 + 5 })
    expect(g.fight().levelUp).toEqual({ level: 4, gained: 12, maxed: false })
  })

  it('level 15 is the last, and says so', () => {
    const g = arena('Rat, Giant', [d10(1)])
    g.patch({ level: 14, xp: 1750000, thac0: 7, attacksPerRound: 2 })

    checkAndAdvanceLevel(g.ctx)
    expect(g.character()).toMatchObject({ level: 15, thac0: 6, attacksPerRound: 2 })
    expect(g.fight().levelUp).toEqual({ level: 15, gained: 2, maxed: true })

    g.patch({ xp: 5000000 })
    checkAndAdvanceLevel(g.ctx)
    expect(g.character().level).toBe(15)
  })
})
