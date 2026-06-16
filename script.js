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
