<script context="module">
  import { PAGE_LIMIT } from "../../constants.js";
  export async function preload(page, session) {
    if (!session.authenticated) return;
    const {
      params: { id },
      query,
    } = page;
    const offset = query?.page?.offset || query?.["page[offset]"];

    return {
      json: await this.fetch(
        `/picramp/rest/picrews/${id}?sort=-created&include=pics&page[limit]=${PAGE_LIMIT}${
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
  import Card from "../../components/Card.svelte";
  import Pager from "../../components/Pager.svelte";
  import DisplayGrid from "../../components/DisplayGrid.svelte";
  import Authenticated from "../../components/Authenticated.svelte";
  import { img } from "../../shared/useApi.js";

  export let json;
</script>

<Authenticated>
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

  <Pager links={json?.links} />
</Authenticated>
