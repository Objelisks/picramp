<script context="module">
  import { PAGE_LIMIT } from "../constants.js";
  export async function preload(page, session) {
    if (!session.authenticated) return;

    const { query } = page;
    const offset = query?.page?.offset || query?.["page[offset]"];

    return {
      json: await this.fetch(
        `/picramp/rest/picrews?include=displayPic&sort=-created&page[limit]=${PAGE_LIMIT}${
          (offset && `&page[offset]=${offset}`) ?? ""
        }`
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
  import Card from "../components/Card.svelte";
  import Pager from "../components/Pager.svelte";
  import DisplayGrid from "../components/DisplayGrid.svelte";
  import Authenticated from "../components/Authenticated.svelte";
  import { img } from "../shared/useApi.js";

  export let json;
</script>

<Authenticated>
  <h2>all of the picrews</h2>

  <DisplayGrid>
    {#if json?.data}
      {#each json.data as picrew, index (picrew.id)}
        <Card
          link={`/picramp/picrew/${picrew.id}`}
          img={img(json.included?.find((include) => include.id === picrew.relationships?.['display-pic']?.data?.id)?.attributes.url)}
          label={picrew.attributes.name} />
      {/each}
    {/if}
  </DisplayGrid>

  <Pager links={json?.links ?? {}} />
</Authenticated>
