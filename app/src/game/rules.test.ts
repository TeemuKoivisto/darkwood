/** The tables in `notes/rules.md` "Character", value by value. */
import { creatureByName } from './data'
import {
  armorClass,
  attacksPerRound,
  conHitPoints,
  dexAcBonus,
  levelEarned,
  minXpForLevel,
  surrenderPenalty,
  thac0,
  toDamageBonus,
  toHitBonus,
} from './rules'
import { startingCharacter } from './systems/newGame'

describe('thac0 and attacks', () => {
  it('is 21 - level for levels 1..15 and fails outside', () => {
    expect(thac0(1)).toBe(20)
    expect(thac0(15)).toBe(6)
    expect(() => thac0(0)).toThrow('Can not determine THAC0')
    expect(() => thac0(16)).toThrow()
  })

  it('gives a second attack from level 13', () => {
    expect(attacksPerRound(12)).toBe(1)
    expect(attacksPerRound(13)).toBe(2)
  })
})

describe('strength bonuses', () => {
  it.each([
    [16, 0, 0, 1],
    [17, 0, 1, 1],
    [18, 0, 1, 2],
    [18, 50, 1, 3],
    [18, 51, 2, 3],
    [18, 75, 2, 3],
    [18, 76, 2, 4],
    [18, 90, 2, 4],
    [18, 91, 2, 5],
    [18, 99, 2, 5],
    [18, 100, 3, 6],
    [15, 0, 0, 0],
  ])('str %i/%i: to hit +%i, damage +%i', (str, pct, hit, dmg) => {
    expect(toHitBonus(str, pct)).toBe(hit)
    expect(toDamageBonus(str, pct)).toBe(dmg)
  })
})

describe('dexterity and constitution', () => {
  it('give 1..4 for 15..18 and nothing otherwise', () => {
    expect([14, 15, 16, 17, 18, 19].map(dexAcBonus)).toEqual([0, 1, 2, 3, 4, 0])
    expect([14, 15, 16, 17, 18, 19].map(conHitPoints)).toEqual([0, 1, 2, 3, 4, 0])
  })
})

describe('armorClass', () => {
  it('is 10 + armor - dex bonus - ring bonuses', () => {
    const c = startingCharacter('x', 'Derek')
    expect(armorClass(c)).toBe(9) // dex 15
    c.armor = { name: 'Full Plate +4', cost: 5000, ac_modifier: -13 }
    expect(armorClass(c)).toBe(-4)
    c.magicItems = [
      {
        name: 'Ring of Protection +3',
        cost: 2000,
        ac_bonus: 3,
        unused: 0,
        dmg_min: 0,
        dmg_max: 0,
        heal_min: 0,
        heal_max: 0,
        charges: 0,
        attribute_raised: 0,
      },
    ]
    expect(armorClass(c)).toBe(-7)
  })
})

describe('levels', () => {
  it('needs the fighter table', () => {
    expect(minXpForLevel(1)).toBe(0)
    expect(minXpForLevel(2)).toBe(2000)
    expect(minXpForLevel(8)).toBe(125000)
    expect(minXpForLevel(15)).toBe(1750000)
  })

  it('earns a level at the threshold and caps at 15', () => {
    expect(levelEarned(0)).toBe(1)
    expect(levelEarned(1999)).toBe(1)
    expect(levelEarned(2000)).toBe(2)
    expect(levelEarned(1548525)).toBe(14)
    expect(levelEarned(1750000)).toBe(15)
    expect(levelEarned(99999999)).toBe(15)
  })
})

describe('surrenderPenalty', () => {
  it('is a tenth of the award money, truncated', () => {
    expect(surrenderPenalty(creatureByName('Rat, Giant'))).toBe(1)
    expect(surrenderPenalty(creatureByName('Dragon, Red'))).toBe(500)
  })
})
