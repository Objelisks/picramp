<script>
  import Card from "../components/Card.svelte";
  import Create from "../components/Create.svelte";
  import DisplayGrid from "../components/DisplayGrid.svelte";

  import { stores } from "@sapper/app";
  const { preloading, page, session } = stores();

  import { api, img } from "../shared/useApi.js";
  import { onMount } from "svelte";

  let json = null;
  onMount(async () => {
    api(`/rest/camper/${$session.camper.id}?include=pics`).then(
      (result) => (json = result)
    );
  });

  const createPic = (pic) => {
    const formData = new FormData();
    formData.append("file", pic);
    return fetch(`${window.location.origin}/upload`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.text())
      .then((res) => {
        // update locally
        json.included = [
          ...(json.included ?? []),
          {
            id: res,
            attributes: {
              url: `/images/${pic.name}`,
            },
          },
        ];
      })
      .catch((err) => console.error(err));
  };

  const deletePic = (pic) => {
    // TODO: clean up old picrews when last pic deleted
    return fetch(`${window.location.origin}/rest/pic/${pic.id}`, {
      method: "DELETE",
    }).then(() => {
      // update locally
      json.included = json.included.filter((jsonPic) => jsonPic.id !== pic.id);
    });
  };

  const selectDisplayPic = (pic) => {
    return fetch(
      `${window.location.origin}/rest/camper/${$session.camper.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/vnd.api+json",
        },
        body: JSON.stringify({
          data: {
            type: "camper",
            id: $session.camper.id,
            attributes: {
              displayPic: pic.id,
            },
          },
        }),
      }
    ).then(() => {
      // update locally
      json.data.relationships["display-pic"] = { data: { id: pic.id } };
    });
  };
</script>

{#if json}
  <p>logged in as: {json.data?.attributes.name}</p>
{/if}

<DisplayGrid small>
  {#if json?.included}
    {#each json.included as pic}
      <Card
        img={img(pic.attributes.url)}
        highlight={json.data.relationships['display-pic']?.data?.id === pic.id}
        on:click={() => selectDisplayPic(pic)}>
        <button
          on:click={(e) => {
            e.stopPropagation();
            deletePic(pic);
          }}>del</button>
      </Card>
    {/each}
  {/if}
  <Create createAction={(pic) => createPic(pic)} />
</DisplayGrid>
