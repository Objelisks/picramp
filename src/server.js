import sirv from "sirv";
import express from "express";
import session from "express-session";
import compression from "compression";
import * as sapper from "@sapper/server";
import passport from "passport";
import MastodonStrategy from "passport-mastodon";
import path from "path";

import creds from "./creds.json";
import store, { picrewApi } from "./server/picrewApi.js";
import fileUpload from "./server/fileUpload.js";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

passport.use(
  new MastodonStrategy(
    creds,
    async (accessToken, refreshToken, profile, cb) => {
      const res = await picrewApi.find("camper", undefined, {
        match: {
          name: profile.username,
        },
      });
      let user = null;
      if (res.payload.count > 0) {
        user = res.payload.records[0];
      } else {
        const record = {
          name: profile.username,
          url: profile.profileUrl,
          created: new Date(),
        };
        const created = await picrewApi.create("camper", record);
        user = created.payload.records[0];
      }
      return cb(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  const res = await picrewApi.find("camper", userId);
  const user = res.payload.records[0];
  done(null, user);
});

express()
  .use(session({ secret: "fgsfds" }))
  .use(passport.initialize())
  .use(passport.session())
  .get(
    "/picramp/login",
    passport.authenticate("mastodon", {
      scope: "read:accounts",
    })
  )
  .get(
    "/picramp/login/redirect",
    passport.authenticate("mastodon", {
      successRedirect: "/picramp",
      failureRedirect: "/picramp",
    })
  )
  .use("/picramp/upload", fileUpload)
  .use("/picramp/rest", store)
  .use(
    "/picramp",
    compression({ threshold: 0 }),
    sirv(path.join(__dirname, `../../static/`), { dev }),
    sapper.middleware({
      session: (req, res) => {
        return {
          authenticated: !!req.user,
          camper: req.user,
        };
      },
    })
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
