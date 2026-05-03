/* ============================================================
   BOLTAI STUDIO — studio.js
   ============================================================ */

// ── Nav scroll effect ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('up', window.scrollY > 30);
});

// ── Mobile menu ──
const burger = document.getElementById('navBurger');
const mobMenu = document.getElementById('mobMenu');
burger.addEventListener('click', () => {
  mobMenu.classList.toggle('open');
});
function closeMob() {
  mobMenu.classList.remove('open');
}

// ── Scroll reveal ──
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('vis');
    entry.target.querySelectorAll('.bg-card, .pc, .trow').forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = 'opacity .5s ease, transform .5s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * 80);
    });
    io.unobserve(entry.target);
  });
}, { threshold: 0.08 });

document.querySelectorAll('.rev').forEach(el => {
  el.querySelectorAll('.bg-card, .pc, .trow').forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(18px)';
  });
  io.observe(el);
});

// ── Form submission ──
async function handleSubmit() {
  const btn = document.getElementById('submitBtn');
  const label = document.getElementById('submitLabel');
  const arrow = document.getElementById('submitArrow');
  const spinner = document.getElementById('submitSpinner');
  const errorEl = document.getElementById('form-error');

  // Gather values
  const name        = document.getElementById('fname').value.trim();
  const email       = document.getElementById('femail').value.trim();
  const description = document.getElementById('fdesc').value.trim();
  const budget      = document.getElementById('fbudget').value;
  const timeline    = document.getElementById('ftimeline').value;
  const references  = document.getElementById('frefs').value.trim();

  // Validate
  errorEl.style.display = 'none';
  if (!name) { showError('Please enter your name.'); return; }
  if (!email || !isValidEmail(email)) { showError('Please enter a valid email address.'); return; }
  if (!description) { showError('Please describe what you want to build.'); return; }

  // Loading state
  btn.disabled = true;
  label.textContent = 'Sending…';
  arrow.style.display = 'none';
  spinner.style.display = 'block';

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, description, budget, timeline, references })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Server error. Please try again.');
    }

    // Success
    document.getElementById('fcard-inner') // handled below
    document.getElementById('finner').classList.add('hide');
    document.getElementById('succ').classList.add('show');

  } catch (err) {
    showError(err.message || 'Something went wrong. Please email us directly.');
    btn.disabled = false;
    label.textContent = 'Submit & get a proposal';
    arrow.style.display = 'block';
    spinner.style.display = 'none';
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }
}
