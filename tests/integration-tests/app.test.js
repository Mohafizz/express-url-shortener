process.env.ENV = "test";

const app = require("../../app");
const request = require("supertest");
const mongoose = require("mongoose");
const URLs = require("../../models/urls");
const Counter = require("../../models/counter");
const btoa = require("btoa");

describe("Urls", () => {
  let db;

  beforeAll(async () => {
    const dbUri = "mongodb://localhost/test_urls_db";
    db = await mongoose.connect(dbUri, () => {
      console.log("connected to test DB successfully");
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
    await URLs.deleteMany().exec();
  });

  it("GET / should return status of 200 and all stored urls in the test DB", async () => {
    const expectedUrls = await URLs.find({});

    const response = await request(app).get("/");
    expect(response.status).toEqual(200);
    expect(response.header["content-type"]).toContain("application/json");
    expect(response.body.message).toEqual(
      "List of all URLs in our database..."
    );
    expect(response.body.urlListing).toEqual([]);
  });

  it("POST /shorten should return hash", async () => {
    const URL = "http://google.com";

    const response = await request(app)
      .post("/shorten")
      .send({ url: URL });
    expect(response.status).toEqual(200);
    expect(response.header["content-type"]).toContain("application/json");
    expect(response.body.url).toEqual(URL);
    expect(response.body.statusTxt).toEqual("OK");
    expect(response.body.hash).toEqual("MTAwMDA=");
  });

  it("GET /:hash should redirect to the stored URL", async () => {
    const hashId = "MTAwMDA=";

    const response = await request(app)
      .get("/MTAwMDA=")
      .redirects(1);
    expect(response.status).toEqual(302);
    expect(response.header["location"]).toContain("google.com");
  });

  afterAll(async () => {
    await URLs.deleteMany().exec();
    await db.close();
  });
});
