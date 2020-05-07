const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// import all .env file contents
require("dotenv").config();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get(
  "/admin/*",
  basicAuth({
    users: { admin: process.env.ADMIN_PASSWORD },
    challenge: true,
    realm: "admin-zone",
  }),
  express.static(path.join(__dirname, "/public/admin"))
);

// front-end
app.get("/*", express.static(path.join(__dirname, "/public")));

app.get(
  "/lookup/:query",
  basicAuth({
    users: { admin: process.env.ADMIN_PASSWORD },
    challenge: true,
    realm: "admin-zone",
  }),
  (req, res) => {
    const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE}/Students?filterByFormula=SEARCH(LOWER("${req.params.query}"), LOWER(Name))>=1&view=Stream+View&fields%5B%5D=Name&fields%5B%5D=Slack+Handle&fields%5B%5D=Role`;

    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_KEY}`,
      },
      //credentials: 'user:passwd'
    })
      .then((response) => response.json())
      .then((json) => res.send(json));
  }
);

let currentData = {};

// push card update to user socket
app.post("/push", (req, res) => {
  currentData = {
    name: req.body.name,
    handle: req.body.handle,
    role: req.body.role,
  };

  io.emit("push", currentData);

  res.status(200);
});

// clear current overlay
app.get("/clear", (req, res) => {
  currentData = {};
  io.emit("clear");

  res.status(200).end();
});

// app.get("/push/airtable", (req, res) => {
// 	if (req.query.auth == process.env.ADMIN_PASSWORD) {
// 		currentData = {
// 			name: req.query.name,
// 			handle: req.query.handle,
// 			role: req.query.role,
// 		};

// 		io.emit("push", currentData);
// 		res.status(200).send(`We done. Close this!`);
// 	} else {
// 		res.status(400).end();
// 	}
// });

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
