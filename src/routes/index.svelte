<script context="module">
  import { PAGE_LIMIT } from "../constants.js";
  export async function preload(page, session) {
    const { query } = page;
    const offset = query?.page?.offset || query?.["page[offset]"];

    return {
      json: await this.fetch(
        `/picramp/rest/pics?sort=-created&page[limit]=${PAGE_LIMIT}${
          offset && `&page[offset]=${offset}`
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
  import { img } from "../shared/useApi.js";

  export let json;
</script>

<style>
  h1,
  h2,
  h3 {
    text-align: center;
    margin: 0 auto;
    font-size: 1.4em;
  }

  h3 {
    font-size: 0.6em;
  }

  h1 {
    font-size: 2.8em;
    text-transform: uppercase;
    font-weight: 700;
  }

  @media (min-width: 480px) {
    h1 {
      font-size: 4em;
    }
    h2 {
      font-size: 2em;
    }
    h3 {
      font-size: 0.8em;
    }
  }
</style>

<svelte:head>
  <title>picramp</title>
</svelte:head>

<h1>welcome to picramp</h1>
<h2>the only source for official camp picrews</h2>
<h3>besides the other official source, friend dot camp</h3>

<br />

<DisplayGrid>
  {#if json?.data}
    {#each json.data as pic (pic.id)}
      <Card
        img={img(pic.attributes.url)}
        link={`/picramp/camper/${pic.relationships.camper?.data?.id}`} />
    {/each}
  {/if}
</DisplayGrid>

<Pager links={json?.links} />
