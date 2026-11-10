import { mount } from 'svelte'

import './app.css'
import App from './App.svelte'
import { GameData } from './game/GameData.svelte'
import { createGameMaps } from './game/maps'
import { autosave, loadSaved } from './game/persist.svelte'
import { mathRng } from './game/rng'

// ASSUMPTION: the maps are created here rather than in App.svelte, so the save can be loaded
// before the first render and autosave can be wired outside the component tree
const state = new GameData(createGameMaps())
const ctx = { state, rng: mathRng }
loadSaved(ctx, localStorage)
autosave(state, localStorage)

const app = mount(App, {
  target: document.getElementById('app')!,
  props: { ctx },
})

export default app
