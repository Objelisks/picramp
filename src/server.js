import sirv from "sirv";
import express from "express";
import compression from "compression";
import * as sapper from "@sapper/server";
import passport from "passport";
import MastodonStrategy from "passport-mastodon";

import creds from "./creds.json";
import picrewApi from "./server/picrewApi.js";
import fileUpload from "./server/fileUpload.js";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

passport.use(
  new MastodonStrategy(
    creds,
    async (accessToken, refreshToken, profile, cb) => {
      console.log(profile);
      return cb(
        null,
        await picrewApi.find("camper", {
          match: {
            name: profile.name,
          },
        })
      );
    }
  )
);

express()
  .get("/auth/redirect", passport.authenticate("mastodon"))
  .use((req, res, next) => {
    if (dev) {
      // cheating
      req.headers["Remote-User"] = "eXHk3kPmqbPLMr6";
    }
    next();
  })
  .get(
    "/login",
    passport.authenticate("mastodon", {
      scope: "read:accounts",
      failureRedirect: "/",
    })
  )
  .use("/upload", fileUpload)
  .use("/rest", picrewApi)
  .use(
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware({
      session: (req, res) => ({
        camper: { id: req.headers["Remote-User"] }, //await picrewApi.find("camper", req.id),
      }),
    })
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
