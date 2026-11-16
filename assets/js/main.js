/*===== MAIN JS: mobile menu, active link, language switch =====*/
(function () {
  var html = document.documentElement;

  /*===== MOBILE MENU =====*/
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-menu");

  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle("show", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("show"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("show")) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /*===== CLOSE MENU + ACTIVE LINK ON CLICK =====*/
  var links = document.querySelectorAll(".nav__link");
  links.forEach(function (link) {
    link.addEventListener("click", function () {
      links.forEach(function (l) { l.classList.remove("active-link"); });
      if (!link.classList.contains("nav__hire")) link.classList.add("active-link");
      setMenu(false);
    });
  });

  /*===== ACTIVE LINK ON SCROLL =====*/
  var sections = document.querySelectorAll("section[id]");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY + window.innerHeight / 3;
    sections.forEach(function (s) {
      var link = document.querySelector('.nav__link[href="#' + s.id + '"]');
      if (!link || link.classList.contains("nav__hire")) return;
      var inView = y >= s.offsetTop && y < s.offsetTop + s.offsetHeight;
      link.classList.toggle("active-link", inView);
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /*===== LANGUAGE (FR / EN) =====*/
  var dict = window.I18N || {};

  function t(lang, key) {
    var d = dict[lang] || {};
    if (key in d) return d[key];
    return dict.en && key in dict.en ? dict.en[key] : null;
  }

  function setAll(selector, attr, lang, apply) {
    document.querySelectorAll(selector).forEach(function (el) {
      var value = t(lang, el.getAttribute(attr));
      if (value !== null) apply(el, value);
    });
  }

  function applyLang(lang) {
    if (!dict[lang]) lang = "en";
    window.NJ_LANG = lang;
    html.lang = lang;

    setAll("[data-i18n]", "data-i18n", lang, function (el, v) { el.textContent = v; });
    setAll("[data-i18n-html]", "data-i18n-html", lang, function (el, v) { el.innerHTML = v; });
    setAll("[data-i18n-alt]", "data-i18n-alt", lang, function (el, v) { el.setAttribute("alt", v); });
    setAll("[data-i18n-aria]", "data-i18n-aria", lang, function (el, v) { el.setAttribute("aria-label", v); });

    var title = t(lang, "meta.title");
    if (title) document.title = title;
    var desc = document.querySelector('meta[name="description"]');
    var d = t(lang, "meta.description");
    if (desc && d) desc.setAttribute("content", d);

    document.querySelectorAll(".lang-switch__btn").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });

    html.classList.remove("i18n-wait");
  }

  document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang");
      applyLang(lang);
      try { localStorage.setItem("nj-lang", lang); } catch (e) {}
      // Keep the URL shareable in the chosen language
      try {
        var url = new URL(location.href);
        url.searchParams.set("lang", lang);
        history.replaceState(null, "", url.pathname + url.search + url.hash);
      } catch (e) {}
    });
  });

  applyLang(window.NJ_LANG || "en");
})();
