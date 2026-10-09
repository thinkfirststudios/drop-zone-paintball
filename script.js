/* Drop Zone Paintball Park — spec mockup. Impact-led motion: things land, splat, settle.
   Paint lands once — no loops. Everything renders final without JS or under reduced motion. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) root.classList.add("js-motion");

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Mobile nav
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { btn.click(); btn.focus(); }
    });
  }

  // Sticky header condenses; phone stays visible
  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () { head.classList.toggle("is-condensed", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  // Count-up — verified figures only: 37, 80 (+), 1989. Final value is already in the HTML.
  function countUp(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), from = parseInt(el.getAttribute("data-from") || "0", 10);
    if (isNaN(end) || reduce) return;
    var t0 = null, dur = 900;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(from + (end - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step); else el.textContent = end;
    }
    requestAnimationFrame(step);
  }

  // Scroll indicator: one paint hit per section, accumulating down the right edge
  var trail = document.querySelector(".hit-trail");
  var sections = Array.prototype.slice.call(document.querySelectorAll("main > section, main > .band-1989, main > .paths"));

  if (root.classList.contains("js-motion")) {
    document.querySelectorAll(".rv-stagger").forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) { c.classList.add("rv"); c.style.setProperty("--i", i); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        en.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  }

  if (trail && sections.length) {
    var hit = {};
    var place = function (i) {
      if (hit[i]) return; hit[i] = true;
      var d = document.createElement("i");
      d.style.top = (sections.length > 1 ? (i / (sections.length - 1)) * 100 : 0) + "%";
      d.style.transform = "rotate(" + ((i * 67) % 360) + "deg)";
      trail.appendChild(d);
    };
    if ("IntersectionObserver" in window) {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) place(sections.indexOf(en.target)); });
      }, { threshold: 0.25 });
      sections.forEach(function (s) { tio.observe(s); });
    }
  }

  // Count-ups outside .rv containers (e.g. the 1989 band)
  if (!root.classList.contains("js-motion")) { /* final values already rendered */ }

  // Impact-burst: a splat blooms from the pointer on buttons and cards, then settles. No loop.
  document.addEventListener("pointerdown", function (e) { burst(e, true); });
  document.addEventListener("pointerover", function (e) { burst(e, false); });
  function burst(e, force) {
    var host = e.target.closest && e.target.closest(".btn, .card, .party");
    if (!host) return;
    if (!force && host.contains(e.relatedTarget)) return;
    if (host.querySelector(":scope > .burst") && !force) return;
    var r = host.getBoundingClientRect(), s = document.createElement("span");
    s.className = "burst"; s.setAttribute("aria-hidden", "true");
    s.style.left = (e.clientX - r.left) + "px"; s.style.top = (e.clientY - r.top) + "px";
    s.style.rotate = Math.round(Math.random() * 360) + "deg";
    var old = host.querySelector(":scope > .burst"); if (old) old.remove();
    host.appendChild(s);
    host.addEventListener("pointerleave", function () { s.remove(); }, { once: true });
  }

  // Party carousel buttons
  document.querySelectorAll("[data-carousel]").forEach(function (c) {
    var track = c.querySelector(".carousel-track");
    c.querySelectorAll("[data-dir]").forEach(function (b) {
      b.addEventListener("click", function () {
        var card = track.querySelector(".party");
        var step = card ? card.getBoundingClientRect().width + 24 : 280;
        track.scrollBy({ left: step * parseInt(b.getAttribute("data-dir"), 10), behavior: reduce ? "auto" : "smooth" });
      });
    });
  });

  // Forms — mockup only, not connected
  document.querySelectorAll("form[data-mock]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var errId = f.id + "-err", err = document.getElementById(errId);
        var bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) {
          ok = false;
          if (!err) {
            err = document.createElement("p"); err.className = "err"; err.id = errId;
            err.textContent = f.type === "email" ? "Enter a valid email address." : "Please fill this in.";
            f.insertAdjacentElement("afterend", err); f.setAttribute("aria-describedby", errId);
          }
        } else if (err) { err.remove(); f.removeAttribute("aria-describedby"); }
      });
      if (!ok) { var first = form.querySelector('[aria-invalid="true"]'); if (first) first.focus(); return; }
      var status = form.querySelector(".form-status");
      status.hidden = false;
      status.textContent = "Mockup only — this form is not connected and nothing was sent. [FORM HANDLER / RESERVATION FLOW — CONFIRM]";
      status.focus();
    });
  });
})();
