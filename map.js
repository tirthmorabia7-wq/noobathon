/* ════════════════════════════════════════════════════
   map.js — Los Santos City Map
   GTA V themed Leaflet map with all features
════════════════════════════════════════════════════ */

// ─── FICTIONAL LOCATIONS ──────────────────────────
// Centered on a fictional downtown area (LA coords as base)
const MAP_CENTER = [34.052, -118.244];

const OPERATION_ZONES = [
  { name: 'Vespucci Beach Ops', coords: [33.985, -118.470], heat: 'low', earnings: 45000, type: 'Narcotics Distribution' },
  { name: 'Downtown Syndicate', coords: [34.043, -118.267], heat: 'high', earnings: 120000, type: 'Money Laundering' },
  { name: 'Mirror Park Cell', coords: [34.098, -118.285], heat: 'medium', earnings: 67000, type: 'Arms Dealing' },
  { name: 'Palomino Yard', coords: [34.021, -118.193], heat: 'low', earnings: 38000, type: 'Vehicle Chop Shop' },
  { name: 'Strawberry Ring', coords: [34.009, -118.291], heat: 'high', earnings: 95000, type: 'Extortion' },
  { name: 'Rockford Racket', coords: [34.075, -118.378], heat: 'medium', earnings: 71000, type: 'Gambling Den' },
];

const SAFEHOUSES = [
  { name: 'Echo Park Safehouse', coords: [34.073, -118.260], capacity: 8, status: 'Secure' },
  { name: 'Chumash Hideout', coords: [34.013, -118.560], capacity: 4, status: 'Secure' },
  { name: 'Vinewood Cache', coords: [34.112, -118.325], capacity: 6, status: 'Watchlist' },
  { name: 'LSIA Warehouse', coords: [33.944, -118.410], capacity: 12, status: 'Secure' },
];

const HOT_ZONES = [
  { name: 'LSPD HQ Perimeter', coords: [34.056, -118.250], threat: 'Extreme', patrols: 24 },
  { name: 'Federal Building', coords: [34.048, -118.258], threat: 'High', patrols: 16 },
  { name: 'Harbor Division', coords: [33.733, -118.278], threat: 'Medium', patrols: 10 },
  { name: 'Blaine County Sheriff', coords: [34.390, -118.555], threat: 'High', patrols: 12 },
];

// HVT starts at a random location
let hvtPosition = [34.067, -118.240];
const HVT_TRAIL_MAX = 8;
let hvtTrail = [hvtPosition];

// ─── MAP INIT ─────────────────────────────────────
const map = L.map('map', {
  center: MAP_CENTER,
  zoom: 12,
  zoomControl: true,
}).setView(MAP_CENTER, 12);

// Dark tile layer from CartoDB
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CARTO',
  maxZoom: 19,
}).addTo(map);

// ─── MARKER HELPERS ───────────────────────────────
function heatColor(heat) {
  if (heat === 'low') return '#00ff88';
  if (heat === 'medium') return '#f5c518';
  return '#ff2020';
}

function heatGlow(heat) {
  if (heat === 'low') return '0 0 10px #00ff88';
  if (heat === 'medium') return '0 0 10px #f5c518';
  return '0 0 12px #ff2020, 0 0 25px rgba(255,32,32,0.3)';
}

function createCircleMarker(coords, color, radius = 12, pulsing = false) {
  return L.circleMarker(coords, {
    radius,
    color: color,
    fillColor: color,
    fillOpacity: 0.75,
    weight: 2,
    opacity: 0.9,
  });
}

// ─── LAYERS ───────────────────────────────────────
const layers = {
  ops: L.layerGroup(),
  safe: L.layerGroup(),
  hot: L.layerGroup(),
  hvt: L.layerGroup(),
  hits: L.layerGroup(),
};

// ─── OPS MARKERS ─────────────────────────────────
OPERATION_ZONES.forEach(z => {
  const color = heatColor(z.heat);
  const marker = createCircleMarker(z.coords, color);
  marker.bindPopup(`
    <div style="font-family:'Rajdhani',sans-serif;min-width:200px;">
      <div style="font-family:'Orbitron',monospace;font-size:12px;color:#f5c518;margin-bottom:8px;letter-spacing:1px;">
        🎯 OPERATION ZONE
      </div>
      <div style="font-size:15px;font-weight:700;color:#e8e8f0;margin-bottom:8px;">${z.name}</div>
      <div style="display:grid;gap:4px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;">
          <span style="color:#8888aa;">Type:</span>
          <span style="color:#e8e8f0;">${z.type}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;">
          <span style="color:#8888aa;">Heat Level:</span>
          <span style="color:${color};font-weight:700;">${z.heat.toUpperCase()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;">
          <span style="color:#8888aa;">Est. Earnings:</span>
          <span style="color:#f5c518;font-weight:700;">$${z.earnings.toLocaleString()}</span>
        </div>
      </div>
    </div>`, { className: '' });
  layers.ops.addLayer(marker);
});

