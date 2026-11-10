<script lang="ts">
  /**
   * The combat dialog (`reference/07-combat-start.png`): both fighters, the four buttons, the
   * last round's messages. After the round's alerts, the end of a fight shows its dialogs in
   * turn: win, level up, game won (`10`, `DITL 281`, `13`) or death (`12`).
   */
  import {
    defensiveRound,
    endFight,
    fightRound,
    surrender,
    useItemRound,
  } from '../game/systems/combat'
  import { newGame } from '../game/systems/newGame'
  import { useGame } from './game'
  import ItemPicker from './ItemPicker.svelte'
  import Modal from './Modal.svelte'
  import { sounds } from './sounds'

  const { data, run } = useGame()
  const c = $derived(data.character!)
  const fight = $derived(data.fight!)
  const creature = $derived(fight.creature)
  const ongoing = $derived(fight.outcome === 'ongoing')

  const playerDamage = $derived(
    data.weapon ? `${data.weapon.dmg_min}-${data.weapon.dmg_max}` : '1-2'
  )

  let picking = $state(false)

  type Ending = 'win' | 'level' | 'won-game' | 'death'
  const endings = $derived.by((): Ending[] => {
    if (fight.outcome === 'died') return ['death']
    if (fight.outcome !== 'won') return []
    return [
      'win',
      ...(fight.levelUp ? (['level'] as const) : []),
      ...(fight.gameWon ? (['won-game'] as const) : []),
    ]
  })
  let seen = $state(0)
  // The round's alerts first, then the dialogs one at a time
  const ending = $derived(data.alert === null ? endings[seen] : undefined)

  function next() {
    seen += 1
    if (seen < endings.length) return
    if (fight.outcome === 'died') {
      run(endFight)
      run(newGame, {})
    } else run(endFight)
  }

  // Each new round plays its sounds; a fight reopened from the save stays quiet
  let heard = data.fight!.round
  $effect(() => {
    if (fight.round === heard) return
    heard = fight.round
    sounds.playAll(fight.sounds)
  })

  // A paid surrender leaves the arena once its alert is closed
  $effect(() => {
    if (fight.outcome === 'surrendered' && data.alert === null) run(endFight)
  })

  function use(item: string) {
    picking = false
    run(useItemRound, { item })
  }

  const pct = (hp: number, max: number) => `${Math.max(0, Math.min(1, hp / max)) * 100}%`
</script>

