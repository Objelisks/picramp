<script context="module">
  export async function preload(page, session) {
    const { id } = page.params;

    return {
      json: await this.fetch(
        `/picramp/rest/picrews/${id}?sort=-created&include=pics`
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

<h2>{json?.data?.attributes?.name}</h2>
<a
  href={`https://picrew.me/image_maker/${json?.data?.attributes?.url}`}
  target="_blank">picrew.me link</a>

<DisplayGrid>
  {#if json?.included}
    {#each json.included as pic, index (pic.id)}
      <Card
        link={`/picramp/camper/${pic.relationships.camper?.data?.id}`}
        img={img(pic.attributes.url)} />
    {/each}
  {/if}
</DisplayGrid>
