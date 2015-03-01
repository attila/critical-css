(function(exports) {

  var binPath = require('phantomjs').path;
  var execFile = require('child_process').execFile;
  var extend = require('xtend');
  var path = require('path');

  var DEFAULT_BUFFER_SIZE = 800*1024;

  /**
   * Run the the parser through phantom.
   */
  exports.generate = function(url, options, cb) {
    if (typeof url === 'undefined') {
      throw new Error('Missing url parameter.');
    }

    // Default callback function for handling phantomjs returns.
    var defaultCb = function(err, output) {
      if (err) {
        throw new Error(err);
      }
      console.log(output);
    };

    // Process config options.
    var defaults = {
      width: 1200,
      height: 900,
      excludeSelectors: [],
      enabledOrigins: [],
      keepInlineStyles: false,
      ignoreConsole: true,
      maxBuffer: DEFAULT_BUFFER_SIZE
    };

    // Fall back to defaults if no options or callbacks are provided.
    if (typeof options === 'undefined' && typeof cb === 'undefined') {
      cb = defaultCb;
      options = {};
      console.log('fall back to default options, default callback');
    }
    // Fall back to default options if only callback is provided.
    if (typeof options === 'function' && typeof cb === 'undefined') {
      cb = options;
      options = {};
      console.log('fall back to default options');
    }
    // Fall back to default callback if only options are provided.
    if (typeof cb === 'undefined') {
      cb = defaultCb;
      console.log('fall back to default callback');
    }

    var config = extend(defaults, options);

    var childArgs = [
      path.resolve(path.join(__dirname, 'lib', 'runner.js')),
      url,
      config.width,
      config.height,
      JSON.stringify(config.excludeSelectors),
      JSON.stringify(config.enabledOrigins),
      config.keepInlineStyles,
      (config.ignoreConsole) ? '--ignoreConsole' : false
    ];
    var phantomOptions = {
      maxBuffer: config.maxBuffer
    };

    // Call PhantomJS with our runner script.
    execFile(binPath, childArgs, phantomOptions, function(err, stdout, stderr) {
      if (err) {
        console.log('Something is awry with phantomjs...');
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

}(typeof exports === 'object' && exports || this));
