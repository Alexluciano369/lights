import { mkdir, writeFile, readdir, stat, copyFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { cities, REGION_NOTES, ECO_PROFILES } from "../data/cities.mjs";
import { services, serviceMap } from "../data/services.mjs";
import { testimonials } from "../data/testimonials.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "dist");

const SKIP_TOP = new Set([
  "dist",
  "node_modules",
  "scripts",
  "data",
  "supabase",
  ".env",
  ".env.example",
  ".bolt",
  ".git",
  "package.json",
  "package-lock.json",
  "serve.json",
  "README.md",
]);

async function copyTree(src, dst) {
  const entries = await readdir(src, { withFileTypes: true });
  await mkdir(dst, { recursive: true });
  for (const entry of entries) {
    const from = join(src, entry.name);
    const to = join(dst, entry.name);
    if (entry.isDirectory()) {
      await copyTree(from, to);
    } else if (entry.isFile()) {
      await copyFile(from, to);
    }
  }
}

async function copyStaticAssets() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_TOP.has(entry.name)) continue;
    const from = join(ROOT, entry.name);
    const to = join(OUT, entry.name);
    if (entry.isDirectory()) {
      await copyTree(from, to);
    } else if (entry.isFile()) {
      await copyFile(from, to);
    }
  }
}
const SITE = "https://cleangutterslighting.com";
const PHONE = "856-874-6640";
const PHONE_TEL = "8568746640";
const PHONE_INTL = "+1-856-874-6640";
const EMAIL = "cleangutters2008@gmail.com";
const FOUNDING_DATE = "2009";
const BIZ_NAME = "CleanGutters Lighting";
const BIZ_ADDR = { street: "Cherry Hill, NJ", city: "Cherry Hill", region: "NJ", postal: "08002", country: "US" };
const BIZ_GEO = { lat: 39.9346, lng: -75.0307 };
const AGG_RATING = { value: "4.9", count: "45" };
const HOURS = [
  { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], open: "07:30", close: "18:00" },
  { days: ["Saturday"], open: "08:00", close: "15:00" },
];

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const interp = (tpl, ctx) =>
  String(tpl ?? "").replace(/{{\s*(\w+)\s*}}/g, (_, k) => ctx[k] ?? "");

async function write(rel, content) {
  const abs = resolve(OUT, rel);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content, "utf8");
}

function localBusinessSchema(city, canonical) {
  const openingHoursSpecification = HOURS.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days,
    opens: h.open,
    closes: h.close,
  }));
  const areaServed = city
    ? {
        "@type": "City",
        name: `${city.name}, ${city.state}`,
        containedInPlace: city.county
          ? { "@type": "AdministrativeArea", name: `${city.county}, ${city.stateFull}` }
          : undefined,
        address: {
          "@type": "PostalAddress",
          addressLocality: city.name,
          addressRegion: city.state,
          addressCountry: "US",
        },
      }
    : cities.map((c) => ({
        "@type": "City",
        name: `${c.name}, ${c.state}`,
        address: { "@type": "PostalAddress", addressLocality: c.name, addressRegion: c.state, addressCountry: "US" },
      }));
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": SITE + "/#business",
    name: BIZ_NAME,
    description: "Gutter guard installation, LeafBlaster Pro micro-mesh gutter guards, seamless gutters, gutter cleaning, and permanent LED outdoor lighting across South Jersey, Eastern PA, and Delaware.",
    keywords: "gutter guards, gutter guard installation, gutter guards near me, LeafBlaster Pro micro-mesh gutter guards, permanent outdoor lighting, seamless gutters, gutter cleaning",
    url: SITE,
    telephone: PHONE_INTL,
    email: EMAIL,
    priceRange: "$",
    foundingDate: FOUNDING_DATE,
    image: SITE + "/logo.png",
    logo: SITE + "/logo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: BIZ_ADDR.street,
      addressLocality: BIZ_ADDR.city,
      addressRegion: BIZ_ADDR.region,
      postalCode: BIZ_ADDR.postal,
      addressCountry: BIZ_ADDR.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: city ? city.lat : BIZ_GEO.lat, longitude: city ? city.lng : BIZ_GEO.lng },
    openingHoursSpecification,
    aggregateRating: { "@type": "AggregateRating", ratingValue: AGG_RATING.value, reviewCount: AGG_RATING.count },
    areaServed,
    sameAs: [],
    ...(canonical ? { mainEntityOfPage: canonical } : {}),
  };
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

function serviceSchema(service, city, canonical) {
  const stypes = Array.isArray(service.serviceTypes) ? service.serviceTypes : [service.shortName];
  const areaServed = city
    ? {
        "@type": "City",
        name: `${city.name}, ${city.state}`,
        ...(city.county
          ? { containedInPlace: { "@type": "AdministrativeArea", name: `${city.county}, ${city.stateFull}` } }
          : {}),
        address: { "@type": "PostalAddress", addressLocality: city.name, addressRegion: city.state, addressCountry: "US" },
      }
    : cities.map((c) => ({
        "@type": "City",
        name: `${c.name}, ${c.state}`,
        address: { "@type": "PostalAddress", addressLocality: c.name, addressRegion: c.state, addressCountry: "US" },
      }));
  const catalogItems = city
    ? services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.shortName },
        url: `${SITE}/locations/${city.slug}/${s.slug}`,
      }))
    : services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.shortName },
        url: `${SITE}/${s.slug === "gutter-guards" ? "gutter-guards" : s.slug}`,
      }));
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: city ? `${service.name} in ${city.name}, ${city.state}` : service.name,
    description: city
      ? `${service.tagline} Serving ${city.name}, ${city.state}${city.county ? ` and the ${city.county} area` : " and surrounding neighborhoods"}.`
      : service.tagline,
    serviceType: stypes,
    keywords: service.keywordFocus,
    provider: {
      "@id": SITE + "/#business",
      "@type": "HomeAndConstructionBusiness",
      name: BIZ_NAME,
      telephone: PHONE_INTL,
      foundingDate: FOUNDING_DATE,
      priceRange: "$",
    },
    areaServed,
    url: canonical,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: city ? `${service.shortName} offers in ${city.name}` : `${service.shortName} offers`,
      itemListElement: catalogItems,
    },
  };
}

function faqSchema(faqs, ctx) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: interp(f.q, ctx),
      acceptedAnswer: { "@type": "Answer", text: interp(f.a, ctx) },
    })),
  };
}

const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

