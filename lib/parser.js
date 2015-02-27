;(function(root) {

  var CSSCriticalPath = function(w, d, opts) {
    if (typeof w.getMatchedCSSRules !== 'function') {
      throw new Error('Browser is incompatible');
    }

    var opt = opts || {};
    var css = {};

    var pushCSS = function(r) {
      if (!css[r.selectorText]) {
        css[r.selectorText] = {};
      }

      var styles = r.style.cssText.split(/;(?![A-Za-z0-9])/);
      for (var i = 0; i < styles.length; i++) {
        if (!styles[i].trim()) {
          continue;
        }
        var pair = styles[i].split(': ');
        pair[0] = pair[0].trim();
        pair[1] = pair[1].trim();
        css[r.selectorText][pair[0]] = pair[1];
      }
    };

    var parseTree = function() {
      // Get a list of all the elements in the view.
      var height = w.innerHeight;
      var walker = d.createTreeWalker(d, w.NodeFilter.SHOW_ELEMENT, function() {
        return w.NodeFilter.FILTER_ACCEPT;
      }, true);

      while (walker.nextNode()) {
        var node = walker.currentNode;
        var rect = node.getBoundingClientRect();
        if (rect.top < height || opt.scanFullPage) {
          var rules = [];

          // Add matching element rules.
          rules.push.apply(rules, ruleListToArray(w.getMatchedCSSRules(node)));

          // Going forward, add pseudo-element rules too.
          rules.push.apply(rules, ruleListToArray(w.getMatchedCSSRules(node, 'before')));
          rules.push.apply(rules, ruleListToArray(w.getMatchedCSSRules(node, 'after')));

          // Do not include if the style is not from an external stylesheet.
          // This means that the rule is either inline already or inlined by JS.
          if (!opt.keepInlineStyles) {
            rules = rules.filter(function(e) {
              return (!!e.parentStyleSheet.href);
            });
          }

          // Only include CSS originating from whitelisted host names.
          if (opt.enabledHosts) {
            rules = rules.filter(function(e) {
              var out = false, re;
              opt.enabledHosts.forEach(function(v) {
                re = new RegExp('^(https?:)?\/\/' + escapeRegExp(v) + '\/', 'i');
                if (e.parentStyleSheet.href === null || e.parentStyleSheet.href.match(re)) {
                  out = true;
                }
              });
              return out;
            });
          }

          // Do not include blacklisted selectors.
          if (opt.excludeSelectors) {
            rules = rules.filter(function(e) {
              var out = true, re;
              opt.excludeSelectors.forEach(function(v) {
                re = new RegExp(escapeRegExp(v), 'i');
                if (e.selectorText.match(re)) {
                  out = false;
                }
              });
              return out;
            });
          }

          if (!!rules) {
            for (var r = 0; r < rules.length; r++) {
              pushCSS(rules[r]);
            }
          }
        }
      }
    };

    var ruleListToArray = function(ruleset) {
      if (!ruleset || !ruleset.item) {
        return;
      }
      var ruleList = [];
      for (var i = 0; i < ruleset.length; i++) {
        ruleList.push(ruleset.item(i));
      }

      return ruleList;
    };

    var escapeRegExp = function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    };

    this.generateCSS = function() {
      var finalCSS = '';
      for (var k in css) {
        finalCSS += k + ' { ';
        for (var j in css[k]) {
          finalCSS += j + ': ' + css[k][j] + '; ';
        }
        finalCSS += '}\u000A';
      }

      return finalCSS;
    };

    parseTree();
  };

  root.CSSCriticalPath = CSSCriticalPath;

}(this));
