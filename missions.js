/* ════════════════════════════════════════════════════
   missions.js — Mission Planner Logic
════════════════════════════════════════════════════ */

const TYPE_ICONS = { Heist: '💎', Delivery: '📦', Surveillance: '👁️', Ambush: '⚔️', Takeover: '🏴', Setup: '🛠️', Story: '🎬' };
const RISK_HEAT = { Low: 5, Medium: 12, High: 22, Critical: 35 };

const STORY_MISSIONS = [
    { name: "Prologue", type: "Story", risk: "Low", location: "Ludendorff, NY", reward: 0 },
    { name: "Franklin and Lamar", type: "Delivery", risk: "Low", location: "Los Santos", reward: 800 },
    { name: "Repossession", type: "Ambush", risk: "Medium", location: "Vespucci Beach", reward: 1200 },
    { name: "Complications", type: "Surveillance", risk: "Low", location: "Rockford Hills", reward: 500 },
    { name: "Father/Son", type: "Story", risk: "Medium", location: "Western Highway", reward: 2000 },
    { name: "Chop", type: "Story", risk: "Low", location: "Strawberry", reward: 500 },
    { name: "Marriage Counseling", type: "Ambush", risk: "Medium", location: "Vinewood Hills", reward: 1500 },
    { name: "Daddy's Little Girl", type: "Story", risk: "Low", location: "Vespucci Beach", reward: 300 },
    { name: "Friend Request", type: "Surveillance", risk: "Low", location: "Vinewood", reward: 1200 },
    { name: "The Long Stretch", type: "Ambush", risk: "High", location: "Strawberry", reward: 3500 },
    { name: "Casing the Jewel Store", type: "Setup", risk: "Low", location: "Vangelico", reward: 0 },
    { name: "The Jewel Store Job", type: "Heist", risk: "High", location: "Rockford Hills", reward: 1200000 },
    { name: "Mr. Philips", type: "Ambush", risk: "Medium", location: "Grapeseed", reward: 5000 },
    { name: "Trevor Philips Industries", type: "Ambush", risk: "High", location: "Sandy Shores", reward: 8000 },
    { name: "Nervous Ron", type: "Ambush", risk: "High", location: "McKenzie Airfield", reward: 12000 },
    { name: "Crystal Maze", type: "Ambush", risk: "High", location: "Grapeseed", reward: 15000 },
    { name: "Friends Reunited", type: "Story", risk: "Low", location: "Blaine County", reward: 5000 },
    { name: "Fame or Shame", type: "Story", risk: "Low", location: "Maze Bank Arena", reward: 2000 },
    { name: "Dead Man Walking", type: "Surveillance", risk: "Medium", location: "FIB Building", reward: 10000 },
    { name: "Three's Company", type: "Ambush", risk: "High", location: "FIB Towers", reward: 25000 },
    { name: "By the Book", type: "Surveillance", risk: "Medium", location: "Warehouse", reward: 0 },
    { name: "Hood Safari", type: "Ambush", risk: "High", location: "Grove Street", reward: 12000 },
    { name: "Did Somebody Say Yoga?", type: "Story", risk: "Low", location: "Rockford Hills", reward: 0 },
    { name: "Scouting the Port", type: "Setup", risk: "Low", location: "LS Port", reward: 0 },
    { name: "The Merryweather Heist", type: "Heist", risk: "Critical", location: "Pacific Ocean", reward: 0 },
    { name: "The Hotel Assassination", type: "Surveillance", risk: "Medium", location: "Downtown", reward: 30000 },
    { name: "The Multi Target Assassination", type: "Ambush", risk: "High", location: "Los Santos", reward: 45000 },
    { name: "The Vice Assassination", type: "Ambush", risk: "High", location: "Los Santos", reward: 50000 },
    { name: "The Bus Assassination", type: "Surveillance", risk: "Medium", location: "Los Santos", reward: 40000 },
    { name: "The Construction Assassination", type: "Ambush", risk: "High", location: "Los Santos", reward: 60000 },
    { name: "Blitz Play", type: "Ambush", risk: "Critical", location: "Cypress Flats", reward: 0 },
    { name: "I Fought the Law...", type: "Story", risk: "Medium", location: "Banning", reward: 15000 },
    { name: "Eye in the Sky", type: "Surveillance", risk: "Medium", location: "Police Station", reward: 10000 },
    { name: "Mr. Richards", type: "Story", risk: "Low", location: "Majestic Studios", reward: 20000 },
    { name: "Caida Libre", type: "Ambush", risk: "High", location: "La Fuente Blanca", reward: 25000 },
    { name: "Deep Inside", type: "Ambush", risk: "High", location: "Movie Studio", reward: 30000 },
    { name: "Minor Turbulence", type: "Ambush", risk: "Critical", location: "McKenzie Airfield", reward: 0 },
    { name: "Paleto Score Setup", type: "Setup", risk: "Medium", location: "Paleto Bay", reward: 0 },
    { name: "The Paleto Score", type: "Heist", risk: "Critical", location: "Paleto Bay Bank", reward: 8000000 },
    { name: "Derailed", type: "Story", risk: "High", location: "Cassidy Creek", reward: 0 },
    { name: "Monkey Business", type: "Ambush", risk: "Critical", location: "Humane Labs", reward: 0 },
    { name: "Hang Ten", type: "Story", risk: "Low", location: "Vespucci", reward: 0 },
    { name: "Surveying the Score", type: "Setup", risk: "Low", location: "Union Depository", reward: 0 },
    { name: "Bury the Hatchet", type: "Story", risk: "High", location: "North Yankton", reward: 0 },
    { name: "Pack Man", type: "Delivery", risk: "High", location: "Los Santos", reward: 50000 },
    { name: "Fresh Meat", type: "Ambush", risk: "High", location: "Butcher Shop", reward: 0 },
    { name: "The Ballad of Rocco", type: "Ambush", risk: "Medium", location: "Studio Lot", reward: 25000 },
    { name: "Cleaning out the Bureau", type: "Setup", risk: "Low", location: "FIB Building", reward: 0 },
    { name: "The Bureau Raid", type: "Heist", risk: "Critical", location: "FIB Tower", reward: 150000 },
    { name: "The Wrap Up", type: "Ambush", risk: "Critical", location: "Kortz Center", reward: 0 },
    { name: "Lamar Down", type: "Ambush", risk: "High", location: "Paleto Forest", reward: 0 },
    { name: "Legal Trouble", type: "Story", risk: "High", location: "LSIA", reward: 0 },
    { name: "Meltdown", type: "Story", risk: "High", location: "Vinewood", reward: 0 },
    { name: "Planning the Big Score", type: "Setup", risk: "Low", location: "Strip Club", reward: 0 },
    { name: "The Big Score", type: "Heist", risk: "Critical", location: "Union Depository", reward: 201600000 },
    { name: "Something Sensible (Ending A)", type: "Story", risk: "High", location: "Mountains", reward: 0 },
    { name: "The Time's Come (Ending B)", type: "Story", risk: "High", location: "Factory", reward: 0 },
    { name: "The Third Way (Ending C)", type: "Heist", risk: "Critical", location: "Foundry", reward: 20000000 }
];

