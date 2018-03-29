'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const hService = require('./services/homeService.js');
const cService = require('./services/cbotService.js');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
 
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
      });
  
    next();
  });
  

global.access = 'not granted';
global.uid = '';
global.dob = '';

// Initiates service for connected home
app.post('/services/hservice', (req, res) => {
    console.log('Inside hservice');
    hService.relayCommand(req, res);
});

app.post('/services/cservice', (req, res) => {
    console.log('Inside cservice');
    cService.relayCommand(req, res);
});

// Set up server
app.listen(process.env.PORT || 3000, () => {
    console.log('Relay service is up and listening');
    // end of server set up
});
