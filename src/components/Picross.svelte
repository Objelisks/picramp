<script>
  import { onMount } from "svelte";

  export let url;
  export let size;

  let threshold;

  let image;
  let canvas;
  onMount(async () => {
    image = await fetch(url)
      .then((data) => data.blob())
      .then((blob) => createImageBitmap(blob));
  });

  const getRelativeLuminance = (data) => {
    const rgb = [...data]
      .map((x) => x / 255)
      .map((x) =>
        x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
      );

    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const toColor = (data) => ({
    color: `rgb(${data[0]}, ${data[1]}, ${data[2]})`,
    data: data,
    dark: true,
    lum: getRelativeLuminance(data),
  });

  let rows = [];
  let colors = new Map();
  const resetGrid = (canvas) => {
    rows = [];

    // assign colors to each cell
    for (let i = 0; i < size; i++) {
      const col = [];
      for (let j = 0; j < size; j++) {
        const color = toColor(
          canvas.getContext("2d").getImageData(j, i, 1, 1).data
        );
        colors.set(color.color, color);
        let cell = {
          filled: false,
          color: color,
          toggle: () => (cell.filled = !cell.filled),
        };
        col.push(cell);
      }
      rows.push(col);
    }

    // sort colors by luminance and pick a cutoff point
    const sortedColors = [...colors.values()].sort(
      (colorA, colorB) => colorA.lum > colorB.lum
    );
    const midpoint = Math.max(
      0,
      sortedColors.findIndex((x) => getRelativeLuminance(x.data) > threshold)
    );

    for (let i = midpoint; i < sortedColors.length; i++) {
      sortedColors[i].dark = false;
    }
  };

  $: {
    [image, size, threshold];
    if (image) {
      canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.getContext("2d").drawImage(image, 0, 0, size, size);
      resetGrid(canvas);
    }
  }
</script>

<style>
  .grid {
    display: inline-grid;
    user-select: none;
    border: 1px solid black;
  }
  .cell {
    width: 1em;
    height: 1em;
    box-sizing: border-box;
    border: 1px solid black;
  }
</style>

<div
  class:grid={true}
  style="grid-template-columns: repeat({size}, 1em)"
  on:contextmenu={(e) => e.preventDefault()}>
  {#each rows as col}
    {#each col as cell}
      <div
        class="cell"
        class:filled={cell.filled}
        on:mousedown={(e) => {
          if (e.buttons === 1) {
            cell.filled = !cell.filled;
          } else if (e.buttons === 2) {
            cell.filled = false;
          }
        }}
        on:mouseenter={(e) => {
          if (e.buttons === 1) {
            cell.filled = true;
          } else if (e.buttons === 2) {
            cell.filled = false;
          }
        }}
        style="background-color:{cell.color.dark ? '#333' : ''}" />
    {/each}
  {/each}
</div>

<img src={url} alt="hello" width={64} height={64} />
<input
  type="range"
  bind:value={threshold}
  min={0}
  max={1}
  step={0.01} />{threshold}
