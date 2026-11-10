<script lang="ts">
  /** "Please Select an Opponent" (`reference/06-opponent.png`): every creature, Cancel / Fight. */
  import { CREATURES } from '../game/data'
  import { surrenderPenalty } from '../game/rules'
  import { startFight } from '../game/systems/combat'
  import { openScreen } from '../game/systems/newGame'
  import { useGame } from './game'
  import ListBox from './ListBox.svelte'

  const { run } = useGame()

  let row = $state(0)
  const creature = $derived(CREATURES[row])
  const stats = $derived([
    ['Hit Points:', creature.hp_max],
    ['Armor Class:', creature.ac],
    ['Attacks/Round:', creature.attacks],
    ['Damage/Attack:', `${creature.dmg_min}-${creature.dmg_max}`],
    ['XP Value:', creature.xp],
    ['Award Money:', creature.gold],
    ['Surrender Penalty:', surrenderPenalty(creature)],
    ['Magic Weapon Req:', creature.needs_magic_weapon ? `+${creature.needs_magic_weapon}` : 'No'],
  ])
</script>

<section class="picker" aria-label="Please Select an Opponent">
  <h2 class="dlog-title">Please Select an Opponent</h2>
  <div class="columns">
    <div>
      <h3>Possible Opponents</h3>
      <ListBox
        label="Possible Opponents"
        items={CREATURES.map(c => c.name)}
        bind:selected={row}
        rows={8}
      />
    </div>
    <dl class="box" aria-label="Opponent">
      {#each stats as [label, value] (label)}
        <div class="row">
          <dt>{label}</dt>
          <dd class="blue">{value}</dd>
        </div>
      {/each}
    </dl>
  </div>
  <div class="buttons">
    <button class="push" onclick={() => run(openScreen, { screen: 'main' })}>Cancel</button>
    <button class="push default" onclick={() => run(startFight, { creature: creature.name })}>
      Fight
    </button>
  </div>
</section>

<style>
  .picker {
    width: 660px;
    padding: 14px;
  }

  h2 {
    color: #c82828;
    text-align: center;
  }

  h3 {
    margin: 0 0 4px;
    font-size: 18px;
  }

  .columns {
    display: grid;
    grid-template-columns: 290px 1fr;
    gap: 14px;
  }

  dl {
    align-self: end;
    margin: 0;
    font-size: 18px;
    line-height: 31px;
  }

  dd {
    margin: 0;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 30px;
    margin-top: 18px;
  }
</style>