let missions = [];
let currentTab = 'all';

// ─── SEED MISSIONS ───────────────────────────────
function seedMissions() {
    if (missions.length === 0) {
        // Initial set of missions - only the first is active, others are locked
        missions = STORY_MISSIONS.map((m, index) => ({
            id: 'story_' + index,
            ...m,
            status: index === 0 ? 'active' : 'locked',
            start: index === 0 ? new Date().toISOString() : null,
            end: null,
            createdAt: new Date().toISOString()
        }));
        saveMissions();
        if (typeof showToast === 'function') {
            showToast('🎬 STORY INITIATED', 'Prologue: Ludendorff, NY is ready.', '🎬');
        }
    }
}

// ─── LOAD FROM STORAGE ───────────────────────────
function loadMissions() {
    try {
        const stored = localStorage.getItem('ls_missions');
        if (!stored || stored === '[]') {
            seedMissions();
            return;
        }
        missions = JSON.parse(stored);
        // Auto-transition pending → active based on time
        const now = Date.now();
        missions.forEach(m => {
            if (m.status === 'pending' && m.start && new Date(m.start).getTime() <= now) {
                m.status = 'active';
            }
            if (m.status === 'active' && m.end && new Date(m.end).getTime() <= now) {
                m.status = 'done';
            }
        });
        saveMissions();
    } catch (e) {
        missions = [];
        seedMissions();
    }
}

