import sirv from "sirv";
import express from "express";
import compression from "compression";
import * as sapper from "@sapper/server";
import passport from "passport";
import MastodonStrategy from "passport-mastodon";

import creds from "./creds.json";
import { picrewApi } from "./server/picrewApi.js";
import fileUpload from "./server/fileUpload.js";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

/*
  _json: {
    id: '214',
    username: 'objelisks',
    acct: 'objelisks',
    display_name: 'tim 🍓',
    locked: false,
    bot: false,
    discoverable: true,
    group: false,
    created_at: '2018-08-13T16:56:18.865Z',
    note: '<p>im tim, you might know me from friend dot camp</p><p>seattle camper<br />very tired<br />im making a trains game<br />let me know if you see any cool web dev jobs<br />play video games with me</p>',
    url: 'https://friend.camp/@objelisks',
    avatar: 'https://friend.camp/system/accounts/avatars/000/000/214/original/f828e9f86f5b82d9.jpeg?1567109019',
    avatar_static: 'https://friend.camp/system/accounts/avatars/000/000/214/original/f828e9f86f5b82d9.jpeg?1567109019',
    header: 'https://friend.camp/system/accounts/headers/000/000/214/original/a26b88469cebb892.png?1534204556',
    header_static: 'https://friend.camp/system/accounts/headers/000/000/214/original/a26b88469cebb892.png?1534204556',
    followers_count: 132,
    following_count: 179,
    statuses_count: 4605,
    last_status_at: '2020-10-30',
    source: {
      privacy: 'public',
      sensitive: false,
      language: '',
      federation: false,
      note: 'im tim, you might know me from friend dot camp\r\n' +
        '\r\n' +
        'seattle camper\r\n' +
        'very tired\r\n' +
        'im making a trains game\r\n' +
        'let me know if you see any cool web dev jobs\r\n' +
        'play video games with me',
      fields: [Array],
      follow_requests_count: 0
    },
    emojis: [],
    fields: [ [Object], [Object], [Object], [Object] ]
  }
}


*/

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
        user = await picrewApi.create("camper", {
          name: profile.username,
          url: profile.url,
          created: new Date(),
        });
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
  .use("/picramp/rest", picrewApi)
  .use(
    "/picramp",
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
