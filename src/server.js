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
      const res = await picrewApi.find("camper", undefined, {
        match: {
          name: profile.username,
        },
      });
      console.log(res);
      let user = null;
      if (res.count > 0) {
        user = res[0];
      } else {
        const record = {
          name: profile.username,
          url: profile.profileUrl,
          created: new Date(),
        };
        console.log(record);
        const created = await picrewApi.create("camper", record);
        user = created.payload.records[0];
      }
      return cb(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("serialize", user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log("deserialize", user);
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
      failureRedirect: "/picramp",
    })
  )
  .get(
    "/picramp/login/redirect",
    passport.authorize("mastodon", { failureRedirect: "/picramp" }),
    (req, res) => {
      res.redirect("/picramp");
    }
  )
  .use("/picramp/upload", fileUpload)
  .use("/picramp/rest", store)
  .use(
    "/picramp",
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware({
      session: (req, res) => {
        console.log(
          "user",
          req.user,
          "account",
          req.account,
          "passport",
          passport.isAuthenticated
        );
        return {
          camper: req.account,
        };
      },
    })
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
