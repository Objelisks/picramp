<script>
  import Card from "../components/Card.svelte";
  import DisplayGrid from "../components/DisplayGrid.svelte";
  import { useApi } from "../shared/useApi.js";

  let json = null;
  useApi("/rest/campers?include=displayPic&sort=-created").then(
    (res) => (json = res)
  );
</script>

<h2>all of the campers</h2>

<DisplayGrid>
  {#if json?.data}
    {#each json.data as camper, index (camper.id)}
      <Card
        link={`/camper/${camper.id}`}
        img={json.included?.[index]?.attributes?.url}
        label={camper.attributes.name} />
    {/each}
  {/if}
</DisplayGrid>
