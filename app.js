const express = require("express");
const bodyParser = require("body-parser");
const Counter = require("./models/counter");
const URLs = require("./models/urls");

// load our own helper functions
const btoa = require("btoa");
const atob = require("atob");

const app = express();
app.use(bodyParser.json());

// Base route for front-end
app.get("/", async function(req, res, next) {
  try {
    const urlListing = await URLs.find({}).exec();
    res.send({
      message: "List of all URLs in our database...",
      urlListing
    });
  } catch (error) {
    next(error);
  }
});

app.post("/shorten", async function(req, res, next) {
  try {
    console.log(req.body.url);
    let urlData = req.body.url;
    let searchUrlEntry = await URLs.findOne({ url: urlData }).exec();
    if (searchUrlEntry) {
      console.log("entry found in db");
      res.send({
        url: urlData,
        hash: btoa(searchUrlEntry._id),
        status: 200,
        statusTxt: "OK"
      });
    } else {
      console.log("entry NOT found in db, saving new");
      console.log("urlData: ", urlData);
      let url = await new URLs({
        url: urlData
      }).save();
      res.send({
        url: urlData,
        hash: btoa(url._id),
        status: 200,
        statusTxt: "OK"
      });
    }
  } catch (error) {
    next(error);
  }
});

app.get("/:hash", async function(req, res, next) {
  try {
    let baseid = req.params.hash;
    let id = atob(baseid);
    const urlListing = await URLs.findOne({ _id: id }).exec();
    if (urlListing) {
      res.redirect(urlListing.url);
    } else {
      res.redirect("/");
    }
  } catch (err) {
    next(err);
  }
  res.end;
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
