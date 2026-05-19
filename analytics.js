/**
 * CleanGutters Lighting — Self-Hosted Pageview Analytics
 * Zero third-party dependencies. No cookies. No PII.
 */
(function () {
  'use strict';
  var HOST = window.location.hostname;
  if (HOST !== 'cleangutterslighting.com' && HOST !== 'www.cleangutterslighting.com') return;
  var URL = 'https://ccleangutters.agents.runlobster.com/api/analytics/track' +
    '?p=' + encodeURIComponent(window.location.pathname) +
    '&r=' + encodeURIComponent(document.referrer || '') +
    '&w=' + window.screen.width +    '&t=' + Date.now();
  if (navigator.sendBeacon) {
    navigator.sendBeacon(URL);
  } else {
    var img = new Image();
    img.src = URL;
    img.onload = img.onerror = function () { img = null; };
  }
})();