function saveMissions() {
    localStorage.setItem('ls_missions', JSON.stringify(missions));
    checkOverlap();
    updateStats();
    renderMissions();
    renderTimeline();
}

// ─── ADD MISSION ─────────────────────────────────
function addMission() {
    const name = document.getElementById('mName').value.trim();
    const type = document.getElementById('mType').value;
    const risk = document.getElementById('mRisk').value;
    const loc = document.getElementById('mLocation').value;
    const reward = parseInt(document.getElementById('mReward').value) || 50000;
    const start = document.getElementById('mStart').value;
    const end = document.getElementById('mEnd').value;

    if (!name) { showToast('⚠️ ERROR', 'Mission name is required.', '⚠️'); return; }
    if (start && end && new Date(end) <= new Date(start)) {
        showToast('⚠️ ERROR', 'End time must be after start time.', '⚠️');
        return;
    }

    const now = new Date();
    const startTime = start ? new Date(start) : null;
    let status = 'pending';
    const activeExists = missions.some(m => m.status === 'active');
    if ((!startTime || startTime <= now) && !activeExists) {
        status = 'active';
    }

    const mission = {
        id: Date.now().toString(),
        name, type, risk, location: loc, reward,
        start: start || (status === 'active' ? now.toISOString() : null),
        end: end || null,
        status,
        createdAt: now.toISOString(),
    };

    missions.unshift(mission);
    saveMissions();
    showToast('✅ MISSION PLANNED', `"${name}" has been added to the roster.`, TYPE_ICONS[type] || '🎯');

    // Clear form
    document.getElementById('mName').value = '';
    document.getElementById('mReward').value = '';
    document.getElementById('mStart').value = '';
    document.getElementById('mEnd').value = '';

    // Add to activity history
    addHistory(`Mission planned: <strong>${name}</strong> [${type}, ${risk} risk, $${reward.toLocaleString()} reward]`);
}

