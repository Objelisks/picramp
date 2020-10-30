<script>
  import { onMount } from "svelte";

  import Card from "../components/Card.svelte";
  import DisplayGrid from "../components/DisplayGrid.svelte";
  import { api, img } from "../shared/useApi.js";

  let json = null;
  onMount(async () => {
    api("/rest/picrews?include=displayPic&sort=-created").then(
      (result) => (json = result)
    );
  });
</script>

<h2>all of the picrews</h2>

<DisplayGrid>
  {#if json?.data}
    {#each json.data as picrew, index (picrew.id)}
      <Card
        link={`/picrew/${picrew.id}`}
        img={img(json.included?.find((include) => include.id === picrew.relationships?.['display-pic']?.data?.id)?.attributes.url)}
        label={picrew.attributes.name} />
    {/each}
  {/if}
</DisplayGrid>
