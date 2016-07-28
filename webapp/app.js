/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var request = require('request');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// Define the configuration for the MFP server that we are reverse-proxying for
//var mfpServer = "http://mobilefoundation-bva-server.mybluemix.net";
//var port = 80;
var mfpServer = "http://localhost:9080";
var port = 9080;

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// Reverse proxy, pipes the requests to/from MobileFirst Server
app.use('/mfp/*', function(req, res) {
    var url = mfpServer + req.originalUrl;
    console.log('::: server.js ::: Passing request to URL: ' + url);
    req.pipe(request[req.method.toLowerCase()](url)).pipe(res);
});

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
