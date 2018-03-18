if (process.env.NODE_ENV !== "production") {
  require("dotenv").load();
}
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Counter = require("./models/counter");
const URLs = require("./models/urls");

// load our own helper functions
const encode = require("./demo/encode");
const btoa = require("btoa");
const decode = require("./demo/decode");
const atob = require("atob");

const app = express();
app.use(bodyParser.json());

const dbUrl = process.env.MONGODB_URI;
mongoose.connect(dbUrl, {}).then(async () => {
  console.log("Connected to mongo database at " + dbUrl);
  URLs.remove({}, function() {
    console.log("URL collection removed");
  });
  Counter.remove({}, function() {
    console.log("Counter collection removed");
    let counter = new Counter({ _id: "url_count", count: 10000 });
    counter.save(function(err) {
      if (err) return console.error(err);
      console.log("counter inserted");
    });
  });
});

app.post("/shorten", function(req, res, next) {
  console.log(req.body.url);
  let urlData = req.body.url;
  URLs.findOne({ url: urlData }, function(err, doc) {
    if (doc) {
      console.log("entry found in db");
      res.send({
        url: urlData,
        hash: btoa(doc._id),
        status: 200,
        statusTxt: "OK"
      });
    } else {
      console.log("entry NOT found in db, saving new");
      let url = new URLs({
        url: urlData
      });
      url.save(function(err) {
        if (err) return console.error(err);
        res.send({
          url: urlData,
          hash: btoa(url._id),
          status: 200,
          statusTxt: "OK"
        });
      });
    }
  });
});

app.get("/", async function(req, res, next) {
  try {
    const urlListing = await URLs.find({}).exec();
    res.send({
      message: "List of all URLs in our database...",
      urlListing
    });
  } catch (err) {
    next(err);
  }
  res.end;
});

app.get("/:hash", function(req, res, next) {
  try {
    let baseid = req.params.hash;
    let id = atob(baseid);
    URLs.findOne({ _id: id }, function(err, doc) {
      if (doc) {
        res.redirect(doc.url);
      } else {
        res.redirect("/");
      }
    });
  } catch (error) {
    next(error);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.send("error");
});

module.exports = app;
