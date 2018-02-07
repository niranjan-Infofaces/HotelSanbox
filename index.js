"use strict"
const express = require("express");
const bodyParser = require("body-parser");
const DialogflowApp = require('actions-on-google').DialogflowApp;
const restService = express();

restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

function orderMenu(req, res)
{
    const app = new DialogflowApp({request: req, response: res});
    function tell_Order(app)
    {
        app.tell("idli vada dosa");
    }
    function your_Order(app)
    {
        // cont from here
        let _app = new DialogflowApp({req,res})
        let _order = app.getArgument('menu');
        app.tell("You have ordered",_order)
    }
}
const actionMap = new Map();
actionMap.set('order',tell_Order);
actionMap.set('OrderedMenu',your_Order);
app.handleRequest(actionMap);
    
restService.post('/', function (req, res) {
    // console.log(req.body);
    orderMenu(req, res);
   })
   
restService.listen(process.env.PORT || 8000, function() {
    console.log("Server up and listening");
  });
