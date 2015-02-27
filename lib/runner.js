/* global phantom: true */
/* global require: true */
/* global CSSCriticalPath: true */
/* global window: true */
/* global document: true */
/* global document: true */
/* jshint evil: true */

(function(){
  'use strict';

  var system = require('system');

  var site = system.args[1];
  var width = system.args[2];
  var height = system.args[3];
  var ignoreConsole = system.args[7] === '--ignoreConsole' ? true : false;

  var parserOptions = {
    excludeSelectors: system.args[4],
    enabledHosts: system.args[5],
    keepInlineStyles: system.args[6]
  };

  /**
   * Wait until the test condition is true or a timeout occurs. Useful for waiting
   * on a server response or for a ui change (fadeIn, etc.) to occur.
   *
   * Borrowed from the phantomjs examples library.
   *
   * @param testFx javascript condition that evaluates to a boolean,
   * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
   * as a callback function.
   * @param onReady what to do when testFx condition is fulfilled,
   * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
   * as a callback function.
   * @param timeout the max amount of time to wait in milliseconds.
   * Defaults to 3000.
   */
  function waitFor(testFx, onReady, timeout) {
    var maxTimeout = timeout ? timeout : 3000; //< Default Max Timout is 3s
    var start = new Date().getTime();
    var condition = false;
    var interval = setInterval(function() {
      if ((new Date().getTime() - start < maxTimeout) && !condition) {
        // If not time-out yet and condition not yet fulfilled.
        condition = (typeof(testFx) === 'string' ? eval(testFx) : testFx());
      }
      else {
        if (!condition) {
          // Condition still not fulfilled after timeout.
          throw new Error('waitFor() timed out.');
        }
        else {
          // Condition fulfilled (timeout and/or condition is 'true')
          typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
          clearInterval(interval); //< Stop this interval
        }
      }
    }, 250); //< repeat check every 250ms
  }

  // Set phantom error handler.
  var errorHandler = function(msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace && trace.length) {
      msgStack.push('TRACE:');
      trace.forEach(function(t) {
        msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
      });
    }
    system.stderr.write(msgStack.join("\n") );
    phantom.exit(1);
  };
  phantom.onError = errorHandler;

  var page = require('webpage').create();

  // Set page event handlers before loading.
  page.onError = errorHandler;
  page.onConsoleMessage = function (msg) {
    if (!ignoreConsole) {
      system.stdout.write('Console output: ' + msg + "\n");
      system.stderr.write('Console error: ' + msg + "\n");
    }
  };

  page.onCallback = function(data) {
    system.stdout.write(data);
    phantom.exit(0);
  };

  // Configure viewport size.
  page.viewportSize = {
    width: width,
    height: height
  };

  // Allow script running.
  page.settings.webSecurityEnabled = false;
  page.settings.localToRemoteUrlAccessEnabled = true;

  page.open(site, function(status) {
    if (status !== 'success') {
      throw new Error('Page did not open: ' + site);
    }

    if (!page.injectJs('./parser.js')) {
      throw new Error('Could not inject parser script to ' + site);
    }

    waitFor(function() {
      // Check in the page if a specific element is now visible.
      return page.evaluate(function() {
        return (typeof CSSCriticalPath === 'function');
      });
    }, function() {

      // Run the parser.
      page.evaluate(function() {
        var parser = new CSSCriticalPath(window, document);
        var CSSList = parser.generateCSS();

        // Trigger callback with returned output.
        try {
          window.callPhantom(CSSList);
        }
        catch (err) {
          throw new Error(err);
        }
      });
    });
  });

}());
