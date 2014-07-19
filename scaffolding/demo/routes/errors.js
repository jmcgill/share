var mongo = require("mongoskin"),
    app = module.parent.exports.app,
    winston = require('winston'),
    BSON = mongo.BSONPure;

var mongo = require('mongoskin');
var database = 'localhost:27017/dev';

app.post('/error', function(req, res) { 
  var error = req.body;
  if (!error) {
    winston.info('Received error log without body.');
    return;
  }

  // Augment the error with some information from the server.
  error.ip = req.ip;
  error.referer = req.header('Referer');
  error.useragent = req.header('User-Agent');
  error.timestamp = new Date();

  var collection = mongo.db(database, {safe:true}).collection('Errors');
  collection.insert(error, function() {
    res.send(200);
  });
});