// ─── COMPLETE MISSION ─────────────────────────────
function completeMission(id) {
    const m = missions.find(x => x.id === id);
    if (!m) return;
    m.status = 'done';

    // ─── PROGRESSION LOGIC ───────────────────────
    if (id.startsWith('story_')) {
        const currentIdx = parseInt(id.split('_')[1]);
        const nextIdx = currentIdx + 1;
        const nextId = 'story_' + nextIdx;
        const nextM = missions.find(x => x.id === nextId);

        if (nextM && nextM.status === 'locked') {
            nextM.status = 'active';
            nextM.start = new Date().toISOString();
            showToast('🔓 UNLOCKED', `Next Mission: "${nextM.name}" is now available.`, '🎬');
        } else if (!nextM && currentIdx === STORY_MISSIONS.length - 1) {
            showToast('🏆 STORY COMPLETE', 'You have finished the Los Santos Storyline.', '✨');
        }
    }
    // ─────────────────────────────────────────────

    // Update dashboard state
    const s = JSON.parse(localStorage.getItem('ls_state') || '{}');
    s.cash = (s.cash || 0) + m.reward;
    s.missionWins = (s.missionWins || 0) + 1;
    s.totalOpsRun = (s.totalOpsRun || 0) + 1;
    s.missionActive = missions.filter(x => x.status === 'active').length;
    s.heat = Math.min(100, (s.heat || 0) + RISK_HEAT[m.risk] * 0.5);
    s.wantedLevel = Math.min(5, Math.floor(s.heat / 20));

    // Streak
    let streak = parseInt(localStorage.getItem('ls_streak') || '0') + 1;
    localStorage.setItem('ls_streak', streak);

    localStorage.setItem('ls_state', JSON.stringify(s));
    saveMissions();

    // Play GTA SA Mission Passed Sound
    const audio = new Audio('https://www.myinstants.com/media/sounds/gta-sa-mission-passed-sound-effect-hd.mp3');
    audio.play().catch(e => console.warn('Audio play failed:', e));

    showToast('💰 MISSION COMPLETE', `"${m.name}" done! +$${m.reward.toLocaleString()} earned.`, '🎉');
    addHistory(`Mission <strong>${m.name}</strong> completed → +$${m.reward.toLocaleString()} · Heat +${RISK_HEAT[m.risk]}%`);
}

// ─── FAIL MISSION ─────────────────────────────────
function failMission(id) {
    const m = missions.find(x => x.id === id);
    if (!m) return;
    m.status = 'failed';

    const s = JSON.parse(localStorage.getItem('ls_state') || '{}');
    s.missionFails = (s.missionFails || 0) + 1;
    s.totalOpsRun = (s.totalOpsRun || 0) + 1;
    s.missionActive = missions.filter(x => x.status === 'active').length;
    s.heat = Math.min(100, (s.heat || 0) + RISK_HEAT[m.risk]);
    s.wantedLevel = Math.min(5, Math.floor(s.heat / 20));
    localStorage.setItem('ls_streak', '0');

    localStorage.setItem('ls_state', JSON.stringify(s));
    saveMissions();
    showToast('💀 MISSION FAILED', `"${m.name}" failed. Heat spiked +${RISK_HEAT[m.risk]}%.`, '☠️');
    addHistory(`Mission <strong>${m.name}</strong> failed · Heat +${RISK_HEAT[m.risk]}%`);
}

// ─── DELETE MISSION ───────────────────────────────
function deleteMission(id) {
    missions = missions.filter(x => x.id !== id);
    saveMissions();
}

function clearCompleted() {
    missions = missions.filter(m => m.status !== 'done' && m.status !== 'failed');
    saveMissions();
    showToast('🗑️ CLEARED', 'Completed and failed missions removed.', '🗑️');
}

// ─── SWITCH TAB ───────────────────────────────────
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('tab-' + tab);
    if (btn) btn.classList.add('active');
    renderMissions();
}

// ─── START MISSION ────────────────────────────────
function startMission(id) {
    const m = missions.find(x => x.id === id);
    if (!m) return;

    m.status = 'active';
    m.start = new Date().toISOString();

    // Update dashboard active mission count
    const s = JSON.parse(localStorage.getItem('ls_state') || '{}');
    s.missionActive = missions.filter(x => x.status === 'active').length;
    localStorage.setItem('ls_state', JSON.stringify(s));

    saveMissions();
    showToast('▶ MISSION STARTED', `"${m.name}" is now live.`, '🎯');
}


