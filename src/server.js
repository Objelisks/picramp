import sirv from "sirv";
import express from "express";
import session from "express-session";
import compression from "compression";
import * as sapper from "@sapper/server";
import passport from "passport";
import MastodonStrategy from "passport-mastodon";

import creds from "./creds.json";
import store, { picrewApi } from "./server/picrewApi.js";
import fileUpload from "./server/fileUpload.js";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

passport.use(
  new MastodonStrategy(
    creds,
    async (accessToken, refreshToken, profile, cb) => {
      const res = await picrewApi.find("camper", {
        match: {
          name: profile.username,
        },
      });
      let user = null;
      if (res.count > 0) {
        user = res[0];
      } else {
        const record = {
          name: profile.username,
          url: `${profile.url}`,
          created: new Date(),
        };
        user = await picrewApi.create("camper", record);
      }
      return cb(null, user);
    }
  )
);

express()
  .get("/picramp/auth/redirect", passport.authenticate("mastodon"))
  .use((req, res, next) => {
    if (dev) {
      // cheating
      req.headers["Remote-User"] = "eXHk3kPmqbPLMr6";
    }
    next();
  })
  .get(
    "/picramp/login",
    passport.authenticate("mastodon", {
      scope: "read:accounts",
      failureRedirect: "/",
    })
  )
  .use("/picramp/upload", fileUpload)
  .use("/picramp/rest", store)
  .use(
    "/picramp",
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    session({ secret: "fgsfds" }),
    passport.initialize(),
    passport.session(),
    sapper.middleware({
      session: (req, res) => ({
        camper: req.user, //await picrewApi.find("camper", req.id),
      }),
    })
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
