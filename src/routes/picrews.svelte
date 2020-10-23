<script>
  import Card from "../components/Card.svelte";
  import DisplayGrid from "../components/DisplayGrid.svelte";
  import { useApi } from "../shared/useApi.js";

  let json = null;
  useApi("/rest/picrews?include=displayPic&sort=-created").then(
    (result) => (json = result)
  );
</script>

<h2>all of the picrews</h2>

<DisplayGrid>
  {#if json?.data}
    {#each json.data as picrew, index (picrew.id)}
      <Card
        link={`/picrew/${picrew.id}`}
        img={json.included?.[index]?.attributes?.url}
        label={picrew.attributes.name} />
    {/each}
  {/if}
</DisplayGrid>
