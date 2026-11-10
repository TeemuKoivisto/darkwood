<script lang="ts">
  /** The Magic Item Shop (`reference/02-magic-shop.png`). */
  import { MAGIC_ITEMS } from '../game/data'
  import { sellPrice } from '../game/rules'
  import { buyMagicItem, sellMagicItem } from '../game/systems/magicShop'
  import { openScreen } from '../game/systems/newGame'
  import { useGame } from './game'
  import ListBox from './ListBox.svelte'

  const { data, run } = useGame()
  const owned = $derived(data.character!.magicItems)

  let shopRow = $state(0)
  let ownedRow = $state(0)
  const forSale = $derived(MAGIC_ITEMS[shopRow])
  const mine = $derived(owned[ownedRow])

  // Keep a row selected in the owned list as it shrinks and grows
  $effect(() => {
    if (ownedRow >= owned.length) ownedRow = owned.length - 1
    if (ownedRow < 0 && owned.length) ownedRow = 0
  })
</script>

<section class="shop" aria-label="Magic Item Shop">
  <h2 class="dlog-title">Magic Item Shop</h2>
  <div class="columns">
    <div class="column">
      <h3>Items Available</h3>
      <ListBox
        label="Items Available"
        items={MAGIC_ITEMS.map(i => i.name)}
        bind:selected={shopRow}
      />
      <div class="box row"><span>Cost:</span><span class="blue">{forSale?.cost ?? ''}</span></div>
      <button class="push" onclick={() => run(buyMagicItem, { name: forSale.name })}>Buy</button>
    </div>
    <div class="column">
      <h3>Character Items</h3>
      <ListBox label="Character Items" items={owned.map(i => i.name)} bind:selected={ownedRow} />
      <div class="box row">
        <span>Sell</span><span class="blue">{mine ? sellPrice(mine.cost) : ''}</span>
      </div>
      <button
        class="push"
        disabled={!mine}
        onclick={() => mine && run(sellMagicItem, { name: mine.name })}>Sell</button
      >
    </div>
  </div>
  <div class="footer">
    <div class="gold">Gold: <span class="blue">{data.character!.gold}</span></div>
    <button class="push default" onclick={() => run(openScreen, { screen: 'main' })}>Done</button>
  </div>
</section>

<style>
  .shop {
    width: 680px;
    padding: 14px;
  }

  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
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

  .column button {
    align-self: center;
    width: 80%;
    border-radius: 0;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 18px;
  }

  .gold span {
    margin-left: 40px;
  }
</style>
