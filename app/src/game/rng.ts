/**
 * Random source for the rules engine. Injected so tests can be deterministic.
 * `next()` must return a float in [0, 1).
 */
export type Rng = { next(): number }

export const mathRng: Rng = { next: () => Math.random() }

/** Fixed sequence, for tests. Values are taken in order and wrap around. */
export function seqRng(values: number[]): Rng {
  let i = 0
  return { next: () => values[i++ % values.length] }
}

/**
 * The original's RandomNumber(lo, hi): see notes/rules.md "Random numbers".
 * Truncation means `hi` is (practically) never returned: the result is uniform on lo..hi-1.
 * Keep this quirk; it is what makes a d20 roll 1..19.
 */
export function randomNumber(rng: Rng, lo: number, hi: number): number {
  return lo + Math.trunc(rng.next() * (hi - lo))
}
