const express = require("express");
const bodyParser = require("body-parser");

// load our own helper functions
const encode = require("./demo/encode");
const decode = require("./demo/decode");
// const atob = require("atob");
// const btoa = require("btoa");

const app = express();
app.use(bodyParser.json());

const existingURLs = [
  { id: "1", url: "www.google.com", hash: "MQ==" },
  { id: "2", url: "www.facebook.com", hash: "Mg==" }
];

// TODO: Implement functionalities specified in README
app.get("/", function(req, res) {
  res.send("Hello world!");
});

app.post("/shorten-url", function(req, res) {
  const url = req.body.url;
  let encodedResult = encode(url, existingURLs);
  let newURL = {
    id: "3",
    url: url,
    hash: encodedResult
  };
  existingURLs.push(newURL);
  res.send(
    `${newURL.id}) ${newURL.url} is created with new hash: "${newURL.hash}"`
  );
  res.end();
});

app.post("/expand-url", function(req, res) {
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

app.delete("/expand-url/:hash", function(req, res) {
  const hashId = req.body.hash;
  try {
    let decodedResult = decode(hashId, existingURLs);
    console.log("decodedResult: ", decodedResult);
    if (decodedResult !== undefined) {
      console.log("existingURLs: ", existingURLs);
      res.status(200);
      res.send(`URL with hash value '${hashId}' deleted successfully.`);
    }
  } catch (error) {
    console.log("existingURLs: ", existingURLs);
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