// Single source of truth for the site's Content-Security-Policy.
// Every host listed here was taken from an exhaustive sweep of the resources the
// site actually loads (analytics, fonts, stock imagery, the YouTube embed, the
// lead database and the lead email relay). Nothing else may load.
const CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://ccleangutters.agents.runlobster.com https://bolt.new https://app.trysoro.com; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://app.trysoro.com; " +
  "img-src 'self' data: blob: https://images.pexels.com https://cleangutterslighting-prod.netlify.app https://www.google-analytics.com https://www.googletagmanager.com https://img.youtube.com https://i.ytimg.com https://app.trysoro.com; " +
  "font-src 'self' data: https://fonts.gstatic.com https://app.trysoro.com; " +
  "connect-src 'self' https://cpbexrtitabqgrcfucbm.supabase.co https://formsubmit.co https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://ccleangutters.agents.runlobster.com https://app.trysoro.com; " +
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://app.trysoro.com; " +
  "object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests";

function head({ title, description, canonical, ogImage, jsonLdBlocks, geo }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#1e3a5f">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:site_name" content="${esc(BIZ_NAME)}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(ogImage)}">
${geo ? `<meta name="geo.region" content="US-${esc(geo.state)}">
<meta name="geo.placename" content="${esc(geo.name)}, ${esc(geo.stateFull)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : ""}
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" as="image" href="/inner-hero-bg.webp">
<link rel="stylesheet" href="/styles.css">
${jsonLdBlocks.join("\n")}
</head>
<body>
<a href="#main" class="skip-link">Skip to main content</a>`;
}

function header() {
  return `<header class="site-header">
<div class="bar">
<a href="/" class="brand" aria-label="${esc(BIZ_NAME)} home">
<picture><source srcset="/logo.webp" type="image/webp"><img src="/logo2.png" alt="${esc(BIZ_NAME)} logo" width="40" height="40"></picture>
<span class="brand-name"><span class="clean">CleanGutters</span> <span class="lighting">Lighting</span></span>
</a>
<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle navigation">Menu</button>
<nav id="primary-nav" class="primary-nav" aria-label="Primary">
<a href="/">Home</a>
<a href="/gutters">Gutter Guards</a>
<a href="/lighting">Outdoor Lighting</a>
<a href="/gutter-services">Services</a>
<a href="/service-areas">Service Areas</a>
<a href="/reviews">Reviews</a>
<a href="/blog">Blog</a>
</nav>
<a href="tel:${PHONE_TEL}" class="header-cta" aria-label="Call ${PHONE}">Call ${PHONE}</a>
</div>
</header>`;
}

function breadcrumbs(items) {
  return `<div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items
    .map((it, i, arr) =>
      i === arr.length - 1
        ? `<li aria-current="page">${esc(it.name)}</li>`
        : `<li><a href="${esc(it.href)}">${esc(it.name)}</a></li>`
    )
    .join("")}</ol></nav></div>`;
}

function reviewsFor(citySlug, serviceSlug) {
  const city = testimonials.filter((t) => t.city.toLowerCase().startsWith(cities.find((c) => c.slug === citySlug).name.toLowerCase()));
  const svc = serviceSlug ? testimonials.filter((t) => t.service === serviceSlug) : [];
  const pool = [...city, ...svc, ...testimonials].filter((v, i, a) => a.indexOf(v) === i);
  return pool.slice(0, 3);
}

function reviewGrid(list) {
  return `<div class="review-grid">${list
    .map(
      (t) => `<article class="review"><div class="stars" aria-label="${t.rating} out of 5">${"\u2605".repeat(t.rating)}</div><p>"${esc(t.body)}"</p><p class="who"><strong>${esc(t.name)}</strong> &middot; ${esc(t.city)}</p></article>`
    )
    .join("")}</div>`;
}

function benefitGrid(list) {
  return `<div class="benefits">${list
    .map(
      (b, i) => `<div class="benefit"><span class="icon" aria-hidden="true">${i + 1}</span><h3>${esc(b.title)}</h3><p>${esc(b.body)}</p></div>`
    )
    .join("")}</div>`;
}

function faqBlock(faqs, ctx) {
  return `<div class="faq">${faqs
    .map(
      (f) => `<details><summary>${esc(interp(f.q, ctx))}</summary><p>${esc(interp(f.a, ctx))}</p></details>`
    )
    .join("")}</div>`;
}

function quoteForm({ city, service, heading = "Get your free estimate", sub = "Straight quote from the owner. No pressure, no upsell." }) {
  const preSelectedService = service ? service.slug : "";
  const cityFull = city ? `${city.name}, ${city.state}` : "";
  return `<form class="quote-card" data-lead-form ${city ? `data-city="${esc(city.slug)}"` : ""} ${service ? `data-service="${esc(service.slug)}"` : ""} novalidate>
<h2>${esc(heading)}</h2>
<p class="sub">${esc(sub)}</p>
<div class="form-row grid-2">
<div class="form-field"><label for="lf-name">Your name</label><input id="lf-name" name="name" type="text" autocomplete="name" maxlength="200" required></div>
<div class="form-field"><label for="lf-phone">Phone</label><input id="lf-phone" name="phone" type="tel" autocomplete="tel" maxlength="50" required></div>
</div>
<div class="form-row grid-2">
<div class="form-field"><label for="lf-email">Email</label><input id="lf-email" name="email" type="email" autocomplete="email" maxlength="320" required></div>
<div class="form-field"><label for="lf-address">Address / city</label><input id="lf-address" name="address" type="text" autocomplete="street-address" maxlength="300" value="${esc(cityFull)}"></div>
</div>
<div class="form-row">
<div class="form-field"><label for="lf-service">Service</label>
<select id="lf-service" name="service" required>
<option value="">Select a service</option>
${services
  .map((s) => `<option value="${esc(s.slug)}" ${s.slug === preSelectedService ? "selected" : ""}>${esc(s.shortName)}</option>`)
  .join("")}
</select></div>
</div>
<div class="form-row">
<div class="form-field"><label for="lf-message">Anything we should know?</label><textarea id="lf-message" name="message" rows="3" maxlength="5000" placeholder="Rooflines, timeline, questions..."></textarea></div>
</div>
<button class="btn btn-primary" type="submit" style="margin-top: 1rem; width: 100%;">Get my free estimate</button>
<p class="form-status" role="status" aria-live="polite"></p>
</form>`;
}

function footer() {
  return `<footer class="footer">
<div class="container">
<div class="grid">
<div>
<h4>${esc(BIZ_NAME)}</h4>
<p>Certified GutterGlove &amp; LeafBlaster Pro installer since 2009. Permanent Oelo LED roofline lighting. Serving South Jersey, Eastern Pennsylvania, and Delaware.</p>
<p style="margin-top:0.75rem"><a href="tel:${PHONE_TEL}" style="color:#ffd700;font-weight:800">${PHONE}</a></p>
<p><a href="mailto:${EMAIL}">${EMAIL}</a></p>
</div>
<div>
<h4>Services</h4>
<ul style="list-style:none;display:grid;gap:0.4rem">
${services.map((s) => `<li><a href="/${s.slug === "permanent-outdoor-lighting" ? "lighting" : s.slug === "gutter-guards" ? "gutters" : s.slug}">${esc(s.shortName)}</a></li>`).join("")}
</ul>
</div>
<div>
<h4>Top Service Areas</h4>
<ul style="list-style:none;display:grid;gap:0.4rem">
${cities.slice(0, 8).map((c) => `<li><a href="/locations/${c.slug}">${esc(c.name)}, ${esc(c.state)}</a></li>`).join("")}
<li><a href="/service-areas">View all</a></li>
</ul>
</div>
<div>
<h4>Company</h4>
<ul style="list-style:none;display:grid;gap:0.4rem">
<li><a href="/gutter-guards">Best Gutter Guards Near Me</a></li>
<li><a href="/reviews">Reviews</a></li>
<li><a href="/faq">FAQ</a></li>
<li><a href="/blog">Blog</a></li>
<li><a href="/privacy">Privacy</a></li>
<li><a href="/terms">Terms</a></li>
</ul>
</div>
</div>
<div class="legal">
<span>&copy; 2009&ndash;${new Date().getFullYear()} ${esc(BIZ_NAME)}. All rights reserved.</span>
<span>Cherry Hill, NJ 08002 &middot; NJ HIC + PA HIC insured</span>
</div>
</div>
</footer>
<a href="tel:${PHONE_TEL}" class="sticky-call" aria-label="Call ${PHONE}">Call ${PHONE}</a>
<script src="/js/lead-form.js" defer></script>
</body></html>`;
}

function ecoContext(city) {
  const p = ECO_PROFILES[city.region] || ECO_PROFILES.wooded;
  const ctx = {
    cityName: city.name,
    state: city.state,
    stateFull: city.stateFull,
    countyName: city.county || `the ${city.name} area`,
  };
  return `<section class="section"><div class="container">
<p class="eyebrow">${esc(p.label)} &middot; ${esc(city.name)}, ${esc(city.state)}</p>
<h2>Why ${esc(city.name)} Homes Face Unique Gutter Challenges</h2>
${p.paragraphs.map((para) => `<p style="max-width:75ch;margin-bottom:0.9rem">${esc(interp(para, ctx))}</p>`).join("")}
<div class="benefit-grid" style="margin-top:1.5rem">
${p.features.map((f) => `<article class="benefit-card"><h3>${esc(interp(f.title, ctx))}</h3><p>${esc(interp(f.body, ctx))}</p></article>`).join("")}
</div>
<p style="max-width:75ch;margin-top:1.25rem;color:var(--brand-navy)"><strong>Recommended for ${esc(city.name)}:</strong> ${esc(interp(p.solution, ctx))} <a href="/gutter-guards" style="color:var(--brand-navy);font-weight:600;text-decoration:underline">LeafBlaster Pro Gutter Guard Installation in ${esc(city.name)} &rarr;</a></p>
</div></section>`;
}

function localCityFaqs(city, service) {
  const p = ECO_PROFILES[city.region] || ECO_PROFILES.wooded;
  const stateCode = city.state;
  const countyName = city.county || `the ${city.name} area`;
  return [
    {
      q: `Why do standard gutter screens fail against ${city.name}'s tree canopy?`,
      a: `${p.challenge} In ${city.name}, ${stateCode}, that is exactly why we install LeafBlaster Pro 316 stainless micro-mesh instead of a slotted screen or foam insert.`,
    },
    {
      q: `How do freeze-thaw cycles and winter weather in ${countyName} affect micro-mesh guards?`,
      a: `${countyName} sees repeated freeze-thaw cycles from December through March. Rigid 316 stainless micro-mesh, mounted on a powder-coated aluminum sub-frame, does not warp, sag, or crack under ice load — the reason we install LeafBlaster Pro exclusively on ${city.name} homes rather than pop-in plastic or foam inserts.`,
    },
    {
      q: `Do you provide same-day estimates and installation in ${city.name}, ${stateCode}?`,
      a: `Yes. Free written estimates in ${city.name}, ${stateCode} are typically delivered the same day you call, and gutter cleaning can often be scheduled the same day before noon. ${service ? `${service.shortName} installs` : "Gutter guard, seamless gutter, and permanent lighting installs"} in ${city.name} are usually booked within 3–7 business days. Call ${PHONE} to lock in a slot.`,
    },
  ];
}

function cityHub(city) {
  const canonical = `${SITE}/locations/${city.slug}`;
  const title = `Gutter Guards & Permanent Lighting in ${city.name}, ${city.state} | ${BIZ_NAME}`.slice(0, 60);
  const description = `Certified LeafBlaster Pro gutter guards, seamless gutters, cleaning, and permanent LED lighting in ${city.name}, ${city.state}. Free estimate — call ${PHONE}.`;
  const ogImage = `${SITE}/${city.hero}`;
  const crumbs = [
    { name: "Home", href: "/", item: `${SITE}/` },
    { name: "Service Areas", href: "/service-areas", item: `${SITE}/service-areas` },
    { name: `${city.name}, ${city.state}`, href: canonical, item: canonical },
  ];
  const regionNote = REGION_NOTES[city.region] || REGION_NOTES.wooded;
  const nearby = (city.nearbyTowns || []).slice(0, 4);
  const nearbyText = nearby.length ? nearby.join(", ") : "";
  const faqs = [
    ...localCityFaqs(city, null),
    {
      q: `What services does ${BIZ_NAME} offer in ${city.name}, ${city.state}?`,
      a: `We install LeafBlaster Pro micro-mesh gutter guards, seamless 5\" and 6\" aluminum gutters, permanent Oelo-style LED roofline lighting, and provide professional gutter cleaning and inspection throughout ${city.name}${city.county ? ` and the broader ${city.county} area` : ""}.`,
    },
    {
      q: `Which ${city.name} neighborhoods do you serve?`,
      a: `We cover every ${city.name} neighborhood including ${city.neighborhoods.join(", ")} and the ${city.zips.join(", ")} zip codes${nearbyText ? `, and route the same crews through nearby ${nearbyText}` : ""}.`,
    },
    {
      q: `Are you insured to work in ${city.stateFull}?`,
      a: `Yes. We carry full general liability, workers' comp, and required ${city.stateFull} home-improvement contractor registration. Certificates available on request.`,
    },
  ];
  const jsonLdBlocks = [
    jsonLd(localBusinessSchema(city, canonical)),
    jsonLd(breadcrumbSchema(crumbs.map((c) => ({ name: c.name, item: c.item })))),
    jsonLd(faqSchema(faqs, { cityName: city.name, state: city.state })),
  ];

  const reviews = reviewsFor(city.slug, null);

  const html =
    head({ title, description, canonical, ogImage, jsonLdBlocks, geo: city }) +
    header() +
    breadcrumbs(crumbs.map((c) => ({ name: c.name, href: c.href }))) +
    `<section class="hero"><div class="container">
<div>
<p class="eyebrow">Serving ${esc(city.name)}, ${esc(city.state)} since 2009</p>
<h1>Gutter Guards, Seamless Gutters &amp; Permanent Lighting in ${esc(city.name)}, ${esc(city.state)}</h1>
<p class="lead">${esc(city.climate)} We install the systems that stop the problem — <a href="/gutter-guards" style="color:inherit;text-decoration:underline">LeafBlaster Pro micro-mesh gutter guards</a>, oversized seamless gutters, permanent LED roofline lighting, and hand-cleaning done right.</p>
<div class="badges">
<span class="badge">Certified LeafBlaster Pro Installer</span>
<span class="badge">Lifetime Workmanship Warranty</span>
<span class="badge">4.9 &starf; from 45+ homeowners</span>
</div>
<div class="cta-row">
<a href="#quote" class="btn btn-primary">Get free estimate</a>
<a href="tel:${PHONE_TEL}" class="btn btn-outline">Call ${PHONE}</a>
</div>
</div>
<div id="quote">${quoteForm({ city, service: null, heading: `Free estimate in ${city.name}`, sub: `Firm written quote. No pressure.` })}</div>
</div></section>` +
    `<section class="trust-strip"><div class="container row"><span><strong>${esc(city.county || "")}</strong>${city.county ? " &middot; " : ""}<strong>Zip codes served:</strong> ${city.zips.map((z) => esc(z)).join(", ")}</span><span><strong>Neighborhoods:</strong> ${city.neighborhoods.slice(0, 4).map((n) => esc(n)).join(", ")}</span>${nearbyText ? `<span><strong>Also near:</strong> ${esc(nearbyText)}</span>` : ""}</div></section>` +
    `<main id="main">
${ecoContext(city)}
${nearbyText ? `<section class="section"><div class="container"><p style="max-width:75ch">The same ${esc(city.name)} crew also services nearby <strong>${esc(nearbyText)}</strong>, so scheduling routes stay tight and quotes stay consistent across ${esc(city.county || city.stateFull)}.</p></div></section>` : ""}

<section class="section section-alt"><div class="container">
<p class="eyebrow">Every service in ${esc(city.name)}</p>
<h2>Choose your project</h2>
<div class="service-grid">
${services
  .map(
    (s) => `<article class="service-card"><h3>${esc(s.shortName)} in ${esc(city.name)}, ${esc(city.state)}</h3><p>${esc(s.tagline)}</p><a class="link" href="/locations/${city.slug}/${s.slug}">${esc(s.slug === "gutter-guards" ? `LeafBlaster Pro Gutter Guard Installation in ${city.name}` : `${s.shortName} in ${city.name}`)} &rarr;</a></article>`
  )
  .join("")}
</div>
</div></section>

<section class="section section-alt"><div class="container">
<p class="eyebrow">${esc(city.name)} homeowners &middot; ${AGG_RATING.value} average</p>
<h2>What ${esc(city.name)} neighbors say</h2>
${reviewGrid(reviews)}
</div></section>

<section class="section"><div class="container">
<p class="eyebrow">${esc(city.name)}, ${esc(city.state)} coverage</p>
<h2>Neighborhoods &amp; zip codes we serve in ${esc(city.name)}</h2>
<p style="max-width:70ch;margin-bottom:1rem">We route crews to ${esc(city.name)} multiple times per week. If your street isn't listed, call ${PHONE} — we still serve it.</p>
<p style="font-weight:700;color:var(--brand-navy);margin-bottom:0.5rem">Neighborhoods:</p>
<div class="chip-list" style="margin-bottom:1rem">${city.neighborhoods.map((n) => `<span class="chip">${esc(n)}</span>`).join("")}</div>
<p style="font-weight:700;color:var(--brand-navy);margin-bottom:0.5rem">Zip codes:</p>
<div class="zip-list">${city.zips.map((z) => `<span>${esc(z)}</span>`).join("")}</div>
</div></section>

<section class="section section-alt"><div class="container">
<p class="eyebrow">${esc(city.name)} FAQ</p>
<h2>Common questions from ${esc(city.name)} homeowners</h2>
${faqBlock(faqs, { cityName: city.name, state: city.state })}
</div></section>

<section class="section"><div class="container split">
<div>
<h2>Ready for a firm quote in ${esc(city.name)}?</h2>
<p>Every estimate is free, on-site, and delivered in writing before any work is scheduled. Fifteen years of jobs in ${esc(city.name)}, ${esc(city.stateFull)} — from ${esc(city.landmarks[0])} to ${esc(city.landmarks[city.landmarks.length - 1])}.</p>
<div class="cta-row" style="margin-top:1rem">
<a href="tel:${PHONE_TEL}" class="btn btn-primary">Call ${PHONE}</a>
<a href="mailto:${EMAIL}" class="btn btn-outline" style="color:var(--brand-navy);border-color:var(--brand-navy)">Email us</a>
</div>
</div>
<div>${quoteForm({ city, service: null, heading: `Book a ${city.name} estimate` })}</div>
</div></section>
</main>` +
    footer();
  return html;
}

function serviceCityPage(city, service) {
  const canonical = `${SITE}/locations/${city.slug}/${service.slug}`;
  const isGuards = service.slug === "gutter-guards";
  const rawTitle = isGuards
    ? `Best Gutter Guards in ${city.name}, ${city.state} | ${BIZ_NAME}`
    : `${service.shortName} in ${city.name}, ${city.state} | ${BIZ_NAME}`;
  const title = rawTitle.length > 65 ? `${isGuards ? "Best Gutter Guards" : service.shortName} in ${city.name}, ${city.state}` : rawTitle;
  const description = isGuards
    ? `Looking for the best gutter guards in ${city.name}, ${city.state}? ${BIZ_NAME} installs premium LeafBlaster Pro micro-mesh gutter guards with a lifetime warranty. Call ${PHONE}.`.slice(0, 160)
    : `${service.tagline} Local ${city.name}, ${city.state} crews with lifetime workmanship warranty. Free written estimate — call ${PHONE}.`.slice(0, 160);
  const ogImage = `${SITE}/${city.hero}`;
  const crumbs = [
    { name: "Home", href: "/", item: `${SITE}/` },
    { name: "Service Areas", href: "/service-areas", item: `${SITE}/service-areas` },
    { name: `${city.name}, ${city.state}`, href: `/locations/${city.slug}`, item: `${SITE}/locations/${city.slug}` },
    { name: service.shortName, href: canonical, item: canonical },
  ];
  const ctx = { cityName: city.name, state: city.state, stateFull: city.stateFull };
  const regionNote = REGION_NOTES[city.region] || REGION_NOTES.wooded;
  const nearby = (city.nearbyTowns || []).slice(0, 4);
  const nearbyText = nearby.length ? nearby.join(", ") : "";
  const localFaqs = localCityFaqs(city, service);
  const combinedFaqs = [...service.faqs, ...localFaqs];
  const jsonLdBlocks = [
    jsonLd(localBusinessSchema(city, canonical)),
    jsonLd(serviceSchema(service, city, canonical)),
    jsonLd(breadcrumbSchema(crumbs.map((c) => ({ name: c.name, item: c.item })))),
    jsonLd(faqSchema(combinedFaqs, ctx)),
  ];
  const reviews = reviewsFor(city.slug, service.slug);
  const otherServices = services.filter((s) => s.slug !== service.slug);

  const html =
    head({ title, description, canonical, ogImage, jsonLdBlocks, geo: city }) +
    header() +
    breadcrumbs(crumbs.map((c) => ({ name: c.name, href: c.href }))) +
    `<section class="hero"><div class="container">
<div>
<p class="eyebrow">${esc(service.shortName)} &middot; ${esc(city.name)}, ${esc(city.state)}</p>
<h1>${isGuards ? `Top-Rated Gutter Guards &amp; Installation in ${esc(city.name)}, ${esc(city.state)}` : `Premium ${esc(service.name)} in ${esc(city.name)}, ${esc(city.state)}`}</h1>
<p class="lead">${esc(service.heroPitch)} ${esc(city.climate)}</p>
<div class="badges">
<span class="badge">Certified installer</span>
<span class="badge">Lifetime workmanship warranty</span>
<span class="badge">${AGG_RATING.value} &starf; from ${AGG_RATING.count}+ homeowners</span>
</div>
<div class="cta-row">
<a href="#quote" class="btn btn-primary">Get free estimate</a>
<a href="tel:${PHONE_TEL}" class="btn btn-outline">Call ${PHONE}</a>
</div>
</div>
<div id="quote">${quoteForm({ city, service, heading: `Free ${service.shortName} quote in ${city.name}` })}</div>
</div></section>` +
    `<section class="trust-strip"><div class="container row"><span><strong>${esc(city.county || city.stateFull)}</strong>${city.county ? ` &middot; ${esc(city.stateFull)}` : ""}</span><span><strong>Zip codes:</strong> ${city.zips.map((z) => esc(z)).join(", ")}</span><span><strong>Neighborhoods:</strong> ${city.neighborhoods.slice(0, 3).map((n) => esc(n)).join(", ")}</span>${nearbyText ? `<span><strong>Also near:</strong> ${esc(nearbyText)}</span>` : ""}</div></section>` +
    `<main id="main">
${ecoContext(city)}
${nearbyText ? `<section class="section"><div class="container"><p style="max-width:75ch">The same ${esc(city.name)} crew routes through nearby <strong>${esc(nearbyText)}</strong> most weeks, so ${esc(city.county || city.stateFull)} homeowners get consistent pricing and scheduling on ${esc(service.shortName.toLowerCase())} projects.</p></div></section>` : ""}

<section class="section section-alt"><div class="container">
<p class="eyebrow">Why ${esc(city.name)} homeowners choose us</p>
<h2>${esc(service.shortName)} built for ${esc(city.stateFull)}</h2>
${benefitGrid(service.benefits)}
</div></section>

<section class="section section-alt"><div class="container split">
<div>
<p class="eyebrow">Our ${esc(city.name)} process</p>
<h2>How ${esc(service.shortName.toLowerCase())} works, step by step</h2>
<ol style="margin-top:1rem;padding-left:1.25rem;display:grid;gap:0.6rem">
${service.process.map((p) => `<li>${esc(p)}</li>`).join("")}
</ol>
<div class="cta-row" style="margin-top:1.5rem">
<a href="tel:${PHONE_TEL}" class="btn btn-primary">Call ${PHONE}</a>
<a href="#quote" class="btn btn-outline" style="color:var(--brand-navy);border-color:var(--brand-navy)">Get a written estimate</a>
</div>
</div>
<div>
<img src="/${city.hero}" alt="${esc(city.heroAlt)}" width="900" height="600" loading="lazy" decoding="async">
</div>
</div></section>

<section class="section"><div class="container">
<p class="eyebrow">${esc(city.name)}, ${esc(city.state)} reviews</p>
<h2>${AGG_RATING.value}-star reviews from ${esc(city.name)} homeowners</h2>
${reviewGrid(reviews)}
</div></section>

<section class="section section-alt"><div class="container">
<p class="eyebrow">${esc(service.shortName)} FAQ</p>
<h2>Everything ${esc(city.name)} homeowners ask us</h2>
${faqBlock(combinedFaqs, ctx)}
</div></section>

<section class="section"><div class="container">
<p class="eyebrow">Other ${esc(city.name)} services</p>
<h2>Also serving ${esc(city.name)} with</h2>
<div class="service-grid">
${otherServices
  .map(
    (s) => `<article class="service-card"><h3>${esc(s.shortName)}</h3><p>${esc(s.tagline)}</p><a class="link" href="/locations/${city.slug}/${s.slug}">${esc(s.slug === "gutter-guards" ? `LeafBlaster Pro Gutter Guard Installation in ${city.name}` : `${s.shortName} in ${city.name}`)} &rarr;</a></article>`
  )
  .join("")}
</div>
</div></section>

<section class="section section-alt"><div class="container split">
<div>
<h2>Firm ${esc(service.shortName.toLowerCase())} quote in ${esc(city.name)}, ${esc(city.state)}</h2>
<p>Every ${esc(service.shortName.toLowerCase())} estimate in ${esc(city.name)} is free and delivered in writing before any work starts. We cover every zip code from ${esc(city.zips[0])} to ${esc(city.zips[city.zips.length - 1])}, and every neighborhood from ${esc(city.neighborhoods[0])} to ${esc(city.neighborhoods[city.neighborhoods.length - 1])}.</p>
<div class="cta-row" style="margin-top:1rem">
<a href="tel:${PHONE_TEL}" class="btn btn-primary">Call ${PHONE}</a>
<a href="mailto:${EMAIL}" class="btn btn-outline" style="color:var(--brand-navy);border-color:var(--brand-navy)">Email us</a>
</div>
</div>
<div>${quoteForm({ city, service, heading: `Book my ${service.shortName} estimate` })}</div>
</div></section>
</main>` +
    footer();
  return html;
}

function locationsIndex() {
  const canonical = `${SITE}/locations`;
  const title = `Service Areas | ${BIZ_NAME}`;
  const description = `Gutter guards, seamless gutters, cleaning, and permanent LED lighting across ${cities.length}+ priority cities in South Jersey, Eastern PA, and Delaware.`;
  const crumbs = [
    { name: "Home", href: "/", item: `${SITE}/` },
    { name: "Locations", href: canonical, item: canonical },
  ];
  const jsonLdBlocks = [
    jsonLd(localBusinessSchema(null, canonical)),
    jsonLd(breadcrumbSchema(crumbs.map((c) => ({ name: c.name, item: c.item })))),
  ];
  const html =
    head({ title, description, canonical, ogImage: `${SITE}/hero-friendly-gutter-protection.jpg`, jsonLdBlocks }) +
    header() +
    breadcrumbs(crumbs.map((c) => ({ name: c.name, href: c.href }))) +
    `<section class="hero"><div class="container"><div>
<p class="eyebrow">Priority service areas</p>
<h1>Cities we serve across NJ, PA &amp; DE</h1>
<p class="lead">Dedicated crews cover ${cities.length} priority cities and 60+ surrounding towns. Pick your city for local pricing, reviews, and a free written estimate.</p>
<div class="cta-row"><a href="tel:${PHONE_TEL}" class="btn btn-primary">Call ${PHONE}</a><a href="/service-areas" class="btn btn-outline">All 60+ towns</a></div>
</div><div>${quoteForm({ city: null, service: null, heading: "Not sure which city?", sub: "Tell us your address and we'll route the closest crew." })}</div></div></section>
<main id="main"><section class="section"><div class="container">
<h2>Choose your city</h2>
<div class="service-grid">
${cities
  .map(
    (c) => `<article class="service-card"><h3>${esc(c.name)}, ${esc(c.state)}</h3><p>${esc(c.zips.join(" &middot; "))}</p><a class="link" href="/locations/${c.slug}">Explore ${esc(c.name)} services &rarr;</a></article>`
  )
  .join("")}
</div>
</div></section></main>` +
    footer();
  return html;
}

function gutterGuardsHub() {
  const canonical = `${SITE}/gutter-guards`;
  const title = `Gutter Guards Near Me | LeafBlaster Pro Install`;
  const description = `Top-rated gutter guard installation in South Jersey, Eastern PA & DE. LeafBlaster Pro micro-mesh gutter guards, lifetime warranty. Call ${PHONE}.`;
  const ogImage = `${SITE}/hero-friendly-gutter-protection.jpg`;
  const crumbs = [
    { name: "Home", href: "/", item: `${SITE}/` },
    { name: "Gutter Guards", href: canonical, item: canonical },
  ];
  const svc = serviceMap["gutter-guards"];
  const ctx = { cityName: "South Jersey", state: "NJ", stateFull: "New Jersey" };
  const jsonLdBlocks = [
    jsonLd(localBusinessSchema(null, canonical)),
    jsonLd(serviceSchema(svc, { name: "South Jersey", state: "NJ", stateFull: "New Jersey", slug: "cherry-hill-nj" }, canonical)),
    jsonLd(breadcrumbSchema(crumbs.map((c) => ({ name: c.name, item: c.item })))),
    jsonLd(faqSchema(svc.faqs, ctx)),
  ];
  const html =
    head({ title, description, canonical, ogImage, jsonLdBlocks }) +
    header() +
    breadcrumbs(crumbs.map((c) => ({ name: c.name, href: c.href }))) +
    `<section class="hero"><div class="container">
<div>
<p class="eyebrow">Certified LeafBlaster Pro installer &middot; since 2009</p>
<h1>Top-Rated Gutter Guard Installation in South Jersey &amp; Eastern PA</h1>
<p class="lead">Best gutter guards near me? ${esc(BIZ_NAME)} installs LeafBlaster Pro micro-mesh gutter guards with a lifetime no-clog warranty. Permanent gutter guard solutions engineered for oak leaves, pine needles, and shingle grit \u2014 backed by a lifetime workmanship warranty from our family-owned crew.</p>
<div class="badges">
<span class="badge">LeafBlaster Pro certified</span>
<span class="badge">Lifetime workmanship warranty</span>
<span class="badge">${AGG_RATING.value} &starf; from ${AGG_RATING.count}+ homeowners</span>
</div>
<div class="cta-row">
<a href="#quote" class="btn btn-primary">Get free gutter guard estimate</a>
<a href="tel:${PHONE_TEL}" class="btn btn-outline">Call ${PHONE}</a>
</div>
</div>
<div id="quote">${quoteForm({ city: null, service: svc, heading: "Free gutter guard estimate", sub: "LeafBlaster Pro micro-mesh gutter guards \u2014 firm written quote." })}</div>
</div></section>
<main id="main">
<section class="section"><div class="container">
<p class="eyebrow">Why LeafBlaster Pro Micro-Mesh Gutter Guards</p>
<h2>Best Gutter Guards Near Me \u2014 Built for the Northeast Roofline</h2>
${benefitGrid(svc.benefits)}
</div></section>

<section class="section section-alt"><div class="container">
<p class="eyebrow">Gutter guard installation process</p>
<h2>How our gutter guard installation works</h2>
<ol style="padding-left:1.25rem;display:grid;gap:0.6rem">${svc.process.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
</div></section>

<section class="section"><div class="container">
<p class="eyebrow">Local gutter guard coverage</p>
<h2>Permanent gutter guard solutions across NJ, PA &amp; DE</h2>
<div class="service-grid">
${cities.map((c) => `<article class="service-card"><h3>Gutter Guards in ${esc(c.name)}, ${esc(c.state)}</h3><p>${esc(c.zips.slice(0, 3).join(" \u00b7 "))}</p><a class="link" href="/locations/${c.slug}/gutter-guards">Gutter guard installation in ${esc(c.name)} &rarr;</a></article>`).join("")}
</div>
</div></section>

<section class="section section-alt"><div class="container">
<p class="eyebrow">Gutter guard FAQ</p>
<h2>Common questions about gutter guard installation</h2>
${faqBlock(svc.faqs, ctx)}
</div></section>

<section class="section"><div class="container split">
<div>
<h2>Book your gutter guard installation</h2>
<p>Every LeafBlaster Pro micro-mesh gutter guard estimate is free, on-site, and delivered in writing before any work is scheduled. Serving South Jersey, Eastern Pennsylvania, and Delaware.</p>
<div class="cta-row" style="margin-top:1rem">
<a href="tel:${PHONE_TEL}" class="btn btn-primary">Call ${PHONE}</a>
<a href="mailto:${EMAIL}" class="btn btn-outline" style="color:var(--brand-navy);border-color:var(--brand-navy)">Email us</a>
</div>
</div>
<div>${quoteForm({ city: null, service: svc, heading: "Free gutter guard quote" })}</div>
</div></section>
</main>` +
    footer();
  return html;
}

function blogGutterGuardsVsCleaning() {
  const canonical = `${SITE}/blog/gutter-guards-vs-cleaning-south-jersey`;
  const title = `Best Gutter Guards Near Me: Why South Jersey Upgrades`;
  const description = `Best gutter guards near me? See why South Jersey homeowners upgrade from cleaning to LeafBlaster Pro micro-mesh gutter guards. Call ${PHONE}.`.slice(0, 160);
  const ogImage = `${SITE}/hero-friendly-gutter-protection.jpg`;
  const crumbs = [
    { name: "Home", href: "/", item: `${SITE}/` },
    { name: "Blog", href: "/blog", item: `${SITE}/blog` },
    { name: "Best Gutter Guards Near Me", href: canonical, item: canonical },
  ];
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Best Gutter Guards Near Me: Why South Jersey Homeowners Are Upgrading",
    description,
    mainEntityOfPage: canonical,
    url: canonical,
    author: { "@type": "Organization", name: BIZ_NAME },
    publisher: { "@id": SITE + "/#business", "@type": "HomeAndConstructionBusiness", name: BIZ_NAME, logo: { "@type": "ImageObject", url: SITE + "/logo.png" } },
    image: ogImage,
    datePublished: "2026-08-21",
    dateModified: new Date().toISOString().slice(0, 10),
    keywords: "best gutter guards near me, gutter guards, gutter guard installation, LeafBlaster Pro micro-mesh gutter guards, permanent gutter guard solutions",
  };
  const jsonLdBlocks = [
    jsonLd(localBusinessSchema(null, canonical)),
    jsonLd(articleSchema),
    jsonLd(breadcrumbSchema(crumbs.map((c) => ({ name: c.name, item: c.item })))),
  ];
  const html =
    head({ title, description, canonical, ogImage, jsonLdBlocks }) +
    header() +
    breadcrumbs(crumbs.map((c) => ({ name: c.name, href: c.href }))) +
    `<article class="section"><div class="container" style="max-width:820px">
<p class="eyebrow">Gutter guards &middot; Buyer's guide</p>
<h1>Best Gutter Guards Near Me: Why South Jersey Homeowners Are Upgrading</h1>
<p class="lead">Between heavy oak pollen in the spring, severe summer storms, and thick autumn leaves across Camden and Burlington counties, South Jersey homes demand serious exterior maintenance. For homeowners in Cherry Hill, Voorhees, Marlton, and surrounding areas, the choice comes down to two options: paying for recurring manual cleanings or installing permanent <a href="/gutter-guards">micro-mesh gutter guards</a>.</p>
<p>Here is an honest breakdown of costs, ladder safety risks, and long-term home protection.</p>

<h2>The True Cost of Manual Gutter Cleaning</h2>
<p>Most single-family homes in South Jersey require at least two thorough gutter cleanings per year \u2014 late spring after seed drop and late autumn after defoliation.</p>
<ul>
<li><strong>Average Cleaning Cost:</strong> $150 to $250 per visit (depending on home height and linear footage).</li>
<li><strong>Annual Cost:</strong> $300 to $500+ every single year.</li>
<li><strong>10-Year Out-of-Pocket:</strong> $3,000 to $5,000+ \u2014 with zero equity added to your home and recurring ladder hazard risks.</li>
</ul>
<p>If heavy pine needles or maple helicopters drop between visits, an unexpected downpour can still overflow clogged gutters, leading to fascia rot, landscape erosion, and basement seepage before the next scheduled visit.</p>

<h2>Why LeafBlaster Pro Micro-Mesh Gutter Guards Win</h2>
<p>Not all <a href="/gutter-guards">gutter guards</a> perform equally. Cheap plastic covers, slotted vinyl shields, and large-gap wire mesh often trap debris on top or let fine pine needles and roof grit slip directly into the channel.</p>

<h3>1. Zero-Maintenance Filtration</h3>
<p>Medical-grade stainless steel micro-mesh \u2014 like <strong>LeafBlaster Pro by GutterGlove</strong> \u2014 blocks everything down to roof grit, pine needles, and pests while accepting heavy rainfall loads without overflowing.</p>

<h3>2. Eliminating Ladder Hazards</h3>
<p>Over 500,000 ladder-related injuries occur annually in the U.S. Installing a permanent, heavy-duty guard system ends dangerous climbs to clear wet, rotting sludge.</p>

<h3>3. Preventing Costly Water Damage</h3>
<p>When gutters overflow in winter, water pools around foundations and freezes into destructive ice dams along the eaves. Micro-mesh guards ensure unrestricted flow directly to downspouts, preventing soffit rot and foundation cracking.</p>

<h2>The Verdict: Long-Term ROI</h2>
<p>While regular cleaning spreads costs out in recurring increments, professional micro-mesh <a href="/gutter-guards">gutter guard installation</a> pays for itself in roughly 4 to 6 years \u2014 all while providing permanent peace of mind, a lifetime warranty, and lasting curb appeal.</p>

<h2>Protect Your Home Today</h2>
<p>Ready to retire your ladder? <strong>${esc(BIZ_NAME)}</strong> provides professional LeafBlaster Pro installation across South Jersey and Eastern PA.</p>
<p>Call <a href="tel:${PHONE_TEL}"><strong>${PHONE}</strong></a> or <a href="#quote" class="btn btn-primary" style="margin-left:0.5rem">Request a free estimate</a> today.</p>

<div id="quote" style="margin-top:2rem">${quoteForm({ city: null, service: serviceMap["gutter-guards"], heading: "Get my free gutter guard estimate", sub: "LeafBlaster Pro micro-mesh gutter guards \u2014 firm written quote." })}</div>
</div></article>` +
    footer();
  return html;
}

