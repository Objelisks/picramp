<script>
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";
  const { page } = stores();

  import Card from "../components/Card.svelte";
  import DisplayGrid from "../components/DisplayGrid.svelte";
  import { api, img } from "../shared/useApi.js";

  const id = page.params.id;

  let json = null;
  onMount(async () => {
    api(`/rest/camper/${id}/relationships/pic?sort=-created`).then(
      (res) => (json = res)
    );
  });
</script>

<h2>camper's pics</h2>

<DisplayGrid>
  {#if json?.data}
    {#each json.data as pic, index (pic.id)}
      <Card
        link={`/picramp/picrew/${pic.relationships.picrew?.data?.id}`}
        img={img(pic.attributes.url)}
        label={'go to picrew'} />
    {/each}
  {/if}
</DisplayGrid>
