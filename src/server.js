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
let loggedout = true;

const findOrCreateUser = async (name, url, token) => {
  // try to find by token
  const res = await picrewApi.find("camper", null, {
    match: {
      token,
    },
  });
  let user = res.payload?.records?.[0] ?? null;

  // try to find by name
  if (!user) {
    const res = await picrewApi.find("camper", null, {
      match: {
        name,
      },
    });
    user = res.payload?.records?.[0] ?? null;

    // update token
    if (user) {
      await picrewApi.update("camper", [
        {
          id: user.id,
          replace: {
            token,
          },
        },
      ]);
    }
  }

  if (!user) {
    const record = {
      name: name,
      url: url,
      created: new Date(),
      token,
    };
    const created = await picrewApi.create("camper", record);
    user = created.payload.records[0];
  }

  return user;
};

passport.use(
  "localhost",
  new CustomStrategy(async (req, done) => {
    const user = await findOrCreateUser("objelisks", "fgsfds", "token1");
    if (dev && loggedout) {
      loggedout = false;
      return done(null, false);
    }
    return done(null, user);
  })
);

passport.use(
  new MastodonStrategy(
    creds,
    async (accessToken, refreshToken, profile, done) => {
      const user = await findOrCreateUser(
        profile.username,
        profile.profileUrl,
        accessToken
      );
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  const res = await picrewApi.find("camper", userId);
  const user = res.payload?.records?.[0];
  done(null, user);
});

const authenticate = ({ dev }) =>
  dev
    ? passport.authenticate("localhost", {
        failureRedirect: "/picramp/landing",
      })
    : passport.authenticate("mastodon", {
        scope: "read:accounts",
        failureRedirect: "/picramp/landing",
      });

express()
  .use(session({ secret: "fgsfds" }))
  .use(passport.initialize())
  .use(passport.session())
  .get(
    "/picramp/login/redirect",
    passport.authenticate("mastodon", {
      successRedirect: "/picramp",
      failureRedirect: "/picramp/landing",
    })
  )
  .get("/picramp/logout", (req, res, next) => {
    loggedout = true;
    req.session.destroy(() => {
      req.logout();
      res.redirect("/picramp/landing");
    });
  })
  .get("/picramp/landing", (req, res, next) => {
    res.sendFile(path.join(__dirname, "../../../static/landing.html"));
  })
  .use("/picramp/upload", authenticate({ dev }), fileUpload)
  .use("/picramp/rest", authenticate({ dev }), store)
  .use("/picramp/db", dev ? htmlListener : (_, __, next) => next())
  .use(
    "/picramp",
    authenticate({ dev }),
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
