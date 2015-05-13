import ConsoleReporter from './ConsoleReporter';
import formatStackTrace from '../formatStackTrace';

const SOURCE_MAP = fetchSourceMap();

window.__wpbbt_sourceMap__ = SOURCE_MAP;

function fetchSourceMap() {
  let request = new XMLHttpRequest();
  request.open('GET', '/bundle.js.map', false);
  request.send(null);

  if (request.status === 200) {
    return JSON.parse(request.responseText);
  } else {
    return null;
  }
}

let __ExceptionFormatter = jasmineRequire.ExceptionFormatter();
jasmineRequire.ExceptionFormatter = function() {
  return function() {
    let underlying = new __ExceptionFormatter();
    this.message = underlying.message;
    this.stack = function(err) {
      if (!err || !err.stack || !SOURCE_MAP) {
        return underlying.stack(err);
      } else {
        return formatStackTrace(SOURCE_MAP, err.stack);
      }
    };
  };
};

window.jasmine = jasmineRequire.core(jasmineRequire);

jasmineRequire.html(jasmine);

let env = jasmine.getEnv();

let jasmineInterface = jasmineRequire.interface(jasmine, env);

extend(window, jasmineInterface);

let queryString = new jasmine.QueryString({
  getWindowLocation: function() { return window.location; }
});

let catchingExceptions = queryString.getParam("catch");
env.catchExceptions(typeof catchingExceptions === "undefined" ? true : catchingExceptions);

let throwingExpectationFailures = queryString.getParam("throwFailures");
env.throwOnExpectationFailure(throwingExpectationFailures);

let htmlReporter = new jasmine.HtmlReporter({
  env: env,
  onRaiseExceptionsClick: function() { queryString.navigateWithNewParam("catch", !env.catchingExceptions()); },
  onThrowExpectationsClick: function() { queryString.navigateWithNewParam("throwFailures", !env.throwingExpectationFailures()); },
  addToExistingQueryString: function(key, value) { return queryString.fullStringWithNewParam(key, value); },
  getContainer: function() { return document.body; },
  createElement: function() { return document.createElement.apply(document, arguments); },
  createTextNode: function() { return document.createTextNode.apply(document, arguments); },
  timer: new jasmine.Timer()
});

let consoleReporter = new ConsoleReporter({
  timer: new jasmine.Timer(),
  print: function() {
    console.log.apply(console, arguments)
  }
});

env.addReporter(jasmineInterface.jsApiReporter);
env.addReporter(htmlReporter);
env.addReporter(consoleReporter);

let specFilter = new jasmine.HtmlSpecFilter({
  filterString: function() { return queryString.getParam("spec"); }
});

env.specFilter = function(spec) {
  return specFilter.matches(spec.getFullName());
};

window.setTimeout = window.setTimeout;
window.setInterval = window.setInterval;
window.clearTimeout = window.clearTimeout;
window.clearInterval = window.clearInterval;

let currentWindowOnload = window.onload;

window.onload = function() {
  if (currentWindowOnload) {
    currentWindowOnload();
  }
  htmlReporter.initialize();
  env.execute();
};

function extend(destination, source) {
  for (let property in source) destination[property] = source[property];
  return destination;
}