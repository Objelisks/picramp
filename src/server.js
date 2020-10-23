import sirv from "sirv";
import express from "express";
import compression from "compression";
import * as sapper from "@sapper/server";

import session from "express-session";

import picrewApi from "./server/picrewApi.js";
import fileUpload from "./server/fileUpload.js";
import sessionData from "./server/session.js";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

express() // You can also use Express
  .use((req, res, next) => {
    if (dev) {
      req.headers["Remote-User"] = "eXHk3kPmqbPLMr6";
    }
    next();
  })
  .use("/upload", fileUpload)
  .use("/rest", picrewApi)
  .use(
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware({
      session: sessionData,
    })
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
