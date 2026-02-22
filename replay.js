/* ════════════════════════════════════════════════════
   replay.js — Activity Replay Engine
════════════════════════════════════════════════════ */

let history = [];
let currentStep = 0;
let isPlaying = false;
let playInterval = null;
let playSpeed = 1000;

let cashChart = null;
let heatChart = null;

// ─── LOAD HISTORY ─────────────────────────────────
function loadHistory() {
    try {
        history = JSON.parse(localStorage.getItem('ls_history') || '[]').reverse();
    } catch (e) { history = []; }
}

// ─── CHARTS ───────────────────────────────────────
function initCharts() {
    const cashCtx = document.getElementById('replayCashChart').getContext('2d');
    const heatCtx = document.getElementById('replayHeatChart').getContext('2d');

    const labels = history.map((_, i) => `#${i + 1}`);
    const cashData = history.map(h => h.cash || 0);
    const heatData = history.map(h => h.heat || 0);

    cashChart = new Chart(cashCtx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Cash',
                data: cashData,
                borderColor: '#f5c518',
                backgroundColor: 'rgba(245,197,24,0.08)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#f5c518',
                tension: 0.4,
                fill: true,
            }],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: '#12121a', borderColor: 'rgba(245,197,24,0.3)', borderWidth: 1, titleColor: '#f5c518', bodyColor: '#8888aa' } },
            scales: {
                x: { ticks: { color: '#555570', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.03)' } },
                y: { ticks: { color: '#f5c518', callback: v => '$' + (v / 1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.03)' } },
            },
        },
    });

    heatChart = new Chart(heatCtx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Heat %',
                data: heatData,
                borderColor: '#ff2020',
                backgroundColor: 'rgba(255,32,32,0.08)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#ff2020',
                tension: 0.4,
                fill: true,
            }],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: '#12121a', borderColor: 'rgba(255,32,32,0.3)', borderWidth: 1, titleColor: '#ff2020', bodyColor: '#8888aa' } },
            scales: {
                x: { ticks: { color: '#555570', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.03)' } },
                y: { min: 0, max: 100, ticks: { color: '#ff2020', callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,0.03)' } },
            },
        },
    });
}

function updateChartCursor() {
    // Highlight current step via annotation-like update
    if (cashChart) {
        cashChart.data.datasets[0].pointBackgroundColor = cashChart.data.labels.map((_, i) => i === currentStep ? '#fff' : '#f5c518');
        cashChart.data.datasets[0].pointRadius = cashChart.data.labels.map((_, i) => i === currentStep ? 6 : 3);
        cashChart.update('none');
    }
    if (heatChart) {
        heatChart.data.datasets[0].pointBackgroundColor = heatChart.data.labels.map((_, i) => i === currentStep ? '#fff' : '#ff2020');
        heatChart.data.datasets[0].pointRadius = heatChart.data.labels.map((_, i) => i === currentStep ? 6 : 3);
        heatChart.update('none');
    }
}

// ─── EVENT LOG ────────────────────────────────────
function renderEventLog() {
    const el = document.getElementById('eventLog');
    if (history.length === 0) {
        el.innerHTML = '<div style="color:var(--text-dim);text-align:center;padding:20px;">No events recorded.</div>';
        return;
    }

    const typeIcons = { cash: '💰', heat: '🔥', op: '🎯', alert: '⚠️' };

    el.innerHTML = history.map((h, i) => `
    <div class="event-row ${i === currentStep ? 'highlight' : ''}" id="evrow-${i}">
      <span class="event-idx">${String(i + 1).padStart(2, '0')}</span>
      <span class="event-icon">${typeIcons[h.type] || '📌'}</span>
      <span class="event-text">${h.text}</span>
      <span class="event-time">${h.time || ''}</span>
      <span class="event-cash">${h.cash !== undefined ? '$' + Math.round(h.cash).toLocaleString() : ''}</span>
    </div>`).join('');

    // Scroll to current
    const row = document.getElementById(`evrow-${currentStep}`);
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── SNAPSHOT ─────────────────────────────────────
function updateSnapshot() {
    if (history.length === 0) return;
    const h = history[currentStep] || {};
    document.getElementById('snapCash').textContent = '$' + Math.round(h.cash || 0).toLocaleString();
    document.getElementById('snapHeat').textContent = (h.heat || 0) + '%';
    document.getElementById('snapTerritory').textContent = (h.territory || 0) + '%';

    // Progress bar
    const pct = history.length > 1 ? (currentStep / (history.length - 1)) * 100 : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('replayIndexLabel').textContent = `Step ${currentStep + 1} / ${history.length}`;

    updateChartCursor();
    renderEventLog();
}

// ─── CONTROLS ─────────────────────────────────────
function replayStep(dir) {
    currentStep = Math.max(0, Math.min(history.length - 1, currentStep + dir));
    updateSnapshot();
}

function replayReset() {
    stopPlay();
    currentStep = 0;
    updateSnapshot();
}

function replayToggle() {
    if (isPlaying) {
        stopPlay();
    } else {
        startPlay();
    }
}

function startPlay() {
    if (currentStep >= history.length - 1) currentStep = 0;
    isPlaying = true;
    document.getElementById('playBtn').textContent = '⏸';
    playInterval = setInterval(() => {
        currentStep++;
        updateSnapshot();
        if (currentStep >= history.length - 1) {
            stopPlay();
        }
    }, playSpeed);
}

function stopPlay() {
    isPlaying = false;
    document.getElementById('playBtn').textContent = '▶';
    if (playInterval) { clearInterval(playInterval); playInterval = null; }
}

function setSpeed(ms) {
    playSpeed = ms;
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    const labels = { 2000: 'speed1', 1000: 'speed2', 400: 'speed3' };
    const btnId = labels[ms];
    if (btnId) document.getElementById(btnId).classList.add('active');
    if (isPlaying) { stopPlay(); startPlay(); }
}

function progressClick(e) {
    const bar = document.getElementById('progressBar');
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    currentStep = Math.max(0, Math.min(history.length - 1, Math.round(pct * (history.length - 1))));
    updateSnapshot();
}

// ─── CLEAR ────────────────────────────────────────
function clearHistory() {
    if (!confirm('Clear all activity history? This cannot be undone.')) return;
    localStorage.removeItem('ls_history');
    history = [];
    stopPlay();
    init();
}

// ─── INIT ─────────────────────────────────────────
function init() {
    loadHistory();

    const empty = document.getElementById('emptyReplay');
    const content = document.getElementById('replayContent');

    if (history.length === 0) {
        empty.style.display = 'block';
        content.style.display = 'none';
        return;
    }

    empty.style.display = 'none';
    content.style.display = 'block';
    currentStep = 0;

    if (cashChart) { cashChart.destroy(); cashChart = null; }
    if (heatChart) { heatChart.destroy(); heatChart = null; }

    initCharts();
    updateSnapshot();
}

document.addEventListener('DOMContentLoaded', init);