// ─── RENDER ───────────────────────────────────────
function renderMissions() {
    const el = document.getElementById('missionList');
    if (!el) return;
    let list = missions;

    if (currentTab === 'active') list = missions.filter(m => m.status === 'active');
    if (currentTab === 'pending') list = missions.filter(m => m.status === 'pending');
    if (currentTab === 'done') list = missions.filter(m => m.status === 'done' || m.status === 'failed');
    if (currentTab === 'story') list = missions.filter(m => m.id && m.id.startsWith('story_'));

    if (list.length === 0) {
        el.innerHTML = `<div class="empty-state"><div class="es-icon">🎯</div>No missions here yet.</div>`;
        return;
    }

    const hasActive = missions.some(m => m.status === 'active');

    // Sort story mode chronologically
    if (currentTab === 'story') {
        list.sort((a, b) => {
            const idxA = parseInt(a.id.split('_')[1]);
            const idxB = parseInt(b.id.split('_')[1]);
            return idxA - idxB;
        });
    }

    el.innerHTML = list.map(m => {
        const icon = m.status === 'locked' ? '🔒' : (TYPE_ICONS[m.type] || '🎯');
        const riskClass = { Low: 'risk-low', Medium: 'risk-med', High: 'risk-high', Critical: 'risk-crit' }[m.risk] || 'risk-med';
        const cardClass = { active: 'active-card', pending: 'pending-card', done: 'done-card', failed: 'failed-card', locked: 'locked-card' }[m.status] || '';
        const statusTag = {
            active: `<span class="status-tag active">ACTIVE</span>`,
            pending: `<span class="status-tag pending">UPCOMING</span>`,
            done: `<span class="status-tag done">DONE</span>`,
            locked: `<span class="status-tag locked">LOCKED</span>`,
            failed: `<span class="status-tag failed">FAILED</span>`,
        }[m.status] || '';

        let actionRow = '';
        if (m.status === 'active') {
            actionRow = `
                <div class="mc-actions">
                    <button class="mc-btn complete" onclick="completeMission('${m.id}')">✅ Complete</button>
                    <button class="mc-btn fail"    onclick="failMission('${m.id}')">💀 Fail</button>
                    <button class="mc-btn delete"  onclick="deleteMission('${m.id}')">🗑</button>
                </div>`;
        } else if (m.status === 'pending') {
            actionRow = `
                <div class="mc-actions">
                    ${hasActive ?
                    `<span style="font-size:11px; color:var(--text-dim);">Finish active mission to start this</span>` :
                    `<button class="mc-btn complete" onclick="startMission('${m.id}')">▶ Start Now</button>`
                }
                    <button class="mc-btn delete" onclick="deleteMission('${m.id}')">🗑</button>
                </div>`;
        } else if (m.status === 'locked') {
            actionRow = `
                <div class="mc-actions" style="opacity:0.5; pointer-events:none;">
                    <span style="font-size:11px;color:var(--text-dim);">Complete previous to unlock</span>
                </div>`;
        } else {
            actionRow = `
                <div class="mc-actions">
                    <button class="mc-btn delete" onclick="deleteMission('${m.id}')">🗑 Remove</button>
                </div>`;
        }


        const timeStr = m.start
            ? `${new Date(m.start).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}${m.end ? ' → ' + new Date(m.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}`
            : 'Unscheduled';

        return `
      <div class="mission-card ${cardClass}" id="m-card-${m.id}">
        <div class="mission-card-icon">${icon}</div>
        <div class="mission-card-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <div class="mc-name">${m.name}${statusTag}</div>
              <div class="mc-meta">
                <span><i class="ri-map-pin-line"></i> ${m.location}</span>
                <span><i class="ri-money-dollar-circle-line"></i> ${m.reward.toLocaleString()}</span>
                <span><i class="ri-bubble-chart-line"></i> ${m.type}</span>
              </div>
            </div>
            <div class="risk-badge ${riskClass}">${m.risk}</div>
          </div>
          ${actionRow}
          <div style="margin-top:10px; font-size:11px; color:var(--text-dim); border-top:1px solid rgba(255,255,255,0.05); padding-top:8px;">
            <i class="ri-time-line"></i> ${timeStr}
          </div>
        </div>
      </div>`;
    }).join('');
}

