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
const decode = require("./demo/decode");

const app = express();
app.use(bodyParser.json());

const existingURLs = [];
const dbUrl = process.env.MONGODB_URI;
mongoose.connect(dbUrl, {}).then(async () => {
  console.log("Connected to mongo database at " + dbUrl);
});

// TODO: Implement functionalities specified in README
app.get("/", function(req, res) {
  res.send("Hello world!");
});

app.get("/expand-url", function(req, res) {
  const hashUrl = req.body.hash;
  try {
    let decodedResult = decode(hashUrl, existingURLs);
    if (decodedResult !== undefined) {
      res.send(`URL found: "${decodedResult}"`);
      res.status(200);
    }
  } catch (error) {
    res.status(error.status || 404);
    res.send(`There is no long URL registered for hash value: ${hashUrl}`);
  }
  res.end();
});

app.post("/shorten-url", function(req, res, next) {
  try {
    const url = req.body.url;
    let encodedResult = encode(url, existingURLs);
    let isAvailable = existingURLs.filter(url => url.url == url);
    let newURL = {
      id: Number.parseInt(existingURLs.length - 1) + 1,
      url: url,
      hash: encodedResult
    };
    existingURLs.push(newURL);
    console.log("newURL: ", newURL);
    res.send(
      `${newURL.id}) ${newURL.url} is sucessfully created with new hash: "${
        newURL.hash
      }"`
    );
  } catch (error) {
    next(error);
  }
  res.end();
});

app.delete("/expand-url/:hash", function(req, res) {
  const hashId = req.body.hash;
  try {
    let decodedResult = decode(hashId, existingURLs);
    if (decodedResult !== undefined) {
      res.status(200);
      res.send(`URL with hash value '${hashId}' deleted successfully.`);
    }
  } catch (error) {
    res.status(error.status || 404);
    res.send(`URL with hash value '${hashId}' does not exist.`);
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
