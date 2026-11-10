<script lang="ts">
  /** The menu bar across the top of the panel: File / Character / Shops. */
  import { newGame, openScreen } from '../game/systems/newGame'
  import type { Screen } from '../game/types'
  import { useGame } from './game'

  const { data, run } = useGame()

  type Item = { label: string; action: () => void }
  type Menu = { title: string; items: Item[] }

  const shop = (label: string, screen: Screen): Item => ({
    label,
    action: () => run(openScreen, { screen }),
  })

  const MENUS: Menu[] = [
    { title: 'File', items: [{ label: 'New Game', action: () => run(newGame, {}) }] },
    { title: 'Character', items: [] },
    {
      title: 'Shops',
      items: [
        shop('Weapon Shop...', 'weapon-shop'),
        shop('Armorer...', 'armorer'),
        shop('Magic Items...', 'magic-shop'),
        shop('Inn...', 'inn'),
      ],
    },
  ]

  let open = $state<string | null>(null)
  // The menus are for the town; a shop or a fight has to be closed first, like the modal original
  const enabled = $derived(data.screen === 'main')

  function choose(item: Item) {
    open = null
    item.action()
  }
</script>

<svelte:window
  onclick={e => {
    if (!(e.target as Element).closest('.menubar')) open = null
  }}
/>

<nav class="menubar" aria-label="Menu bar">
  {#each MENUS as menu (menu.title)}
    <div class="menu">
      <button
        class="menu-title"
        class:open={open === menu.title}
        aria-haspopup="menu"
        aria-expanded={open === menu.title}
        disabled={!enabled}
        onclick={() => (open = open === menu.title ? null : menu.title)}
      >
        {menu.title}
      </button>
      {#if open === menu.title && menu.items.length}
        <div class="items" role="menu" aria-label={menu.title}>
          {#each menu.items as item (item.label)}
            <button role="menuitem" onclick={() => choose(item)}>{item.label}</button>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</nav>

<style>
  .menubar {
    display: flex;
    height: 26px;
    padding: 0 10px;
    border-bottom: 2px solid #000;
    background: #fff;
    font-size: 16px;
  }

  .menu {
    position: relative;
  }

  button {
    padding: 2px 12px;
    border: 0;
    background: transparent;
    white-space: nowrap;
  }

  .menu-title.open {
    background: #000;
    color: #fff;
  }

  .items {
    position: absolute;
    z-index: 10;
    top: 100%;
    left: 0;
    display: flex;
    flex-direction: column;
    min-width: 180px;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #000;
    background: #fff;
  }

  .items button {
    padding: 3px 16px;
    text-align: left;
  }

  .items button:hover {
    background: #000;
    color: #fff;
  }
</style>
