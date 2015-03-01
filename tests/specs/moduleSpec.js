(function(exports) {

  var extend = require('xtend');
  var path = require('path');
  var criticalCss = require(path.join('..', '..', 'critical-css.js'));
  var url = 'http://127.0.0.1:8999/site.html';

  var defaultOutput = "body { position: relative; }\np:first-child { text-align: center; }";
  var tallOutput = "body { position: relative; }\np:first-child { text-align: center; }\n#down { position: absolute; top: 4000px; }";
  var inlineOutput = "body { position: relative; }\nbody.inline { background-color: rgb(255, 255, 255); }\np:first-child { text-align: center; }";
  var excludedOutput = "body { position: relative; }";
  var consoledOutput = "Console output: test message\nbody { position: relative; }\np:first-child { text-align: center; }";

  var defaultOptions = {
    width: 1200,
    height: 900,
    excludeSelectors: [],
    enabledOrigins: [],
    keepInlineStyles: false,
    ignoreConsole: true,
    maxBuffer: 800*1024
  };

  /**
   * Strip whitespaces, tabs and newlines and replace with one space.
   *
   * @param string
   */
  function stripWhitespace(string) {
    return string.replace(/[\r\n]+/mg, ' ').replace(/\s+/gm, '');
  }

  exports.generate = {
    setUp: function(done) {
      this.options = extend(defaultOptions);
      done();
    },

    tearDown: function(done) {
      delete this.options;
      done();
    },

    'no arguments': function(test) {
      test.expect(1);
      // tests here
      test.throws(function() {
        criticalCss.generate();
      }, TypeError, 'Should throw type error if there is no url');
      test.done();
    },

    'url given but is not string': function(test) {
      test.expect(1);
      // tests here
      test.throws(function() {
        criticalCss.generate(42);
      }, TypeError, 'Should throw type error if url is not string');
      test.done();
    },

    'fall back to default options': function(test) {
      test.expect(1);
      // tests here
      criticalCss.generate(url, function(err, stdout){
        if (err) {
          throw new Error(err);
        }
        else {
          test.equal(stripWhitespace(stdout), stripWhitespace(defaultOutput), "Content should match");
          test.done();
        }
      });
    },

    'set viewport': function(test) {
      test.expect(1);
      // tests here
      this.options.height = 5000;
      criticalCss.generate(url, this.options, function(err, stdout) {
        if (err) {
          throw new Error(err);
        }
        else {
          test.equal(stripWhitespace(stdout), stripWhitespace(tallOutput), "Content should match");
          test.done();
        }
      });
    },

    'include inline styles': function(test) {
      test.expect(1);
      // tests here
      this.options.keepInlineStyles = true;
      criticalCss.generate(url, this.options, function(err, stdout) {
        if (err) {
          throw new Error(err);
        }
        else {
          test.equal(stripWhitespace(stdout), stripWhitespace(inlineOutput), "Content should match");
          test.done();
        }
      });
    },

    'exclude matching selectors': function(test) {
      test.expect(1);
      // tests here
      this.options.excludeSelectors = ['p:first-child'];
      criticalCss.generate(url, this.options, function(err, stdout) {
        if (err) {
          throw new Error(err);
        }
        else {
          test.equal(stripWhitespace(stdout), stripWhitespace(excludedOutput), "Content should match");
          test.done();
        }
      });
    },

    'whitelist styles based on origins': function(test) {
      test.expect(1);
      // tests here
      this.options.enabledOrigins = ['example.com'];
      criticalCss.generate(url, this.options, function(err, stdout) {
        if (err) {
          throw new Error(err);
        }
        else {
          test.equal(stripWhitespace(stdout), '', "Content should be empty");
          test.done();
        }
      });
    },

    'include console messages': function(test) {
      test.expect(1);
      // tests here
      this.options.ignoreConsole = false;
      criticalCss.generate(url + '#log', this.options, function(err, stdout) {
        if (err) {
          throw new Error(err);
        }
        else {
          test.equal(stripWhitespace(stdout), stripWhitespace(consoledOutput), "Content should match");
          test.done();
        }
      });
    },

    'throw from within phantom': function(test) {
      test.expect(1);
      // tests here
      criticalCss.generate(url + '#fail', this.options, function(err) {
        test.equal(!!err, true, 'Should throw error');
        test.done();
      });
    },

  };

}(typeof exports === 'object' && exports || this));
