// Mobile menu toggle
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});

// Close mobile menu when a link inside it is tapped
mobileMenu?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  })
);

// Waitlist form (front-end only — no backend yet)
const form = document.getElementById('waitlistForm');
const note = document.getElementById('formNote');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  form.reset();
  if (note) {
    note.hidden = false;
  }
});
