if (process.env.NODE_ENV !== "production") {
  require("dotenv").load();
}
const app = require("./app");
const mongoose = require("mongoose");
const Counter = require("./models/counter");
const URLs = require("./models/urls");

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

const server = app.listen(process.env.PORT || 3000, function() {
  console.log(`Listening on port ${server.address().port}...`);
});
