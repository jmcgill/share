var express = require('express'),
  cons = require('consolidate'),
  swig = require('swig');

var app = module.exports.app = express();
app.use(express.bodyParser());

var home = require('./routes/index.js'),
  mongoo = require('./routes/mongoo.js'),
  errors = require('./routes/errors.js');

// Configure SWIG as the default templating enginge.
app.engine('.html', cons.swig);
app.set('view engine', 'html');
swig.init({
	root: 'templates',
	allowErrors: true
});
app.set('views', 'templates');

// Routes
app.get('/', home.index);

// Static content
app.use("/src", express.static(__dirname + '/src'));
app.use("/lib", express.static(__dirname + '/lib'));

// A pre-commit hook applied to all insert commands for MongoDB.
var append_timestamp = function (document) {
	document.timestamp = new Date();
	return document;
}
mongoo.pre_commit_hooks[".*"] = append_timestamp;

app.listen(3000);