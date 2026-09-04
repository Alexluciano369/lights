(function () {
  var MEASUREMENT_ID = "G-E7NG44429T";

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID);
    var analyticsScript = document.createElement("script");
    analyticsScript.async = true;
    analyticsScript.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
    document.head.appendChild(analyticsScript);
  }

  function sendEvent(name, parameters) {
    try {
      if (typeof window.gtag === "function") window.gtag("event", name, parameters || {});
    } catch (error) {}
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[href]");
    if (!link) return;
    var href = link.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) {
      sendEvent("phone_click", {
        event_category: "lead",
        link_url: href,
        page_location: window.location.href
      });
    } else if (href.indexOf("mailto:") === 0 && /estimate|quote/i.test(href)) {
      sendEvent("quote_request_click", {
        event_category: "lead",
        link_url: href.split("?")[0],
        page_location: window.location.href
      });
    }
  });

  var thankYou = document.getElementById("thankYouMessage");
  if (thankYou && typeof MutationObserver === "function") {
    var sent = false;
    new MutationObserver(function () {
      if (!sent && window.getComputedStyle(thankYou).display !== "none") {
        sent = true;
        sendEvent("generate_lead", {
          event_category: "lead",
          method: "website_form",
          page_location: window.location.href
        });
      }
    }).observe(thankYou, { attributes: true, attributeFilter: ["style", "class"] });
  }
})();
