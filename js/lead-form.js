(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function submitLead(payload) {
    return fetch("https://cpbexrtitabqgrcfucbm.supabase.co/functions/v1/submit-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) { return res.json().then(function (body) { return res.ok && !!body && body.success === true; }); });
  }

  var forms = document.querySelectorAll("form[data-lead-form]");
  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (form.dataset.sending === "1") return;
      form.dataset.sending = "1";
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
      };

      submitLead(payload)
        .then(function (accepted) {
          if (accepted) {
            if (status) { status.className = "form-status ok"; status.textContent = "Thanks! We received your request and will reach out shortly."; }
            form.reset();
            try {
              if (typeof gtag === "function") {
                gtag("event", "generate_lead", { event_category: "lead", event_label: payload.service || "unknown" });
              }
            } catch (e) {}
          } else {
            throw new Error("Not accepted");
          }
        })
        .catch(function () {
          if (status) { status.className = "form-status err"; status.textContent = "Sorry, that didn't go through. Please call 856-874-6640 or try again."; }
        })
        .finally(function () {
          form.dataset.sending = "";
          if (button) { button.disabled = false; button.textContent = originalLabel; }
        });
    });
  });
})();
