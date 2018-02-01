"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const restService = express();

restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

restService.use(bodyParser.json());

restService.post("/echo", function(req, res) {
    var menu = ["idli","dosa","vada"] ;
    console.log(req.body);
  var speech =  req.body.result && req.body.result.parameters && req.body.result.parameters.Menu ? menu  : "Seems like some problem. Speak again.";
  return res.json({
    speech: speech,
    displayText: speech,
    source: "webhook-echo-sample"
  });
});
restService.listen(process.env.PORT || 8000, function() {
    console.log("Server up and listening");
  });