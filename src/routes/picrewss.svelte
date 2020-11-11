<script>
  import { onMount } from "svelte";
  import { api, img } from "../shared/useApi";
  import Picross from "../components/Picross.svelte";
  import Authenticated from "../components/Authenticated.svelte";

  import { stores } from "@sapper/app";
  const { session } = stores();

  let randomPic = null;
  let size = 10;
  let name;

  onMount(async () => {
    if (!$session.authenticated) return;
    restart();
  });

  const restart = () => {
    api(`/rest/pics`).then((res) => {
      // TODO: implement random as a IO hook
      const total = res.meta.count;
      const randomPage = Math.floor(Math.random() * total);
      api(
        `/rest/pics?page[offset]=${randomPage}&page[limit]=1&include=camper`
      ).then((res) => {
        randomPic = res.data?.[0];
        name = res.included?.[0].attributes.name;
      });
    });
  };

  const finished = () => {};
</script>

<Authenticated>
  <h2>picrew picross (picrewss)</h2>

  {#if randomPic}
    <Picross
      url={img(randomPic.attributes.url)}
      {name}
      {size}
      on:complete={finished} />
  {/if}

  size:
  <select bind:value={size}>
    <option>{5}</option>
    <option>{10}</option>
    <option>{15}</option>
    <option>{20}</option>
  </select>

  <button
    on:click={() => {
      restart();
    }}>gimme new one</button>
</Authenticated>
