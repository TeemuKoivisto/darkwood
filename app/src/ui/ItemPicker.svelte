<script lang="ts">
  /** The "Magic Items" picker (`reference/08-magic-items.png`), in combat and from the menu. */
  import { useGame } from './game'
  import ListBox from './ListBox.svelte'
  import Modal from './Modal.svelte'

  let {
    open,
    oncancel,
    onuse,
  }: { open: boolean; oncancel: () => void; onuse: (item: string) => void } = $props()

  const { data } = useGame()
  const items = $derived(data.character?.magicItems ?? [])
  let row = $state(0)
  const chosen = $derived(items[Math.min(row, items.length - 1)])
</script>

<Modal {open} label="Magic Items" plain>
  <div class="picker">
    <h2 class="dlog-title">Magic Items</h2>
    <ListBox label="Magic Items" items={items.map(i => i.name)} bind:selected={row} rows={5} />
    <div class="buttons">
      <button onclick={oncancel}>Cancel</button>
      <button class="default" disabled={!chosen} onclick={() => chosen && onuse(chosen.name)}>
        Use
      </button>
    </div>
  </div>
</Modal>

<style>
  .picker {
    width: 520px;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 30px;
    margin-top: 18px;
  }
</style>
