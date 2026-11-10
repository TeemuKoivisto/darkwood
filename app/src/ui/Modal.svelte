<script lang="ts">
  /**
   * A native modal `<dialog>` that is open while `open` is true. Escape does nothing: every box
   * in the game is closed with its own buttons.
   */
  import type { Snippet } from 'svelte'

  let {
    open,
    label,
    children,
    plain = false,
  }: { open: boolean; label: string; children: Snippet; plain?: boolean } = $props()

  let dialog: HTMLDialogElement

  $effect(() => {
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  })
</script>

<dialog bind:this={dialog} aria-label={label} class:plain oncancel={e => e.preventDefault()}>
  {#if open}
    {@render children()}
  {/if}
</dialog>

<style>
  dialog {
    padding: 16px 20px;
    border: 2px solid #000;
    outline: 2px solid #fff;
    outline-offset: -6px;
    box-shadow: 4px 4px 0 rgb(0 0 0 / 50%);
    background: #fff;
    color: #000;
    font: inherit;
  }

  dialog.plain {
    outline: 3px double #000;
    outline-offset: -8px;
    background: var(--panel);
  }

  dialog::backdrop {
    background: transparent;
  }
</style>
