// run this file with `node demo/encoding-decoding-example-1.js` to see how you can encode/decode a string
const btoa = require("btoa");
const atob = require("atob");

encodedString = btoa("www.google.com");
console.log(encodedString);

decodedString = atob("MTAwMDA=");
console.log(decodedString);
