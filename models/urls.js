const mongoose = require("mongoose");
const Counter = require("../models/counter");

var urlSchema = new mongoose.Schema({
  _id: { type: Number },
  url: "",
  created_at: ""
});

urlSchema.pre("save", async function(next) {
  console.log("running pre-save");
  var doc = this;
  await Counter.findByIdAndUpdate(
    { _id: "url_count" },
    { $inc: { count: 1 } },
    await function(err, counter) {
      if (err) return next(err);
      console.log(counter);
      console.log(counter.count);
      doc._id = counter.count;
      doc.created_at = new Date();
      console.log(doc);
      next();
    }
  );
});

var URLs = mongoose.model("URLs", urlSchema);

module.exports = URLs;
