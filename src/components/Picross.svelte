<script>
  import RgbQuant from "rgbquant";
  import { Creator } from "../nonogram/src/index.js";
  import confetti from "canvas-confetti";
  import { onMount } from "svelte";

  console.log(confetti);

  export let url;
  export let size;

  let palette;
  let puzzle;
  let solved = false;

  let image;
  let canvas;
  let trueColors;

  const loadImage = async () => {
    image = await fetch(url)
      .then((data) => data.blob())
      .then((blob) => createImageBitmap(blob));
  };

  // load image
  $: {
    [url];
    loadImage();
  }

  const rgb = (col) => `rgb(${col[0]}, ${col[1]}, ${col[2]})`;
  const matchColor = (c1, c2) =>
    c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2];

  let dataGrid = [];
  let nonoGrid = [];

  const setGridFromCanvas = (context) => {
    dataGrid = [];
    nonoGrid = [];

    // assign colors to each cell
    for (let y = 0; y < size; y++) {
      const dataCol = [];
      const nonoCol = [];
      for (let x = 0; x < size; x++) {
        const data = context.getImageData(x, y, 1, 1).data;
        const color = rgb(data);
        let cell = {
          filled: false,
          color: color,
        };
        dataCol.push(cell);
        nonoCol.push(matchColor(data, palette[0]) ? 0 : 1);
      }
      dataGrid.push(dataCol);
      nonoGrid.push(nonoCol);
    }
  };

  const fillRandom = (context) => {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    context.fillStyle = rgb(palette[1]);
    context.fillRect(x, y, 1, 1);
  };

  const initialize = () => {
    canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx1 = canvas.getContext("2d");
    ctx1.fillStyle = "rgb(0, 0, 0)";
    ctx1.fillRect(0, 0, image.width, image.height);
    ctx1.drawImage(image, 0, 0);

    let canvas2 = document.createElement("canvas");
    canvas2.width = size;
    canvas2.height = size;
    trueColors = canvas2.getContext("2d");
    trueColors.fillStyle = "rgb(0, 0, 0)";
    trueColors.fillRect(0, 0, image.width, image.height);
    trueColors.drawImage(image, 0, 0, size, size);

    const quantOpts = {
      colors: 2,
      minHueCols: 512,
    };
    let q = new RgbQuant(quantOpts);
    q.sample(canvas);
    palette = q.palette(true, true);
    const result = q.reduce(canvas2);

    let canvas3 = document.createElement("canvas");
    canvas3.width = size;
    canvas3.height = size;
    const ctx3 = canvas3.getContext("2d");

    const imageData = ctx3.createImageData(size, size);
    imageData.data.set(result);
    ctx3.putImageData(imageData, 0, 0);

    setGridFromCanvas(ctx3);

    const creator = new Creator();

    let puzzleValid = false;
    while (!puzzleValid) {
      puzzleValid = creator.createFromGrid(nonoGrid);
      if (puzzleValid) {
        console.log("puzzle valid");
        puzzle = puzzleValid;
      } else {
        console.log("invalid puzzle, retrying...");
        for (let i = 0; i < 5; i++) {
          fillRandom(ctx3);
        }
        setGridFromCanvas(ctx3);
      }
    }
  };

  const checkSolution = () => {
    solved = puzzle.checkUserSolution();
  };

  const getCell = (row, col) => {
    return puzzle.cells[col * size + row];
  };

  $: {
    [image, size];
    if (image) {
      initialize();
    }
  }

  const randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  $: {
    [puzzle];
    if (puzzle) {
      checkSolution();
    }
  }

  let confettiInterval = null;
  $: {
    [solved];

    if (solved) {
      if (!confettiInterval) {
        confettiInterval = setInterval(
          () =>
            confetti({
              angle: randomInRange(55, 125),
              spread: randomInRange(50, 70),
              particleCount: randomInRange(50, 100),
              origin: { x: randomInRange(0.3, 0.7), y: randomInRange(0.4, 1) },
            }),
          300
        );
      }
    } else {
      clearInterval(confettiInterval);
      confettiInterval = null;
    }
  }

  onMount(() => {
    return () => {
      clearInterval(confettiInterval);
      confettiInterval = null;
    };
  });
</script>

<style>
  .grid {
    display: grid;
    user-select: none;
  }
  .cell {
    width: 2em;
    height: 2em;
    box-sizing: border-box;
    border: 1px solid black;
  }
  .hint {
    box-sizing: border-box;
    font-size: 1em;
    line-height: 1.5em;
    align-items: center;
    justify-content: flex-end;
    display: flex;
    gap: 0.5em;
  }
  .hint.horz {
    padding-right: 0.5em;
  }
  .hint.vert {
    flex-direction: column;
    padding-bottom: 0.5em;
  }
</style>

{#if puzzle}
  <div
    class:grid={true}
    style="grid-template-columns: 2em repeat({size}, 2em)"
    on:contextmenu={(e) => e.preventDefault()}>
    <div />
    {#each puzzle.columnHints as columnHint}
      <div class="hint vert">
        {#each columnHint as hintValue}
          <span class="hintvalue vert">{hintValue}</span>
        {/each}
      </div>
    {/each}
    {#each puzzle.grid as col, colIndex}
      <div class="hint horz">
        {#each puzzle.rowHints[colIndex] as hintValue}
          <span class="hintvalue horz">{hintValue}</span>
        {/each}
      </div>
      <!-- TODO fix drawing -->
      {#each col as _cell, rowIndex}
        <div
          class="cell"
          on:mousedown={(e) => {
            const cell = getCell(rowIndex, colIndex);
            if (e.buttons === 1) {
              cell.userSolution = cell.userSolution ? 0 : 1;
              puzzle = puzzle;
            } else if (e.buttons === 2) {
              cell.userSolution = 0;
              puzzle = puzzle;
            }
          }}
          on:mouseenter={(e) => {
            const cell = getCell(rowIndex, colIndex);
            if (e.buttons === 1) {
              cell.userSolution = 1;
              puzzle = puzzle;
            } else if (e.buttons === 2) {
              cell.userSolution = 0;
              puzzle = puzzle;
            }
          }}
          style="background-color:{solved ? rgb(trueColors.getImageData(rowIndex, colIndex, 1, 1).data) : puzzle.cells[colIndex * size + rowIndex].userSolution ? rgb(palette[1]) : rgb(palette[0])}" />
        <!-- needs that direct access to puzzle to trigger refresh -->
      {/each}
    {/each}
  </div>
{/if}

{#if solved}<img src={url} alt="the solution" width={size * 32} />{/if}

<br />

<button
  on:click={() => {
    puzzle.cells.forEach((cell) => (cell.userSolution = 0));
    puzzle = puzzle;
  }}>reset</button>

<button
  on:click={() => {
    puzzle.cells.forEach((cell) => (cell.userSolution = cell.solution));
    puzzle = puzzle;
  }}>solve</button>
