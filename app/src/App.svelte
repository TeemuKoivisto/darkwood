<script lang="ts">
  /**
   * The game panel: menu bar, the main screen, and the screen `state.screen` names on top of it.
   * See ../../notes/REMAKE_PLAN.md for the screens.
   */
  import type { Component } from 'svelte'

  import { newGame } from './game/systems/newGame'
  import type { Screen } from './game/types'
  import Alert from './ui/Alert.svelte'
  import { provideGame, type UiCtx } from './ui/game'

  let { ctx }: { ctx: UiCtx } = $props()

  // svelte-ignore state_referenced_locally
  const { state, run } = provideGame(ctx)
  // A fresh load with no save (or an unreadable one) starts the fixed character
  if (!state.character) run(newGame, {})

  const SCREENS: Partial<Record<Screen, Component>> = {}
  const Current = $derived(SCREENS[state.screen])
</script>

<div class="panel">
  <main class="game">
    {#if state.screen === 'main' || !Current}
      <p>Darkwood</p>
    {:else}
      <Current />
    {/if}
  </main>
  <Alert />
</div>

<style>
  .panel {
    display: grid;
    place-items: center;
    min-height: 100vh;
  }

  .game {
    position: relative;
    width: 720px;
    height: 560px;
    background: var(--panel);
    border: 2px solid #000;
    box-shadow: 0 0 0 2px #fff;
  }
</style>
