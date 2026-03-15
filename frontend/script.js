/* ═══════════════════════════════════════════
   Shared JS — Hyderabad Camping Tent Rentals
   ═══════════════════════════════════════════ */

const API = window.location.origin;

// ── Sticky Navbar ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ── Hamburger ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

// ── Scroll Reveal ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  observer.observe(el);
});

// ── Active nav link ──
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
  if (a.getAttribute('href') === currentPath || 
      (currentPath === '/' && a.getAttribute('href') === '/') ||
      (currentPath.includes('tents') && a.getAttribute('href') === '/tents') ||
      (currentPath.includes('booking') && a.getAttribute('href') === '/booking')) {
    a.classList.add('active');
  }
});

// ── Tent price lookup ──
const TENT_PRICES = {
  explorer: { name: 'Explorer Tent', day: 399, week: 1999, capacity: '2 Person' },
  adventure: { name: 'Adventure Tent', day: 699, week: 3499, capacity: '4 Person' },
  family:    { name: 'Family Dome Tent', day: 999, week: 4999, capacity: '6 Person' }
};

// ── Booking Form Logic ──
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const fields = {
    name: document.getElementById('name'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    tentType: document.getElementById('tentType'),
    numberOfTents: document.getElementById('numberOfTents'),
    startDate: document.getElementById('startDate'),
    endDate: document.getElementById('endDate'),
    deliveryOption: document.getElementById('deliveryOption'),
    address: document.getElementById('address'),
    notes: document.getElementById('notes'),
  };
  const deliveryGroup = document.getElementById('deliveryAddressGroup');
  const submitBtn = document.getElementById('submitBtn');

  // Set min date
  const today = new Date().toISOString().split('T')[0];
  if (fields.startDate) fields.startDate.min = today;
  if (fields.endDate) fields.endDate.min = today;

  // Show/hide delivery address
  if (fields.deliveryOption) {
    fields.deliveryOption.addEventListener('change', () => {
      deliveryGroup?.classList.toggle('show', fields.deliveryOption.value === 'delivery');
    });
  }

  // Update end date min
  if (fields.startDate) {
    fields.startDate.addEventListener('change', () => {
      if (fields.endDate) {
        fields.endDate.min = fields.startDate.value;
        if (fields.endDate.value && fields.endDate.value <= fields.startDate.value) {
          fields.endDate.value = '';
        }
      }
      updateSummary();
    });
  }

  // Live summary update
  ['tentType','numberOfTents','startDate','endDate'].forEach(key => {
    if (fields[key]) fields[key].addEventListener('change', updateSummary);
    if (fields[key]) fields[key].addEventListener('input', updateSummary);
  });

  function updateSummary() {
    const tent = fields.tentType?.value;
    const num = parseInt(fields.numberOfTents?.value) || 1;
    const start = fields.startDate?.value;
    const end = fields.endDate?.value;

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    if (tent && TENT_PRICES[tent]) {
      const t = TENT_PRICES[tent];
      setEl('sum-tent', `${t.name} (${t.capacity})`);
      setEl('sum-qty', `${num} tent${num > 1 ? 's' : ''}`);
    }

    if (start && end && tent && TENT_PRICES[tent]) {
      const s = new Date(start), e = new Date(end);
      const days = Math.max(1, Math.ceil((e - s) / 86400000));
      const t = TENT_PRICES[tent];
      const total = t.day * num * days;
      setEl('sum-dates', `${formatDate(start)} → ${formatDate(end)} (${days} day${days > 1 ? 's' : ''})`);
      setEl('sum-total', `₹${total.toLocaleString('en-IN')}`);
    }
  }

  function formatDate(str) {
    if (!str) return '—';
    const d = new Date(str);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Validation
  function validateField(input, rule) {
    const errEl = input.parentElement.querySelector('.form-error');
    let valid = true, msg = '';
    if (rule.required && !input.value.trim()) { valid = false; msg = 'This field is required.'; }
    else if (rule.pattern && !rule.pattern.test(input.value.trim())) { valid = false; msg = rule.msg; }
    input.classList.toggle('error', !valid);
    if (errEl) { errEl.textContent = msg; errEl.classList.toggle('show', !valid); }
    return valid;
  }

  const rules = {
    name: { required: true },
    phone: { required: true, pattern: /^[+\d\s-]{7,15}$/, msg: 'Enter a valid phone number.' },
    email: { required: true, pattern: /^\S+@\S+\.\S+$/, msg: 'Enter a valid email address.' },
    tentType: { required: true },
    numberOfTents: { required: true },
    startDate: { required: true },
    endDate: { required: true },
    deliveryOption: { required: true },
  };

  Object.keys(rules).forEach(key => {
    if (fields[key]) {
      fields[key].addEventListener('blur', () => validateField(fields[key], rules[key]));
    }
  });

  // Submit
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all
    let allValid = true;
    Object.keys(rules).forEach(key => {
      if (fields[key]) {
        if (!validateField(fields[key], rules[key])) allValid = false;
      }
    });

    // Delivery address
    if (fields.deliveryOption?.value === 'delivery' && !fields.address?.value.trim()) {
      const errEl = fields.address?.parentElement?.querySelector('.form-error');
      if (fields.address) fields.address.classList.add('error');
      if (errEl) { errEl.textContent = 'Delivery address is required.'; errEl.classList.add('show'); }
      allValid = false;
    }

    if (!allValid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    const payload = {};
    Object.keys(fields).forEach(k => { if (fields[k]) payload[k] = fields[k].value; });

    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showModal(data.booking);
        bookingForm.reset();
        updateSummary();
        if (deliveryGroup) deliveryGroup.classList.remove('show');
      } else {
        showAlert(data.message || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showAlert('Cannot connect to server. Please check your connection.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking';
    }
  });

  function showModal(booking) {
    const modal = document.getElementById('successModal');
    if (!modal) return;
    const tent = TENT_PRICES[booking.tentType] || {};
    document.getElementById('modal-id').textContent = booking.bookingId;
    document.getElementById('modal-price').innerHTML = `
      Total Amount: <strong>₹${booking.totalPrice?.toLocaleString('en-IN')}</strong><br>
      Status: <strong style="color:#27AE60">✅ ${booking.status.toUpperCase()}</strong>
    `;
    modal.classList.add('open');
  }
}

// Close modal
function closeModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.classList.remove('open');
}

// Inline alert
function showAlert(msg, type = 'info') {
  const existing = document.getElementById('__alert');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.id = '__alert';
  div.style.cssText = `
    position:fixed;bottom:28px;right:28px;z-index:9998;
    background:${type === 'error' ? '#E74C3C' : '#27AE60'};
    color:white;padding:14px 22px;border-radius:12px;
    font-size:0.92rem;font-weight:600;
    box-shadow:0 8px 30px rgba(0,0,0,0.15);
    max-width:320px;line-height:1.5;
    animation:slideInRight .35s ease;
  `;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 5000);
}