// ─── SAFEHOUSE MARKERS ───────────────────────────
SAFEHOUSES.forEach(s => {
  const statusColor = s.status === 'Secure' ? '#00d4ff' : '#f5c518';
  const marker = createCircleMarker(s.coords, statusColor, 10);
  marker.bindPopup(`
    <div style="font-family:'Rajdhani',sans-serif;min-width:200px;">
      <div style="font-family:'Orbitron',monospace;font-size:12px;color:#00d4ff;margin-bottom:8px;letter-spacing:1px;">
        🏠 SAFEHOUSE
      </div>
      <div style="font-size:15px;font-weight:700;color:#e8e8f0;margin-bottom:8px;">${s.name}</div>
      <div style="display:grid;gap:4px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;">
          <span style="color:#8888aa;">Status:</span>
          <span style="color:${statusColor};font-weight:700;">${s.status}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;">
          <span style="color:#8888aa;">Capacity:</span>
          <span style="color:#e8e8f0;">${s.capacity} agents</span>
        </div>
      </div>
    </div>`);
  layers.safe.addLayer(marker);
});

// ─── HOT ZONE MARKERS ────────────────────────────
HOT_ZONES.forEach(h => {
  const marker = createCircleMarker(h.coords, '#ff6b00', 14);
  marker.bindPopup(`
    <div style="font-family:'Rajdhani',sans-serif;min-width:200px;">
      <div style="font-family:'Orbitron',monospace;font-size:12px;color:#ff6b00;margin-bottom:8px;letter-spacing:1px;">
        ⚠️ HIGH-RISK ZONE
      </div>
      <div style="font-size:15px;font-weight:700;color:#e8e8f0;margin-bottom:8px;">${h.name}</div>
      <div style="display:grid;gap:4px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;">
          <span style="color:#8888aa;">Threat Level:</span>
          <span style="color:#ff6b00;font-weight:700;">${h.threat}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;">
          <span style="color:#8888aa;">Active Patrols:</span>
          <span style="color:#e8e8f0;">${h.patrols}/day</span>
        </div>
      </div>
    </div>`);
  layers.hot.addLayer(marker);
});

// ─── HVT MARKER + TRAIL ───────────────────────────
let hvtMarker = null;
let hvtTrailLine = null;

function createHVTIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:18px;height:18px;
      border-radius:50%;
      background:#ff0000;
      border:3px solid #ff6666;
      box-shadow:0 0 12px #ff0000, 0 0 25px rgba(255,0,0,0.5);
      animation:blink 0.8s infinite;
    "></div>
    <style>@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}</style>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function initHVT() {
  hvtMarker = L.marker(hvtPosition, { icon: createHVTIcon() })
    .bindPopup(`
      <div style="font-family:'Rajdhani',sans-serif;">
        <div style="font-family:'Orbitron',monospace;font-size:11px;color:#ff2020;letter-spacing:1px;margin-bottom:6px;">🔴 HIGH-VALUE TARGET</div>
        <div style="font-size:14px;font-weight:700;color:#e8e8f0;">Tony "Phantom" Reyes</div>
        <div style="font-size:12px;color:#8888aa;margin-top:4px;">Wanted: $250,000 dead or alive</div>
      </div>`);
  layers.hvt.addLayer(hvtMarker);

  hvtTrailLine = L.polyline(hvtTrail, {
    color: 'rgba(255,0,0,0.35)',
    weight: 2,
    dashArray: '4,6',
  });
  layers.hvt.addLayer(hvtTrailLine);
}

