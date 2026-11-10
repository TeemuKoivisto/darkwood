<script lang="ts">
  /** Character > Equipment: weapons (the current one marked), armor, magic items with charges. */
  import { useGame } from './game'
  import Modal from './Modal.svelte'

  let { open, onclose }: { open: boolean; onclose: () => void } = $props()

  const { data } = useGame()
  const c = $derived(data.character)
</script>

<Modal {open} label="Equipment" plain>
  {#if c}
    <div class="equipment">
      <h2 class="dlog-title">Equipment</h2>
      <div class="columns">
        <section aria-label="Weapons">
          <h3>Weapons</h3>
          <ul class="list">
            {#each c.weapons as weapon, i (i)}
              <li>{i === c.currentWeapon ? '✓' : ''}{weapon.name}</li>
            {:else}
              <li>None</li>
            {/each}
          </ul>
          <h3>Armor</h3>
          <ul class="list"><li>{c.armor?.name ?? 'None'}</li></ul>
        </section>
        <section aria-label="Magic Items">
          <h3>Magic Items</h3>
          <ul class="list">
            {#each c.magicItems as item (item.name)}
              <li class="row">
                <span>{item.name}</span>
                {#if item.charges > 0}<span class="blue">{item.charges}</span>{/if}
              </li>
            {:else}
              <li>None</li>
            {/each}
          </ul>
        </section>
      </div>
      <div class="ok"><button class="default" onclick={onclose}>OK</button></div>
    </div>
  {/if}
</Modal>

<style>
  .equipment {
    width: 620px;
  }

  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  h3 {
    margin: 8px 0 4px;
    font-size: 18px;
  }

  .list {
    margin: 0;
    padding: 4px 8px;
    border: 2px solid #000;
    background: #fff;
    list-style: none;
    line-height: 30px;
  }

  .ok {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
</style>
