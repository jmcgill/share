// Scaffolding: A light weight collection of functions to quickly prototype applications
// with node.js and mongodb.

var scaffolding = Scaffolding();

// Automatically catch and log all exceptions to the server.
window.onerror = function(msg, url, line) {
  var obj = {
    type: 'JS_EXCEPTION',
    details: msg,
    url: url,
    line: line
  };
  scaffolding.query("/error", obj);
};

function Scaffolding() {
  // HTTP query method. Send JSON data to node.js using POST, with automattic
  // retry handling and error logging.
  //
  // Overwrite scaffolding.onError to handle error strings more gracefully than
  // alert. 
  var makeAjaxErrorHandler_ = function(url) {
    return function(xhr, textStatus, errorText) {
      var error_callback = scaffolding.onError || alert;
      var obj = {
        type: 'NETWORK',
        details: errorText,
        url: url
      };
      $.query("/error", obj);

      error_callback("An error occured. Your last action may not have been saved.");
    }
  };

  var query_ = function(url, data, callback) {
    $.ajax({
      url: url,
      data: JSON.stringify(data),
      type: "POST",
      contentType: "application/json; charset=utf-8",
      success: callback,
      error: makeAjaxErrorHandler_(url)
    });
  };

  return {
    query: query_
  }
};