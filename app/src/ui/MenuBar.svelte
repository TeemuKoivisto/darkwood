<script lang="ts">
  /**
   * The menu bar across the top of the panel: File (New Game, Open, Save), Character (Equipment,
   * Magic Items), Shops (the four shops, as on the map). Autosave runs whatever File does.
   */
  import { useMagicItem } from '../game/systems/items'
  import { loadGame, newGame, openScreen } from '../game/systems/newGame'
  import { serializeMaps } from '../game/save'
  import type { Screen } from '../game/types'
  import Equipment from './Equipment.svelte'
  import { useGame } from './game'
  import ItemPicker from './ItemPicker.svelte'
  import Modal from './Modal.svelte'
  import { sounds } from './sounds'

  const { data, run } = useGame()

  type Item = { label: string; action: () => void }
  type Menu = { title: string; items: Item[] }

  let dialog = $state<'new-game' | 'equipment' | 'items' | null>(null)
  let fileInput: HTMLInputElement

  const shop = (label: string, screen: Screen): Item => ({
    label,
    action: () => run(openScreen, { screen }),
  })

  const MENUS: Menu[] = [
    {
      title: 'File',
      items: [
        { label: 'New Game', action: () => (dialog = 'new-game') },
        { label: 'Open...', action: () => fileInput.click() },
        { label: 'Save...', action: save },
      ],
    },
    {
      title: 'Character',
      items: [
        { label: 'Equipment...', action: () => (dialog = 'equipment') },
        { label: 'Magic Items...', action: () => (dialog = 'items') },
      ],
    },
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

  let muted = $state(sounds.muted)

  function toggleSound() {
    muted = !muted
    sounds.setMuted(muted)
  }

  let open = $state<string | null>(null)
  // The menus are for the town; a shop or a fight has to be closed first, like the modal original
  const enabled = $derived(data.screen === 'main')

  function choose(item: Item) {
    open = null
    item.action()
  }

  function save() {
    const json = serializeMaps(data.maps, data.characterId)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    link.download = `${data.character?.name ?? 'Character'}.darkwood.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  async function load() {
    const file = fileInput.files?.[0]
    fileInput.value = ''
    if (file) run(loadGame, { json: await file.text() })
  }

  function useItem(item: string) {
    dialog = null
    run(useMagicItem, { item })
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
      {#if open === menu.title}
        <div class="items" role="menu" aria-label={menu.title}>
          {#each menu.items as item (item.label)}
            <button role="menuitem" onclick={() => choose(item)}>{item.label}</button>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
  <button class="sound" aria-pressed={!muted} onclick={toggleSound}>
    {muted ? 'Sound Off' : 'Sound On'}
  </button>
  <input
    bind:this={fileInput}
    type="file"
    accept=".json,application/json"
    aria-label="Open a character file"
    hidden
    onchange={load}
  />
</nav>

<Modal open={dialog === 'new-game'} label="New Game">
  <div class="confirm">
    <p>Are you sure you want to abandon this character for another?</p>
    <div class="buttons">
      <button onclick={() => (dialog = null)}>Cancel</button>
      <button
        class="default"
        onclick={() => {
          dialog = null
          run(newGame, {})
        }}>OK</button
      >
    </div>
  </div>
</Modal>

<Equipment open={dialog === 'equipment'} onclose={() => (dialog = null)} />
<ItemPicker open={dialog === 'items'} oncancel={() => (dialog = null)} onuse={useItem} />

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

  .menu button {
    padding: 2px 12px;
    border: 0;
    background: transparent;
    white-space: nowrap;
  }

  .sound {
    margin-left: auto;
    padding: 2px 12px;
    border: 0;
    background: transparent;
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

  .confirm {
    width: 420px;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 24px;
  }
</style>
