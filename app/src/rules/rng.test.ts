import { describe, expect, it } from 'vitest'
import { randomNumber, seqRng } from './rng'

describe('randomNumber', () => {
  it('returns lo at 0 and never hi (truncation quirk)', () => {
    expect(randomNumber(seqRng([0]), 1, 20)).toBe(1)
    expect(randomNumber(seqRng([0.999999]), 1, 20)).toBe(19)
  })

  it('is uniform over lo..hi-1', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 1000; i++) seen.add(randomNumber(seqRng([i / 1000]), 1, 4))
    expect([...seen].sort()).toEqual([1, 2, 3])
  })
})
