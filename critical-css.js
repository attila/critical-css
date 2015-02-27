(function(module) {

  var binPath = require('phantomjs').path;
  var execFile = require('child_process').execFile;
  var path = require('path');

  var DEFAULT_BUFFER_SIZE = 800*1024;

  /**
   * Run the the parser through phantom.
   */
  module.exports = function(url, options, cb) {
    if (typeof url === 'undefined') {
      throw new Error('Missing url parameter.');
    }

    // Default callback function for handling phantomjs returns.
    var defaultCb = function(err, output) {
      if (err) {
        throw new Error(err);
      }
      return output;
    };

    // Fall back to defaults if no options or callbacks are provided.
    if (typeof options === 'undefined' && typeof cb === 'undefined') {
      options = {};
      cb = defaultCb;
    }
    // Fall back to default options if only callback is provided.
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    var width = 1200;
    var height = 900;
    var excludeSelectors = options.excludeSelectors || [];
    var includeSelectors = options.includeSelectors || [];

    var childArgs = [
      path.resolve(path.join(__dirname, 'lib', 'runner.js')),
      url,
      width,
      height,
      JSON.stringify(excludeSelectors),
      JSON.stringify(includeSelectors)
    ];
    var phantomOptions = {
      maxBuffer: options.buffer || DEFAULT_BUFFER_SIZE
    };

    // Call PhantomJS with our runner script.
    execFile(binPath, childArgs, phantomOptions, function(err, stdout, stderr) {
      if (err) {
        console.log('Something is awry wrong with phantomjs...');
        if (stderr) {
          err.message = stderr;
        }
        cb(err, null);
      }
      else {
        cb(null, stdout);
      }
    });
  };

}(typeof module === "object" && typeof module.exports === "object" && module || this));
