/* ============================================================
   SITECRAFT — STABLE CINEMATIC MOTION ENGINE
   ------------------------------------------------------------
   PURPOSE:
   Premium 3D motion without animation conflicts.

   IMPORTANT:
   This engine intentionally does NOT control:
   - custom cursor
   - page transitions
   - scroll velocity
   - button magnetic movement
   - card hover transforms

   Those systems are commonly responsible for transform conflicts.

   REQUIRES:
   - GSAP
   - ScrollTrigger
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     SAFETY
     ============================================================ */

  if (window.__SITECRAFT_STABLE_MOTION__) {
    console.warn("[SiteCraft] Motion engine already running.");
    return;
  }

  window.__SITECRAFT_STABLE_MOTION__ = true;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const finePointer = window.matchMedia(
    "(pointer: fine)"
  ).matches;

  const qs = (selector, parent = document) =>
    parent.querySelector(selector);

  const qsa = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  /* ============================================================
     GSAP SAFETY
     ============================================================ */

  if (!gsap) {
    console.warn(
      "[SiteCraft Motion] GSAP not found. Native website restored."
    );

    document.documentElement.classList.add(
      "sitecraft-motion-fallback"
    );

    qsa("[style]").forEach((el) => {
      if (el.dataset.scMotionHidden === "1") {
        el.style.opacity = "";
        el.style.visibility = "";
      }
    });

    return;
  }

  if (ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ============================================================
     GLOBAL CONFIG
     ============================================================ */

  gsap.config({
    nullTargetWarn: false
  });

  gsap.defaults({
    overwrite: "auto"
  });

  let resizeTimer = null;

  /* ============================================================
     RUNTIME CSS
     ------------------------------------------------------------
     Very conservative CSS.
     No body transforms.
     No html perspective.
     No fixed cursor.
     No overflow tricks.
     ============================================================ */

  function injectCSS() {
    if (document.getElementById("sitecraft-stable-motion-css")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "sitecraft-stable-motion-css";

    style.textContent = `
      /* ---------------------------------------------
         GLOBAL
         --------------------------------------------- */

      html {
        overflow-x: hidden;
      }

      body {
        overflow-x: hidden;
      }

      .hero,
      .section,
      .about-intro,
      .services,
      .pricing,
      .portfolio,
      .process,
      .cta-final {
        transform-style: preserve-3d;
      }

      /* ---------------------------------------------
         HERO
         --------------------------------------------- */

      .hero-visual {
        transform-style: preserve-3d;
        transform-origin: center center;
        backface-visibility: hidden;
        will-change: transform;
      }

      .hero-bg {
        transform-style: preserve-3d;
        backface-visibility: hidden;
        will-change: transform;
      }

      .hero-bg .grid,
      .hero-bg .glow {
        transform-origin: center center;
        will-change: transform;
      }

      .eco-icon {
        transform-style: preserve-3d;
        backface-visibility: hidden;
        will-change: transform;
      }

      .hv-browser {
        transform-style: preserve-3d;
        backface-visibility: hidden;
        will-change: transform;
      }

      /* ---------------------------------------------
         CARDS
         --------------------------------------------- */

      .service-card,
      .price-card,
      .concept-card,
      .value-card,
      .coming-card,
      .mini-price-card {
        transform-style: preserve-3d;
        backface-visibility: hidden;
        will-change: transform, opacity;
      }

      /* ---------------------------------------------
         IMAGES
         --------------------------------------------- */

      .concept-preview {
        overflow: hidden;
        transform-style: preserve-3d;
      }

      .concept-preview img {
        transform-origin: center center;
        will-change: transform;
        backface-visibility: hidden;
      }

      /* ---------------------------------------------
         PROCESS
         --------------------------------------------- */

      .sc-process-line {
        pointer-events: none;
        position: absolute;
        z-index: 0;
      }

      .sc-process-line-fill {
        transform-origin: top center;
      }

      /* ---------------------------------------------
         MOTION DEPTH
         --------------------------------------------- */

      .sc-depth-inner {
        transform-style: preserve-3d;
        backface-visibility: hidden;
      }

      /* ---------------------------------------------
         DESKTOP ONLY
         --------------------------------------------- */

      @media (min-width: 769px) {
        .hero,
        .section,
        .cta-final {
          perspective: 1400px;
        }
      }

      /* ---------------------------------------------
         MOBILE
         --------------------------------------------- */

      @media (max-width: 768px) {
        .hero-visual,
        .service-card,
        .price-card,
        .concept-card,
        .value-card,
        .coming-card,
        .mini-price-card {
          transform-style: preserve-3d;
        }
      }

      /* ---------------------------------------------
         REDUCED MOTION
         --------------------------------------------- */

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          scroll-behavior: auto !important;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ============================================================
     REFRESH
     ============================================================ */

  function safeRefresh() {
    if (!ScrollTrigger) return;

    requestAnimationFrame(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.warn(
          "[SiteCraft Motion] Refresh warning:",
          error
        );
      }
    });
  }

  /* ============================================================
     HERO
     ------------------------------------------------------------
     IMPORTANT:
     Only ONE GSAP timeline controls hero scroll.
     Mouse movement controls ONLY inner browser layer.
     ============================================================ */

  function initHero() {
    const hero = qs(".hero");

    if (!hero) return;

    const visual = qs(".hero-visual", hero);
    const browser = qs(".hv-browser", hero);
    const bg = qs(".hero-bg", hero);
    const grid = qs(".hero-bg .grid", hero);
    const glow = qs(".hero-bg .glow", hero);

    const label = qs(".hero-label", hero);
    const heading = qs(".hero h1", hero);
    const sub = qs(".hero-sub", hero);
    const ctas = qs(".hero-ctas", hero);
    const meta = qs(".hero-meta", hero);

    const objects = qsa(
      ".eco-icon",
      hero
    );

    /* ----------------------------------------------------------
       HERO LOAD-IN
       ---------------------------------------------------------- */

    if (!reduceMotion) {
      const intro = gsap.timeline({
        defaults: {
          ease: "power3.out"
        }
      });

      const textElements = [
        label,
        heading,
        sub,
        ctas,
        meta
      ].filter(Boolean);

      if (textElements.length) {
        gsap.set(textElements, {
          opacity: 0,
          y: 30
        });
      }

      if (visual) {
        gsap.set(visual, {
          opacity: 0,
          scale: 0.94,
          y: 25,
          rotateX: 2,
          rotateY: -3
        });
      }

      if (grid) {
        gsap.set(grid, {
          opacity: 0,
          scale: 1.04
        });
      }

      if (glow) {
        gsap.set(glow, {
          opacity: 0,
          scale: 0.94
        });
      }

      if (label) {
        intro.to(
          label,
          {
            opacity: 1,
            y: 0,
            duration: 0.45
          },
          0.05
        );
      }

      if (heading) {
        intro.to(
          heading,
          {
            opacity: 1,
            y: 0,
            duration: 0.8
          },
          0.1
        );
      }

      if (sub) {
        intro.to(
          sub,
          {
            opacity: 1,
            y: 0,
            duration: 0.6
          },
          0.28
        );
      }

      if (ctas) {
        intro.to(
          ctas,
          {
            opacity: 1,
            y: 0,
            duration: 0.55
          },
          0.4
        );
      }

      if (meta) {
        intro.to(
          meta,
          {
            opacity: 1,
            y: 0,
            duration: 0.45
          },
          0.52
        );
      }

      if (visual) {
        intro.to(
          visual,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            duration: 1
          },
          0.12
        );
      }

      if (grid) {
        intro.to(
          grid,
          {
            opacity: 1,
            scale: 1,
            duration: 0.9
          },
          0.05
        );
      }

      if (glow) {
        intro.to(
          glow,
          {
            opacity: 1,
            scale: 1,
            duration: 1
          },
          0.05
        );
      }
    }

    /* ----------------------------------------------------------
       FLOATING HERO OBJECTS
       ---------------------------------------------------------- */

    if (!reduceMotion && objects.length) {
      objects.forEach((object, index) => {
        gsap.fromTo(
          object,
          {
            opacity: 0,
            y: 35,
            scale: 0.88,
            rotateZ: index % 2 ? 5 : -5
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateZ: 0,
            duration: 0.8,
            delay: 0.2 + index * 0.06,
            ease: "back.out(1.4)"
          }
        );

        if (finePointer) {
          gsap.to(object, {
            y: index % 2 ? 7 : -7,
            rotationZ: index % 2 ? 2 : -2,
            duration: 2.8 + index * 0.15,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.12
          });
        }
      });
    }

    /* ----------------------------------------------------------
       HERO SCROLL
       ----------------------------------------------------------
       NO PIN.
       NO EXTREME SCALE.
       NO OPACITY ZERO.
       This eliminates the white blank/jump problem.
       ---------------------------------------------------------- */

    if (ScrollTrigger && !reduceMotion) {
      const desktop = window.matchMedia(
        "(min-width: 769px)"
      ).matches;

      if (desktop) {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=650",
            scrub: 1.1,
            invalidateOnRefresh: true
          }
        });

        /* Text moves away */

        if (label) {
          timeline.to(
            label,
            {
              y: -45,
              opacity: 0.25,
              ease: "none"
            },
            0
          );
        }

        if (heading) {
          timeline.to(
            heading,
            {
              y: -90,
              scale: 0.9,
              opacity: 0.18,
              ease: "none"
            },
            0
          );
        }

        if (sub) {
          timeline.to(
            sub,
            {
              y: -55,
              opacity: 0.2,
              ease: "none"
            },
            0.03
          );
        }

        if (ctas) {
          timeline.to(
            ctas,
            {
              y: -35,
              opacity: 0.35,
              scale: 0.96,
              ease: "none"
            },
            0.05
          );
        }

        /* Browser comes toward viewer */

        if (visual) {
          timeline.to(
            visual,
            {
              scale: 1.16,
              y: -20,
              rotateX: 2,
              rotateY: -4,
              ease: "none"
            },
            0
          );
        }

        if (grid) {
          timeline.to(
            grid,
            {
              xPercent: -5,
              yPercent: 4,
              scale: 1.08,
              ease: "none"
            },
            0
          );
        }

        if (glow) {
          timeline.to(
            glow,
            {
              scale: 1.25,
              opacity: 0.8,
              ease: "none"
            },
            0
          );
        }

        if (bg) {
          timeline.to(
            bg,
            {
              y: -25,
              ease: "none"
            },
            0
          );
        }

        /*
          Second phase:
          camera gently pulls back.
          This gives zoom-in → zoom-out feeling
          without disappearing.
        */

        if (visual) {
          timeline.to(
            visual,
            {
              scale: 1.04,
              y: 5,
              rotateY: 2,
              rotateX: -1,
              ease: "none"
            },
            0.55
          );
        }

        if (grid) {
          timeline.to(
            grid,
            {
              xPercent: 2,
              yPercent: -2,
              scale: 1.02,
              ease: "none"
            },
            0.55
          );
        }
      } else {
        /* ------------------------------------------------------
           MOBILE
           ------------------------------------------------------ */

        if (visual) {
          gsap.to(
            visual,
            {
              y: -25,
              scale: 1.035,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: 1
              }
            }
          );
        }

        if (grid) {
          gsap.to(
            grid,
            {
              yPercent: -3,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: 1
              }
            }
          );
        }
      }
    }

    /* ----------------------------------------------------------
       HERO MOUSE PARALLAX
       ----------------------------------------------------------
       IMPORTANT:
       Mouse controls browser ONLY.
       Scroll controls hero-visual.
       Therefore no transform fight.
       ---------------------------------------------------------- */

    if (
      finePointer &&
      !reduceMotion &&
      browser
    ) {
      let targetX = 0;
      let targetY = 0;

      const move = (event) => {
        const rect =
          hero.getBoundingClientRect();

        const x =
          (event.clientX -
            rect.left) /
            rect.width -
          0.5;

        const y =
          (event.clientY -
            rect.top) /
            rect.height -
          0.5;

        targetX = clamp(x, -0.5, 0.5);
        targetY = clamp(y, -0.5, 0.5);
      };

      hero.addEventListener(
        "pointermove",
        move,
        { passive: true }
      );

      hero.addEventListener(
        "pointerleave",
        () => {
          targetX = 0;
          targetY = 0;
        },
        { passive: true }
      );

      const quickX = gsap.quickTo(
        browser,
        "x",
        {
          duration: 0.45,
          ease: "power3.out"
        }
      );

      const quickY = gsap.quickTo(
        browser,
        "y",
        {
          duration: 0.45,
          ease: "power3.out"
        }
      );

      const quickRX = gsap.quickTo(
        browser,
        "rotateX",
        {
          duration: 0.45,
          ease: "power3.out"
        }
      );

      const quickRY = gsap.quickTo(
        browser,
        "rotateY",
        {
          duration: 0.45,
          ease: "power3.out"
        }
      );

      const mouseLoop = () => {
        quickX(targetX * 16);
        quickY(targetY * 10);
        quickRX(targetY * -3);
        quickRY(targetX * 4);

        requestAnimationFrame(mouseLoop);
      };

      requestAnimationFrame(mouseLoop);
    }
  }

  /* ============================================================
     ABOUT
     ------------------------------------------------------------
     Words animate once.
     No second animation on same heading.
     ============================================================ */

  function initAbout() {
    const section =
      qs(".about-intro");

    const heading =
      qs(".about-intro h2");

    if (
      !section ||
      !heading ||
      !ScrollTrigger ||
      reduceMotion
    ) {
      return;
    }

    if (!heading.dataset.scStableWords) {
      const text =
        heading.textContent
          .trim()
          .replace(/\s+/g, " ");

      const words =
        text.split(" ");

      heading.innerHTML =
        words
          .map(
            (word) =>
              `<span class="sc-stable-word">${word}</span>`
          )
          .join(" ");

      heading.dataset.scStableWords = "1";
    }

    const words =
      qsa(
        ".sc-stable-word",
        heading
      );

    if (!words.length) return;

    gsap.set(words, {
      opacity: 0,
      y: 35,
      rotateX: -35,
      transformOrigin: "center bottom"
    });

    gsap.to(words, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger: 0.035,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 82%",
        end: "top 45%",
        scrub: 0.8
      }
    });
  }

  /* ============================================================
     CARD ENTRANCES
     ------------------------------------------------------------
     ONE animation per card.
     No hover transform.
     No duplicate service/pricing/card animation.
     ============================================================ */

  function initCards() {
    if (!ScrollTrigger || reduceMotion) return;

    const cards =
      qsa(
        [
          ".service-card",
          ".price-card",
          ".concept-card",
          ".value-card",
          ".coming-card",
          ".mini-price-card"
        ].join(",")
      );

    if (!cards.length) return;

    cards.forEach((card, index) => {
      if (card.dataset.scStableCard) {
        return;
      }

      card.dataset.scStableCard = "1";

      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 55,
          scale: 0.94,
          rotateX: 7,
          rotateY:
            index % 2 === 0
              ? -2.5
              : 2.5
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            end: "top 58%",
            scrub: 0.7,
            invalidateOnRefresh: true
          }
        }
      );
    });
  }

  /* ============================================================
     CARD INTERNAL ELEMENTS
     ------------------------------------------------------------
     Text/icon comes slightly forward.
     Does NOT transform parent again.
     ============================================================ */

  function initCardInternals() {
    if (!ScrollTrigger || reduceMotion) return;

    const cards =
      qsa(
        [
          ".service-card",
          ".price-card",
          ".concept-card",
          ".value-card"
        ].join(",")
      );

    cards.forEach((card) => {
      const children =
        qsa(
          "h3, h4, p, .service-top, .service-icon, .value-icon, .num, a, .price, .concept-preview",
          card
        );

      if (!children.length) return;

      gsap.fromTo(
        children,
        {
          opacity: 0,
          y: 18
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.025,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
            end: "top 55%",
            scrub: 0.65
          }
        }
      );
    });
  }

  /* ============================================================
     PORTFOLIO IMAGES
     ------------------------------------------------------------
     Image zoom only.
     Card itself handled separately.
     ============================================================ */

  function initPortfolio() {
    if (!ScrollTrigger || reduceMotion) return;

    const images =
      qsa(
        ".concept-preview img"
      );

    images.forEach((image) => {
      const card =
        image.closest(
          ".concept-card"
        ) || image;

      if (image.dataset.scStableImage) {
        return;
      }

      image.dataset.scStableImage = "1";

      gsap.fromTo(
        image,
        {
          scale: 1.12
        },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 92%",
            end: "center 45%",
            scrub: 1,
            invalidateOnRefresh: true
          }
        }
      );
    });
  }

  /* ============================================================
     SECTION HEADINGS
     ------------------------------------------------------------ */

  function initHeadings() {
    if (!ScrollTrigger || reduceMotion) return;

    const headings =
      qsa(
        "section h2, .section-head h2"
      );

    headings.forEach((heading) => {
      if (
        heading.closest(".about-intro") ||
        heading.dataset.scStableHeading
      ) {
        return;
      }

      heading.dataset.scStableHeading = "1";

      gsap.fromTo(
        heading,
        {
          opacity: 0,
          y: 35,
          scale: 0.97
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heading,
            start: "top 88%",
            toggleActions:
              "play none none reverse"
          }
        }
      );
    });
  }

  /* ============================================================
     GENERIC REVEALS
     ------------------------------------------------------------
     Existing .reveal classes are used by SiteCraft already.
     We animate them ONLY if they aren't already marked visible.
     ============================================================ */

  function initReveals() {
    if (!ScrollTrigger || reduceMotion) return;

    const elements =
      qsa(
        ".reveal:not(.is-visible):not(.sc-stable-reveal), .stagger:not(.is-visible):not(.sc-stable-reveal)"
      );

    elements.forEach((element) => {
      element.classList.add(
        "sc-stable-reveal"
      );

      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 35
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 90%",
            toggleActions:
              "play none none reverse"
          }
        }
      );
    });
  }

  /* ============================================================
     PROCESS
     ------------------------------------------------------------
     Stable vertical line.
     No transform on whole process section.
     ============================================================ */

  function initProcess() {
    const section =
      qs(".process");

    if (
      !section ||
      !ScrollTrigger ||
      reduceMotion
    ) {
      return;
    }

    const steps =
      qsa(
        ".process-step",
        section
      );

    if (!steps.length) return;

    /* ----------------------------------------------------------
       STEP ANIMATION
       ---------------------------------------------------------- */

    steps.forEach((step, index) => {
      if (step.dataset.scStableProcess) {
        return;
      }

      step.dataset.scStableProcess = "1";

      gsap.fromTo(
        step,
        {
          opacity: 0,
          x: index % 2 === 0 ? -30 : 30,
          y: 25,
          scale: 0.97
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: step,
            start: "top 84%",
            end: "top 58%",
            scrub: 0.7
          }
        }
      );
    });

    /* ----------------------------------------------------------
       ONLY CREATE LINE IF NEEDED
       ---------------------------------------------------------- */

    let line =
      qs(
        ".sc-process-line",
        section
      );

    if (!line) {
      line =
        document.createElement(
          "div"
        );

      line.className =
        "sc-process-line";

      Object.assign(
        line.style,
        {
          left: "24px",
          top: "0",
          bottom: "0",
          width: "2px",
          background:
            "rgba(20,107,255,.12)"
        }
      );

      const fill =
        document.createElement(
          "div"
        );

      fill.className =
        "sc-process-line-fill";

      Object.assign(
        fill.style,
        {
          width: "100%",
          height: "0%",
          background:
            "linear-gradient(to bottom,#146BFF,#67A3FF)"
        }
      );

      line.appendChild(fill);

      const position =
        getComputedStyle(
          section
        ).position;

      if (position === "static") {
        section.style.position =
          "relative";
      }

      section.appendChild(line);
    }

    const fill =
      qs(
        ".sc-process-line-fill",
        line
      );

    if (fill) {
      gsap.to(
        fill,
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "bottom 42%",
            scrub: 0.8
          }
        }
      );
    }
  }

  /* ============================================================
     CTA
     ------------------------------------------------------------
     NO PIN.
     No disappearing CTA.
     Cinematic scale only.
     ============================================================ */

  function initCTA() {
    const cta =
      qs(".cta-final");

    if (
      !cta ||
      !ScrollTrigger ||
      reduceMotion
    ) {
      return;
    }

    const content =
      qs(".cta-grid", cta) ||
      qs(".cta-content", cta) ||
      cta.firstElementChild;

    const heading =
      qs("h2", cta);

    const paragraph =
      qs("p", cta);

    if (content) {
      gsap.fromTo(
        content,
        {
          opacity: 0.65,
          scale: 0.9,
          y: 35
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cta,
            start: "top 82%",
            end: "top 42%",
            scrub: 0.9
          }
        }
      );
    }

    if (heading) {
      gsap.fromTo(
        heading,
        {
          opacity: 0.3,
          scale: 1.06
        },
        {
          opacity: 1,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: cta,
            start: "top 78%",
            end: "center 48%",
            scrub: 0.8
          }
        }
      );
    }

    if (paragraph) {
      gsap.fromTo(
        paragraph,
        {
          opacity: 0,
          y: 20
        },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: paragraph,
            start: "top 88%",
            end: "top 62%",
            scrub: 0.7
          }
        }
      );
    }
  }

  /* ============================================================
     HERO INNER DEPTH
     ------------------------------------------------------------
     Gives browser itself additional depth without touching
     hero-visual scroll transform.
     ============================================================ */

  function initBrowserDepth() {
    if (
      !finePointer ||
      reduceMotion
    ) {
      return;
    }

    const browsers =
      qsa(
        ".hv-browser"
      );

    browsers.forEach((browser) => {
      if (browser.dataset.scStableBrowser) {
        return;
      }

      browser.dataset.scStableBrowser = "1";

      const quickRX =
        gsap.quickTo(
          browser,
          "rotateX",
          {
            duration: 0.4,
            ease: "power3.out"
          }
        );

      const quickRY =
        gsap.quickTo(
          browser,
          "rotateY",
          {
            duration: 0.4,
            ease: "power3.out"
          }
        );

      browser.addEventListener(
        "pointermove",
        (event) => {
          const rect =
            browser.getBoundingClientRect();

          if (
            !rect.width ||
            !rect.height
          ) {
            return;
          }

          const x =
            (event.clientX -
              rect.left) /
              rect.width -
            0.5;

          const y =
            (event.clientY -
              rect.top) /
              rect.height -
            0.5;

          quickRX(y * -2.5);
          quickRY(x * 3);
        },
        { passive: true }
      );

      browser.addEventListener(
        "pointerleave",
        () => {
          quickRX(0);
          quickRY(0);
        },
        { passive: true }
      );
    });
  }

  /* ============================================================
     IMAGE MICRO PARALLAX
     ------------------------------------------------------------
     Very small movement.
     ============================================================ */

  function initImageParallax() {
    if (
      !finePointer ||
      reduceMotion
    ) {
      return;
    }

    const previews =
      qsa(
        ".concept-preview"
      );

    previews.forEach((preview) => {
      const image =
        qs("img", preview);

      if (!image) return;

      const quickX =
        gsap.quickTo(
          image,
          "x",
          {
            duration: 0.6,
            ease: "power3.out"
          }
        );

      const quickY =
        gsap.quickTo(
          image,
          "y",
          {
            duration: 0.6,
            ease: "power3.out"
          }
        );

      preview.addEventListener(
        "pointermove",
        (event) => {
          const rect =
            preview.getBoundingClientRect();

          const x =
            (event.clientX -
              rect.left) /
              rect.width -
            0.5;

          const y =
            (event.clientY -
              rect.top) /
              rect.height -
            0.5;

          quickX(x * 8);
          quickY(y * 6);
        },
        { passive: true }
      );

      preview.addEventListener(
        "pointerleave",
        () => {
          quickX(0);
          quickY(0);
        },
        { passive: true }
      );
    });
  }

  /* ============================================================
     OPTIONAL HORIZONTAL SECTION
     ------------------------------------------------------------
     Only activates if SiteCraft actually contains it.
     ============================================================ */

  function initHorizontal() {
    const section =
      qs(
        ".sc-horizontal-section"
      );

    const track =
      qs(
        ".sc-horizontal-track",
        section || document
      );

    if (
      !section ||
      !track ||
      !ScrollTrigger ||
      reduceMotion
    ) {
      return;
    }

    if (
      !window.matchMedia(
        "(min-width: 1000px)"
      ).matches
    ) {
      return;
    }

    const getDistance =
      () =>
        Math.max(
          0,
          track.scrollWidth -
            window.innerWidth
        );

    gsap.to(
      track,
      {
        x: () =>
          -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () =>
            `+=${getDistance() + 250}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true
        }
      }
    );
  }

  /* ============================================================
     MOBILE MOTION
     ------------------------------------------------------------
     Deliberately subtle.
     ============================================================ */

  function initMobile() {
    if (
      !ScrollTrigger ||
      reduceMotion
    ) {
      return;
    }

    if (
      !window.matchMedia(
        "(max-width: 768px)"
      ).matches
    ) {
      return;
    }

    const visuals =
      qsa(
        ".service-card, .price-card, .concept-card, .value-card"
      );

    visuals.forEach((element, index) => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 28
        },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 92%",
            end: "top 68%",
            scrub: 0.5
          }
        }
      );
    });
  }

  /* ============================================================
     CLEAN OLD SITECRAFT CURSOR
     ------------------------------------------------------------
     If previous engine created these elements,
     remove them permanently.
     ============================================================ */

  function removeOldMotionArtifacts() {
    qsa(
      ".sc-cursor-dot, .sc-cursor-ring, .sc-noise, .sc-motion-progress, .sc-motion-layer, .sc-light-sweep, .sc-card-light"
    ).forEach((element) => {
      element.remove();
    });

    /*
      Remove old injected stylesheet from previous engine.
    */

    const oldCSS =
      document.getElementById(
        "sitecraft-motion-v3-css"
      );

    if (oldCSS) {
      oldCSS.remove();
    }
  }

  /* ============================================================
     REFRESH HANDLER
     ============================================================ */

  function initRefresh() {
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
          safeRefresh();
        }, 300);
      },
      { passive: true }
    );

    window.addEventListener(
      "orientationchange",
      () => {
        setTimeout(
          safeRefresh,
          400
        );
      },
      { passive: true }
    );

    window.addEventListener(
      "load",
      () => {
        setTimeout(
          safeRefresh,
          250
        );

        setTimeout(
          safeRefresh,
          800
        );
      },
      { once: true }
    );
  }

  /* ============================================================
     REDUCED MOTION
     ============================================================ */

  function initReducedMotion() {
    if (!reduceMotion) return;

    /*
      Ensure content remains fully visible.
    */

    qsa(
      ".hero-label, .hero h1, .hero-sub, .hero-ctas, .hero-meta, .hero-visual, .service-card, .price-card, .concept-card, .value-card, .coming-card, .mini-price-card"
    ).forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
      element.style.filter = "none";
    });
  }

  /* ============================================================
     INITIALIZE
     ============================================================ */

  function init() {
    try {
      removeOldMotionArtifacts();

      injectCSS();

      initReducedMotion();

      if (reduceMotion) {
        console.log(
          "[SiteCraft Motion] Reduced-motion mode."
        );
        return;
      }

      initHero();

      initAbout();

      initCards();

      initCardInternals();

      initPortfolio();

      initHeadings();

      initReveals();

      initProcess();

      initCTA();

      initBrowserDepth();

      initImageParallax();

      initHorizontal();

      initMobile();

      initRefresh();

      safeRefresh();

      setTimeout(
        safeRefresh,
        500
      );

      console.log(
        "%c SITECRAFT — STABLE CINEMATIC MOTION %c READY ",
        "background:#0B1220;color:#67A3FF;font-weight:700;padding:8px 12px;border-radius:5px 0 0 5px;",
        "background:#2563EB;color:#fff;font-weight:700;padding:8px 12px;border-radius:0 5px 5px 0;"
      );
    } catch (error) {
      console.error(
        "[SiteCraft Motion] Initialization error:",
        error
      );

      /*
        Critical safety:
        Never leave the website invisible because
        an animation failed.
      */

      qsa(
        ".hero-label, .hero h1, .hero-sub, .hero-ctas, .hero-meta, .hero-visual, .service-card, .price-card, .concept-card, .value-card, .coming-card, .mini-price-card"
      ).forEach((element) => {
        element.style.opacity = "1";
        element.style.visibility = "visible";
        element.style.filter = "none";
      });
    }
  }

  /* ============================================================
     START
     ============================================================ */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.SiteCraftMotion = {
    version:
      "stable-cinematic-4.0",

    refresh: safeRefresh,

    destroy() {
      try {
        if (ScrollTrigger) {
          ScrollTrigger.getAll().forEach(
            (trigger) => {
              trigger.kill();
            }
          );
        }

        gsap.killTweensOf(
          ".hero, .hero-visual, .hero-bg, .hero-bg .grid, .hero-bg .glow, .service-card, .price-card, .concept-card, .value-card, .coming-card, .mini-price-card, .concept-preview img, .process-step, .cta-final"
        );

        qsa(
          ".sc-stable-word"
        ).forEach((word) => {
          word.style.opacity = "";
          word.style.transform = "";
        });

        const runtimeCSS =
          document.getElementById(
            "sitecraft-stable-motion-css"
          );

        if (runtimeCSS) {
          runtimeCSS.remove();
        }

        window.__SITECRAFT_STABLE_MOTION__ =
          false;
      } catch (error) {
        console.warn(
          "[SiteCraft Motion] Destroy warning:",
          error
        );
      }
    }
  };

})();