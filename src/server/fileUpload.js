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
        /<meta property="og:title" content="(\p{Any}*?)｜Picrew"\/>\n/u
      )
    )
    .then((matches) => matches?.[1] ?? "picrew");

app.post("/", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  const file = req.files.file;
  file.mv(
    path.join(__dirname, `../../../static/images/${file.name}`),
    async (err) => {
      if (err) return res.status(500).send(err);

      // TODO: turn this all into an IO hook in fortune

      // extract picrew url, id
      const nameParts = file.name.split("_");
      const picrewUrl = nameParts[0];
      const picId = nameParts[1]; // TODO: dedupe uploads

      // find or create picrew entry
      let newPicrew = false;
      const picrew = await picrewApi
        .find("picrew", undefined, {
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
            return picrewApi
              .create("picrew", [
                {
                  name: await picrewName(picrewUrl),
                  url: picrewUrl,
                  created: new Date(),
                },
              ])
              .then((res) => {
                newPicrew = true;
                return res.payload.records[0];
              });
          }
        });

      const userId = req.headers["Remote-User"];

      // create the pic entry
      const picResponse = await picrewApi.create("pic", {
        camper: userId,
        picrew: picrew.id,
        created: new Date(),
        url: `/images/${file.name}`,
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
