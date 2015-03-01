# Critical CSS

Detects Above the Fold styles on sites and assembles a stylesheet of them.

Opens any web page on an accessible URL and runs a parser to detect above the
fold CSS in the headless browser.

## How it works

The module opens the supplied URL and runs a parser script which returns the
stylesheet consisting critical style rules. This can be further processed in a
callback function.

Operation is not limited to checking a single stylesheet as the parser script is
injected to and runs in [phantomjs](http://phantomjs.org/).

## Quick Start

Install the module via npm: `npm install critical-css`

```javascript
var criticalCss = require('critical-css');

var options = {
  width: 1050,
  height: 800,
  enabledOrigins: ['www.example.com']
}

criticalCss.generate('http://www.example.com/', function(err, output) {
  if (err) {
    throw new Error(err);
  }
  // Print the styles to the console.
  console.log(output);
});

```

## Documentation

`.generate(url, [options, callback])`

### url

The URL of the site to process. Must be accessible by phantom.

### options

An optional object of options.

#### options.width

Type: `Integer` Default value: `1200`

The width of the viewport used in the browser. Used to determine what is "above
the fold", i.e what is visible during rendering the page initially.

#### options.height

Type: `Integer` Default value: `900`

The height of the viewport used in the browser. Used to determine what is "above
the fold", i.e what is visible during rendering the page initially.

#### options.excludeSelectors

Type: `Array` Default value: `[]`

An array of CSS selectors or basically any pattern. These are matched against
every individual style declaration and if the patterns provided here match the
style rule is discarded from the output.

This can be useful to exclude certain 3rd party elements or any styles that are
loaded asynchronously anyways.

##### Example:

```javascript
options = {
  excludeSelectors: [
    '.dfp-tag-wrapper', // Asynchronous DFP ad formatting
    'html, body, div'  // CSS resets starting with "html, body, div"
  ]
};
```

#### options.enabledOrigins

Type: `Array` Default value: `[]`

An array of host names to serve as a whitelist where CSS can originate from. Any
`CSSRuleList` objects with `parentStyleSheet.href` not having this host name are
excluded from the critical CSS.

This can be useful to exclude certain styles supplied by 3rd party widgets that
are loaded asynchronously anyways.

##### Example:

```javascript
options = {
  enabledOrigins: ['cdn-1.example.com', 'cdn-2.example.com']
};
```

#### options.keepInlineStyles

Type: `Boolean` Default value: `false`

Controls whether non-external styles should be included. These are usually rules
which are already inlined or are set by JavaScript. These are excluded by
default.

#### options.ignoreConsole

Type: `Boolean` Default value: `true`

Controls console output from the headless browser should be added to the output.
Useful for debugging purposes.

#### options.maxBuffer

Type: `Integer` Default value: `819200`

Sets the output buffer for the child process.


### callback

Type: `Function` Default value:

```javascript
function(err, output) {
  if (err) {
    throw new Error(err);
  }
  console.log(output);
};
```

An optional callback function with `output` being the value of `stdout` from the
child process (i.e the headless browser).


## Contributing

This project is under active development.
New features, tests and examples are in the works now.

Please head over to the issue queue to add suggestions or file bug reports.


## Changelog

* 0.1.0 - Initial release


## License

Copyright (c) 2015 Attila Beregszaszi
Licensed under the MIT license.

Development was sponsored by [Front Seed Labs](http://frontseed.com/) and
[Dennis Publishing](http://www.dennis.co.uk/)
