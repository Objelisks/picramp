const jsonApiSerializer = require("fortune-json-api");

const path = require("path");
const fortune = require("fortune");
const fsAdapter = require("fortune-fs");
const fortuneHTTP = require("fortune-http");
const htmlSerializer = fortuneHTTP.HtmlSerializer;
const formDataSerializer = fortuneHTTP.FormDataSerializer;
const formUrlEncodedSerializer = fortuneHTTP.FormUrlEncodedSerializer;

const {
  errors: { NotFoundError },
} = fortune;
const store = fortune(
  {
    camper: {
      name: String,
      displayPic: "pic",
      url: String,
      created: Date,

      pics: [Array("pic"), "camper"],
    },
    picrew: {
      name: String,
      displayPic: "pic",
      url: String,
      created: Date,

      pics: [Array("pic"), "picrew"],
    },
    pic: {
      camper: ["camper", "pics"],
      picrew: ["picrew", "pics"],
      url: String,
      created: Date,
    },
  },
  {
    adapter: [
      fsAdapter,
      {
        path: path.join(__dirname, "../../../.db/picrew.db"),
      },
    ],
  }
);

const apiListener = fortuneHTTP(store, {
  serializers: [[jsonApiSerializer, { prefix: "/picramp/rest" }]],
});

const htmlListener = fortuneHTTP(store, {
  serializers: [
    [htmlSerializer, { indexRoute: "/picramp/db", prefix: "/picramp/db" }],
    [formDataSerializer],
    [formUrlEncodedSerializer],
  ],
});

export default apiListener;
export { store as picrewApi, htmlListener };
