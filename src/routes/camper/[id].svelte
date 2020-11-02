<script context="module">
  export async function preload(page, session) {
    const { id } = page.params;

    return {
      json: await this.fetch(
        `/picramp/rest/campers/${id}?sort=-created&include=pics`
      )
        .then((res) => res.json())
        .then((parsed) => {
          if (parsed?.errors?.length > 0) {
            throw parsed.errors[0];
          }
          return parsed;
        }),
    };
  }
</script>

<script>
  import Card from "../../components/Card.svelte";
  import DisplayGrid from "../../components/DisplayGrid.svelte";
  import { img } from "../../shared/useApi.js";

  export let json;
</script>

<h2>{json?.data?.attributes?.name}'s pics</h2>

<DisplayGrid>
  {#if json?.included}
    {#each json.included as pic, index (pic.id)}
      <Card
        link={`/picramp/picrew/${pic.relationships.picrew?.data?.id}`}
        img={img(pic.attributes.url)} />
    {/each}
  {/if}
</DisplayGrid>