function renderTimeline() {
    const el = document.getElementById('timeline');
    if (missions.length === 0) {
        el.innerHTML = `<div class="empty-state"><div class="es-icon">📅</div>No missions planned yet.</div>`;
        return;
    }

    const sorted = [...missions].sort((a, b) => {
        const ta = a.start ? new Date(a.start).getTime() : 0;
        const tb = b.start ? new Date(b.start).getTime() : 0;
        return tb - ta;
    }).slice(0, 10);

    const dotClass = { active: 'active', pending: 'pending', done: 'done', failed: 'failed' };
    el.innerHTML = sorted.map(m => {
        const icon = TYPE_ICONS[m.type] || '🎯';
        const timeStr = m.start
            ? new Date(m.start).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Immediate';
        return `
      <div class="tl-item" onclick="scrollToMission('${m.id}')" style="cursor:pointer;">
        <div class="tl-dot ${dotClass[m.status] || 'pending'}"></div>
        <div class="tl-time">${timeStr}</div>
        <div class="tl-content">${icon} ${m.name}</div>
        <div class="tl-sub">${m.type} · $${m.reward.toLocaleString()} · ${m.status.toUpperCase()}</div>
      </div>`;
    }).join('');
}

function scrollToMission(id) {
    const card = document.getElementById(`m-card-${id}`);
    if (!card) {
        // If mission category is filtered out, switch to 'all' tab
        currentTab = 'all';
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.classList.remove('active'));
        document.getElementById('tab-all').classList.add('active');
        renderMissions();
        // Wait for render
        setTimeout(() => {
            const newCard = document.getElementById(`m-card-${id}`);
            if (newCard) {
                newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                newCard.style.boxShadow = '0 0 30px var(--neon-gold)';
                setTimeout(() => newCard.style.boxShadow = '', 2000);
            }
        }, 50);
        return;
    }
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.style.boxShadow = '0 0 30px var(--neon-gold)';
    setTimeout(() => card.style.boxShadow = '', 2000);
}

// ─── STATS ───────────────────────────────────────
function updateStats() {
    const s = JSON.parse(localStorage.getItem('ls_state') || '{}');
    document.getElementById('statTotal').textContent = missions.length;
    document.getElementById('statDone').textContent = s.missionWins || 0;
    document.getElementById('statFailed').textContent = s.missionFails || 0;
    document.getElementById('statEarned').textContent = '$' + (s.cash || 0).toLocaleString();
}

// ─── OVERLAP CHECK ────────────────────────────────
function checkOverlap() {
    const active = missions.filter(m => m.status === 'active' && m.risk === 'High' || m.risk === 'Critical');
    const highActive = missions.filter(m => m.status === 'active' && (m.risk === 'High' || m.risk === 'Critical'));
    const warn = document.getElementById('overlapWarn');
    if (warn) warn.style.display = highActive.length >= 2 ? 'block' : 'none';
}

// ─── ACTIVITY HISTORY ─────────────────────────────
function addHistory(text) {
    const history = JSON.parse(localStorage.getItem('ls_history') || '[]');
    history.unshift({
        text, type: 'op',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cash: (JSON.parse(localStorage.getItem('ls_state') || '{}').cash || 0),
    });
    if (history.length > 100) history.pop();
    localStorage.setItem('ls_history', JSON.stringify(history));
}

// ─── TOAST ───────────────────────────────────────
function showToast(title, msg, icon = '📣') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span class="toast-icon">${icon}</span><div class="toast-body"><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div>`;
    c.appendChild(t);
    setTimeout(() => { t.classList.add('removing'); setTimeout(() => t.remove(), 400); }, 4000);
}

// ─── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadMissions();
    renderMissions();
    renderTimeline();
    updateStats();

    // Set default start time to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const nowStr = now.toISOString().slice(0, 16);
    document.getElementById('mStart').value = nowStr;

    // Refresh every 10s to keep timeline in sync
    setInterval(() => { renderTimeline(); updateStats(); }, 10000);
});