function moveHVT() {
  // Random movement in LA area
  const lat = hvtPosition[0] + (Math.random() - 0.5) * 0.025;
  const lng = hvtPosition[1] + (Math.random() - 0.5) * 0.030;
  hvtPosition = [lat, lng];

  hvtTrail.push(hvtPosition);
  if (hvtTrail.length > HVT_TRAIL_MAX) hvtTrail.shift();

  hvtMarker.setLatLng(hvtPosition);
  hvtTrailLine.setLatLngs(hvtTrail);

  // Update stats
  const posEl = document.getElementById('hvtPos');
  if (posEl) posEl.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  const updEl = document.getElementById('mapLastUpdate');
  if (updEl) updEl.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Show notification every 3rd move
  if (Math.random() > 0.6) showMapNotif();
}

function showMapNotif() {
  const notif = document.getElementById('mapNotif');
  if (!notif) return;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 3500);
  showToast('🚨 HIGH-VALUE TARGET SPOTTED', 'Tony "Phantom" Reyes has moved to a new location!', '🔴');
}

// ─── RECENT HITS (CRIME SCENES) ──────────────────
function renderRecentHits() {
  layers.hits.clearLayers();
  const s = JSON.parse(localStorage.getItem('ls_state') || '{}');
  const hits = s.recentHits || [];

  hits.forEach(h => {
    const timeStr = new Date(h.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const marker = createCircleMarker(h.coords, '#ffff00', 12); // Yellow for crime scene
    marker.bindPopup(`
        <div style="font-family:'Rajdhani',sans-serif;min-width:180px;">
          <div style="font-family:'Orbitron',monospace;font-size:11px;color:#ffff00;letter-spacing:1px;margin-bottom:6px;">🕵️ CRIME SCENE</div>
          <div style="font-size:14px;font-weight:700;color:#e8e8f0;">Target: ${h.name}</div>
          <div style="font-size:12px;color:#8888aa;margin-top:4px;">Neutralized at ${h.location}</div>
          <div style="font-size:11px;color:var(--neon-gold);margin-top:2px;">Logged: ${timeStr}</div>
        </div>`);
    layers.hits.addLayer(marker);
  });
}

// ─── HEAT MAP OVERLAY ────────────────────────────
const heatData = [
  ...OPERATION_ZONES.map(z => [...z.coords, z.heat === 'high' ? 1.0 : z.heat === 'medium' ? 0.6 : 0.3]),
  ...HOT_ZONES.map(h => [...h.coords, h.threat === 'Extreme' ? 1.0 : h.threat === 'High' ? 0.7 : 0.4]),
];

let heatLayer = null;
try {
  heatLayer = L.heatLayer(heatData, {
    radius: 40,
    blur: 25,
    maxZoom: 17,
    max: 1.0,
    gradient: { 0.2: '#00ff88', 0.5: '#f5c518', 0.8: '#ff6b00', 1.0: '#ff0000' },
  });
} catch (e) { console.warn('Heat layer not available:', e); }

// ─── LAYER TOGGLE ────────────────────────────────
function toggleLayer(name) {
  const layer = layers[name];
  if (!layer) return;
  if (map.hasLayer(layer)) {
    map.removeLayer(layer);
  } else {
    map.addLayer(layer);
  }
}

function toggleHeatMap() {
  if (!heatLayer) return;
  if (map.hasLayer(heatLayer)) {
    map.removeLayer(heatLayer);
  } else {
    map.addLayer(heatLayer);
  }
}

// ─── TOAST ───────────────────────────────────────
function showToast(title, msg, icon = '📣') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
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
  }, 4500);
}

// ─── LIVE STATS ───────────────────────────────────
function updateMapStats() {
  const s = JSON.parse(localStorage.getItem('ls_state') || '{}');
  const heatEl = document.getElementById('mapHeat');
  const zonesEl = document.getElementById('mapZones');
  if (heatEl) heatEl.textContent = (s.heat || 0) + '%';
  if (zonesEl) zonesEl.textContent = OPERATION_ZONES.length;
}

// ─── INIT ─────────────────────────────────────────
// Add all layers to map
layers.ops.addTo(map);
layers.safe.addTo(map);
layers.hot.addTo(map);
layers.hvt.addTo(map);
layers.hits.addTo(map);
if (heatLayer) heatLayer.addTo(map); // Enable Heat Map by default

initHVT();
renderRecentHits();
updateMapStats();

// Move HVT every 8 seconds
setInterval(moveHVT, 8000);
setInterval(renderRecentHits, 10000);
setInterval(updateMapStats, 10000);

// Initial HVT notification after 3s
setTimeout(() => {
  showMapNotif();
}, 3000);