<script lang="ts">
  /**
   * The game panel: menu bar, the main screen, and the screen `data.screen` names on top of it.
   * See ../../notes/REMAKE_PLAN.md for the screens.
   */
  import type { Component } from 'svelte'

  import { newGame } from './game/systems/newGame'
  import type { Screen } from './game/types'
  import Alert from './ui/Alert.svelte'
  import { provideGame, type UiCtx } from './ui/game'
  import Armorer from './ui/Armorer.svelte'
  import Inn from './ui/Inn.svelte'
  import MagicShop from './ui/MagicShop.svelte'
  import MainScreen from './ui/MainScreen.svelte'
  import MenuBar from './ui/MenuBar.svelte'

  let { ctx }: { ctx: UiCtx } = $props()

  // svelte-ignore state_referenced_locally
  const { data, run } = provideGame(ctx)
  // A fresh load with no save (or an unreadable one) starts the fixed character
  if (!data.character) run(newGame, {})

  const SCREENS: Partial<Record<Screen, Component>> = {
    'magic-shop': MagicShop,
    inn: Inn,
    armorer: Armorer,
  }
  const Current = $derived(SCREENS[data.screen])
</script>

<div class="page">
  <div class="game">
    <MenuBar />
    <div class="window">
      <div class="titlebar"><span>Darkwood</span></div>
      <main>
        {#if data.character}
          <MainScreen />
        {/if}
      </main>
    </div>
    {#if Current && data.character}
      <!-- The shops and the arena are modal windows over the town, as in the original -->
      <div class="overlay">
        <div class="screen"><Current /></div>
      </div>
    {/if}
  </div>
  <Alert />
</div>

<style>
  .page {
    display: grid;
    place-items: center;
    min-height: 100vh;
  }

  .game {
    position: relative;
    width: 740px;
    border: 2px solid #000;
    background: var(--panel);
  }

  .window {
    margin: 8px;
    border: 2px solid #000;
    box-shadow: 0 0 0 2px #fff;
  }

  .titlebar {
    height: 22px;
    border-bottom: 2px solid #000;
    background: repeating-linear-gradient(#fff 0 2px, #000 2px 3px) content-box #fff;
    padding: 4px 6px;
    font-size: 18px;
    line-height: 14px;
    text-align: center;
  }

  .titlebar span {
    padding: 0 10px;
    background: #fff;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
  }

  .screen {
    border: 2px solid #000;
    outline: 2px solid #fff;
    box-shadow:
      0 0 0 4px #000,
      6px 6px 0 4px rgb(0 0 0 / 40%);
    background: var(--panel);
  }
</style>
