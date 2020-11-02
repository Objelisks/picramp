import serve from "serve-static";
import express from "express";
import session from "express-session";
import compression from "compression";
import * as sapper from "@sapper/server";
import passport from "passport";
import CustomStrategy from "passport-custom";
import MastodonStrategy from "passport-mastodon";
import path from "path";

import creds from "./creds.json";
import store, { picrewApi, htmlListener } from "./server/picrewApi.js";
import fileUpload from "./server/fileUpload.js";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const findOrCreateUser = async (name, url) => {
  const res = await picrewApi.find("camper", undefined, {
    match: {
      name: name,
    },
  });
  let user = null;
  if (res.payload.count > 0) {
    user = res.payload.records[0];
  } else {
    const record = {
      name: name,
      url: url,
      created: new Date(),
    };
    const created = await picrewApi.create("camper", record);
    user = created.payload.records[0];
  }
  return user;
};

passport.use(
  "localhost",
  new CustomStrategy(async (req, done) => {
    const user = await findOrCreateUser("objelisks", "fgsfds");
    return done(null, user);
  })
);

passport.use(
  new MastodonStrategy(
    creds,
    async (accessToken, refreshToken, profile, cb) => {
      const user = await findOrCreateUser(profile.username, profile.profileUrl);
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
    (() => {
      return dev
        ? passport.authenticate("localhost", {
            failureRedirect: "/picramp",
          })
        : passport.authenticate("mastodon", {
            scope: "read:accounts",
          });
    })(),
    (req, res) => {
      res.redirect("/picramp");
    }
  )
  .get(
    "/picramp/login/redirect",
    passport.authenticate("mastodon", {
      successRedirect: "/picramp",
      failureRedirect: "/picramp",
    })
  )
  .get("/picramp/logout", (req, res, next) => {
    req.logout();
    res.redirect("/picramp");
  })
  .use("/picramp/upload", fileUpload)
  .use("/picramp/rest", store)
  .use("/picramp/db", dev ? htmlListener : (_, __, next) => next())
  .use(
    "/picramp",
    compression({ threshold: 0 }),
    serve(path.join(__dirname, `../../../static/`)),
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
