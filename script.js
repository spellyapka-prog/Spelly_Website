// ===== Mobile menu toggle =====
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});

mobileMenu?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  })
);

// ===== Navbar background on scroll =====
const nav = document.querySelector('.nav');
const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 12);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ===== Tarot cards parallax on scroll (subtle depth effect) =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const bgCards = document.querySelectorAll('.bg-card');

if (bgCards.length && !prefersReducedMotion) {
  // per-card vertical speed → varied depth so they drift up/down at different rates
  const speeds = [0.14, -0.09, 0.2, 0.07, -0.13];

  let ticking = false;
  const updateCards = () => {
    const y = window.scrollY;
    bgCards.forEach((card, i) => {
      const speed = speeds[i % speeds.length];
      card.style.translate = `0 ${(y * speed).toFixed(1)}px`;
    });
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateCards);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateCards();
}

// ===== Scroll reveal (smooth, Framer-like) =====
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-visible'));
}

// ===== Waitlist form (saves emails to Supabase) =====
const form = document.getElementById('waitlistForm');
const note = document.getElementById('formNote');

const showNote = (text, isError = false) => {
  if (!note) return;
  note.textContent = text;
  note.classList.toggle('cta__note--error', isError);
  note.hidden = false;
};

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const cfg = window.SPELLY_CONFIG || {};
  const submitBtn = form.querySelector('button[type="submit"]');
  const email = form.querySelector('input[name="email"]').value.trim();
  if (!email) return;

  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('YOUR-PROJECT')) {
    showNote('Signups are not configured yet.', true);
    return;
  }

  submitBtn.disabled = true;

  try {
    const res = await fetch(`${cfg.SUPABASE_URL}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${cfg.SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        email,
        source: 'waitlist',
        referrer: document.referrer || null,
      }),
    });

    // 409 = email already on the list (unique constraint) — treat as success.
    if (res.ok || res.status === 409) {
      form.reset();
      showNote("You're on the list. We'll be in touch ✦");
    } else {
      console.error('Subscribe failed:', res.status, await res.text());
      showNote('Something went wrong. Please try again.', true);
    }
  } catch (err) {
    console.error(err);
    showNote('Network error. Please try again.', true);
  } finally {
    submitBtn.disabled = false;
  }
});

// ===== Cookie consent (Google Consent Mode v2) =====
const cookieBanner = document.getElementById('cookieBanner');

const setConsent = (granted) => {
  try {
    localStorage.setItem('spelly_consent', granted ? 'granted' : 'denied');
  } catch (e) {}

  if (typeof gtag === 'function') {
    const state = granted ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    });
  }

  if (cookieBanner) cookieBanner.hidden = true;
};

if (cookieBanner) {
  let saved = null;
  try {
    saved = localStorage.getItem('spelly_consent');
  } catch (e) {}

  // Show the banner only if the visitor hasn't chosen yet.
  if (!saved) cookieBanner.hidden = false;

  document.getElementById('cookieAccept')?.addEventListener('click', () => setConsent(true));
  document.getElementById('cookieDecline')?.addEventListener('click', () => setConsent(false));
}

// ===== Steps: pinned stage. Each theme dwells in place, then the text conveyors
//        (centre text rises & out, next rises from below) into the next theme =====
const themeEls = document.querySelectorAll('.theme');
const stepsTrack = document.querySelector('.steps__track');

if (themeEls.length && stepsTrack) {
  const mq = window.matchMedia('(min-width: 810px)'); // effect on web/tablet only
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const texts = [...themeEls].map((t) => t.querySelector('.theme__text'));
  const sphere = document.querySelector('.phone3__el--sphere'); // screen-1 object wrapper
  const aiCards = document.querySelector('.ai-cards'); // screen-2 flip cards
  const ram = document.querySelector('.phone3__el--ram'); // screen-3 object wrapper
  const n = themeEls.length;
  // phases alternate: dwell, transition, dwell, transition, … dwell  → 2n-1 total
  const segs = 2 * n - 1;
  const smooth = (x) => x * x * (3 - 2 * x); // smoothstep easing for the conveyor move
  let ticking = false;
  let lastProgress = 0; // to detect scroll direction

  // on mobile the themes are static stacked blocks — wipe any inline styles JS left
  const reset = () => {
    themeEls.forEach((t, i) => {
      t.style.opacity = '';
      t.style.pointerEvents = '';
      if (texts[i]) texts[i].style.transform = '';
    });
    if (sphere) sphere.style.transform = '';
  };

  const update = () => {
    ticking = false;
    if (!mq.matches) {
      reset();
      return;
    }
    const rect = stepsTrack.getBoundingClientRect();
    const total = rect.height - window.innerHeight; // scrollable distance while pinned
    if (total <= 0) return;

    const progress = Math.min(Math.max(-rect.top / total, 0), 1); // 0 → 1
    const phase = Math.min(progress * segs, segs - 1e-6); // 0 → segs
    const k = Math.floor(phase);
    const local = phase - k;

    // even phase = dwell on theme k/2; odd phase = conveyor from (k-1)/2 → (k+1)/2
    const pos = k % 2 === 0 ? k / 2 : (k - 1) / 2 + smooth(local);

    const spacing = window.innerHeight * 0.55; // distance each text travels per theme
    themeEls.forEach((t, i) => {
      const d = i - pos; // signed distance from the centred theme (theme-units)
      const opacity = Math.max(0, 1 - Math.abs(d));
      t.style.opacity = opacity;
      t.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      if (texts[i]) texts[i].style.transform = `translateY(${d * spacing}px)`;
    });

    // sphere (screen 1): grow then slowly shrink while scrolling through its theme
    if (sphere && !reduce.matches) {
      const t = Math.min(progress / 0.4, 1); // 0 → 1 over theme-1's window
      const scale = 1 + 0.2 * Math.sin(t * Math.PI); // 1 → 1.2 → 1
      sphere.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    // cards (screen 2): flip open once the AI theme is reached; flip back on reverse.
    // when scrolling UP, use a higher threshold so they flip back a touch earlier.
    if (aiCards) {
      const goingUp = progress < lastProgress;
      const threshold = goingUp ? 0.74 : 0.6;
      aiCards.classList.toggle('is-flipped', pos > threshold);
    }
    lastProgress = progress;

    // entrance triggers (web/tablet): sphere shows with theme 1; bubble pops when
    // theme 3 is reached (toggled so it replays each time you scroll back to it)
    if (sphere) sphere.classList.add('is-in');
    if (ram) ram.classList.toggle('is-in', pos > 1.55);
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', update);
  update();
}

// ===== Mobile entrance reveals (geometric). On web/tablet the pinned stage means
//        elements are always "in view", so those are triggered by the conveyor JS instead. =====
const revealTargets = document.querySelectorAll('.phone3__el--sphere, .phone3__el--ram, .theme__text, .ai-cards, .theme__phone');
if (revealTargets.length && 'IntersectionObserver' in window && window.matchMedia('(max-width: 809px)').matches) {
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          revealIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.25 }
  );
  revealTargets.forEach((t) => revealIO.observe(t));
}
