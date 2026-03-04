/* ============================================================
   FLEVIE — Main JavaScript
   Features: Navbar scroll, Countdown, Smooth scroll,
             Scroll-to-top, Fade-in animations, Product slider,
             Momentum (inertia) scroll
   ============================================================ */

"use strict";

/* ── Helpers ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Navbar: shadow on scroll ────────────────────────────── */
function initNavbar() {
  const nav = $("#mainNav");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── Countdown Timer ─────────────────────────────────────── */
function initCountdown() {
  const days = $("#cd-days");
  const hours = $("#cd-hours");
  const mins = $("#cd-mins");
  const secs = $("#cd-secs");
  if (!days) return;

  const target = new Date();
  target.setDate(target.getDate() + 2);
  target.setHours(target.getHours() + 6);
  target.setMinutes(target.getMinutes() + 5);

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    const diff = Math.max(0, target - Date.now());
    days.textContent = pad(Math.floor(diff / 86400000));
    hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    mins.textContent = pad(Math.floor((diff % 3600000) / 60000));
    secs.textContent = pad(Math.floor((diff % 60000) / 1000));
    if (diff > 0) requestAnimationFrame(() => setTimeout(tick, 1000));
  }
  tick();
}

/* ── Scroll-to-Top Button ────────────────────────────────── */
function initScrollTop() {
  const btn = $("#scrollTop");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ── Fade-up on Scroll (IntersectionObserver) ────────────── */
function initFadeUp() {
  const els = $$(".fade-up");
  if (!els.length || !window.IntersectionObserver) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => obs.observe(el));
}

/* ── Carousel Dots ───────────────────────────────────────── */
function initDots() {
  $$(".carousel-dots").forEach((wrap) => {
    const dots = $$(".carousel-dot", wrap);
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        dots.forEach((d) => d.classList.remove("active"));
        dot.classList.add("active");
      });
    });
  });
}

/* ── Smooth In-Page Anchor Scroll ────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = $(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById("mainNav")?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

/* ── Product Slider ──────────────────────────────────────── */
function initProductSliders() {
  $$("[data-slider]").forEach((wrap) => {
    const prev = $("[data-prev]", wrap.parentElement);
    const next = $("[data-next]", wrap.parentElement);
    const cards = $$(".product-card", wrap);
    let idx = 0;

    // Always >= 2 per row
    const visibleCount = () =>
      window.innerWidth < 768
        ? 2      // mobile  → 2 per row
        : window.innerWidth < 992
          ? 3    // tablet  → 3 per row
          : 4;   // desktop → 4 per row

    const show = () => {
      const cnt = visibleCount();
      cards.forEach((c, i) => {
        c.style.display = i >= idx && i < idx + cnt ? "" : "none";
      });
    };

    if (prev) prev.addEventListener("click", () => { idx = Math.max(0, idx - 1); show(); });
    if (next) next.addEventListener("click", () => {
      idx = Math.min(cards.length - visibleCount(), idx + 1);
      show();
    });

    window.addEventListener("resize", show, { passive: true });
    show();
  });
}

/* ── Newsletter Form ─────────────────────────────────────── */
function initNewsletter() {
  const form = $("#newsletterForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $('input[type="email"]', form);
    const btn = $("button", form);
    if (!input.value.trim()) return;
    btn.textContent = "Subscribed ✓";
    btn.disabled = true;
    btn.style.background = "var(--color-accent)";
    input.value = "";
    setTimeout(() => {
      btn.textContent = "Subscribe";
      btn.disabled = false;
      btn.style.background = "";
    }, 3000);
  });
}

