<script>
  import Card from "../components/Card.svelte";
  import Create from "../components/Create.svelte";
  import DisplayGrid from "../components/DisplayGrid.svelte";

  import { stores } from "@sapper/app";
  const { preloading, page, session } = stores();

  import { useApi } from "../shared/useApi.js";

  let json = null;
  useApi(`/rest/camper/${$session.camper.id}?include=pics`).then(
    (result) => (json = result)
  );

  const createPic = (pic) => {
    const formData = new FormData();
    formData.append("file", pic);
    return fetch(`${window.location.origin}/upload`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.text())
      .then((res) => {
        json.included = [
          ...json.included,
          {
            id: res,
            attributes: {
              url: `/images/${pic.name}`,
            },
          },
        ];
      })
      .catch((err) => console.error(error));
  };
  const deletePic = (pic) => {
    return fetch(`${window.location.origin}/rest/pic/${pic.id}`, {
      method: "DELETE",
    }).then(() => {
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
      json.data.relationships["display-pic"] = { data: { id: pic.id } };
    });
  };
</script>

<DisplayGrid small>
  {#if json?.included}
    {#each json.included as pic}
      <Card
        img={pic.attributes.url}
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
