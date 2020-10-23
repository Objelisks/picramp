<script>
  export let highlight = false;
  export let img = null;
  export let link = null;
  export let label = null;
</script>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .card.highlight {
    border: 1px solid red;
  }

  .card a {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .card img {
    width: 80%;
    margin: 2%;
  }
</style>

<div class:card={true} class:highlight on:click>
  <a href={link}>
    {#if img}<img alt={img} src={`${window.location.origin}${img}`} />{/if}
  </a>
  {#if label}{label}{/if}
  <slot />
</div>
