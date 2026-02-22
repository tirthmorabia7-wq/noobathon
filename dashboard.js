/* ════════════════════════════════════════════════════
   dashboard.js  — Los Santos Command Center
   Full GTA-V themed dashboard logic
════════════════════════════════════════════════════ */

// ─── STATE ────────────────────────────────────────
const state = {
  cash: 120000,
  cashDelta: 0,
  heat: 42,
  ops: 3,
  territory: 38,
  wantedLevel: 2,
  status: 'AT LARGE',        // AT LARGE | ON THE MOVE | HIDING | CAPTURED
  lastLocation: 'Vespucci Beach',
  sightingStart: JSON.parse(localStorage.getItem('ls_state') || '{}').sightingStart || Date.now(),
  totalOpsRun: 7,
  missionWins: 5,
  missionFails: 2,
  missionActive: 1,
  streak: 3,
  heatCooldown: 0,
  tierProgress: 35,
  achievements: { 'firstblood': true, 'moneybags': false, 'ghostmode': false, 'untouchable': false, 'kingpin': false, 'legend': false },
  recentHits: [],
};

const TARGET_NAMES = [
  "Vagos Enforcer", "Duggan Security Chief", "Madrazo Lieutenant", "Lost MC Sergeant",
  "Merryweather Captain", "Armenian Mob Boss", "Ballas OG", "Triad Negotiator",
  "Corrupt IAA Agent", "Epsilon Program Recruiter"
];

const TIERS = [
  { name: 'Street Hustler', threshold: 0, next: 'Underboss', cashMin: 0 },
  { name: 'Underboss', threshold: 100000, next: 'Crime Lord', cashMin: 100000 },
  { name: 'Crime Lord', threshold: 300000, next: 'Kingpin', cashMin: 300000 },
  { name: 'Kingpin', threshold: 600000, next: 'Los Santos Legend', cashMin: 600000 },
  { name: 'Los Santos Legend', threshold: 1000000, next: '—', cashMin: 1000000 },
];

const ZONES = [
  { name: 'Vespucci Beach', color: '#00d4ff' },
  { name: 'Downtown LS', color: '#f5c518' },
  { name: 'Mirror Park', color: '#00ff88' },
  { name: 'Grove Street', color: '#ff6b00' },
  { name: 'Blaine County', color: '#bf00ff' },
];

const LOCATIONS = ['Vespucci Beach', 'Downtown LS', 'Mirror Park', 'Grove Street', 'Del Perro Pier', 'Vinewood Hills', 'Sandy Shores', 'Chumash'];

let zoneControl = [55, 70, 30, 80, 20];

// ─── HELPERS ─────────────────────────────────────
function fmt$(n) {
  return '$' + Math.round(n).toLocaleString();
}

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

// ─── CLOCK ───────────────────────────────────────
function startClock() {
  const el = document.getElementById('topbarClock');
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
}

