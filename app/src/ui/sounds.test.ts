/** The sound player: in order, one after another, and silent when muted. */
import { createSounds, MUTE_KEY } from './sounds'

function fakes() {
  const played: { src: string; onended: (() => void) | null }[] = []
  const makeAudio = (src: string) => {
    const audio = { src, onended: null as (() => void) | null, play: () => {} }
    played.push(audio)
    return audio
  }
  const store = new Map<string, string>()
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v)
    },
  }
  return { played, makeAudio, storage, store }
}

describe('sounds', () => {
  it('plays a round in order, each after the last ended', () => {
    const f = fakes()
    const s = createSounds(f.makeAudio, f.storage)

    s.playAll(['hit-on-creature', 'hit-on-player'])
    expect(f.played.map(a => a.src)).toEqual(['assets/snd/hit-on-creature.wav'])

    f.played[0].onended!()
    expect(f.played.map(a => a.src)).toEqual([
      'assets/snd/hit-on-creature.wav',
      'assets/snd/hit-on-player.wav',
    ])
  })

  it('is silent when muted, and remembers it', () => {
    const f = fakes()
    createSounds(f.makeAudio, f.storage).setMuted(true)
    expect(f.store.get(MUTE_KEY)).toBe('true')

    const again = createSounds(f.makeAudio, f.storage)
    expect(again.muted).toBe(true)
    again.playAll(['oouch'])
    expect(f.played).toEqual([])
  })
})
