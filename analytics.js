/**
 * CleanGutters Lighting — Self-Hosted Pageview Analytics
 * Zero third-party dependencies. No cookies. No PII.
 * Pings our analytics server with path, referrer, and screen width.
 */
(function () {
  'use strict';

  var LOCATION = window.location;
  var DOCUMENT = window.document;
  var NAVIGATOR = window.navigator;
  var SCREEN = window.screen;

  // Only track on the production domain
  var HOST = LOCATION.hostname;
  if (
    HOST !== 'cleangutterslighting.com' &&
    HOST !== 'www.cleangutterslighting.com' &&
    HOST.indexOf('.localhost') === -1 &&
    HOST !== 'localhost'
  ) {
    return;
  }

  var PATH = LOCATION.pathname;
  var REFERRER = DOCUMENT.referrer || '';
  var SCREEN_WIDTH = SCREEN.width;
  var NOW = Date.now();

  // Ping our analytics server (cross-origin, uses sendBeacon + no-cors Image fallback)
  var ANALYTICS_HOST = 'https://ccleangutters.agents.runlobster.com';
  var URL =
    ANALYTICS_HOST +
    '/api/analytics/track' +
    '?p=' +
    encodeURIComponent(PATH) +
    '&r=' +
    encodeURIComponent(REFERRER) +
    '&w=' +
    SCREEN_WIDTH +
    '&t=' +
    NOW;

  // sendBeacon for non-blocking delivery
  if (NAVIGATOR.sendBeacon) {
    NAVIGATOR.sendBeacon(URL);
  } else {
    // Fallback: Image beacon (works everywhere)
    var img = new Image();
    img.src = URL;
    img.onload = img.onerror = function () {
      img = null;
    };
  }
})();
