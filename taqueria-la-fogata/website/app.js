/* ============================================================================
   Taqueria La Fogata — renders the page from site-config.js
   You should not need to edit this file. Edit site-config.js instead.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.FOGATA;
  if (!C) { return; }

  /* The restaurant's clock, not the visitor's. Georgia is Eastern. */
  var TZ = "America/New_York";

  var DAYS  = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  var DAY_NAMES = {
    en: { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" },
    es: { mon: "Lunes",  tue: "Martes",  wed: "Miércoles", thu: "Jueves",   fri: "Viernes", sat: "Sábado",  sun: "Domingo" }
  };

  var UI = {
    en: {
      menu: "Menu", hours: "Hours", find: "Find Us",
      openNow: "Open now", closedNow: "Closed",
      until: "until", opensAt: "Opens at", opensDay: "Opens",
      closedToday: "Closed today",
      call: "Call", callUs: "Call to order", directions: "Directions", getDirections: "Get directions",
      phone: "Phone", address: "Address", copy: "Copy", copied: "Copied",
      popular: "Popular", prices: "Prices and items may change. Call to confirm.",
      followTiktok: "TikTok", followInsta: "Instagram", onGoogle: "Google",
      langLabel: "Español", themeLabel: "Theme",
      placeholderWarn: "Preview only — the phone number, address and menu below are placeholders. Edit <code>site-config.js</code> before going live."
    },
    es: {
      menu: "Menú", hours: "Horario", find: "Dónde Estamos",
      openNow: "Abierto ahora", closedNow: "Cerrado",
      until: "hasta", opensAt: "Abre a las", opensDay: "Abre",
      closedToday: "Cerrado hoy",
      call: "Llamar", callUs: "Llama para ordenar", directions: "Cómo llegar", getDirections: "Cómo llegar",
      phone: "Teléfono", address: "Dirección", copy: "Copiar", copied: "Copiado",
      popular: "Favorito", prices: "Precios y platillos pueden cambiar. Llámanos para confirmar.",
      followTiktok: "TikTok", followInsta: "Instagram", onGoogle: "Google",
      langLabel: "English", themeLabel: "Tema",
      placeholderWarn: "Vista previa — el teléfono, la dirección y el menú son de ejemplo. Edita <code>site-config.js</code> antes de publicar."
    }
  };

  /* ---------------------------------------------------------- small helpers */

  function store(key, val) {
    try {
      if (val === undefined) { return window.localStorage.getItem(key); }
      window.localStorage.setItem(key, val);
    } catch (e) { /* private window, blocked storage — the page still works */ }
    return null;
  }

  var lang  = store("fogata-lang") === "es" ? "es" : "en";
  var theme = store("fogata-theme");

  function t(key) { return (UI[lang] && UI[lang][key]) || UI.en[key] || key; }

  /* Config values may be a plain string or {en, es}. */
  function s(val) {
    if (val === null || val === undefined) { return ""; }
    if (typeof val === "string") { return val; }
    return val[lang] || val.en || val.es || "";
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function el(id) { return document.getElementById(id); }

  function digits(str) { return String(str || "").replace(/[^\d+]/g, ""); }

  function money(p) {
    if (p === null || p === undefined || p === "") { return ""; }
    return "$" + p;
  }

  /* ------------------------------------------------------ the clock in GA  */

  function nowInGeorgia() {
    var parts;
    try {
      parts = new Intl.DateTimeFormat("en-US", {
        timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
    } catch (e) {
      var d = new Date();
      return { day: DAYS[d.getDay()], minutes: d.getHours() * 60 + d.getMinutes() };
    }
    var get = function (type) {
      for (var i = 0; i < parts.length; i++) { if (parts[i].type === type) { return parts[i].value; } }
      return "";
    };
    var wd = get("weekday").toLowerCase().slice(0, 3);
    return {
      day: DAYS.indexOf(wd) > -1 ? wd : "mon",
      minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10)
    };
  }

  function toMinutes(hhmm) {
    if (!hhmm) { return null; }
    var bits = String(hhmm).split(":");
    return parseInt(bits[0], 10) * 60 + parseInt(bits[1] || "0", 10);
  }

  function pretty(hhmm) {
    var m = toMinutes(hhmm);
    if (m === null) { return ""; }
    var h = Math.floor(m / 60), min = m % 60;
    var ampm = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (min ? ":" + String(min).padStart(2, "0") : "") + ampm;
  }

  /* Returns {open:bool, closesAt, opensAt, opensDayKey} for right now. */
  function openState() {
    var now = nowInGeorgia();
    var today = C.hours && C.hours[now.day];

    if (today && today.open && today.close) {
      var o = toMinutes(today.open), c = toMinutes(today.close);
      /* A close time earlier than the open time means it runs past midnight. */
      var isOpen = c > o ? (now.minutes >= o && now.minutes < c)
                         : (now.minutes >= o || now.minutes < c);
      if (isOpen) { return { open: true, closesAt: today.close }; }
      if (now.minutes < o) { return { open: false, opensAt: today.open, opensDayKey: null }; }
    }

    /* Find the next day that has hours. */
    for (var i = 1; i <= 7; i++) {
      var key = DAYS[(DAYS.indexOf(now.day) + i) % 7];
      var h = C.hours && C.hours[key];
      if (h && h.open) { return { open: false, opensAt: h.open, opensDayKey: key }; }
    }
    return { open: false };
  }

  /* -------------------------------------------------------------- renderers */

  function renderNotice() {
    var n = el("notice");
    if (!n) { return; }
    if (!C.usingPlaceholders) { n.hidden = true; return; }
    n.hidden = false;
    n.innerHTML = '<div class="wrap">' + t("placeholderWarn") + "</div>";
  }

  function renderHero() {
    el("brand").innerHTML = '<span class="ember">' + esc(C.name.split(" ")[0]) + "</span>" +
      esc(C.name.split(" ").slice(1).join(" "));
    el("tagline").textContent = s(C.tagline);
    el("blurb").textContent = s(C.blurb);
  }

  function renderStatus() {
    var st = openState();
    var box = el("status");
    var detail = "";

    if (st.open) {
      detail = t("until") + " " + pretty(st.closesAt);
    } else if (st.opensAt && st.opensDayKey) {
      detail = t("opensDay") + " " + DAY_NAMES[lang][st.opensDayKey] + " " + pretty(st.opensAt);
    } else if (st.opensAt) {
      detail = t("opensAt") + " " + pretty(st.opensAt);
    } else {
      detail = t("closedToday");
    }

    box.dataset.open = st.open ? "yes" : "no";
    box.innerHTML = '<span class="dot" aria-hidden="true"></span><span>' +
      esc(st.open ? t("openNow") : t("closedNow")) +
      '</span><span class="detail">' + esc(detail) + "</span>";
  }

  function actionButtons() {
    var tel = digits(C.phone);
    return '<a class="btn btn--primary" href="tel:' + esc(tel) + '">' +
             esc(t("call")) + " <small>" + esc(C.phone) + "</small></a>" +
           '<a class="btn" href="' + esc(C.mapsUrl) + '" target="_blank" rel="noopener">' +
             esc(t("directions")) + "</a>";
  }

  function renderActions() {
    el("actions").innerHTML = actionButtons();
    el("stickybar").innerHTML = actionButtons();
  }

  function renderMenu() {
    el("menu-title").textContent = t("menu");
    el("menu-note").textContent = t("prices");

    var html = C.menu.map(function (cat) {
      var items = (cat.items || []).filter(function (i) { return !i.hidden; }).map(function (i) {
        var tag = i.popular ? '<span class="tag">' + esc(t("popular")) + "</span>" : "";
        var desc = s(i.desc) ? '<span class="item-desc">' + esc(s(i.desc)) + "</span>" : "";
        return '<li><span class="item-main"><span class="item-name">' + esc(s(i.name)) + "</span>" +
               tag + desc + '</span><span class="item-price">' + esc(money(i.price)) + "</span></li>";
      }).join("");

      var note = s(cat.note) ? '<p class="cat-note">' + esc(s(cat.note)) + "</p>" : "";
      return '<div class="menu-cat"><h3>' + esc(s(cat.name)) + "</h3>" + note +
             '<ul class="menu-list">' + items + "</ul></div>";
    }).join("");

    el("menu-body").innerHTML = html;
  }

  function renderHours() {
    el("hours-title").textContent = t("hours");
    var todayKey = nowInGeorgia().day;

    el("hours-body").innerHTML = ORDER.map(function (k) {
      var h = C.hours && C.hours[k];
      var val = (h && h.open && h.close) ? pretty(h.open) + " – " + pretty(h.close) : t("closedNow");
      return '<li data-today="' + (k === todayKey ? "yes" : "no") + '">' +
             '<span class="day">' + esc(DAY_NAMES[lang][k]) + "</span>" +
             "<span>" + esc(val) + "</span></li>";
    }).join("");
  }

  function renderHappyHour() {
    var sec = el("happyhour");
    if (!C.happyHour || !C.happyHour.show) { sec.hidden = true; return; }
    sec.hidden = false;
    sec.innerHTML = '<div class="wrap"><div class="card card--accent">' +
      '<p class="eyebrow">' + esc(s(C.happyHour.when)) + "</p>" +
      "<h2>" + esc(s(C.happyHour.name)) + "</h2>" +
      "<p>" + esc(s(C.happyHour.details)) + "</p></div></div>";
  }

  function renderComingSoon() {
    var sec = el("coming");
    if (!C.comingSoon || !C.comingSoon.show) { sec.hidden = true; return; }
    sec.hidden = false;
    sec.innerHTML = '<div class="wrap"><div class="card card--accent">' +
      '<p class="eyebrow">' + esc(s(C.comingSoon.eyebrow)) + "</p>" +
      "<h2>" + esc(s(C.comingSoon.headline)) + "</h2>" +
      "<p>" + esc(s(C.comingSoon.body)) + "</p></div></div>";
  }

  function renderFind() {
    el("find-title").textContent = t("find");
    var a = C.address || {};

    var social = "";
    if (C.social) {
      if (C.social.tiktok)    { social += '<a class="btn" href="' + esc(C.social.tiktok)    + '" target="_blank" rel="noopener">' + esc(t("followTiktok")) + "</a>"; }
      if (C.social.instagram) { social += '<a class="btn" href="' + esc(C.social.instagram) + '" target="_blank" rel="noopener">' + esc(t("followInsta")) + "</a>"; }
      if (C.social.google)    { social += '<a class="btn" href="' + esc(C.social.google)    + '" target="_blank" rel="noopener">' + esc(t("onGoogle")) + "</a>"; }
    }

    var addrText = a.street + ", " + a.city + ", " + a.state + " " + a.zip;

    el("find-body").innerHTML =
      '<p class="addr">' + esc(a.street) + "</p>" +
      '<p class="addr-line">' + esc(a.city + ", " + a.state + " " + a.zip) + "</p>" +
      '<div class="copyrow"><span class="label">' + esc(t("phone")) + "</span>" +
        '<span class="value">' + esc(C.phone) + "</span>" +
        '<button class="copybtn" type="button" data-copy="' + esc(C.phone) + '">' + esc(t("copy")) + "</button></div>" +
      '<div class="copyrow"><span class="label">' + esc(t("address")) + "</span>" +
        '<span class="value">' + esc(addrText) + "</span>" +
        '<button class="copybtn" type="button" data-copy="' + esc(addrText) + '">' + esc(t("copy")) + "</button></div>" +
      '<div class="actions"><a class="btn btn--primary" href="' + esc(C.mapsUrl) + '" target="_blank" rel="noopener">' +
        esc(t("getDirections")) + "</a></div>" +
      (social ? '<div class="social">' + social + "</div>" : "");
  }

  function renderFooter() {
    el("footer-body").innerHTML =
      "<p><strong>" + esc(C.name) + "</strong></p>" +
      "<p>" + esc((C.address || {}).city + ", " + (C.address || {}).state) + " &middot; " + esc(C.phone) + "</p>";
  }

  function renderChrome() {
    el("lang-toggle").textContent = t("langLabel");
    el("theme-toggle").textContent = t("themeLabel");
    document.documentElement.lang = lang;
  }

  function renderAll() {
    renderNotice();
    renderHero();
    renderStatus();
    renderActions();
    renderMenu();
    renderHours();
    renderHappyHour();
    renderComingSoon();
    renderFind();
    renderFooter();
    renderChrome();
  }

  /* ------------------------------------------------------------- behaviour */

  function applyTheme() {
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function currentlyDark() {
    if (theme === "dark")  { return true; }
    if (theme === "light") { return false; }
    try { return !window.matchMedia("(prefers-color-scheme: light)").matches; }
    catch (e) { return true; }
  }

  document.addEventListener("click", function (ev) {
    var copyBtn = ev.target.closest && ev.target.closest(".copybtn");
    if (copyBtn) {
      var text = copyBtn.getAttribute("data-copy");
      var done = function () {
        var old = copyBtn.textContent;
        copyBtn.textContent = t("copied");
        setTimeout(function () { copyBtn.textContent = old; }, 1600);
      };
      try {
        navigator.clipboard.writeText(text).then(done, function () { selectValue(copyBtn); });
      } catch (e) { selectValue(copyBtn); }
      return;
    }

    if (ev.target.id === "lang-toggle") {
      lang = lang === "en" ? "es" : "en";
      store("fogata-lang", lang);
      renderAll();
      return;
    }

    if (ev.target.id === "theme-toggle") {
      theme = currentlyDark() ? "light" : "dark";
      store("fogata-theme", theme);
      applyTheme();
    }
  });

  /* If the clipboard is refused, select the text so it can be copied by hand. */
  function selectValue(btn) {
    var row = btn.closest(".copyrow");
    var value = row && row.querySelector(".value");
    if (!value) { return; }
    try {
      var range = document.createRange();
      range.selectNodeContents(value);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* nothing more we can do */ }
  }

  applyTheme();
  renderAll();

  /* Keep the open/closed badge honest without reloading the page. */
  setInterval(renderStatus, 60000);
})();