// ─── TIME SINCE SIGHTING ─────────────────────────
function updateSighting() {
  const diff = Math.floor((Date.now() - state.sightingStart) / 1000);
  const h = String(Math.floor(diff / 3600)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
  const s = String(diff % 60).padStart(2, '0');
  document.getElementById('timeSinceSighting').textContent = `${h}:${m}:${s}`;
}

// ─── TOAST ───────────────────────────────────────
function showToast(title, msg, icon = '📣') {
  const container = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>`;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('removing');
    setTimeout(() => t.remove(), 400);
  }, 4000);
}

// ─── ACTIVITY FEED ───────────────────────────────
const FEED_ITEMS = [];

function addFeed(text, type = 'op') {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  FEED_ITEMS.unshift({ text, type, time });
  if (FEED_ITEMS.length > 20) FEED_ITEMS.pop();
  renderFeed();
  // store for replay
  const history = JSON.parse(localStorage.getItem('ls_history') || '[]');
  history.unshift({ text, type, time, cash: state.cash, heat: state.heat, territory: state.territory });
  if (history.length > 100) history.pop();
  localStorage.setItem('ls_history', JSON.stringify(history));
}

function renderFeed() {
  const el = document.getElementById('activityFeed');
  el.innerHTML = FEED_ITEMS.slice(0, 12).map(item => `
    <div class="feed-item">
      <div class="feed-dot ${item.type}"></div>
      <div class="feed-text">${item.text}</div>
      <div class="feed-time">${item.time}</div>
    </div>`).join('');
}

// ─── WANTED STARS ────────────────────────────────
function renderStars() {
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById(`star${i}`);
    star.classList.toggle('active', i <= state.wantedLevel);
  }
}

// ─── UPDATE ALL UI ────────────────────────────────
function syncUI() {
  // Cash
  const cashEl = document.getElementById('cashValue');
  cashEl.textContent = fmt$(state.cash);
  cashEl.classList.remove('cash-updated');
  void cashEl.offsetWidth;
  cashEl.classList.add('cash-updated');
  document.getElementById('cashDelta').textContent = fmt$(state.cashDelta).replace('$', '');

  // Heat
  state.heat = clamp(state.heat, 0, 100);
  document.getElementById('heatValue').textContent = state.heat + '%';
  document.getElementById('heatBar').style.width = state.heat + '%';
  const heatStatuses = [
    [0, 'Cool — Lay low if you can'],
    [30, '⚠️ Rising — Watch your back'],
    [60, '🔥 Hot — Cops are onto you'],
    [80, '🚨 CRITICAL — You\'re burned!'],
  ];
  let hs = heatStatuses[0][1];
  for (const [thresh, label] of heatStatuses) {
    if (state.heat >= thresh) hs = label;
  }
  document.getElementById('heatStatus').textContent = hs;

  // Ops
  document.getElementById('opsValue').textContent = state.ops;
  document.getElementById('opsSub').textContent = state.ops === 0 ? 'None running' : `${state.ops} operation${state.ops > 1 ? 's' : ''} active`;

  // Territory
  const avgTerritory = Math.round(zoneControl.reduce((a, b) => a + b, 0) / zoneControl.length);
  state.territory = avgTerritory;
  document.getElementById('territoryValue').textContent = state.territory + '%';
  document.getElementById('territorySub').textContent = state.territory > 60 ? 'Dominant force' : state.territory > 35 ? 'Expanding' : 'Struggling';
  document.getElementById('totalTerritoryBadge').textContent = state.territory + '%';

  // Wanted stars
  renderStars();

  // Status dot + label
  const statusMap = {
    'AT LARGE': { cls: 'at-large', color: 'var(--neon-red)', badge: 'badge-red' },
    'ON THE MOVE': { cls: 'on-move', color: 'var(--neon-orange)', badge: 'badge-orange' },
    'HIDING': { cls: 'hiding', color: 'var(--neon-blue)', badge: 'badge-blue' },
    'CAPTURED': { cls: 'captured', color: 'var(--text-dim)', badge: '' },
  };
  const sm = statusMap[state.status] || statusMap['AT LARGE'];
  const dot = document.getElementById('statusDot');
  dot.className = 'status-indicator ' + sm.cls;
  const lbl = document.getElementById('statusLabel');
  lbl.textContent = state.status;
  lbl.style.color = sm.color;
  document.getElementById('statusBadge').textContent = state.status;
  document.getElementById('statusBadge').className = 'panel-badge ' + sm.badge;

  // Last location
  document.getElementById('lastLocation').textContent = state.lastLocation;

  // Threat
  const threats = ['Negligible', 'Low', 'Medium', 'High', 'Extreme'];
  document.getElementById('threatRating').textContent = threats[clamp(state.wantedLevel, 0, 4)];
  document.getElementById('totalOpsRun').textContent = state.totalOpsRun;

  // Success rate
  const total = state.missionWins + state.missionFails;
  const sr = total > 0 ? Math.round((state.missionWins / total) * 100) : 0;
  document.getElementById('successRate').textContent = sr + '%';
  document.getElementById('missionWins').textContent = state.missionWins;
  document.getElementById('missionFails').textContent = state.missionFails;
  document.getElementById('missionActive').textContent = state.missionActive;

  // Progress ring
  const circumference = 2 * Math.PI * 64;
  const offset = circumference - (sr / 100) * circumference;
  document.getElementById('ringFill').style.strokeDashoffset = offset;
  document.getElementById('ringValEl').textContent = sr + '%';

  // Empire Tier
  let tier = TIERS[0];
  for (const t of TIERS) { if (state.cash >= t.cashMin) tier = t; }
  const tierIdx = TIERS.indexOf(tier);
  const nextTier = TIERS[tierIdx + 1];
  const prog = nextTier
    ? Math.round(((state.cash - tier.cashMin) / (nextTier.cashMin - tier.cashMin)) * 100)
    : 100;
  document.getElementById('empireTierName').textContent = tier.name;
  document.getElementById('tierProgressFill').style.width = prog + '%';
  document.getElementById('tierNextLabel').textContent = tier.next;
  document.getElementById('sidebarRank').textContent = tier.name;
  state.tierProgress = prog;

  // Streak
  state.streak = parseInt(localStorage.getItem('ls_streak') || '0');
  document.getElementById('streakCount').textContent = state.streak;
  document.getElementById('streakBonus').textContent = `+${state.streak * 5}% reward bonus`;

  // Achievements
  checkAchievements();
  renderAchievements();

  // Territory bars
  renderTerritoryBars();

  // Active missions from localStorage
  renderActiveMissions();
}

// ─── TERRITORY BARS ───────────────────────────────
function renderTerritoryBars() {
  const el = document.getElementById('territoryBars');
  const colors = ['#00d4ff', '#f5c518', '#00ff88', '#ff6b00', '#bf00ff'];
  el.innerHTML = ZONES.map((z, i) => `
    <div class="territory-item">
      <span class="territory-name">${z.name}</span>
      <div class="territory-bar-wrap">
        <div class="territory-bar" style="width:${zoneControl[i]}%;background:${colors[i]};"></div>
      </div>
      <span class="territory-pct" style="color:${colors[i]};">${zoneControl[i]}%</span>
    </div>`).join('');
}

// ─── ACHIEVEMENTS ────────────────────────────────
function checkAchievements() {
  if (state.totalOpsRun >= 1) state.achievements.firstblood = true;
  if (state.cash >= 200000) state.achievements.moneybags = true;
  if (state.heat <= 10 && state.totalOpsRun >= 3) state.achievements.ghostmode = true;
  if (state.missionFails === 0 && state.missionWins >= 3) state.achievements.untouchable = true;
  if (state.cash >= 600000) state.achievements.kingpin = true;
  if (state.cash >= 1000000) state.achievements.legend = true;
}

function renderAchievements() {
  const achieved = Object.values(state.achievements).filter(Boolean).length;
  const total = Object.keys(state.achievements).length;
  document.getElementById('achievCount').textContent = `${achieved}/${total}`;
  for (const [key, unlocked] of Object.entries(state.achievements)) {
    const el = document.getElementById(`ach-${key}`);
    if (el) el.classList.toggle('locked', !unlocked);
  }
}

// ─── ACTIVE MISSIONS (from localStorage) ──────────
function renderActiveMissions() {
  const missions = JSON.parse(localStorage.getItem('ls_missions') || '[]');
  const active = missions.filter(m => m.status === 'active');
  const el = document.getElementById('activeMissionsList');
  state.missionActive = active.length;
  state.ops = active.length;
  document.getElementById('opsValue').textContent = state.ops;

  if (active.length === 0) {
    el.innerHTML = `<div style="color:var(--text-dim);font-size:13px;text-align:center;padding:20px 0;">No active missions. <a href="missions.html" style="color:var(--neon-gold);">Plan one →</a></div>`;
    return;
  }

  const typeIcons = { Heist: '💎', Delivery: '📦', Surveillance: '👁️', Ambush: '⚔️', Takeover: '🏴' };
  el.innerHTML = active.slice(0, 5).map(m => `
    <div class="mission-quick-item">
      <span class="mission-type-icon">${typeIcons[m.type] || '🎯'}</span>
      <div class="mission-details">
        <div class="mission-name">${m.name}</div>
        <div class="mission-meta">Risk: ${m.risk} · Reward: ${fmt$(m.reward)}</div>
      </div>
      <span class="mission-status-tag tag-active">ACTIVE</span>
    </div>`).join('');
}

// ─── USER ACTIONS ────────────────────────────────
function conductOperation() {
  const gain = Math.round((30000 + Math.random() * 70000) * (1 + state.streak * 0.05));
  const heatGain = Math.round(8 + Math.random() * 12);
  state.cash += gain;
  state.cashDelta += gain;
  state.heat = clamp(state.heat + heatGain, 0, 100);
  state.wantedLevel = clamp(Math.floor(state.heat / 20), 0, 5);
  state.totalOpsRun++;
  state.missionWins++;
  state.sightingStart = Date.now();
  state.lastLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

  // Grow territory randomly
  const zoneIdx = Math.floor(Math.random() * zoneControl.length);
  zoneControl[zoneIdx] = clamp(zoneControl[zoneIdx] + Math.round(3 + Math.random() * 7), 0, 100);

  // Increment streak
  let streak = parseInt(localStorage.getItem('ls_streak') || '0') + 1;
  localStorage.setItem('ls_streak', streak);
  state.streak = streak;

  saveState();
  syncUI();
  addFeed(`<strong>Operation Conducted</strong> — Hauled ${fmt$(gain)} from ${state.lastLocation}`, 'cash');
  showToast('💰 OPERATION SUCCESS', `+${fmt$(gain)} added to your war chest`, '💰');
  updateChart(gain, state.heat);
  addChartPoint(gain, state.heat);
  triggerCooldown();
}

function hitTarget() {
  const targetName = TARGET_NAMES[Math.floor(Math.random() * TARGET_NAMES.length)];
  const gain = Math.round(15000 + Math.random() * 40000);
  const heatGain = Math.round(15 + Math.random() * 20);

  state.cash += gain;
  state.cashDelta += gain;
  state.heat = clamp(state.heat + heatGain, 0, 100);
  state.wantedLevel = clamp(Math.floor(state.heat / 20), 0, 5);
  state.totalOpsRun++;
  state.missionWins++;
  state.lastLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  state.sightingStart = Date.now();
  state.status = 'ON THE MOVE';

  // Track hit for map (fictional coords based on location center)
  const hitData = {
    name: targetName,
    location: state.lastLocation,
    time: new Date().toISOString(),
    // Random coords near "center" for now - in a real app these would map to the location
    coords: [34.052 + (Math.random() - 0.5) * 0.1, -118.244 + (Math.random() - 0.5) * 0.1]
  };
  state.recentHits.unshift(hitData);
  if (state.recentHits.length > 5) state.recentHits.pop();

  saveState();
  syncUI();
  addFeed(`<strong>${targetName} Eliminated</strong> — ${fmt$(gain)} collected.`, 'heat');
  showToast('🎯 TARGET DOWN', `${targetName} neutralized. Heat up ${heatGain}%.`, '🎯');
  addChartPoint(gain, state.heat);
}

function bribeCops() {
  const cost = Math.round(state.heat * 500 + 5000);
  if (state.cash < cost) {
    showToast('❌ INSUFFICIENT FUNDS', `You need ${fmt$(cost)} to bribe. Earn more first.`, '🚔');
    return;
  }
  const reduction = Math.round(20 + Math.random() * 15);
  state.cash -= cost;
  state.cashDelta -= cost;
  state.heat = clamp(state.heat - reduction, 0, 100);
  state.wantedLevel = clamp(Math.floor(state.heat / 20), 0, 5);
  state.status = 'HIDING';

  saveState();
  syncUI();
  addFeed(`<strong>Cops Bribed</strong> — Paid ${fmt$(cost)}, heat dropped ${reduction}%. Status: Hiding.`, 'op');
  showToast('🚔 BRIBED!', `Heat reduced by ${reduction}%. Cost: ${fmt$(cost)}.`, '🚔');
  addChartPoint(-cost, state.heat);
}

function layLow() {
  const reduction = Math.round(10 + Math.random() * 15);
  state.heat = clamp(state.heat - reduction, 0, 100);
  state.wantedLevel = clamp(Math.floor(state.heat / 20), 0, 5);
  state.status = 'HIDING';
  state.sightingStart = Date.now();
  // Reset streak
  localStorage.setItem('ls_streak', '0');
  state.streak = 0;

  saveState();
  syncUI();
  addFeed(`<strong>Laying Low</strong> — Heat dropped ${reduction}%. Streak reset.`, 'op');
  showToast('🌿 GONE DARK', `Heat reduced by ${reduction}%. Streak reset.`, '🌿');
  addChartPoint(0, state.heat);
}

// ─── HEAT DECAY ──────────────────────────────────
let cooldownInterval = null;
let cooldownRemain = 0;

function triggerCooldown() {
  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownRemain = 120; // 2 min
  const el = document.getElementById('cooldownFill');
  const timer = document.getElementById('cooldownTimer');
  cooldownInterval = setInterval(() => {
    cooldownRemain--;
    const pct = (cooldownRemain / 120) * 100;
    el.style.width = pct + '%';
    const m = String(Math.floor(cooldownRemain / 60)).padStart(2, '0');
    const s = String(cooldownRemain % 60).padStart(2, '0');
    timer.textContent = `${m}:${s}`;
    if (cooldownRemain <= 0) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
      // Auto decay heat a bit
      state.heat = clamp(state.heat - 5, 0, 100);
      saveState();
      syncUI();
      addFeed(`<strong>Heat Decayed</strong> — Automatic cool-down applied. Heat: ${state.heat}%.`, 'op');
      timer.textContent = '—';
    }
  }, 1000);
}

// ─── NATURAL HEAT DECAY (every 45s) ──────────────
setInterval(() => {
  if (state.heat > 0 && !cooldownInterval) {
    state.heat = clamp(state.heat - 2, 0, 100);
    state.wantedLevel = clamp(Math.floor(state.heat / 20), 0, 5);
    saveState();
    syncUI();
  }
}, 45000);

// ─── CHARTS ──────────────────────────────────────
let earningsChart = null;
const chartLabels = [];
const chartEarnings = [];
const chartHeat = [];

function initChart() {
  const ctx = document.getElementById('earningsChart').getContext('2d');
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now - i * 3600000);
    chartLabels.push(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    chartEarnings.push(Math.round(Math.random() * 50000 + 10000));
    chartHeat.push(Math.round(Math.random() * 60 + 10));
  }

  earningsChart = new Chart(ctx, {
    data: {
      labels: chartLabels,
      datasets: [
        {
          type: 'bar',
          label: 'Earnings ($)',
          data: chartEarnings,
          backgroundColor: 'rgba(245,197,24,0.25)',
          borderColor: 'rgba(245,197,24,0.8)',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: 'Heat Level (%)',
          data: chartHeat,
          borderColor: '#ff2020',
          backgroundColor: 'rgba(255,32,32,0.08)',
          borderWidth: 2,
          pointBackgroundColor: '#ff2020',
          pointRadius: 4,
          tension: 0.4,
          fill: true,
          yAxisID: 'y2',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: '#8888aa', font: { family: 'Rajdhani', size: 12 } }
        },
        tooltip: {
          backgroundColor: '#12121a',
          borderColor: 'rgba(245,197,24,0.3)',
          borderWidth: 1,
          titleColor: '#f5c518',
          bodyColor: '#8888aa',
        },
      },
      scales: {
        x: { ticks: { color: '#555570', maxTicksLimit: 8 }, grid: { color: 'rgba(255,255,255,0.03)' } },
        y: {
          position: 'left',
          ticks: { color: '#f5c518', callback: v => '$' + (v / 1000).toFixed(0) + 'k' },
          grid: { color: 'rgba(255,255,255,0.03)' },
        },
        y2: {
          position: 'right',
          min: 0, max: 100,
          ticks: { color: '#ff2020', callback: v => v + '%' },
          grid: { drawOnChartArea: false },
        },
      },
    },
  });
}

function addChartPoint(earnings, heat) {
  const label = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  chartLabels.push(label);
  chartEarnings.push(Math.max(0, earnings));
  chartHeat.push(heat);
  if (chartLabels.length > 20) {
    chartLabels.shift();
    chartEarnings.shift();
    chartHeat.shift();
  }
  earningsChart.update('active');
}

function updateChart(earnings, heat) { }

// ─── AUTH & USER INFO ────────────────────────────
function setupUser() {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    const name = user.email.split('@')[0];
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    document.getElementById('sidebarUserName').textContent = displayName;
    document.getElementById('sidebarAvatar').textContent = displayName[0].toUpperCase();
    document.getElementById('greetingLine').textContent = `Welcome back, ${displayName}. Stay sharp — heat is rising.`;
  });
}

// ─── SAVE / LOAD STATE ───────────────────────────
function saveState() {
  localStorage.setItem('ls_state', JSON.stringify({
    cash: state.cash,
    cashDelta: state.cashDelta,
    heat: state.heat,
    ops: state.ops,
    wantedLevel: state.wantedLevel,
    status: state.status,
    lastLocation: state.lastLocation,
    totalOpsRun: state.totalOpsRun,
    missionWins: state.missionWins,
    missionFails: state.missionFails,
    missionActive: state.missionActive,
    sightingStart: state.sightingStart,
    recentHits: state.recentHits,
    zoneControl,
    achievements: state.achievements,
  }));
}

function loadState() {
  const saved = localStorage.getItem('ls_state');
  if (!saved) return;
  try {
    const s = JSON.parse(saved);
    Object.assign(state, s);
    if (s.zoneControl) zoneControl = s.zoneControl;
  } catch (e) { console.warn('State load error', e); }
}

// ─── THEME TOGGLE ────────────────────────────────
function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById('themeIcon');
  if (body.dataset.theme === 'light') {
    delete body.dataset.theme;
    icon.className = 'ri-contrast-2-line';
    localStorage.setItem('ls_theme', 'dark');
  } else {
    body.dataset.theme = 'light';
    icon.className = 'ri-sun-line';
    localStorage.setItem('ls_theme', 'light');
  }
}

function applyTheme() {
  if (localStorage.getItem('ls_theme') === 'light') {
    document.body.dataset.theme = 'light';
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = 'ri-sun-line';
  }
}

// ─── SCROLL HELPER ───────────────────────────────
function scrollToPanel(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── MISSION LISTENER ────────────────────────────
// Update dashboard state when missions are completed (cross-page via localStorage)
window.addEventListener('storage', e => {
  if (e.key === 'ls_missions' || e.key === 'ls_state') {
    loadState();
    syncUI();
  }
});

// ─── INITIAL FEED ─────────────────────────────────
const initialFeedItems = [
  { text: '<strong>System Online</strong> — Command Center operational.', type: 'op' },
  { text: '<strong>Intel Report</strong> — Vespucci Beach zone secured.', type: 'cash' },
  { text: '<strong>Heat Alert</strong> — LSPD increasing patrols downtown.', type: 'heat' },
  { text: '<strong>Safehouse Active</strong> — Mirror Park safehouse confirmed.', type: 'op' },
];

// ─── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  loadState();
  setupUser();
  startClock();
  setInterval(updateSighting, 1000);
  initChart();

  // Seed feed
  for (const item of initialFeedItems.reverse()) {
    addFeed(item.text, item.type);
  }
  syncUI();

  // Simulate live data every 30s
  setInterval(() => {
    const liveMessages = [
      { text: `<strong>Police Scanner</strong> — Increased patrols near ${LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]}.`, type: 'heat' },
      { text: `<strong>Network Report</strong> — Passive income collected from Grove Street.`, type: 'cash' },
      { text: `<strong>Rival Gang</strong> — Activity detected in Blaine County.`, type: 'alert' },
      { text: `<strong>Safehouse Check</strong> — All safehouses secure.`, type: 'op' },
    ];
    const msg = liveMessages[Math.floor(Math.random() * liveMessages.length)];
    addFeed(msg.text, msg.type);
  }, 30000);
});