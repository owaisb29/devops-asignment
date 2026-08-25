/* ─── Config ─── */
const SPORTS = {
  running:  { label: 'Running',  abbr: 'RUN', color: '#3b82f6', bg: '#eff6ff', pillBorder: '#bfdbfe' },
  lifting:  { label: 'Lifting',  abbr: 'LFT', color: '#8b5cf6', bg: '#f5f3ff', pillBorder: '#ddd6fe' },
  yoga:     { label: 'Yoga',     abbr: 'YOG', color: '#10b981', bg: '#ecfdf5', pillBorder: '#a7f3d0' },
  football: { label: 'Football', abbr: 'FB',  color: '#f59e0b', bg: '#fffbeb', pillBorder: '#fde68a' },
};

const MOODS = [
  '',
  'Rough session',
  'Getting there',
  'Solid effort',
  'Great workout!',
  'Absolutely crushed it! 🔥',
];

/* ─── State ─── */
let rating   = 0;
let workouts = [];

/* ─── Element refs ─── */
const sportSel   = document.getElementById('sport-sel');
const pill       = document.getElementById('sport-pill');
const pillDot    = document.getElementById('pill-dot');
const pillText   = document.getElementById('pill-text');
const starsWrap  = document.getElementById('stars');
const moodText   = document.getElementById('mood-text');
const dateIn     = document.getElementById('date-in');
const formErr    = document.getElementById('form-err');
const submitBtn  = document.getElementById('submit-btn');
const emptyState = document.getElementById('empty-state');
const entriesEl  = document.getElementById('entries');
const histCount  = document.getElementById('hist-count');
const starBtns   = [...starsWrap.querySelectorAll('.star-btn')];

/* ─── Initialise ─── */
dateIn.value = new Date().toISOString().split('T')[0];
syncPill();
render(null);

/* ─── Sport pill ─── */
sportSel.addEventListener('change', syncPill);

function syncPill() {
  const s = SPORTS[sportSel.value];
  pill.style.background    = s.bg;
  pill.style.borderColor   = s.pillBorder;
  pill.style.color         = s.color;
  pillDot.style.background = s.color;
  pillText.textContent     = s.label;
}

/* ─── Star rating ─── */
starBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    rating = +btn.dataset.n;
    paintStars(rating);
    clearErr();
  });
  btn.addEventListener('mouseenter', () => paintStars(+btn.dataset.n, true));
  btn.addEventListener('mouseleave', () => paintStars(rating));
});

function paintStars(n, preview = false) {
  starBtns.forEach((b, i) => b.classList.toggle('lit', i < n));
  moodText.textContent = (!preview && rating > 0) ? MOODS[rating]
                       : (preview ? MOODS[n] : '');
}

/* ─── Submit ─── */
submitBtn.addEventListener('click', () => {
  if (!rating)       { showErr('Please rate your session.'); return; }
  if (!dateIn.value) { showErr('Please choose a date.'); return; }
  clearErr();

  const id = Date.now();
  workouts.unshift({ id, sport: sportSel.value, rating, date: dateIn.value });
  rating = 0;
  paintStars(0);
  render(id);
});

/* ─── Error helpers ─── */
function showErr(msg) {
  formErr.textContent   = '⚠ ' + msg;
  formErr.style.display = 'flex';
}

function clearErr() {
  formErr.style.display = 'none';
}

/* ─── Render history ─── */
function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function render(freshId) {
  const empty = workouts.length === 0;
  emptyState.style.display = empty ? 'block'  : 'none';
  entriesEl.style.display  = empty ? 'none'   : 'flex';
  histCount.style.display  = empty ? 'none'   : 'inline';
  if (empty) return;

  histCount.textContent = workouts.length + (workouts.length === 1 ? ' session' : ' sessions');
  entriesEl.innerHTML   = '';

  workouts.forEach(w => {
    const s    = SPORTS[w.sport];
    const card = document.createElement('div');
    card.className = 'entry' + (w.id === freshId ? ' new' : '');
    card.innerHTML = `
      <div class="entry-bar" style="background:${s.color}"></div>
      <div class="entry-badge" style="background:${s.bg}; color:${s.color}">${s.abbr}</div>
      <div class="entry-meta">
        <div class="entry-sport">${s.label}</div>
        <div class="entry-date">${fmtDate(w.date)}</div>
      </div>
      <div class="entry-stars" aria-label="${w.rating} out of 5 stars">
        ${[1, 2, 3, 4, 5].map(n => `<span class="${n <= w.rating ? 'sf' : 'se'}">★</span>`).join('')}
      </div>
    `;
    entriesEl.appendChild(card);
  });
}
