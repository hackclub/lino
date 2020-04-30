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

app.get("/lookup/:email", (req, res) => {
  fetch(`https://slack.com/api/users.lookupByEmail?email=${req.params.email}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success: ", data);

      if (data.ok) {
        let resData = {
          ok: data.ok,
          name: data.user.real_name,
          handle: data.user.name,
          profile: data.user.profile.image_192,
          admin: data.user.is_admin,
        };

        res.status(200).send(resData);
      } else {
        res.status(404).send(data);
      }
    })
    .catch((err) => {
      console.log("Error: ", err);
      res.status(500).send(err);
    });
});

let currentData = {};

// push card update to user socket
app.post("/push", (req, res) => {
  currentData = {
    name: req.body.name,
    handle: req.body.handle,
    admin: req.body.admin == "admin",
    profile: req.body.profile,
  };

  io.emit("push", currentData);

  res.status(200).redirect("/admin");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  console.log(currentData);
  io.emit("push", currentData);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
