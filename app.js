const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

// load our own helper functions
const encode = require("./demo/encoder");
const decode = require("./demo/decoder");

const app = express();

app.use(bodyParser.json());

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
  res.render("error");
});

// TODO: Implement functionalities specified in README
app.get("/", function(req, res) {
  res.send("Hello world!");
});

module.exports = app;
