<script lang="ts">
  /** A Mac list: white, single selection, scrolls when longer than `rows`. */
  let {
    label,
    items,
    selected = $bindable(-1),
    rows = 6,
    marked = -1,
    onselect,
  }: {
    label: string
    items: string[]
    /** Index of the highlighted row, -1 for none */
    selected?: number
    rows?: number
    /** A row shown with a check mark (the current weapon) */
    marked?: number
    onselect?: (index: number) => void
  } = $props()

  let list: HTMLElement

  function select(index: number) {
    if (index < 0 || index >= items.length) return
    selected = index
    onselect?.(index)
    list.children[index]?.scrollIntoView({ block: 'nearest' })
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') select(selected + 1)
    else if (e.key === 'ArrowUp') select(selected - 1)
    else return
    e.preventDefault()
  }
</script>

<div
  class="list"
  role="listbox"
  aria-label={label}
  tabindex="0"
  style:height="{rows * 32 + 4}px"
  bind:this={list}
  {onkeydown}
>
  {#each items as item, i (i)}
    <div
      role="option"
      aria-selected={i === selected}
      class:selected={i === selected}
      tabindex="-1"
      onclick={() => select(i)}
      onkeydown={() => {}}
    >
      {#if i === marked}<span class="mark" aria-label="current">✓</span>{/if}{item}
    </div>
  {/each}
</div>

<style>
  .list {
    overflow-y: scroll;
    border: 2px solid #000;
    background: #fff;
    font-size: 18px;
  }

  .list:focus-visible {
    outline: 2px dotted #000;
    outline-offset: 2px;
  }

  [role='option'] {
    height: 32px;
    padding: 0 8px;
    line-height: 32px;
    white-space: nowrap;
    cursor: default;
    user-select: none;
  }

  .selected {
    background: #000;
    color: #fff;
  }

  .mark {
    margin-left: -4px;
    margin-right: 4px;
  }
</style>
