<script>
  import { onMount } from "svelte";
  import { api, img } from "../shared/useApi";
  import Picross from "../components/Picross.svelte";

  let randomPic = null;
  let size = 10;

  onMount(async () => {
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
      });
    });
  };

  const finished = () => {};
</script>

<h2>picrew picross (picrewss)</h2>

{#if randomPic}
  <!-- <Picross url={'/images/230257_Ec2Adwcv.png'} {size} on:complete={finished} /> -->
  <Picross url={img(randomPic.attributes.url)} {size} on:complete={finished} />
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
