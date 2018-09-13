const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Schema = mongoose.Schema;

let db = mongoose.connect(process.env.MLAB_URI);

app.use(cors());

// Create User Schema
let userSchema = new Schema({
  username: String,
  log: [
    {
      description: String,
      duration: Number,
      date: Date
    }
  ]
});
// Create User Model
let User = db.model("User", userSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/exercise/users", (req, res) => {
  User.find({}, "_id username").exec((err, doc) => {
    err ? console.log(err) : res.json(doc);
  });
});

app.get("/api/exercise/log", (req, res) => {
  let _id = req.query.userId;
  let fromDate = req.query.from;
  let toDate = req.query.to;
  let limit = req.query.limit;
  console.log("limit", limit);

  console.log(req.query);
  console.log(req.params);
  // if (req.query.from)
  User.findOne(
    {
      _id: _id
    },
    "_id username log"
  ).exec((err, doc) => {
    if (doc == null) {
      res.json({ error: "userId not found" });
    } else if (limit && Number(limit) == NaN) {
      console.log("typeof limit", typeof limit);
      console.log("limit", limit);

      res.json({ error: "limit must be a whole number" });
    } else if (fromDate && new Date(fromDate) == "Invalid Date") {
      res.json({
        error: "From Date Format should be yyyy-mm-dd not " + fromDate
      });
    } else if (toDate && new Date(toDate) == "Invalid Date") {
      res.json({
        error: "To Date Format should be yyyy-mm-dd not " + toDate
      });
    } else {
      if (fromDate && toDate) {
        res.json({
          _id: doc._id,
          username: doc.username,
          count: doc.log.slice(0, limit).length,
          log: limit
            ? doc.log
                .filter(
                  obj =>
                    new Date(obj.date) >= new Date(fromDate) &&
                    new Date(obj.date) <= new Date(toDate)
                )
                .slice(0, limit)
            : doc.log.filter(
                obj =>
                  new Date(obj.date) >= new Date(fromDate) &&
                  new Date(obj.date) <= new Date(toDate)
              )
        });
      } else if (fromDate) {
        res.json({
          _id: doc._id,
          username: doc.username,
          count: doc.log.slice(0, limit).length,
          log: Number(limit)
            ? doc.log
                .filter(obj => new Date(obj.date) >= new Date(fromDate))
                .slice(0, limit)
            : doc.log.filter(obj => new Date(obj.date) >= new Date(fromDate))
        });
      } else {
        res.json({
          _id: doc._id,
          username: doc.username,
          count: doc.log.slice(0, limit).length,
          log: Number(limit) > 0 ? doc.log.slice(0, limit) : doc.log
        });
      }
    }
  });
});

app.post("/api/exercise/new-user", (req, res) => {
  let username = req.body.username;
  User.findOne({ username: username }, (err, doc) => {
    console.log("doc", doc);

    err
      ? console.log(err)
      : doc != null
        ? res.send("username already taken")
        : User.create({ username: username }, (err, doc) => {
            err ? console.log(err) : res.json(doc);
          });
  });
});

app.post("/api/exercise/add", (req, res) => {
  let user = { _id: req.body.userId };
  if (req.body.description) {
    var description = req.body.description;
  }
  if (req.body.duration) {
    var duration = req.body.duration;
  }
  let date = new Date();
  req.body.date && (date = new Date(req.body.date));
  let exercise = {
    description: description,
    duration: duration,
    date: date
  };
  console.log("user", user);

  User.findOneAndUpdate(
    user,
    { $push: { log: exercise } },
    { fields: { log: 1, username: 1, _id: 1 }, new: true },
    (err, doc) => {
      err
        ? (res
            .status(err.status || 500)
            .type("txt")
            .send(err.message),
          console.log(err))
        : (res.json({
            username: doc.username,
            _id: doc._id,
            description: doc.log[doc.log.length - 1].description,
            duration: doc.log[doc.log.length - 1].duration,
            date: doc.log[doc.log.length - 1].date.toDateString()
          }),
          console.log("doc = ", doc._id));
    }
  );
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

const log = [
  {
    date: "2017-01-01T00:00:00.000Z",
    duration: 22,
    description: "SOOBigO",
    _id: "5b93541f74c8d43eb1ee93c6"
  },
  {
    date: "2018-09-08T17:21:01.856Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b9404fd9037f24c50ee1486"
  },
  {
    date: "2018-09-08T17:21:47.369Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b94052b46a4e34c5ced499d"
  },
  {
    date: "2018-09-08T17:23:10.620Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b94057ec595c14c80a3ef15"
  },
  {
    date: "2018-09-08T17:24:14.174Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b9405be6de3c54c9c20929f"
  },
  {
    date: "2018-09-08T17:25:12.618Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b9405f8b096cd4cb5fee9b1"
  },
  {
    date: "2018-09-08T17:26:01.613Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b940629607d264ccfd6da95"
  },
  {
    date: "2018-09-08T17:26:37.201Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b94064d19e26d4cd948c3de"
  },
  {
    date: "2018-09-08T17:27:02.781Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b940666556d0e4ce9e4c7b5"
  },
  {
    date: "2018-09-08T17:27:40.132Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b94068c21e3744d0116be58"
  },
  {
    date: "2018-09-08T17:28:02.362Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b9406a24f53984d1d47b9d2"
  },
  {
    date: "2018-09-08T17:28:34.642Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b9406c27a48f44d30b057f6"
  },
  {
    date: "2018-09-08T17:46:15.006Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b940ae75a74064dbc2e8864"
  },
  {
    date: "2018-09-08T18:05:27.737Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b940f67b975e94e6629b3ec"
  },
  {
    date: "2018-09-08T18:05:48.992Z",
    duration: 22,
    description: "newestest exercise",
    _id: "5b940f7c31495e4e76937694"
  },
  {
    date: "2018-09-10T15:15:39.419Z",
    duration: 44,
    description: "Ehh",
    _id: "5b968a9bf158a80a4d045740"
  },
  {
    date: "2018-09-13T20:55:03.596Z",
    duration: 44,
    description: "something",
    _id: "5b96da27fc610c0ac91472d5"
  }
];

let filterLog = log.filter(
  obj =>
    new Date(obj.date) >= new Date("2018-09-08") &&
    new Date(obj.date) <= new Date("2018-09-12")
);
// console.log("filterLog: ", filterLog);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
