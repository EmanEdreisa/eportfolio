/* Emmanuel Edreisa: portfolio interactions (vanilla JS) */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- nav: scrolled state ---------- */
  var nav = $(".site-nav");
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 24); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- nav: active section ---------- */
  var navLinks = $$('.nav-links a, .mobile-menu__panel a');
  var sectionIds = ["about", "resume", "work", "experience", "credentials", "contact"];
  var sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }

  function updateActive() {
    var probe = window.innerHeight * 0.4;
    var current = "";
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= probe) current = s.id;
    });
    // bottom of page: footer is short, so force "contact"
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = "contact";
    setActive(current);
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(function () { updateActive(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", updateActive);
  updateActive();

  /* ---------- mobile menu ---------- */
  var menu = $("#mobile-menu");
  var toggle = $(".nav-toggle");
  var lastFocus = null;

  function openMenu() {
    lastFocus = document.activeElement;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
    setTimeout(function () { var first = $(".mobile-menu__panel a", menu); if (first) first.focus(); }, 50);
  }
  function closeMenu(restoreFocus) {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    if (restoreFocus && lastFocus) lastFocus.focus();
  }
  toggle.addEventListener("click", openMenu);
  $$("[data-close-menu]", menu).forEach(function (el) { el.addEventListener("click", function () { closeMenu(true); }); });
  $$(".mobile-menu__panel a", menu).forEach(function (a) { a.addEventListener("click", function () { closeMenu(false); }); });
  window.addEventListener("resize", function () { if (window.innerWidth >= 960 && menu.classList.contains("is-open")) closeMenu(false); });

  /* ---------- reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- project tabs ---------- */
  var tabs = $$('[role="tab"]');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) { panel.hidden = !on; panel.classList.toggle("is-active", on); }
    });
    if (focus) tab.focus({ preventScroll: true });
    // keep the active tab visible inside the horizontally scrolling tab strip (mobile)
    var strip = tab.parentNode;
    var left = tab.offsetLeft - strip.offsetLeft, right = left + tab.offsetWidth;
    if (left < strip.scrollLeft) strip.scrollTo({ left: left - 16, behavior: reduceMotion ? "auto" : "smooth" });
    else if (right > strip.scrollLeft + strip.clientWidth) strip.scrollTo({ left: right - strip.clientWidth + 16, behavior: reduceMotion ? "auto" : "smooth" });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- screenshot thumbs: swap main image ---------- */
  $$("[data-shots]").forEach(function (box) {
    var main = $(".shot-main", box);
    var mainImg = $("img", main);
    var thumbs = $$(".shot-thumbs button", box);
    thumbs.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (btn.classList.contains("is-active")) { openLightboxFrom(main); return; }
        thumbs.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        main.dataset.src = btn.dataset.src;
        main.dataset.caption = btn.dataset.caption;
        mainImg.style.opacity = "0";
        setTimeout(function () {
          mainImg.src = btn.dataset.src;
          mainImg.alt = $("img", btn).alt;
          mainImg.onload = function () { mainImg.style.opacity = "1"; };
          if (mainImg.complete) mainImg.style.opacity = "1";
        }, reduceMotion ? 0 : 180);
      });
    });
  });

  /* ---------- gallery: show all ---------- */
  var galleryToggle = $("[data-gallery-toggle]");
  var gallery = $("[data-gallery]");
  if (galleryToggle && gallery) {
    galleryToggle.addEventListener("click", function () {
      var open = gallery.classList.toggle("is-expanded");
      galleryToggle.setAttribute("aria-expanded", open ? "true" : "false");
      galleryToggle.textContent = open ? "Show fewer" : "Show all 11 pieces";
      if (!open) document.getElementById("gallery").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- lightbox ---------- */
  var lb = $("#lightbox");
  var lbImg = $(".lightbox__img", lb);
  var lbText = $(".lightbox__text", lb);
  var lbCount = $(".lightbox__count", lb);
  var lbPrev = $(".lightbox__nav--prev", lb);
  var lbNext = $(".lightbox__nav--next", lb);
  var lbClose = $(".lightbox__close", lb);
  var group = [], index = 0, lbReturn = null;

  function buildGroup(name) {
    var seen = {}, items = [];
    $$('[data-lightbox="' + name + '"]').forEach(function (el) {
      if (el.classList.contains("shot-main")) return; // main view duplicates a thumb
      if (seen[el.dataset.src]) return;
      seen[el.dataset.src] = true;
      items.push({ src: el.dataset.src, caption: el.dataset.caption || "", alt: ($("img", el) || {}).alt || "" });
    });
    if (!items.length) { // single item, e.g. a main image with no thumbs
      var el = $('[data-lightbox="' + name + '"]');
      items.push({ src: el.dataset.src, caption: el.dataset.caption || "", alt: "" });
    }
    return items;
  }

  function show(i) {
    index = (i + group.length) % group.length;
    var item = group[index];
    lbImg.classList.add("is-loading");
    var img = new Image();
    img.onload = img.onerror = function () {
      lbImg.src = item.src;
      lbImg.alt = item.alt || item.caption;
      lbImg.classList.remove("is-loading");
    };
    img.src = item.src;
    lbText.textContent = item.caption;
    lbCount.textContent = group.length > 1 ? (index + 1) + " / " + group.length : "";
    lbPrev.hidden = lbNext.hidden = group.length < 2;
    // preload neighbour
    if (group.length > 1) { var n = new Image(); n.src = group[(index + 1) % group.length].src; }
  }

  function openLightbox(name, src) {
    group = buildGroup(name);
    var start = 0;
    group.forEach(function (it, k) { if (it.src === src) start = k; });
    lbReturn = document.activeElement;
    lb.hidden = false;
    document.body.classList.add("no-scroll");
    show(start);
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbClose.focus();
  }
  function openLightboxFrom(el) { openLightbox(el.dataset.lightbox, el.dataset.src); }

  function closeLightbox() {
    lb.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    setTimeout(function () { lb.hidden = true; lbImg.src = ""; }, reduceMotion ? 0 : 250);
    if (lbReturn) lbReturn.focus();
  }

  $$("[data-lightbox]").forEach(function (el) {
    if (el.closest(".shot-thumbs")) return; // thumbs swap the main image instead
    el.addEventListener("click", function () { openLightboxFrom(el); });
  });
  lbPrev.addEventListener("click", function () { show(index - 1); });
  lbNext.addEventListener("click", function () { show(index + 1); });
  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.classList.contains("lightbox__figure")) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (!lb.hidden) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight" && group.length > 1) show(index + 1);
      else if (e.key === "ArrowLeft" && group.length > 1) show(index - 1);
      else if (e.key === "Tab") { // keep focus inside the dialog
        var f = [lbClose, lbPrev, lbNext].filter(function (b) { return !b.hidden; });
        var pos = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(pos + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
      return;
    }
    if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu(true);
  });

  // swipe on touch
  var touchX = null;
  lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (touchX === null || group.length < 2) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- resume viewer (PDF.js, lazy-loaded) ---------- */
  var viewer = $(".pdf-viewer");
  if (viewer) {
    var stage = $(".pdf-stage", viewer);
    var zoomLabel = $(".pdf-zoom", viewer);
    var url = viewer.dataset.pdf;
    var PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
    var page = null, scale = 1, fitScale = 1, renderTask = null, started = false;

    function fallback() {
      stage.classList.add("is-iframe");
      stage.innerHTML = '<iframe src="' + url + '#view=FitH" title="Resume PDF"></iframe>';
      $$(".pdf-controls button", viewer).forEach(function (b) { b.disabled = true; b.style.opacity = ".35"; });
      zoomLabel.textContent = "";
    }

    function render() {
      if (!page) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      var vp = page.getViewport({ scale: scale });
      var canvas = $("canvas", stage) || document.createElement("canvas");
      canvas.width = Math.floor(vp.width * dpr);
      canvas.height = Math.floor(vp.height * dpr);
      canvas.style.width = Math.floor(vp.width) + "px";
      canvas.style.height = Math.floor(vp.height) + "px";
      if (!canvas.parentNode) { stage.innerHTML = ""; stage.appendChild(canvas); }
      if (renderTask) renderTask.cancel();
      renderTask = page.render({
        canvasContext: canvas.getContext("2d"),
        viewport: vp,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null
      });
      renderTask.promise.catch(function () {});
      zoomLabel.textContent = Math.round((scale / fitScale) * 100) + "%";
    }

    function computeFit() {
      var pad = parseFloat(getComputedStyle(stage).paddingLeft) * 2;
      var w = stage.clientWidth - pad;
      fitScale = w / page.getViewport({ scale: 1 }).width;
    }

    function start() {
      if (started) return; started = true;
      var s = document.createElement("script");
      s.src = PDFJS + "pdf.min.js";
      s.onload = function () {
        var lib = window.pdfjsLib;
        if (!lib) return fallback();
        lib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
        lib.getDocument(url).promise.then(function (doc) { return doc.getPage(1); }).then(function (p) {
          page = p; computeFit(); scale = fitScale; render();
        }).catch(fallback);
      };
      s.onerror = fallback;
      document.head.appendChild(s);
    }

    $$("[data-zoom]", viewer).forEach(function (b) {
      b.addEventListener("click", function () {
        if (!page) return;
        var z = b.dataset.zoom, rel = scale / fitScale;
        if (z === "in") rel = Math.min(rel + 0.25, 3);
        else if (z === "out") rel = Math.max(rel - 0.25, 0.5);
        else rel = 1;
        scale = fitScale * rel; render();
      });
    });

    var rt;
    window.addEventListener("resize", function () {
      if (!page) return;
      clearTimeout(rt);
      rt = setTimeout(function () { var rel = scale / fitScale; computeFit(); scale = fitScale * rel; render(); }, 200);
    });

    if ("IntersectionObserver" in window) {
      var pio = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { start(); pio.disconnect(); }
      }, { rootMargin: "600px 0px" });
      pio.observe(viewer);
    } else { start(); }
  }
})();
