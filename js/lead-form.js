(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var SUPA_URL = "https://cpbexrtitabqgrcfucbm.supabase.co";
  var SUPA_ANON =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYmV4cnRpdGFicWdyY2Z1Y2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTk3NjIsImV4cCI6MjA3ODE5NTc2Mn0.tXTGwH7fN8HrA3dQLaHsldetmc4LWXEtCX1GGHhscEM";

  function submitLead(payload) {
    return fetch(SUPA_URL + "/rest/v1/leads", {
      method: "POST",
      headers: {
        apikey: SUPA_ANON,
        Authorization: "Bearer " + SUPA_ANON,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
  }

  function emailNotify(payload) {
    return fetch("https://formsubmit.co/ajax/cleangutters2008@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  var forms = document.querySelectorAll("form[data-lead-form]");
  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = form.querySelector(".form-status");
      var button = form.querySelector('button[type="submit"]');
      var originalLabel = button ? button.textContent : "";
      if (button) { button.disabled = true; button.textContent = "Sending..."; }
      if (status) { status.className = "form-status"; status.textContent = ""; }

      var data = Object.fromEntries(new FormData(form).entries());
      function cap(value, max) {
        return String(value == null ? "" : value).slice(0, max);
      }
      var payload = {
        name: cap(data.name, 200),
        email: cap(data.email, 320),
        phone: cap(data.phone, 50),
        address: cap(data.address, 300),
        city: cap(form.dataset.city || data.city, 120),
        service: cap(data.service || form.dataset.service, 100),
        message: cap(data.message, 5000),
        page_url: cap(window.location.href, 2000),
        referrer: cap(document.referrer, 2000),
        user_agent: cap(navigator.userAgent, 500),
      };

      Promise.allSettled([submitLead(payload), emailNotify(payload)])
        .then(function (results) {
          var dbOk = results[0].status === "fulfilled" && results[0].value && results[0].value.ok;
          var mailOk = results[1].status === "fulfilled" && results[1].value && results[1].value.ok;
          if (dbOk || mailOk) {
            if (status) { status.className = "form-status ok"; status.textContent = "Thanks! We received your request and will reach out shortly."; }
            form.reset();
            try {
              if (typeof gtag === "function") {
                gtag("event", "generate_lead", { event_category: "lead", event_label: payload.service || "unknown" });
              }
            } catch (e) {}
          } else {
            throw new Error("Both channels failed");
          }
        })
        .catch(function () {
          if (status) { status.className = "form-status err"; status.textContent = "Sorry, that didn't go through. Please call 856-874-6640 or try again."; }
        })
        .finally(function () {
          if (button) { button.disabled = false; button.textContent = originalLabel; }
        });
    });
  });
})();
