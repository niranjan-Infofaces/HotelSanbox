

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');


// a. the action name from the make_name Dialogflow intent
const NAME_ACTION = 'make_name';
// b. the parameters that are parsed from the make_name intent 
const COLOR_ARGUMENT = 'color';
const NUMBER_ARGUMENT = 'number';
const Order="order";
const OrderedMenu ="OrderedMenu";

exports.sillyNameMaker = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));


// c. The function that generates the silly name
  function makeName (app) {
    let number = app.getArgument(NUMBER_ARGUMENT);
    let color = app.getArgument(COLOR_ARGUMENT);
    app.tell('Alright, your silly name is ' +
      color + ' ' + number +
      '! I hope you like it. See you next time.');
  }
  function tell_Order(app){
    app.tell("idli vada dosa");
}
function your_Order(app){
    // cont from here
    let _app = new DialogflowApp({req,res})
    let _order = app.getArgument('menu');
    app.tell("You have ordered",_order)
}
  // d. build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(NAME_ACTION, makeName);
  actionMap.set(NUMBER_INTENT, numberIntent);
  actionMap.set(order,tell_Order);
  


app.handleRequest(actionMap);
});
