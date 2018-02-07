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
    const order = "order";
    const OrderedMenu ="OrderedMenu";
 
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
 
  let actionMap = new Map();
  actionMap.set('order', this.tell_Order);
  actionMap.set('OrderedMenu',this.your_Order);  
  app.handleRequest(actionMap);
function responseHandler (app) {
    console.log("okok")
    // intent contains the name of the intent you defined in the Actions area of API.AI
    let intent = app.getIntent();
    switch (intent) {
      case order:
        app.ask('Welcome!');
        break;

      case OrderedMenu:
        let menu = app.getArgument(OrderedMenu);
        app.tell('You said 2' + menu);
        break;
     
       default:
        app.ask('Please enter correct input! ');
        break;

    }
  }
restService.post('/', function (req, res) {
    // console.log(req.body);
    orderMenu(req, res);
})
   
restService.listen(process.env.PORT || 8000, function() {
    console.log("Server up and listening");
  });
