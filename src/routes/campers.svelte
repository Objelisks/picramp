<script>
  import { onMount } from "svelte";

  import Card from "../components/Card.svelte";
  import DisplayGrid from "../components/DisplayGrid.svelte";
  import { api } from "../shared/useApi.js";

  let json = null;
  onMount(async () => {
    api("/rest/campers?include=displayPic&sort=-created").then(
      (res) => (json = res)
    );
  });
</script>

<h2>all of the campers</h2>

<DisplayGrid>
  {#if json?.data}
    {#each json.data as camper, index (camper.id)}
      <Card
        link={`/camper/${camper.id}`}
        img={json.included?.find((include) => include.id === camper.relationships?.['display-pic']?.data?.id)?.attributes.url}
        label={camper.attributes.name} />
    {/each}
  {/if}
</DisplayGrid>
