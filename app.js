// ── Constants ──────────────────────────────────
const STORAGE_KEY = 'fittrack-workouts';

const EMOJIS = {
    Running:       '🏃',
    Weightlifting: '🏋️',
    Yoga:          '🧘',
    HIIT:          '🔥'
};

// ── State ──────────────────────────────────────
let currentRating = 0;

// ── DOM References ─────────────────────────────
const inputType     = document.getElementById('input-type');
const inputDate     = document.getElementById('input-date');
const inputDuration = document.getElementById('input-duration');
const inputNotes    = document.getElementById('input-notes');
const starRow       = document.getElementById('star-row');
const starEls       = document.querySelectorAll('.star');
const btnAdd        = document.getElementById('btn-add');
const workoutList   = document.getElementById('workout-list');
const toast         = document.getElementById('toast');

// ── Initialise ─────────────────────────────────
inputDate.valueAsDate = new Date();
render();

// ── Star Rating Logic ──────────────────────────
starEls.forEach(star => {
    // Click to set rating
    star.addEventListener('click', () => {
        currentRating = parseInt(star.dataset.value);
        paintStars(currentRating);
    });

    // Hover preview
    star.addEventListener('mouseenter', () => {
        paintStars(parseInt(star.dataset.value), true);
    });
});

// Reset to selected rating when mouse leaves
starRow.addEventListener('mouseleave', () => {
    paintStars(currentRating);
});

function paintStars(count, preview = false) {
    starEls.forEach(star => {
        const val = parseInt(star.dataset.value);
        if (val <= count) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// ── Add Entry ──────────────────────────────────
btnAdd.addEventListener('click', addEntry);

function addEntry() {
    const type     = inputType.value;
    const date     = inputDate.value;
    const duration = parseInt(inputDuration.value);
    const notes    = inputNotes.value.trim();

    // Validation
    if (!date) {
        showToast('⚠️ Please select a date');
        return;
    }
    if (!duration || duration < 1) {
        showToast('⚠️ Please enter a valid duration');
        return;
    }
    if (currentRating === 0) {
        showToast('⚠️ Please select a rating');
        return;
    }

    // Build entry object
    const entry = {
        id:       Date.now(),
        type:     type,
        date:     date,
        duration: duration,
        rating:   currentRating,
        notes:    notes
    };

    // Save to localStorage
    const workouts = loadWorkouts();
    workouts.unshift(entry);
    saveWorkouts(workouts);

    // Reset form
    inputDuration.value   = '';
    inputNotes.value      = '';
    inputDate.valueAsDate = new Date();
    currentRating         = 0;
    paintStars(0);

    // Update the page
    render();
    showToast('Workout logged! 💪');
}

// ── Delete Entry ───────────────────────────────
function deleteEntry(id) {
    const workouts = loadWorkouts().filter(w => w.id !== id);
    saveWorkouts(workouts);
    render();
    showToast('Entry removed');
}

// ── Storage Helpers ────────────────────────────
function loadWorkouts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveWorkouts(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Render ─────────────────────────────────────
function render() {
    const workouts = loadWorkouts();
    updateStats(workouts);
    renderList(workouts);
}

function updateStats(workouts) {
    // Total workouts
    document.getElementById('stat-total').textContent = workouts.length;

    // This week
    const now       = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const thisWeek = workouts.filter(w => {
        return new Date(w.date + 'T00:00:00') >= weekStart;
    }).length;

    document.getElementById('stat-week').textContent = thisWeek;

    // Average rating
    const avgRating = workouts.length
        ? (workouts.reduce((sum, w) => sum + w.rating, 0) / workouts.length).toFixed(1)
        : '—';
    document.getElementById('stat-avg').textContent = avgRating;

    // Total minutes
    const totalMins = workouts.reduce((sum, w) => sum + w.duration, 0);
    document.getElementById('stat-mins').textContent = totalMins;
}

function renderList(workouts) {
    if (workouts.length === 0) {
        workoutList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🏅</span>
                <p>No workouts logged yet — add your first session above!</p>
            </div>
        `;
        return;
    }

    workoutList.innerHTML = workouts.map(w => `
        <div class="workout-card">
            <div class="card-emoji">${EMOJIS[w.type] || '💪'}</div>
            <div class="card-body">
                <div class="card-type">${w.type}</div>
                <div class="card-meta">
                    <span>📅 ${formatDate(w.date)}</span>
                    <span>⏱ ${w.duration} min</span>
                    <span class="card-stars">${renderStars(w.rating)}</span>
                </div>
                ${w.notes ? `<div class="card-notes">"${w.notes}"</div>` : ''}
            </div>
            <button class="btn-delete" onclick="deleteEntry(${w.id})">Delete</button>
        </div>
    `).join('');
}

// ── Utility ────────────────────────────────────
function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
        day:   'numeric',
        month: 'short',
        year:  'numeric'
    });
}

function renderStars(count) {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
}