/* ── Deals Slider ────────────────────────────────────────── */
function initDealsSlider() {
  const slides = $$(".deals-slide");
  const dots = $$("#dealsDots .carousel-dot");
  const prevBtn = $(".deals-prev", $("#dealsSlider"));
  const nextBtn = $(".deals-next", $("#dealsSlider"));
  if (!slides.length) return;

  let current = 0, timer = null;

  function goTo(n) {
    slides[current].classList.remove("active");
    dots[current]?.classList.remove("active");
    current = ((n % slides.length) + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current]?.classList.add("active");
  }
  const startTimer = () => { timer = setInterval(() => goTo(current + 1), 8000); };
  const resetTimer = () => { clearInterval(timer); startTimer(); };

  dots.forEach((dot, i) => dot.addEventListener("click", () => { goTo(i); resetTimer(); }));
  if (prevBtn) prevBtn.addEventListener("click", () => { goTo(current - 1); resetTimer(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { goTo(current + 1); resetTimer(); });

  const slider = $("#dealsSlider");
  if (slider) {
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", startTimer);
  }
  startTimer();
}

/* ── Hero Slider ─────────────────────────────────────────── */
function initHeroSlider() {
  const items = $$(".hero-item");
  const dots = $$(".hero-dot");
  const prev = $("#heroPrev");
  const next = $("#heroNext");
  const total = items.length;
  if (!total) return;

  const POS = ["pos-center", "pos-right", "pos-hidden-right", "pos-hidden-left", "pos-left"];
  let activeCenter = 0, timer = null;

  function updatePositions() {
    items.forEach((item, i) => {
      item.classList.remove(...POS);
      item.classList.add(POS[(i - activeCenter + total) % total]);
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === activeCenter));
  }
  function goTo(n) { activeCenter = ((n % total) + total) % total; updatePositions(); }
  const startTimer = () => { timer = setInterval(() => goTo(activeCenter + 1), 8000); };
  const resetTimer = () => { clearInterval(timer); startTimer(); };

  if (prev) prev.addEventListener("click", () => { goTo(activeCenter - 1); resetTimer(); });
  if (next) next.addEventListener("click", () => { goTo(activeCenter + 1); resetTimer(); });
  dots.forEach((dot, i) => dot.addEventListener("click", () => { goTo(i); resetTimer(); }));

  const stage = $(".hero-stage");
  if (stage) {
    stage.addEventListener("mouseenter", () => clearInterval(timer));
    stage.addEventListener("mouseleave", startTimer);
  }
  updatePositions();
  startTimer();
}

/* ── Bootstrap Mobile Menu ───────────────────────────────── */
function initMobileMenu() {
  const toggler = $(".navbar-toggler");
  const collapse = $("#navCollapse");
  if (!toggler || !collapse) return;

  // Handle dropdown toggles on mobile
  $$(".custom-dropdown-link > .nav-link", collapse).forEach((link) => {
    link.addEventListener("click", (e) => {
      // Only behave as toggle on mobile view
      if (window.innerWidth < 992) {
        e.preventDefault();
        const parent = link.parentElement;
        parent.classList.toggle("open");
      }
    });
  });

  // Close the menu when a standard link or a dropdown item is clicked
  $$(".navbar-nav .nav-link, .custom-dropdown-menu a", collapse).forEach((link) => {
    link.addEventListener("click", () => {
      // Do nothing if it's hitting a dropdown toggle on mobile
      if (window.innerWidth < 992 && link.parentElement.classList.contains("custom-dropdown-link")) {
        return;
      }
      const bsCollapse = bootstrap.Collapse.getInstance(collapse);
      if (bsCollapse) bsCollapse.hide();
    });
  });
}

/* ── GSAP ScrollSmoother ──────────────────────────────────────
   Uses GSAP ScrollSmoother for premium inertia scrolling.
──────────────────────────────────────────────────────────── */
function initMomentumScroll() {
  // 17. scroll wrapper //
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);

  if ($('#smooth-wrapper') && $('#smooth-content')) {
    ScrollSmoother.create({
      smooth: 1.35,
      effects: true,
      smoothTouch: 0.1,
      ignoreMobileResize: true
    });
  }
}

/* ── Shop Page Filters ───────────────────────────────────── */
function initShopFilters() {
  const clearBtn = $("#clearFiltersBtn");
  const applyBtn = $("#applyFiltersBtn");
  if (!clearBtn || !applyBtn) return;

  clearBtn.addEventListener("click", () => {
    // Uncheck all checkboxes
    $$(".shop-sidebar .filter-check input[type='checkbox']").forEach(cb => cb.checked = false);
    
    // Remove active styles from buttons and tags
    $$(".size-btn, .color-btn, .sidebar-tag").forEach(btn => btn.classList.remove("active"));
  });

  applyBtn.addEventListener("click", () => {
    const originalText = applyBtn.textContent;
    applyBtn.textContent = "Applied ✓";
    applyBtn.style.background = "var(--color-accent)";
    setTimeout(() => {
      applyBtn.textContent = originalText;
      applyBtn.style.background = "";
    }, 1500);
  });

  // Handle click toggling on buttons and tags for demo purposes
  $$(".size-btn, .color-btn, .sidebar-tag").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });
}

/* ── Init All ────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initCountdown();
  initScrollTop();
  initFadeUp();
  initDots();
  initSmoothScroll();
  initProductSliders();
  initNewsletter();
  initDealsSlider();
  initHeroSlider();
  initMobileMenu();
  initMomentumScroll();
  initShopFilters();
});
