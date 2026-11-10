/**
 * The game's sounds (`notes/rules.md` "Sounds"). Combat plays a round's sounds one after another;
 * the mute switch in the menu bar is remembered in `localStorage`.
 */
import type { Sound } from '../game/types'

export const MUTE_KEY = 'darkwood-muted'

type Playable = { play(): Promise<void> | void; onended: ((ev: Event) => unknown) | null }

export function createSounds(
  makeAudio: (src: string) => Playable = src => new Audio(src),
  storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = globalThis.localStorage
) {
  let muted = storage?.getItem(MUTE_KEY) === 'true'

  return {
    get muted() {
      return muted
    },
    setMuted(value: boolean) {
      muted = value
      storage?.setItem(MUTE_KEY, String(value))
    },
    /** Plays the sounds in order, each after the one before has ended. */
    playAll(sounds: readonly Sound[]) {
      if (muted || !sounds.length) return
      const [first, ...rest] = sounds
      const audio = makeAudio(`assets/snd/${first}.wav`)
      audio.onended = () => this.playAll(rest)
      // A browser that refuses to play (no user gesture yet) just stays quiet
      Promise.resolve(audio.play()).catch(() => {})
    },
  }
}

export const sounds = createSounds()