function sitemapXml() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [];
  const push = (loc, priority, changefreq = "weekly") =>
    urls.push({ loc, lastmod: today, priority: priority.toFixed(2), changefreq });

  push(SITE + "/", 1.0, "weekly");
  push(SITE + "/gutter-guards", 1.0);
  push(SITE + "/gutters", 0.85);
  push(SITE + "/lighting", 0.95);
  push(SITE + "/gutter-services", 0.9);
  push(SITE + "/services", 0.9);
  push(SITE + "/gutter-cleaning", 0.9);
  push(SITE + "/gutter-installation", 0.9);
  push(SITE + "/gutter-repair", 0.85);
  push(SITE + "/downspout-services", 0.85);
  push(SITE + "/fascia-soffit-repair", 0.8);
  push(SITE + "/seamless-gutters", 0.9);
  push(SITE + "/same-day-gutter-service", 0.8);
  push(SITE + "/reviews", 0.85);
  push(SITE + "/faq", 0.8);
  push(SITE + "/blog", 0.7);
  push(SITE + "/blog/gutter-guards-vs-cleaning-south-jersey", 0.8, "monthly");
  push(SITE + "/blog/best-gutter-guards-south-jersey-guide", 0.9, "monthly");
  push(SITE + "/service-areas", 0.85);
  push(SITE + "/locations", 0.9);
  push(SITE + "/privacy", 0.3);
  push(SITE + "/terms", 0.3);

  cities.forEach((c) => {
    push(`${SITE}/locations/${c.slug}`, c.priority);
    services.forEach((s) => push(`${SITE}/locations/${c.slug}/${s.slug}`, Math.min(0.95, c.priority)));
  });

  const existingCityFiles = [
    "aberdeen-md","alloway-nj","atlantic-city-nj","beachwood-nj","bear-de","bensalem-pa","brick-nj","brigantine-nj","bristol-pa","bryn-mawr-pa","burlington-nj","camden-nj","cape-may-court-house-nj","cape-may-nj","carneys-point-nj","cherry-hill-nj","chester-pa","collingswood-nj","downingtown-pa","doylestown-pa","egg-harbor-township-nj","exton-pa","florence-nj","freehold-nj","glassboro-nj","haddonfield-nj","hamilton-nj","hammonton-nj","howell-nj","jackson-nj","king-of-prussia-pa","lawrenceville-nj","levittown-pa","manchester-township-nj","marlton-nj","mays-landing-nj","medford-nj","media-pa","middletown-de","moorestown-nj","mount-ephraim-nj","mount-laurel-nj","mullica-hill-nj","new-castle-de","newark-de","norristown-pa","ocean-city-nj","paulsboro-nj","pemberton-nj","pennsauken-nj","philadelphia-pa","princeton-nj","salem-nj","sewell-nj","springfield-pa","toms-river-nj","trenton-nj","upper-darby-pa","voorhees-nj","west-chester-pa","west-deptford-nj","wildwood-nj","willingboro-nj","willow-grove-pa","wilmington-de","woodbury-nj","yardley-pa",
  ];
  existingCityFiles.forEach((slug) => push(`${SITE}/service-areas/${slug}`, 0.75));

  const blogSlugs = [
    "4th-july-led-lighting-nj","5-signs-gutters-need-guards","best-gutter-guards-pine-needles-nj","best-time-gutter-guards-nj","gutter-cleaning-cost-south-jersey-2026","gutter-cleaning-vs-guards-cost","gutter-guard-cost-cherry-hill-nj","gutter-guard-installer-questions","gutter-guard-roi-south-jersey","gutter-guards-guide-south-jersey","gutter-guards-mosquito-prevention","gutter-guards-prevent-foundation-damage","gutter-maintenance-checklist-nj","gutterglove-vs-leaffilter","hurricane-season-gutter-guards-nj-2026","july-gutter-guard-install-nj","ladder-safety-gutters-lighting","led-outdoor-lighting-energy-savings-guide","oelo-lighting-color-themes","oelo-vs-diy-professional-install","oelo-vs-gemstone-vs-trimlight","outdoor-lighting-color-schemes","outdoor-lighting-security-nj","permanent-lighting-holiday-transform","permanent-lighting-home-value","permanent-lights-cost-south-jersey","permanent-lights-vs-christmas-lights","permanent-vs-traditional-lighting","pine-needles-gutters-micro-mesh-solution","prevent-ice-dams-gutter-guards","recent-gutter-guard-projects","smart-home-lighting-guide","south-jersey-storm-season-gutter-prep","summer-backyard-led-lighting","top-5-gutter-guard-mistakes-nj-homeowners","why-gutter-guards-essential-south-jersey",
  ];
  blogSlugs.forEach((slug) => push(`${SITE}/${slug}`, 0.55, "monthly"));

  const body = urls
    .map(
      (u) => `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function robotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /_restore/

Sitemap: ${SITE}/sitemap.xml
`;
}

async function run() {
  if (existsSync(OUT)) await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await copyStaticAssets();

  let count = 0;
  await write("locations/index.html", locationsIndex());
  count++;
  await write("gutter-guards/index.html", gutterGuardsHub());
  count++;
  await write("blog/gutter-guards-vs-cleaning-south-jersey/index.html", blogGutterGuardsVsCleaning());
  count++;
  for (const city of cities) {
    await write(`locations/${city.slug}/index.html`, cityHub(city));
    count++;
    for (const service of services) {
      await write(`locations/${city.slug}/${service.slug}/index.html`, serviceCityPage(city, service));
      count++;
    }
  }
  await write("sitemap.xml", sitemapXml());
  await write("robots.txt", robotsTxt());
  console.log(`Built dist/ with ${count} generated pages plus sitemap.xml and robots.txt.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
