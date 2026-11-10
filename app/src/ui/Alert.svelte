<script lang="ts">
  /** The generic message box (`DLOG 512`): the alert text and OK. */
  import { dismissAlert } from '../game/systems/newGame'
  import { useGame } from './game'
  import Modal from './Modal.svelte'

  const { state, run } = useGame()
</script>

<Modal open={state.alert !== null} label="Alert">
  <div class="alert">
    <span class="icon" aria-hidden="true">!</span>
    <p>{state.alert}</p>
  </div>
  <div class="buttons">
    <button class="default" onclick={() => run(dismissAlert)}>OK</button>
  </div>
</Modal>

<style>
  .alert {
    display: flex;
    gap: 20px;
    width: 420px;
    min-height: 80px;
  }

  .icon {
    flex: none;
    width: 34px;
    height: 40px;
    border: 2px solid #000;
    background: #e8b0a0;
    color: #303090;
    font-size: 28px;
    line-height: 40px;
    text-align: center;
  }

  p {
    margin: 4px 0;
    white-space: pre-line;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
  }
</style>
