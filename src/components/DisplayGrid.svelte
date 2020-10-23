<script>
  export let small = false;
</script>

<style>
  .display-grid {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: repeat(auto-fill, 16em);
    grid-auto-rows: 16em;
    gap: 1em;
  }

  .display-grid.small {
    grid-template-columns: repeat(auto-fill, 8em);
    grid-auto-rows: 8em;
    gap: 0.5em;
  }
</style>

<div class="display-grid" class:small>
  <slot />
</div>
