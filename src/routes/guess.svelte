<script>
  import { api, img } from "../shared/useApi";
  import Card from "../components/Card.svelte";
  import { onMount } from "svelte";

  let randomPic = null;
  let actualCamper = null;
  let otherCampers = [];
  let correct = null;
  let points = 0;

  const randomly = () => Math.random() - 0.5;

  const restart = () => {
    randomPic = null;
    actualCamper = null;
    otherCampers = [];
    correct = null;
    api(`/rest/pics`).then((res) => {
      // TODO: implement random as a IO hook
      const total = res.meta.count;
      const randomPage = Math.floor(Math.random() * total);
      api(
        `/rest/pics?page[offset]=${randomPage}&page[limit]=1&include=camper`
      ).then((res) => {
        randomPic = res.data?.[0];
        actualCamper = res.included?.[0];
        api(`/rest/campers`).then((res) => {
          otherCampers = res.data.slice().sort(randomly).slice(0, 4);
        });
      });
    });
  };

  onMount(async () => {
    restart();
  });

  let guessableCampers = [];
  $: {
    guessableCampers = otherCampers.slice();
    if (
      guessableCampers.findIndex(
        (camper) => camper.attributes.name === actualCamper.attributes.name
      ) === -1
    ) {
      guessableCampers[
        Math.floor(Math.random() * guessableCampers.length)
      ] = actualCamper;
    }
  }

  const checkCorrectness = (name) => {
    correct = name === actualCamper.attributes.name;
    if (correct) points = points + 1;
  };
</script>

<style>
  li {
    display: inline-block flow-root list-item;
    width: 10em;
    transition: background-color 200ms;
  }
  li:hover {
    background-color: wheat;
  }

  .points {
    position: absolute;
    right: 2em;
  }
</style>

<h2>guess the camper!</h2>

{#if randomPic && guessableCampers}
  <Card img={img(randomPic.attributes.url)} />
  <p>who is it??</p>
  <span class:points={true}>points: {points}</span>
  <ul>
    {#if correct === null}
      {#each guessableCampers.sort(randomly) as camper}
        <li on:click={() => checkCorrectness(camper.attributes.name)}>
          {camper.attributes.name}
        </li>
      {/each}
    {:else}
      {correct ? 'you got it!' : "that's not it bud"}
      <button on:click={restart}>next</button>
    {/if}
  </ul>
{/if}
