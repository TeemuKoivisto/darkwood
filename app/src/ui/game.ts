/**
 * The game as the components see it: the `GameData` to read and `run` to call a system. `App`
 * provides it once; every component takes it with `useGame()`.
 */
import { getContext, setContext } from 'svelte'

import type { GameData } from '../game/GameData.svelte'
import type { GameCtx, GameSys } from '../game/types'

export type UiCtx = GameCtx & { state: GameData }

export type Game = {
  data: GameData
  ctx: UiCtx
  /** Calls a system; a refusal goes to the alert box. Returns whether it went through. */
  run: <P>(system: GameSys<P>, ...payload: P extends void ? [] : [P]) => boolean
}

const KEY = Symbol('game')

export function makeGame(ctx: UiCtx): Game {
  return {
    data: ctx.state,
    ctx,
    run: (system, ...payload) => {
      const failed = system(ctx, payload[0] as never)
      if (failed) ctx.state.alerts = [...ctx.state.alerts, failed.err]
      return !failed
    },
  }
}

export function provideGame(ctx: UiCtx): Game {
  return setContext(KEY, makeGame(ctx))
}

export function useGame(): Game {
  return getContext<Game>(KEY)
}
