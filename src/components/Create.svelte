<script>
  import DropZone from "svelte-atoms/DropZone.svelte";
  import Card from "./Card.svelte";

  export let createAction;

  let fileName;
  const onChange = (e) => {
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    fileName = file ? file.name : "";
    console.log(file);
    createAction(file).then(() => {
      fileName = "";
    });
  };
</script>

<Card>
  <DropZone
    title={'drag a pic here or click'}
    buttonTitle={''}
    fileTitle={fileName}
    dropOnPage
    on:drop={onChange}
    on:change={onChange} />
</Card>
