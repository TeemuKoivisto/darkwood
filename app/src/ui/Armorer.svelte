<script lang="ts">
  /** The Armorer (`reference/04-armorer.png`). */
  import { ARMORS } from '../game/data'
  import { buyArmor } from '../game/systems/armorer'
  import { openScreen } from '../game/systems/newGame'
  import { useGame } from './game'
  import ListBox from './ListBox.svelte'

  const { data, run } = useGame()

  let row = $state(0)
  const selected = $derived(ARMORS[row])
</script>

<section class="armorer" aria-label="Armorer">
  <h2 class="dlog-title">Armorer</h2>
  <div class="columns">
    <div class="column">
      <h3>Armor Available</h3>
      <ListBox
        label="Armor Available"
        items={ARMORS.map(a => a.name)}
        bind:selected={row}
        rows={5}
      />
      <button class="push" onclick={() => run(buyArmor, { name: selected.name })}>Buy</button>
      <div class="box">
        <!-- ASSUMPTION: "Cost (Trade-In)" shows the plain cost; rules.md has no trade-in -->
        <div class="row">
          <span>Cost (Trade-In):</span><span class="blue">{selected.cost}</span>
        </div>
        <div class="row">
          <span>AC Adjust:</span><span class="blue">{selected.ac_modifier}</span>
        </div>
      </div>
    </div>
    <div class="column">
      <div class="box row"><span>Gold:</span><span class="blue">{data.character!.gold}</span></div>
      <div class="box current">
        <span class="blue" aria-label="Current armor">{data.character!.armor?.name ?? 'None'}</span>
        <img src="assets/img/btn-defensive.png" alt="" />
      </div>
      <button class="push default" onclick={() => run(openScreen, { screen: 'main' })}>Done</button>
    </div>
  </div>
</section>

<style>
  .armorer {
    width: 640px;
    padding: 14px;
  }

  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  h3 {
    margin: 0;
    font-size: 18px;
  }

  .column > button:not(.default) {
    border-radius: 0;
  }

  .current {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    height: 140px;
    padding-top: 10px;
    font-size: 19px;
  }

  .current img {
    width: 64px;
    height: 64px;
    border: 2px solid var(--bevel-light);
    box-shadow: inset -2px -2px 0 var(--bevel-dark);
  }

  .default {
    align-self: center;
    margin-top: 24px;
  }
</style>
