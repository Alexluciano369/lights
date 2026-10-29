(function () {
  if (window.cgTracking) return;
  var MEASUREMENT_ID = "G-E7NG44429T";
  var ADS_ID = "AW-18146670851";
  var FORM_CONVERSION = "AW-18146670851/HZx0COTCwqocEIPygM1D";
  // Matches the submit-lead duplicate window, so a resent accepted inquiry is not counted twice.
  var DUPLICATE_WINDOW_MS = 2 * 60 * 1000;
  var STORE_KEY = "cg_counted_leads";
  var TEST_MODE = /(?:^|[?&])test=1(?:&|$)/.test(window.location.search.slice(1));

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID);
    window.gtag("config", ADS_ID);
    var analyticsScript = document.createElement("script");
    analyticsScript.async = true;
    analyticsScript.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
    document.head.appendChild(analyticsScript);
  }

  var log = [];

  function send(name, parameters) {
    log.push({ event: name, params: parameters, suppressed: TEST_MODE });
    if (TEST_MODE) {
      try { console.info("[test mode] tracking suppressed:", name, parameters); } catch (e) {}
      return;
    }
    try { window.gtag("event", name, parameters); } catch (e) {}
  }

  function fingerprint(form) {
    try {
      if (!form || !form.elements) return "";
      var name = form.elements.namedItem("name");
      var phone = form.elements.namedItem("phone");
      var n = name && name.value ? String(name.value).trim().toLowerCase() : "";
      var p = phone && phone.value ? String(phone.value).replace(/\D/g, "") : "";
      return n || p ? n + "|" + p : "";
    } catch (e) {
      return "";
    }
  }

  function readCounted() {
    try {
      var stored = JSON.parse(window.localStorage.getItem(STORE_KEY) || "{}");
      return stored && typeof stored === "object" ? stored : {};
    } catch (e) {
      return {};
    }
  }

  function alreadyCounted(key) {
    if (!key) return false;
    var now = Date.now();
    var counted = readCounted();
    Object.keys(counted).forEach(function (k) { if (now - counted[k] > DUPLICATE_WINDOW_MS) delete counted[k]; });
    var seen = !!counted[key];
    if (!seen) counted[key] = now;
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(counted)); } catch (e) {}
    return seen;
  }

  function newTransactionId() {
    return "lead-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  // Call only after the delivery service confirmed it accepted the inquiry. Never throws.
  function recordLead(form, parameters) {
    try {
      if (alreadyCounted(fingerprint(form))) {
        log.push({ event: "generate_lead", skipped: "duplicate" });
        return;
      }
      var params = {};
      var source = parameters && typeof parameters === "object" ? parameters : {};
      Object.keys(source).forEach(function (k) { params[k] = source[k]; });
      if (!params.form_name && form && form.id) params.form_name = form.id;
      var transactionId = newTransactionId();
      send("generate_lead", params);
      send("conversion", { send_to: FORM_CONVERSION, transaction_id: transactionId });
    } catch (e) {}
  }

  document.addEventListener("click", function (event) {
    try {
      var link = event.target && event.target.closest && event.target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href") || "";
      if (href.indexOf("tel:") === 0) {
        send("phone_click", {
          event_category: "lead",
          link_url: href,
          page_location: window.location.href
        });
      } else if (href.indexOf("mailto:") === 0 && /estimate|quote/i.test(href)) {
        send("quote_request_click", {
          event_category: "lead",
          link_url: href.split("?")[0],
          page_location: window.location.href
        });
      }
    } catch (e) {}
  });

  window.cgTracking = { testMode: TEST_MODE, log: log };
  window.cgLead = recordLead;
})();
