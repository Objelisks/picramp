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
      return cb(null, {
        id: user.id,
        name: user.name,
        url: user.url,
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
/*
objelisks@ancient-pebble:~/code/picramp$ PORT=4200 npm start

> picramp@0.0.1 start /home/objelisks/code/picramp
> node __sapper__/build

Starting server on port 4200
express-session deprecated undefined resave option; provide resave option __sapper__/build/server/server.js:8196:35
express-session deprecated undefined saveUninitialized option; provide saveUninitialized option __sapper__/build/server/server.js:8196:35
Warning: connect.session() MemoryStore is not
designed for a production environment, as it will leak
memory, and will not scale past a single process.
Error: Failed to serialize session data: Cannot stringify arbitrary non-POJOs
    at /home/objelisks/code/picramp/__sapper__/build/server/server.js:7779:31
    at try_serialize (/home/objelisks/code/picramp/__sapper__/build/server/server.js:7871:13)
    at /home/objelisks/code/picramp/__sapper__/build/server/server.js:7778:41
    at Generator.next (<anonymous>)
    at fulfilled (/home/objelisks/code/picramp/__sapper__/build/server/server.js:3217:58)

*/
express()
  .use(session({ secret: "fgsfds" }))
  .use(passport.initialize())
  .use(passport.session())
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
    sapper.middleware({
      session: (req, res) => ({
        camper: req.user, //await picrewApi.find("camper", req.id),
      }),
    })
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
