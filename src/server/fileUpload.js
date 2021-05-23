const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");

import { picrewApi } from "./picrewApi.js";

const app = express();
app.use(
  fileUpload({
    abortOnLimit: true,
    limits: {
      fileSize: 1024 * 1024 * 1,
      files: 1,
    },
  })
);

// fetch the picrew name from the web site title
const PICREW = `https://picrew.me/image_maker`;
const picrewName = (picrewUrl) =>
  fetch(`${PICREW}/${picrewUrl}`)
    .then((response) => response.text())
    .then((page) =>
      page.match(
        /<title>(\p{Any}*?)｜Picrew/u
      )
    )
    .then((matches) => matches?.[1] ?? "picrew");

export const findOrCreatePicrew = (picrewUrl, picId, out) => 
  picrewApi.find("picrew", undefined, {
    match: {
      url: picrewUrl,
    },
  })
  .then(async (res) => {
    if (res.payload.count > 0) {
      // found an existing picrew
      return res.payload.records[0];
    } else {
      // create a new picrew
      const name = await picrewName(picrewUrl);
      if (!name || name === "") {
        return Promise.resolve(null);
      } else {
        return picrewApi
          .create("picrew", [
            {
              name,
              url: picrewUrl,
              created: new Date(),
              displayPic: picId,
            },
          ])
          .then((res) => {
            out.newPicrew = true;
            return res.payload.records[0];
          });
      }
    }
  });

app.post("/", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  const file = req.files?.file;
  const fileName = file?.name;
  if (!fileName || !file) {
    return res.status(400).send("File not uploaded correctly.");
  }

  file.mv(
    path.join(__dirname, `../../../static/images/${fileName}`),
    async (err) => {
      if (err) return res.status(500).send(err);

      // TODO: turn this all into an IO hook in fortune
      const userId = req.user?.id;
      if (!userId) return res.status(400).send("Not logged in.");

      // extract picrew url, id
      const nameParts = fileName.split("_");
      const picrewUrl = nameParts[0];
      const picId = nameParts[1]; // TODO: dedupe uploads

      // find or create picrew entry
      const out = { newPicrew };
      const picrew = findOrCreatePicrew(picrewUrl, null, out);
      let newPicrew = out.newPicrew;

      // create the pic entry
      const picResponse = await picrewApi.create("pic", {
        camper: userId,
        picrew: picrew.id ?? null,
        created: new Date(),
        url: `/images/${fileName}`,
      });
      const pic = picResponse.payload.records[0];

      // update a newly created picrew with a display pic
      if (newPicrew) {
        picrewApi.update("picrew", {
          id: picrew.id,
          replace: {
            displayPic: pic.id,
          },
        });
      }

      // return the newly created pic id
      res.send(pic.id);
    }
  );
});

export default app;
