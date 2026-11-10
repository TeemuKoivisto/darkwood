<script lang="ts">
  /** The Inn (`reference/03-inn.png`). */
  import { stayOneNight, stayUntilHealed } from '../game/systems/inn'
  import { openScreen } from '../game/systems/newGame'
  import { useGame } from './game'

  const { run } = useGame()
</script>

<!-- A stay closes the inn (the systems set the screen); a refusal keeps it open; Cancel leaves -->
<section class="inn" aria-label="Inn">
  <h2 class="dlog-title">Inn</h2>
  <p>For each night you stay you<br />are healed 1 hit point.</p>
  <div class="buttons">
    <button class="push" onclick={() => run(openScreen, { screen: 'main' })}>Cancel</button>
    <button class="push" onclick={() => run(stayOneNight)}>Stay 1 Night</button>
    <button class="push default" onclick={() => run(stayUntilHealed)}>Stay Until Healed</button>
  </div>
</section>

<style>
  .inn {
    width: 600px;
    padding: 14px;
  }

  h2 {
    text-align: center;
  }

  p {
    margin: 0 0 30px 90px;
    font-size: 18px;
    line-height: 1.6;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    padding: 0 6px 6px;
  }
</style>
