var mongo = require("mongoskin"),
    app = module.parent.exports.app,
    winston = require('winston'),
    BSON = mongo.BSONPure;

var mongo = require('mongoskin');
var database = 'localhost:27017/dev';

exports.pre_commit_hooks = {};

function _(res) {
  res.error = function(type, opt_details) {
    this.send({
      status: type,
      details: opt_details
    });
  };
  return res;
}

app.post('/:collection/search', function(req, res) { 
  res = _(res);
  var query = req.body;

  if (!query) {
    winston.info('Received mongoo search query without body.');
    return res.error('INVALID_REQUEST');
  }

  var collection = mongo.db(database, {safe:true}).collection(req.params.collection);
  collection.find(query).toArray(function (err, items) {
      if (err) {
        winston.info('Query to MongoDB failed: %s', err);
        return res.error('INVALID_QUERY', err);
      }

      res.send(items);
  });
});

app.post('/:collection/insert', function(req, res) { 
  return res.send(503);
  
  res = _(res);
  var document = req.body;

  if (!document) {
    winston.info('Received mongoo insert request without body.');
    return res.error('INVALID_REQUEST');
  }

  // Apply pre-commit hooks
  for (var key in exports.pre_commit_hooks) {
    var regexp = new RegExp(key);
    if (regexp.exec(req.params.collection)) {
      document = exports.pre_commit_hooks[key](document);
    }
  }

  var collection = mongo.db(database, {safe:true}).collection(req.params.collection);
  collection.insert(document, {}, function (err) {
      if (err) {
        winston.info('Insert into MongoDB failed: %s', err);
        return res.error('INVALID_REQUEST', err);
      }

      res.send(document);
  });
});

app.post('/:collection/:id/delete', function(req, res) { 
  res = _(res);

  var id = req.body && req.body._id;

  if (!id) {
    winston.info('Received mongoo delete request without id.');
    return res.error('INVALID_REQUEST');
  }

  var collection = mongo.db(database, {safe:true}).collection(req.params.collection);
  var spec = {'_id': new BSON.ObjectID(id)};

  collection.remove(spec, function (err) {
      if (err) {
        winston.info('Deleting item from MongoDB failed: %s', err);
        return res.error('INVALID_REQUEST', err);
      }

      res.send({});
  });
});

app.post('/:collection/update', function(req, res) { 
  res = _(res);

  var document = req.body;
  var id = document._id;

  if (!document) {
    winston.info('Received mongoo update request without body.');
    return res.error('INVALID_REQUEST');
  }

  // We must remove the _id to avoid a merge conflict on update.
  delete document._id;

  var collection = mongo.db(database, {safe:true}).collection(req.params.collection);
  var spec = {'_id': new BSON.ObjectID(id)};
  collection.update(spec, document, true, function (err, items) {
      if (err) {
        winston.info('Updating item(s) in MongoDB failed: %s', err);
        return res.error('INVALID_REQUEST', err);
      }

      res.send(items);
  });
});