{#snippet fighter(
  label: string,
  portrait: string,
  name: string,
  hp: number,
  hpMax: number,
  stats: [string, string | number][]
)}
  <section class="fighter" aria-label={label}>
    <div class="who">
      <img class="portrait" src="assets/img/{portrait}" alt="" />
      <span class="red">{name}</span>
    </div>
    <div class="box">
      <div class="hp">
        <span>Hit Points</span>
        <span
          class="bar"
          role="meter"
          aria-label="Hit Points"
          aria-valuenow={hp}
          aria-valuemin={0}
          aria-valuemax={hpMax}
        >
          <span style:width={pct(hp, hpMax)}></span>
        </span>
      </div>
      <div class="hp-number">{hp}</div>
      <dl class="box">
        {#each stats as [label, value] (label)}
          <div class="row">
            <dt>{label}</dt>
            <dd class="blue">{value}</dd>
          </div>
        {/each}
      </dl>
    </div>
  </section>
{/snippet}

<section class="combat" aria-label="Combat">
  <div class="fighters">
    {@render fighter('Player', 'portrait-player.png', c.name, c.hp, c.hpMax, [
      ['Armor Class:', data.armorClass],
      ['Attacks/Round:', c.attacksPerRound],
      ['Damage/Attack:', playerDamage],
    ])}
    {@render fighter(
      'Creature',
      'portrait-creature.png',
      creature.name,
      creature.hp,
      creature.hp_max,
      [
        ['Armor Class:', creature.ac],
        ['Attacks/Round:', creature.attacks],
        ['Damage/Attack:', `${creature.dmg_min}-${creature.dmg_max}`],
      ]
    )}
  </div>
  <div class="bottom">
    <div class="actions">
      <button class="icon" aria-label="Fight" disabled={!ongoing} onclick={() => run(fightRound)}>
        <img src="assets/img/btn-fight.png" alt="" />
      </button>
      <button class="icon" aria-label="Use" disabled={!ongoing} onclick={() => (picking = true)}>
        <img src="assets/img/btn-use.png" alt="" />
      </button>
      <button
        class="icon"
        aria-label="Surrender"
        disabled={!ongoing}
        onclick={() => run(surrender)}
      >
        <img src="assets/img/btn-surrender.png" alt="" />
      </button>
      <button
        class="icon"
        aria-label="Defensive"
        disabled={!ongoing}
        onclick={() => run(defensiveRound)}
      >
        <img src="assets/img/btn-defensive.png" alt="" />
      </button>
    </div>
    <div class="box messages">
      <h3>Messages</h3>
      <div class="lines" role="log" aria-label="Messages">
        {#each fight.messages as line, i (i)}
          <div>{line}</div>
        {/each}
      </div>
    </div>
  </div>
</section>

<ItemPicker open={picking} oncancel={() => (picking = false)} onuse={use} />

<Modal open={ending === 'win'} label="Victory">
  <div class="win">
    <p>
      You have defeated your opponent.<br />
      You have been awarded {fight.reward?.gold} gold pieces and {fight.reward?.xp} experience points.
    </p>
    <div class="win-foot">
      <img src="assets/img/treasure.png" alt="A pile of treasure" />
      <button class="default" onclick={next}>OK</button>
    </div>
  </div>
</Modal>

<Modal open={ending === 'level'} label="Level Advancement">
  <div class="text-dialog">
    <p>
      You advance to level {fight.levelUp?.level}. Your character has gained {fight.levelUp?.gained}
      hit points.
      {#if fight.levelUp?.maxed}<br />Your character has reached the maximum allowed level.{/if}
    </p>
    <div class="ok"><button class="default" onclick={next}>OK</button></div>
  </div>
</Modal>

<Modal open={ending === 'won-game'} label="Congratulations">
  <div class="text-dialog with-picture">
    <img class="portrait" src="assets/img/portrait-player.png" alt="" />
    <p>
      Congratulations.<br />
      You have been awarded the position of Captain of the Guard.<br />
      You have won the game.
    </p>
  </div>
  <div class="ok"><button class="default" onclick={next}>OK</button></div>
</Modal>

<Modal open={ending === 'death'} label="Death">
  <div class="death">
    <img src="assets/img/reaper.png" alt="The reaper" />
    <div>
      <p>
        Sorry...<br />
        You character has been killed fighting in the arena. Better luck next time.
      </p>
      <div class="ok"><button class="default" onclick={next}>OK</button></div>
    </div>
  </div>
</Modal>

<style>
  .combat {
    width: 720px;
    padding: 12px;
  }

  .fighters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .who {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 20px;
  }

  .portrait {
    width: 64px;
    height: 64px;
    border: 2px solid #000;
    box-shadow: 0 0 0 2px var(--bevel-light);
  }

  .hp {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
  }

  .bar {
    width: 170px;
    height: 30px;
    border: 2px solid var(--bevel-light);
    box-shadow: inset 1px 1px 0 var(--bevel-dark);
  }

  .bar span {
    display: block;
    height: 100%;
    background: #6af04a;
  }

  .hp-number {
    margin: 4px 0 6px 190px;
    font-size: 19px;
  }

  dl {
    margin: 0 0 8px;
    line-height: 38px;
  }

  dd {
    margin: 0;
  }

  .bottom {
    display: flex;
    gap: 40px;
    margin-top: 10px;
  }

  .actions {
    display: grid;
    grid-template-columns: repeat(2, 68px);
    gap: 12px 24px;
    align-content: start;
    padding: 6px 0 0 6px;
  }

  .icon {
    width: 68px;
    height: 68px;
    padding: 0;
    border: 2px solid var(--bevel-light);
    box-shadow: inset -2px -2px 0 var(--bevel-dark);
    background: var(--panel);
  }

  .icon:active:not(:disabled) {
    box-shadow: inset 2px 2px 0 var(--bevel-dark);
  }

  .icon:disabled img {
    opacity: 0.5;
  }

  .icon img {
    display: block;
    width: 64px;
    height: 64px;
  }

  .messages {
    flex: 1;
  }

  h3 {
    margin: 0 0 4px;
    font-size: 18px;
  }

  .lines {
    height: 112px;
    padding: 2px 4px;
    border: 2px solid var(--bevel-light);
    box-shadow: inset 1px 1px 0 var(--bevel-dark);
    font-size: 18px;
    line-height: 34px;
  }

  .win {
    width: 640px;
  }

  .win p,
  .text-dialog p,
  .death p {
    margin: 0 0 12px;
    line-height: 1.6;
  }

  .win-foot {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .win-foot img {
    width: 508px;
    height: 208px;
  }

  .text-dialog {
    width: 560px;
  }

  .with-picture {
    display: flex;
    gap: 24px;
  }

  .with-picture .portrait {
    flex: none;
    border: 0;
    box-shadow: none;
  }

  .ok {
    display: flex;
    justify-content: flex-end;
  }

  .death {
    display: flex;
    gap: 30px;
    width: 600px;
  }

  .death img {
    flex: none;
    width: 245px;
    height: 335px;
  }

  .death > div {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px 0 10px;
  }
</style>
