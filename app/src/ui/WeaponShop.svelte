<script lang="ts">
  /** The Weapon Shop (`reference/05-weapon-shop.png`). Clicking an owned weapon wields it. */
  import { WEAPONS } from '../game/data'
  import { sellPrice } from '../game/rules'
  import { openScreen } from '../game/systems/newGame'
  import { buyWeapon, sellWeapon, setCurrentWeapon } from '../game/systems/weaponShop'
  import { useGame } from './game'
  import ListBox from './ListBox.svelte'

  const { data, run } = useGame()
  const c = $derived(data.character!)

  let shopRow = $state(0)
  let ownedRow = $state(data.character!.currentWeapon)
  const forSale = $derived(WEAPONS[shopRow])
  const mine = $derived(c.weapons[ownedRow])

  // After a sale the highlight follows the current weapon
  $effect(() => {
    if (ownedRow >= c.weapons.length) ownedRow = c.currentWeapon
  })

  function sell() {
    if (run(sellWeapon, { index: ownedRow })) ownedRow = data.character!.currentWeapon
  }
</script>

<section class="shop" aria-label="Weapon Shop">
  <h2 class="dlog-title">Weapon Shop</h2>
  <div class="columns">
    <div class="column">
      <h3>Weapons Available</h3>
      <ListBox
        label="Weapons Available"
        items={WEAPONS.map(w => w.name)}
        bind:selected={shopRow}
        rows={5}
      />
      <button class="push" onclick={() => run(buyWeapon, { name: forSale.name })}>Buy</button>
      <div class="box">
        <div class="row"><span>Cost:</span><span class="blue">{forSale.cost}</span></div>
        <div class="row"><span>Speed</span><span class="blue">{forSale.speed}</span></div>
        <div class="row">
          <span>Damage:</span><span class="blue">{forSale.dmg_min}-{forSale.dmg_max}</span>
        </div>
      </div>
    </div>
    <div class="column">
      <h3>Character Weapons</h3>
      <ListBox
        label="Character Weapons"
        items={c.weapons.map(w => w.name)}
        bind:selected={ownedRow}
        marked={c.currentWeapon}
        rows={5}
        onselect={index => run(setCurrentWeapon, { index })}
      />
      <button class="push" disabled={!mine} onclick={sell}>Sell</button>
      <div class="box row">
        <span>Sell For:</span><span class="blue">{mine ? sellPrice(mine.cost) : ''}</span>
      </div>
      <button class="push default" onclick={() => run(openScreen, { screen: 'main' })}>Done</button>
    </div>
  </div>
  <div class="gold">Gold: <span class="blue">{c.gold}</span></div>
</section>

<style>
  .shop {
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

  .default {
    align-self: center;
    margin-top: 16px;
  }

  .gold {
    margin-top: 6px;
  }

  .gold span {
    margin-left: 40px;
  }
</style>
