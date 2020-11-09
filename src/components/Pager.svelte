<script>
  import { goto } from "@sapper/app";
  export let links;
  const updatePage = (link) => {
    const offset = /page%5Boffset%5D=(\d+)/.exec(link);
    if (offset && offset[1]) {
      const url = new URL(window.location);
      url.searchParams.set("page[offset]", offset[1]);
      return goto(url);
    }
  };
</script>

<button
  disabled={!links.first}
  on:click={() => updatePage(links.first)}>first</button>
<button
  disabled={!links.prev}
  on:click={() => updatePage(links.prev)}>prev</button>
<button
  disabled={!links.next}
  on:click={() => updatePage(links.next)}>next</button>
<button
  disabled={!links.last}
  on:click={() => updatePage(links.last)}>last</button>
