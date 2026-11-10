<script lang="ts">
  /** The main window (`reference/01-main.png`): the character on the left, the town on the right. */
  import { openScreen } from '../game/systems/newGame'
  import type { Screen } from '../game/types'
  import { useGame } from './game'

  const { data, run } = useGame()
  const c = $derived(data.character!)

  const strength = $derived(c.strengthPct > 0 ? `${c.strength}/${c.strengthPct}` : `${c.strength}`)

  /** Hit areas over the 150x187 map, in percent; listed bottom to top as in TODO_REMAKE.md */
  const BUILDINGS: { label: string; screen: Screen; x: number; y: number; w: number; h: number }[] =
    [
      { label: 'Magic Item Shop', screen: 'magic-shop', x: 57, y: 71, w: 33, h: 25 },
      { label: 'Inn', screen: 'inn', x: 8, y: 59, w: 25, h: 21 },
      { label: 'Armorer', screen: 'armorer', x: 43, y: 43, w: 31, h: 22 },
      { label: 'Weapon Shop', screen: 'weapon-shop', x: 3, y: 24, w: 28, h: 23 },
      { label: 'Arena', screen: 'opponent', x: 45, y: 1, w: 54, h: 24 },
    ]
</script>

<div class="main">
  <section class="character" aria-label="Character">
    <div class="who">
      <img class="portrait" src="assets/img/portrait-player.png" alt="" />
      <div>
        <div class="name">{c.name}</div>
        <div>Class: Warrior</div>
      </div>
    </div>
    <dl class="box">
      <div class="row">
        <dt>Level:</dt>
        <dd>{c.level}</dd>
      </div>
      <div class="row">
        <dt>XP:</dt>
        <dd>{c.xp}</dd>
      </div>
      <div class="row">
        <dt>Hit Points:</dt>
        <dd>{c.hp}/{c.hpMax}</dd>
      </div>
      <div class="row">
        <dt>AC:</dt>
        <dd>{data.armorClass}</dd>
      </div>
      <div class="row">
        <dt>Gold:</dt>
        <dd>{c.gold}</dd>
      </div>
    </dl>
    <dl class="box">
      <div class="row">
        <dt>Strength</dt>
        <dd>{strength}</dd>
      </div>
      <div class="row">
        <dt>Intelligence</dt>
        <dd>{c.intelligence}</dd>
      </div>
      <div class="row">
        <dt>Wisdom</dt>
        <dd>{c.wisdom}</dd>
      </div>
      <div class="row">
        <dt>Dexterity</dt>
        <dd>{c.dexterity}</dd>
      </div>
      <div class="row">
        <dt>Constitution</dt>
        <dd>{c.constitution}</dd>
      </div>
      <div class="row">
        <dt>Charisma</dt>
        <dd>{c.charisma}</dd>
      </div>
    </dl>
  </section>

  <section class="town box" aria-label="City of Darkwood">
    <h1>City of Darkwood</h1>
    <div class="map">
      <img src="assets/img/town-map.png" alt="Map of the city of Darkwood" />
      {#each BUILDINGS as b (b.screen)}
        <button
          class="building"
          aria-label={b.label}
          style:left="{b.x}%"
          style:top="{b.y}%"
          style:width="{b.w}%"
          style:height="{b.h}%"
          onclick={() => run(openScreen, { screen: b.screen })}
        ></button>
      {/each}
    </div>
    <p>Click on a building</p>
  </section>
</div>

<style>
  .main {
    display: flex;
    gap: 14px;
    padding: 14px;
  }

  .character {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
  }

  .who {
    display: flex;
    gap: 18px;
    align-items: center;
    font-size: 19px;
  }

  .portrait {
    width: 64px;
    height: 64px;
    padding: 4px;
    border: 2px solid var(--bevel-light);
    box-shadow: inset 1px 1px 0 var(--bevel-dark);
  }

  .name {
    margin-bottom: 8px;
    color: var(--value-blue);
    font-size: 22px;
  }

  dl {
    margin: 0;
    font-size: 19px;
    line-height: 34px;
  }

  dd {
    margin: 0;
    color: var(--value-red);
    font-size: 21px;
  }

  .town {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
  }

  h1 {
    width: 100%;
    margin: 0 0 8px;
    border: 1px solid #000;
    background: #fff;
    font-size: 20px;
    text-align: center;
  }

  .map {
    position: relative;
    width: 300px;
    height: 374px;
    border: 2px solid var(--bevel-light);
  }

  .map img {
    display: block;
    width: 100%;
    height: 100%;
  }

  .building {
    position: absolute;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .building:hover,
  .building:focus-visible {
    outline: 3px solid #ff0;
    outline-offset: -3px;
  }

  .town p {
    margin: 8px 0 0;
    font-size: 19px;
  }
</style>
