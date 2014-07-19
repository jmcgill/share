var mongo = require('mongoskin');

exports.index = function(req, res) {
  res.render('index.html', {});
}