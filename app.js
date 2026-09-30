const STORAGE_KEY = 'hoornbeeck-campusroute-v3';
const APP_VERSION = 'v9-lokaalkeuze';
const CALIBRATION_KEY = 'hoornbeeck-map-calibration-v1';

// Campuslocatie voor de campuscheck en live routebegeleiding.
const CAMPUS = {
  name: 'Hoornbeeck College Gouda',
  address: 'Noordelijk Halfrond 10, 2801 DE Gouda',
  latitude: 52.0171251,
  longitude: 4.6843562,
  radiusMeters: 150
};

const BUILDINGS = [
  {
    id: 'hoofgebouw', name: 'Hoofdgebouw', code: 'HG',
    floors: [
      { id: 'hg-1', name: '1e verdieping', locals: ['A0.15', 'A0.18', 'A0.22'] },
      { id: 'hg-2', name: '2e verdieping', locals: ['B1.04', 'B1.11', 'B1.17'] },
      { id: 'hg-3', name: '3e verdieping', locals: ['C2.03', 'C2.08', 'C2.15'] },
      {
        id: 'hg-4', name: '4e verdieping', locals: ['4.08', '4.09', '4.10', '4.04', '4.03', '4.01', '4.VR'],
        localAliases: { '4.03': ['B403'] },
        mapImage: 'assets/plattegrond-4e-verdieping.png',
        markers: {
          // Posities afgestemd op de kamerblokken op de aangeleverde plattegrond.
          // De marker staat ongeveer in het midden van de ruimte zodat hij niet
          // op de gang of buiten de kamer valt.
          '4.08': { x: 14, y: 39 },
          '4.09': { x: 24, y: 44 },
          '4.10': { x: 42, y: 37 },
          '4.04': { x: 42, y: 58 },
          '4.03': { x: 64, y: 57 },
          '4.01': { x: 90, y: 40 },
          '4.VR': { x: 80, y: 18 }
        },
        // Route-netwerk op basis van de aangeleverde plattegrond.
        // Alleen de looproute volgt dit netwerk. De GPS-stip behoudt zijn eigen positie.
        routeStart: { x: 48, y: 54, label: 'Centrale trap / lift' },
        gpsMap: {
          // Dit is een instelbare kalibratie. Vervang dit met het echte GPS-punt
          // van de centrale entree/trap van het gebouw voor nauwkeurige indoor routing.
          anchor: { latitude: 52.0171251, longitude: 4.6843562, x: 48, y: 54 },
          mapWidthMeters: 110,
          mapHeightMeters: 70,
          // Deze gegevens zijn nog niet op locatie ingemeten. Een stip op deze
          // kaart is daarom een schatting, ook als de GPS zelf nauwkeurig is.
          calibrated: false,
          maxUsefulAccuracyMeters: 35
        },
        graph: {
          nodes: {
            S: { x: 48, y: 54 },
            W1: { x: 38, y: 54 },
            W2: { x: 25, y: 54 },
            N1: { x: 48, y: 45 },
            E1: { x: 57, y: 54 },
            E2: { x: 70, y: 54 },
            E3: { x: 76, y: 54 },
            N2: { x: 70, y: 40 },
            N3: { x: 78, y: 28 },
            D1: { x: 48, y: 62 },
            // Eindpunten van de route volgen dezelfde posities als de lokalenmarkers.
            L408: { x: 14, y: 39 },
            L409: { x: 24, y: 44 },
            L410: { x: 42, y: 37 },
            L404: { x: 42, y: 58 },
            L403: { x: 64, y: 57 },
            L401: { x: 90, y: 40 },
            LVR: { x: 80, y: 18 }
          },
          edges: [
            ['S','W1'],['W1','W2'],['W2','L408'],['W2','L409'],
            ['S','N1'],['N1','L410'],['S','D1'],['D1','L404'],
            ['S','E1'],['E1','L403'],['E1','E2'],['E2','E3'],['E3','L401'],
            ['E2','N2'],['N2','N3'],['N3','LVR']
          ]
        }
      }
    ]
  },
  {
    id: 'begane-grond', name: 'Begane grond', code: 'BG',
    floors: [
      { id: 'bg-0', name: 'Begane grond', locals: ['Balie', 'Aula', 'C0.01', 'C0.08'] }
    ]
  },
  {
    id: 'sport', name: 'Sport & praktijk', code: 'SP',
    floors: [
      { id: 'sp-1', name: '1e verdieping', locals: ['P1.03', 'P1.07'] },
      { id: 'sp-2', name: '2e verdieping', locals: ['P2.01', 'P2.06'] }
    ]
  }
];

const BADGES = [
  { id: 'first', name: 'Eerste stap', icon: '✦', text: 'Ontdek 1 lokaal', type: 'locals', threshold: 1 },
  { id: 'floor', name: 'Gebouwenkenner', icon: '◈', text: 'Bezoek 4 verdiepingen', type: 'floors', threshold: 4 },
  { id: 'route', name: 'Route expert', icon: '⌁', text: 'Ontdek 8 lokalen', type: 'locals', threshold: 8 },
  { id: 'city', name: 'Ontdekkingsreiziger', icon: '◎', text: 'Ontdek 12 locaties', type: 'locals', threshold: 12 },
  { id: 'all', name: 'Campuskenner', icon: '⌂', text: 'Bezoek alle verdiepingen', type: 'floors', threshold: 7 },
  { id: 'champ', name: 'Doorzetter', icon: '★', text: 'Behaal level 5', type: 'level', threshold: 5 }
];

const XP_LOCAL = 25;
const XP_FLOOR = 50;
const XP_PER_LEVEL = 100;

// Aankomstcontrole: standaard browser-GPS is binnen vaak onnauwkeurig.
// Daarom geven we pas XP na meerdere opeenvolgende GPS-metingen binnen de
// aankomstzone van de bestemming en alleen bij een voldoende nauwkeurige fix.
const ARRIVAL = {
  radiusMeters: 8,
  maxAccuracyMeters: 15,
  requiredConfirmations: 3,
  minConfirmationGapMs: 900
};

const GPS_TRACKING = {
  pollIntervalMs: 3000,
  staleAfterMs: 15000,
  renderIntervalMs: 250,
  options: { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
};

let state = loadState();
let mapCalibrations = loadMapCalibrations();
let currentRoute = 'route';
let selectedBuildingId = null;
let routeTarget = null;
let deferredInstallPrompt = null;
let geoWatchId = null;
let gpsKeepAliveTimer = null;
let gpsUiTimer = null;
let gpsSession = 0;
let gpsRefreshPending = false;
let gpsPermissionDenied = false;
let lastRenderedGpsAt = 0;
const lastIndoorPositions = new Map();
const manualFloorPositions = new Map();
let pendingMapCalibration = null;
let mapCalibrationTimer = null;
let arrival = {
  local: null,
  confirmations: 0,
  arrived: false,
  lastConfirmationAt: 0
};
let offlineMode = !navigator.onLine;

let gps = {
  supported: 'geolocation' in navigator,
  active: false,
  insideCampus: false,
  latitude: null,
  longitude: null,
  accuracy: null,
  distanceMeters: null,
  error: null,
  updatedAt: null
};

function defaultState() {
  return { xp: 0, discoveredLocals: [], visitedFloors: [], activity: [] };
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed) return { ...defaultState(), ...parsed };
    const old = JSON.parse(localStorage.getItem('hoornbeeck-campusroute-v2'));
    if (old) {
      const migrated = { ...defaultState(), ...old };
      migrated.discoveredLocals = (migrated.discoveredLocals || []).map(local => local === '4.05' ? '4.01' : local);
      return migrated;
    }
    return defaultState();
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mapSignature(floor) {
  return JSON.stringify([floor.mapImage, floor.gpsMap.mapWidthMeters, floor.gpsMap.mapHeightMeters, floor.markers]);
}

function loadMapCalibrations() {
  try {
    const saved = JSON.parse(localStorage.getItem(CALIBRATION_KEY)) || {};
    const valid = {};
    for (const building of BUILDINGS) for (const floor of building.floors) {
      const entry = saved[floor.id];
      if (!floor.gpsMap || !entry || entry.signature !== mapSignature(floor) || !Array.isArray(entry.anchors) || !entry.anchors.length || entry.anchors.length > 2) continue;
      const correct = entry.anchors.every(anchor => floor.locals.includes(anchor.local)
        && [anchor.latitude, anchor.longitude, anchor.accuracy, anchor.measuredAt].every(Number.isFinite)
        && Math.abs(anchor.latitude) <= 90 && Math.abs(anchor.longitude) <= 180
        && anchor.accuracy >= 0);
      if (correct && calibrationTransform(floor, entry)) valid[floor.id] = entry;
    }
    return valid;
  } catch { return {}; }
}

function calibrationTransform(floor, entry) {
  if (!entry?.anchors?.length) return null;
  const first = entry.anchors[0];
  const firstPoint = floor.markers[first.local];
  const anchor = { latitude: first.latitude, longitude: first.longitude, ...firstPoint };
  if (entry.anchors.length === 1) return { anchor, rotation: 0, scale: 1 };
  const second = entry.anchors[1];
  const secondPoint = floor.markers[second.local];
  const gpsX = (second.longitude - first.longitude) * 111320 * Math.cos(first.latitude * Math.PI / 180);
  const gpsY = -(second.latitude - first.latitude) * 110540;
  const mapX = (secondPoint.x - firstPoint.x) / 100 * floor.gpsMap.mapWidthMeters;
  const mapY = (secondPoint.y - firstPoint.y) / 100 * floor.gpsMap.mapHeightMeters;
  const gpsDistance = Math.hypot(gpsX, gpsY);
  const mapDistance = Math.hypot(mapX, mapY);
  // Twee punten moeten ruim verder uit elkaar liggen dan hun meetfout.
  if (gpsDistance < Math.max(15, 2 * (first.accuracy + second.accuracy)) || mapDistance < 10) return null;
  const scale = mapDistance / gpsDistance;
  if (scale < 0.25 || scale > 4) return null;
  return { anchor, scale, rotation: Math.atan2(mapY, mapX) - Math.atan2(gpsY, gpsX) };
}

function floorGpsConfig(floor) {
  const cfg = floor?.gpsMap;
  if (!cfg) return null;
  const transform = calibrationTransform(floor, mapCalibrations[floor.id]);
  return { ...cfg, rotation: 0, scale: 1, ...transform };
}

function calibrationReadiness(floor) {
  if (!gps.active || gps.updatedAt == null || gps.error || Date.now() - gps.updatedAt > 5000) {
    return { ready: false, text: 'Wacht op een recente GPS-meting. Gebruik zo nodig Mijn locatie bijwerken.' };
  }
  if (gps.accuracy > floor.gpsMap.maxUsefulAccuracyMeters) {
    return { ready: true, text: `GPS ±${Math.round(gps.accuracy)} m is onnauwkeurig. Je kunt je huidige lokaal koppelen; volgende posities kunnen ruim afwijken. Een telefoon of plek bij een raam kan een betere meting geven.` };
  }
  return { ready: true, text: `GPS ±${Math.round(gps.accuracy)} m. Kies het lokaal waar je nu echt bent.` };
}

function localLabel(floor, local) {
  return [local, ...(floor.localAliases?.[local] || [])].join(' / ');
}

function resolveFloorLocal(floor, value) {
  const normalize = text => String(text || '').toUpperCase().replace(/[.\s-]/g, '');
  const name = normalize(value);
  return floor.locals.find(local => [local, ...(floor.localAliases?.[local] || [])].some(alias => normalize(alias) === name));
}

function cancelPendingMapCalibration() {
  if (pendingMapCalibration) {
    const manual = manualFloorPositions.get(pendingMapCalibration.floorId);
    if (manual) manual.pending = false;
  }
  pendingMapCalibration = null;
  clearTimeout(mapCalibrationTimer);
  mapCalibrationTimer = null;
}

function queueMapCalibration(floor, local, addSecondPoint) {
  cancelPendingMapCalibration();
  const requestedAt = Date.now();
  manualFloorPositions.set(floor.id, { local, point: { ...floor.markers[local] }, pending: true });
  pendingMapCalibration = { floorId: floor.id, local, addSecondPoint, requestedAt, expiresAt: requestedAt + 20000 };
  resetArrivalTracking(routeTarget?.local || null);
  render({ focus: false });
  showToast(`Huidige plek: ${localLabel(floor, local)}. Blijf hier staan terwijl GPS opnieuw wordt gemeten.`);
  mapCalibrationTimer = setTimeout(() => {
    cancelPendingMapCalibration();
    scheduleGpsUiUpdate();
    showToast('Nog geen nieuwe GPS-meting. Je gekozen plek blijft handmatig zichtbaar; bevestig je huidige plek opnieuw om GPS te koppelen.');
  }, 20000);
  if (gps.supported) {
    if (geoWatchId === null) startGPS({ silent: true });
    else requestGpsPosition();
  }
}

function calibrationStatusText(floor) {
  const manual = manualFloorPositions.get(floor.id);
  if (manual) return manual.pending
    ? `Lokaal ${localLabel(floor, manual.local)} gekozen. Blijf hier staan: een nieuwe GPS-meting wordt opgehaald.`
    : `Lokaal ${localLabel(floor, manual.local)} is handmatig aangegeven. GPS is nog niet gekoppeld; bevestig je huidige plek opnieuw om te proberen.`;
  return calibrationReadiness(floor).text;
}

function setMapCalibration(floor, local, addSecondPoint = false) {
  local = resolveFloorLocal(floor, local);
  const ready = calibrationReadiness(floor);
  if (!floor.locals.includes(local)) return showToast('Kies eerst het lokaal waar je nu bent.');
  if (addSecondPoint && !mapCalibrations[floor.id]) return showToast('Stel eerst je huidige plek in.');
  if (!ready.ready) return queueMapCalibration(floor, local, addSecondPoint);
  cancelPendingMapCalibration();
  const anchor = { local, latitude: gps.latitude, longitude: gps.longitude, accuracy: gps.accuracy, measuredAt: gps.updatedAt };
  const previous = mapCalibrations[floor.id];
  if (addSecondPoint && !previous) return showToast('Stel eerst je huidige plek in.');
  const entry = { signature: mapSignature(floor), anchors: addSecondPoint ? [previous.anchors[0], anchor] : [anchor] };
  if (!calibrationTransform(floor, entry)) return showToast('Deze punten liggen te dicht bij elkaar of de GPS-afwijking is te groot. Loop naar een verder gelegen lokaal en probeer opnieuw.');
  const next = { ...mapCalibrations, [floor.id]: entry };
  let persisted = true;
  try { localStorage.setItem(CALIBRATION_KEY, JSON.stringify(next)); } catch { persisted = false; }
  mapCalibrations = next;
  manualFloorPositions.delete(floor.id);
  lastIndoorPositions.delete(floor.id);
  resetArrivalTracking(routeTarget?.local || null);
  render({ focus: false });
  showToast(persisted ? 'Kaart afgesteld. Nieuwe GPS-metingen blijven je positie bijwerken.' : 'Kaart afgesteld voor deze sessie; opslaan is niet gelukt.');
  document.querySelector('.route-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetMapCalibration(floor) {
  const next = { ...mapCalibrations };
  delete next[floor.id];
  try { localStorage.setItem(CALIBRATION_KEY, JSON.stringify(next)); }
  catch { return showToast('De opgeslagen afstelling kon niet worden gewist.'); }
  mapCalibrations = next;
  cancelPendingMapCalibration();
  manualFloorPositions.delete(floor.id);
  lastIndoorPositions.delete(floor.id);
  resetArrivalTracking(routeTarget?.local || null);
  render({ focus: false });
  showToast('Kaartafstelling gewist.');
}

function renderMapCalibration(floor, outsideMap) {
  const entry = mapCalibrations[floor.id];
  const manual = manualFloorPositions.get(floor.id);
  const selected = manual?.local || '';
  return `<details class="map-calibration" ${outsideMap && !entry || manual ? 'open' : ''}>
    <summary>Kaartpositie afstellen</summary>
    <p>Klik op het lokaal waar je nu bent en bevestig je keuze. Je plek verschijnt direct op de kaart. Zonder recente GPS-meting blijft dit een handmatig aangegeven plek totdat GPS is gekoppeld.</p>
    <p id="calibration-local-label">Ik ben nu in lokaal</p>
    <input type="hidden" data-calibration-local value="${escapeHtml(selected)}">
    <div class="calibration-rooms" role="group" aria-labelledby="calibration-local-label">${floor.locals.map(local => `<button type="button" class="calibration-room" data-current-local="${escapeHtml(local)}" aria-pressed="${selected === local}">${escapeHtml(local)}${floor.localAliases?.[local] ? `<small>${floor.localAliases[local].map(escapeHtml).join(' / ')}</small>` : ''}</button>`).join('')}</div>
    <p data-calibration-choice>${selected ? `Gekozen: ${escapeHtml(localLabel(floor, selected))}` : 'Klik hierboven op je huidige lokaal.'}</p>
    <div class="action-row"><button class="primary" data-action="calibrate-map" ${selected ? '' : 'disabled'}>Gebruik als huidige plek</button>
      ${entry ? `<button class="secondary" data-action="calibration-second-point" ${selected ? '' : 'disabled'}>Tweede referentiepunt toevoegen</button><button class="secondary" data-action="calibration-reset">Afstelling wissen</button>` : ''}
    </div>
    <p data-calibration-readiness role="status">${escapeHtml(calibrationStatusText(floor))}</p>
    ${entry ? `<p>Op dit apparaat opgeslagen: ${entry.anchors.map(a => escapeHtml(a.local)).join(' → ')}. ${entry.anchors.length === 1 ? 'Voor een betere richting en schaal: loop naar een verder gelegen lokaal, selecteer dat lokaal en voeg het als tweede referentiepunt toe.' : 'Het referentiepunt, de richting en de schaal zijn afgesteld met twee GPS-metingen.'}</p>` : ''}
  </details>`;
}

function levelFromXP(xp) { return Math.floor(xp / XP_PER_LEVEL) + 1; }
function xpInLevel(xp) { return xp % XP_PER_LEVEL; }
function localCount() { return state.discoveredLocals.length; }
function floorCount() { return state.visitedFloors.length; }
function totalLocals() { return BUILDINGS.reduce((sum, b) => sum + b.floors.reduce((s, f) => s + f.locals.length, 0), 0); }
function totalFloors() { return BUILDINGS.reduce((sum, b) => sum + b.floors.length, 0); }

function badgeUnlocked(badge) {
  if (badge.type === 'locals') return localCount() >= badge.threshold;
  if (badge.type === 'floors') return floorCount() >= badge.threshold;
  return levelFromXP(state.xp) >= badge.threshold;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function formatDistance(meters) {
  if (meters == null) return 'afstand onbekend';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findLocalDetails(local) {
  for (const building of BUILDINGS) {
    const floor = building.floors.find(f => f.locals.includes(local));
    if (floor) return { building, floor };
  }
  return null;
}

function getRouteTarget() {
  if (routeTarget?.local) {
    const details = findLocalDetails(routeTarget.local);
    if (details) return { ...details, local: routeTarget.local };
  }
  const next = findNextUndiscoveredLocal();
  if (!next) return null;
  const details = findLocalDetails(next);
  return details ? { ...details, local: next } : null;
}

function buildGoogleMapsUrl() {
  const destination = encodeURIComponent(`${CAMPUS.latitude},${CAMPUS.longitude}`);
  if (gps.latitude != null && gps.longitude != null) {
    const origin = encodeURIComponent(`${gps.latitude},${gps.longitude}`);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`;
}

function connectionStatusMarkup() {
  if (offlineMode) {
    return `<div class="offline-banner" role="status"><strong>Offline modus</strong><span>De plattegrond, routeberekening, voortgang en XP werken zonder WiFi.</span></div>`;
  }
  return '';
}

function gpsStatusMarkup() {
  if (!gps.supported) return { title: 'GPS wordt niet ondersteund', text: 'Deze browser ondersteunt Geolocation niet.', button: 'GPS niet beschikbaar', disabled: true, tone: 'warn' };
  if (gps.error) return { title: 'GPS-meting mislukt', text: gps.error, button: 'Opnieuw proberen', disabled: false, tone: 'warn' };
  if (!gps.active) return { title: 'GPS staat nog uit', text: `Activeer GPS om je positie en de campusroute te bepalen.`, button: 'Activeer GPS', disabled: false, tone: 'neutral' };
  if (gps.updatedAt == null) return { title: 'Je locatie wordt gezocht…', text: 'Geef toestemming voor locatie en wacht op de eerste GPS-meting.', button: 'GPS zoekt…', disabled: true, tone: 'neutral' };
  if (!isGpsFresh()) return { title: 'Wachten op een nieuwe locatie', text: 'De laatste GPS-meting is te oud. Je laatst bekende positie blijft staan tot er een nieuwe meting is.', button: 'Opnieuw meten', disabled: false, tone: 'warn' };
  if (gps.insideCampus) return { title: 'Je bent op de campus ✓', text: `Afstand tot campus: ${formatDistance(gps.distanceMeters)} · nauwkeurigheid ±${Math.round(gps.accuracy || 0)} m`, button: 'GPS actief', disabled: true, tone: 'success' };
  if (offlineMode) {
    return { title: 'Offline: GPS actief', text: `Je bent ongeveer ${formatDistance(gps.distanceMeters)} van de campus. De lokale plattegrond en binnenroute werken zonder internet.`, button: 'GPS actief', disabled: true, tone: 'neutral' };
  }
  return { title: 'Route naar de campus', text: `Je bent ongeveer ${formatDistance(gps.distanceMeters)} van de campus. Gebruik de routeknop om naar de campus te navigeren.`, button: 'GPS actief', disabled: true, tone: 'neutral' };
}

function isGpsFresh() {
  return gps.updatedAt != null && Date.now() - gps.updatedAt <= GPS_TRACKING.staleAfterMs;
}

function gpsUpdateLabel() {
  if (gps.updatedAt == null) return 'Nog geen GPS-meting';
  const seconds = Math.max(0, Math.floor((Date.now() - gps.updatedAt) / 1000));
  return seconds < 3 ? 'Zojuist bijgewerkt' : `Laatste meting: ${seconds} s geleden`;
}

function renderGpsCard() {
  const ui = gpsStatusMarkup();
  const live = gps.active && isGpsFresh() && !gps.error;
  return `<div class="card gps-card ${ui.tone}">
    <div class="gps-header"><div class="gps-icon">⌖</div><div><div class="eyebrow">GPS</div><h2 data-gps-title>${escapeHtml(ui.title)}</h2></div></div>
    <p data-gps-text>${escapeHtml(ui.text)}</p>
    <div class="gps-actions">
      <button class="primary" data-action="gps-start" ${ui.disabled ? 'disabled' : ''}>${ui.button}</button>
      <span class="gps-live ${live ? '' : 'is-stale'}" ${gps.active ? '' : 'hidden'}><i></i><span data-gps-live-text>${live ? 'Live locatie · ' : ''}${gpsUpdateLabel()}</span></span>
      <a class="secondary link-button" data-campus-route href="${buildGoogleMapsUrl()}" target="_blank" rel="noopener" ${gps.active && isGpsFresh() && !gps.insideCampus && !offlineMode ? '' : 'hidden'}>Route naar campus</a>
      <span class="offline-note" data-gps-offline ${gps.active && !gps.insideCampus && offlineMode ? '' : 'hidden'}>Zonder internet is alleen de lokale campusroute beschikbaar.</span>
    </div>
  </div>`;
}

function render(options = {}) {
  clearTimeout(gpsUiTimer);
  gpsUiTimer = null;
  lastRenderedGpsAt = Date.now();
  const app = document.getElementById('app');
  const views = { route: renderRoute, buildings: renderBuildings, info: renderInfo, profile: renderProfile };
  app.innerHTML = views[currentRoute]();
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.toggle('is-active', btn.dataset.route === currentRoute));
  bindPageEvents();
  if (options.focus !== false) app.focus({ preventScroll: true });
}

function renderRoute() {
  const target = getRouteTarget();
  const targetLabel = target ? target.local : 'Alle locaties ontdekt!';
  const targetFloor = target?.floor;
  const targetHasMap = Boolean(targetFloor?.mapImage && targetFloor?.graph?.nodes && targetFloor?.markers?.[target.local]);

  return `
    <section class="screen">
      <div class="hero">
        <div class="eyebrow">Hoornbeeck College · Gouda</div>
        <h1>Gebouwenroute</h1>
        <p>${target ? `Route naar <strong>${escapeHtml(target.local)}</strong>.<br>GPS bepaalt je actuele startpunt; de plattegrond berekent daarvandaan de binnenroute.` : 'Je hebt alle locaties ontdekt.'}</p>
      </div>

      ${connectionStatusMarkup()}

      ${renderGpsCard()}

      ${target ? `<div class="route-summary card">
        <div><div class="eyebrow">Bestemming</div><h2>Lokaal ${escapeHtml(target.local)}</h2><p>${escapeHtml(target.building.name)} · ${escapeHtml(target.floor.name)}</p></div>
        <div class="route-badge">${state.discoveredLocals.includes(target.local) ? 'Ontdekt ✓' : `+${XP_LOCAL} XP`}</div>
      </div>` : ''}

      ${targetHasMap ? renderIndoorRoute(target) : renderNoMapRoute(target)}

      <div class="grid-2">
        <div class="card progress-wrap">
          <div class="progress-top"><strong>Level ${levelFromXP(state.xp)}</strong><span>${xpInLevel(state.xp)} / ${XP_PER_LEVEL} XP</span></div>
          <div class="progress"><span style="width:${xpInLevel(state.xp)}%"></span></div>
          <p>${XP_PER_LEVEL - xpInLevel(state.xp)} XP tot level ${levelFromXP(state.xp) + 1}</p>
        </div>
        <div class="card grid-2" style="padding:14px;">
          <div class="stat"><span>Locaties ontdekt</span><strong>${localCount()}</strong><span>van ${totalLocals()}</span></div>
          <div class="stat"><span>Verdiepingen bezocht</span><strong>${floorCount()}</strong><span>van ${totalFloors()}</span></div>
        </div>
      </div>

      <div class="section-head"><div><div class="eyebrow">Jouw voortgang</div><h2>Badges</h2></div><button class="secondary" data-go="profile">Bekijk alles</button></div>
      <div class="badge-grid">${BADGES.slice(0, 3).map(renderBadge).join('')}</div>
    </section>`;
}

function projectGpsToFloorMap(floor, options = {}) {
  const cfg = floorGpsConfig(floor);
  const clamp = options.clamp !== false;
  if (!cfg || !gps.active || !isGpsFresh() || gps.error || gps.latitude == null || gps.longitude == null || gps.accuracy == null) return null;
  // Een zwakke meting mag de live kaart niet bevriezen. Voor aankomstcontrole
  // blijft de nauwkeurigheidseis wel gelden (de standaard van deze functie).
  if (options.requireAccuracy !== false && gps.accuracy > cfg.maxUsefulAccuracyMeters) return null;

  const latScale = 110540;
  const lonScale = 111320 * Math.cos(cfg.anchor.latitude * Math.PI / 180);
  const dx = (gps.longitude - cfg.anchor.longitude) * lonScale;
  const dyNorth = (gps.latitude - cfg.anchor.latitude) * latScale;

  const mapDx = cfg.scale * (dx * Math.cos(cfg.rotation) + dyNorth * Math.sin(cfg.rotation));
  const mapDy = cfg.scale * (dx * Math.sin(cfg.rotation) - dyNorth * Math.cos(cfg.rotation));
  const x = cfg.anchor.x + (mapDx / cfg.mapWidthMeters) * 100;
  const y = cfg.anchor.y + (mapDy / cfg.mapHeightMeters) * 100;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (!clamp) return { x, y };
  return { x: Math.max(3, Math.min(97, x)), y: Math.max(3, Math.min(97, y)) };
}

function mapDistanceMeters(floor, a, b) {
  const cfg = floorGpsConfig(floor);
  if (!cfg || !a || !b) return Infinity;
  const dx = ((a.x - b.x) / 100) * cfg.mapWidthMeters;
  const dy = ((a.y - b.y) / 100) * cfg.mapHeightMeters;
  return Math.hypot(dx, dy) / cfg.scale;
}

function targetArrivalStatus(target) {
  if (!target) return { state: 'none', distanceMeters: null, text: '' };
  if (state.discoveredLocals.includes(target.local)) return { state: 'done', distanceMeters: 0, text: 'Locatie al ontdekt ✓' };
  if (manualFloorPositions.has(target.floor.id)) return { state: 'gps', distanceMeters: null, text: 'Je plek is handmatig aangegeven. Koppel eerst een nieuwe GPS-meting voor aankomstcontrole.' };
  if (!gps.active || gps.latitude == null || gps.longitude == null) return { state: 'gps', distanceMeters: null, text: 'Activeer GPS om je aankomst te controleren.' };
  if (!isGpsFresh() || gps.error) return { state: 'gps', distanceMeters: null, text: 'Wacht op een nieuwe GPS-meting om je aankomst te controleren.' };
  if (!gps.insideCampus) return { state: 'campus', distanceMeters: gps.distanceMeters, text: 'Ga eerst naar de campus.' };
  if (gps.accuracy == null || gps.accuracy > ARRIVAL.maxAccuracyMeters) {
    return { state: 'accuracy', distanceMeters: null, text: `Wacht op een nauwkeurigere GPS-meting (nu ±${Math.round(gps.accuracy || 0)} m).` };
  }

  const point = projectGpsToFloorMap(target.floor, { clamp: false });
  const targetPos = target.floor.markers?.[target.local];
  if (!point || !targetPos) return { state: 'gps', distanceMeters: null, text: 'De GPS-positie kan nog niet op deze plattegrond worden geplaatst.' };

  const insideMap = point.x >= 0 && point.x <= 100 && point.y >= 0 && point.y <= 100;
  if (!insideMap) return { state: 'route', distanceMeters: null, text: 'Ga verder volgens de blauwe route.' };

  const distance = mapDistanceMeters(target.floor, point, targetPos);
  if (distance <= ARRIVAL.radiusMeters) {
    if (arrival.local !== target.local) arrival = { local: target.local, confirmations: 0, arrived: false, lastConfirmationAt: 0 };
    const confirmed = arrival.confirmations >= ARRIVAL.requiredConfirmations;
    return {
      state: confirmed ? 'arrived' : 'confirming',
      distanceMeters: distance,
      text: confirmed ? 'Aankomst bevestigd ✓' : `Bijna daar… ${arrival.confirmations}/${ARRIVAL.requiredConfirmations} bevestigingen.`
    };
  }

  if (arrival.local === target.local && arrival.confirmations) arrival.confirmations = 0;
  return { state: 'route', distanceMeters: distance, text: `${formatDistance(distance)} van de bestemming.` };
}

function resetArrivalTracking(local = null) {
  arrival = { local, confirmations: 0, arrived: false, lastConfirmationAt: 0 };
}

function checkRouteArrival() {
  if (currentRoute !== 'route' || !routeTarget) return false;
  const target = getRouteTarget();
  if (!target || state.discoveredLocals.includes(target.local)) return false;
  if (manualFloorPositions.has(target.floor.id)) { resetArrivalTracking(target.local); return false; }
  if (!gps.active || !isGpsFresh() || gps.error || !gps.insideCampus || gps.accuracy == null || gps.accuracy > ARRIVAL.maxAccuracyMeters) {
    if (arrival.local === target.local && arrival.confirmations) resetArrivalTracking(target.local);
    return false;
  }

  const point = projectGpsToFloorMap(target.floor, { clamp: false });
  const targetPos = target.floor.markers?.[target.local];
  if (!point || !targetPos || point.x < 0 || point.x > 100 || point.y < 0 || point.y > 100) {
    if (arrival.local === target.local && arrival.confirmations) resetArrivalTracking(target.local);
    return false;
  }

  const distance = mapDistanceMeters(target.floor, point, targetPos);
  if (distance > ARRIVAL.radiusMeters) {
    if (arrival.local === target.local && arrival.confirmations) resetArrivalTracking(target.local);
    return false;
  }

  // Dezelfde fix kan via zowel de watcher als de handmatige meting binnenkomen.
  // Alleen verschillende meettijdstippen tellen als aankomstbevestiging.
  const now = gps.updatedAt;
  if (arrival.local !== target.local) resetArrivalTracking(target.local);
  if (!arrival.lastConfirmationAt || now - arrival.lastConfirmationAt >= ARRIVAL.minConfirmationGapMs) {
    arrival.confirmations += 1;
    arrival.lastConfirmationAt = now;
  }

  if (arrival.confirmations >= ARRIVAL.requiredConfirmations && !arrival.arrived) {
    arrival.arrived = true;
    const didDiscover = discoverLocal(target.local, { requireArrival: true });
    if (didDiscover) routeTarget = null;
    return didDiscover;
  }
  return false;
}

function distance2D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function nearestGraphNode(floor, point) {
  const nodes = floor.graph?.nodes || {};
  let bestId = null;
  let best = Infinity;
  for (const [id, node] of Object.entries(nodes)) {
    const d = mapDistanceMeters(floor, node, point);
    if (d < best) { best = d; bestId = id; }
  }
  return bestId;
}

function shortestPath(floor, startId, endId) {
  const graph = floor.graph;
  if (!graph?.nodes?.[startId] || !graph?.nodes?.[endId]) return [];
  const adj = Object.fromEntries(Object.keys(graph.nodes).map(id => [id, []]));
  for (const [a,b] of graph.edges || []) {
    const cost = mapDistanceMeters(floor, graph.nodes[a], graph.nodes[b]);
    adj[a].push([b,cost]);
    adj[b].push([a,cost]);
  }
  const dist = Object.fromEntries(Object.keys(graph.nodes).map(id => [id, Infinity]));
  const prev = {};
  const open = new Set(Object.keys(graph.nodes));
  dist[startId] = 0;
  while (open.size) {
    let current = null;
    for (const id of open) {
      if (current === null || dist[id] < dist[current]) current = id;
    }
    if (current === null || dist[current] === Infinity) break;
    open.delete(current);
    if (current === endId) break;
    for (const [next, cost] of adj[current]) {
      const alt = dist[current] + cost;
      if (alt < dist[next]) { dist[next] = alt; prev[next] = current; }
    }
  }
  if (startId !== endId && prev[endId] == null) return [];
  const path = [endId];
  let cursor = endId;
  while (cursor !== startId) {
    cursor = prev[cursor];
    if (!cursor) return [];
    path.push(cursor);
  }
  path.reverse();
  return path.map(id => graph.nodes[id]);
}

function floorLocation(floor) {
  const manual = manualFloorPositions.get(floor.id);
  if (manual) return {
    point: manual.point, accuracy: null, outsideMap: false, live: false, known: true, manual: true,
    label: `Handmatig aangegeven: ${localLabel(floor, manual.local)}`,
    reason: manual.pending ? 'Blijf op deze plek staan terwijl een nieuwe GPS-meting wordt gekoppeld.' : 'Nog geen GPS-koppeling. Bevestig je huidige plek opnieuw om GPS te koppelen.'
  };
  const projected = projectGpsToFloorMap(floor, { clamp: false, requireAccuracy: false });
  if (projected) {
    const outsideMap = projected.x < 0 || projected.x > 100 || projected.y < 0 || projected.y > 100;
    const position = { point: projected, accuracy: gps.accuracy, updatedAt: gps.updatedAt, outsideMap };
    lastIndoorPositions.set(floor.id, position);
    return {
      ...position, live: true, known: true,
      label: outsideMap ? 'GPS-positie buiten de plattegrond' : 'Jouw geschatte GPS-positie',
      reason: outsideMap ? 'De GPS-schatting ligt buiten deze kaart. Ben je wel in dit gebouw? Gebruik Kaartpositie afstellen hieronder.'
        : gps.accuracy > floor.gpsMap.maxUsefulAccuracyMeters ? 'Onnauwkeurige GPS-meting: de stip en route zijn een ruime schatting.' : ''
    };
  }
  const last = lastIndoorPositions.get(floor.id);
  const reason = !gps.active ? 'Activeer GPS voor je actuele positie.' : 'Wachten op een nieuwe GPS-meting.';
  return {
    point: last?.point || floor.routeStart,
    accuracy: last?.accuracy ?? null,
    outsideMap: last?.outsideMap || false,
    live: false,
    known: Boolean(last),
    label: last ? 'Laatst bekende positie' : `Startpunt: ${floor.routeStart.label}`,
    reason
  };
}

function mapMarkerPoint(position) {
  if (!position.outsideMap) return position.point;
  // Een positie buiten de kaart wordt als richtingaanwijzer aan de rand
  // getoond, nooit als een verzonnen locatie binnen een lokaal.
  const dx = position.point.x - 50;
  const dy = position.point.y - 50;
  const scale = 47 / Math.max(Math.abs(dx), Math.abs(dy));
  return { x: 50 + dx * scale, y: 50 + dy * scale };
}

function routeMapDisplay(route, floor) {
  const position = route.position;
  const cfg = floorGpsConfig(floor);
  const liveOnMap = position.live && !position.outsideMap;
  const direction = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'][Math.round(Math.atan2(position.point.y - 50, position.point.x - 50) / (Math.PI / 4) + 8) % 8];
  return {
    marker: mapMarkerPoint(position),
    label: position.manual ? 'Handmatig aangegeven' : position.outsideMap ? 'GPS buiten kaart' : position.live ? 'Live GPS-schatting' : position.known ? 'Laatste positie' : 'Wacht op GPS',
    markerText: position.outsideMap ? `GPS ${direction}` : position.known ? 'JIJ' : 'START',
    liveOnMap,
    note: [position.reason, position.live ? gpsUpdateLabel() : ''].filter(Boolean).join(' '),
    distance: position.outsideMap ? 'Geen binnenroute vanaf deze GPS-positie' : `${routeDistanceLabel(floor, route.points)} geschatte route`,
    radiusX: position.accuracy == null ? 0 : position.accuracy * cfg.scale / cfg.mapWidthMeters * 100,
    radiusY: position.accuracy == null ? 0 : position.accuracy * cfg.scale / cfg.mapHeightMeters * 100
  };
}

function nearestGraphEdge(floor, point) {
  let nearest = null;
  for (const [a, b] of floor.graph.edges) {
    const start = floor.graph.nodes[a];
    const end = floor.graph.nodes[b];
    // Projecteer in meters: de plattegrond is niet vierkant.
    const scaleX = floor.gpsMap.mapWidthMeters / 100;
    const scaleY = floor.gpsMap.mapHeightMeters / 100;
    const dx = (end.x - start.x) * scaleX;
    const dy = (end.y - start.y) * scaleY;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared ? Math.max(0, Math.min(1, (((point.x - start.x) * scaleX) * dx + ((point.y - start.y) * scaleY) * dy) / lengthSquared)) : 0;
    const snapped = { x: start.x + t * (end.x - start.x), y: start.y + t * (end.y - start.y) };
    const distance = mapDistanceMeters(floor, point, snapped);
    if (!nearest || distance < nearest.distance) nearest = { a, b, point: snapped, distance };
  }
  return nearest;
}

function routeDistanceMeters(floor, points) {
  return points.reduce((sum, point, index) => index ? sum + mapDistanceMeters(floor, point, points[index - 1]) : 0, 0);
}

function routePointsForTarget(target) {
  const floor = target.floor;
  const targetNode = Object.entries(floor.graph?.nodes || {}).find(([id, node]) => node.x === floor.markers?.[target.local]?.x && node.y === floor.markers?.[target.local]?.y)?.[0];
  const position = floorLocation(floor);
  if (position.outsideMap) return { points: [], startPoint: position.point, position, usedGpsStart: position.live, startNode: null };
  const edge = nearestGraphEdge(floor, position.point);
  const startPoint = position.point;
  const corridorPoint = edge?.point || startPoint;
  const startNode = nearestGraphNode(floor, corridorPoint);
  const nodeMap = { '4.08':'L408','4.09':'L409','4.10':'L410','4.04':'L404','4.03':'L403','4.01':'L401','4.VR':'LVR' };
  const endNode = nodeMap[target.local] || targetNode;
  let points = shortestPath(floor, startNode, endNode);
  if (edge) {
    const candidates = [edge.a, edge.b].map(id => {
      const path = shortestPath(floor, id, endNode);
      return path.length ? [startPoint, corridorPoint, ...path] : [];
    }).filter(path => path.length);
    candidates.sort((a, b) => routeDistanceMeters(floor, a) - routeDistanceMeters(floor, b));
    if (candidates.length) points = candidates[0];
  }
  if (!points.length) points = [startPoint, floor.markers[target.local]];
  points = points.filter((point, index) => !index || distance2D(point, points[index - 1]) > 0.0001);
  return {
    points,
    startPoint,
    position,
    usedGpsStart: position.live,
    startNode
  };
}

function routeDistanceLabel(floor, points) {
  return formatDistance(routeDistanceMeters(floor, points));
}

function renderIndoorRoute(target) {
  const floor = target.floor;
  const targetPos = floor.markers[target.local];
  const route = routePointsForTarget(target);
  const display = routeMapDisplay(route, floor);
  const polyline = route.points.map(p => `${p.x},${p.y}`).join(' ');
  const discovered = state.discoveredLocals.includes(target.local);
  const campusReady = display.liveOnMap;
  const arrivalStatus = targetArrivalStatus(target);
  const accuracyNote = gps.active && gps.accuracy != null ? `GPS ±${Math.round(gps.accuracy)} m` : 'GPS niet actief';
  const startLabel = route.position.label;
  const locationNote = display.note;
  const arrivalClass = arrivalStatus.state === 'arrived' || arrivalStatus.state === 'done' ? 'done' : '';
  const arrivalText = discovered ? 'XP is al toegekend voor deze locatie.' : arrivalStatus.text;

  return `<section class="card route-map-card" data-current-target="${escapeHtml(target.local)}">
    <div class="section-head map-head">
      <div><div class="eyebrow">Dynamische binnenroute</div><h2>${escapeHtml(floor.name)}</h2></div>
      <span class="map-status ${campusReady ? 'done' : ''}">${display.label}</span>
    </div>
    <p class="map-help">De stip volgt elke nieuwe GPS-meting. De blauwe lijn begint bij de stip en wordt tijdens het lopen opnieuw berekend. Het gekleurde gebied toont de door GPS opgegeven nauwkeurigheid.</p>
    <div class="floor-map route-map ${campusReady ? 'is-ready' : ''}">
      <img src="${floor.mapImage}" alt="Plattegrond met dynamische route naar lokaal ${escapeHtml(target.local)}">
      <svg class="route-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <ellipse class="gps-accuracy-area ${route.position.live ? '' : 'is-stale'}" cx="${display.marker.x}" cy="${display.marker.y}" rx="${display.radiusX}" ry="${display.radiusY}" ${route.position.known && !route.position.outsideMap ? '' : 'hidden'} />
        <polyline class="route-shadow" points="${polyline}" />
        <polyline class="route-path" points="${polyline}" />
      </svg>
      <div class="route-start-marker ${campusReady ? '' : 'is-stale'} ${route.position.outsideMap ? 'is-outside' : ''}" style="left:${display.marker.x}%;top:${display.marker.y}%" aria-label="${escapeHtml(startLabel)}"><span>${display.markerText}</span></div>
      <div class="route-end-marker" style="left:${targetPos.x}%;top:${targetPos.y}%"><span>${escapeHtml(target.local)}</span></div>
    </div>
    <div class="route-live-box">
      <div><strong data-position-label>${escapeHtml(startLabel)}</strong><small data-route-distance>${escapeHtml(accuracyNote)} · ${display.distance}</small><small data-location-note>${escapeHtml(locationNote)}</small></div>
      <button class="secondary" data-action="gps-refresh">Mijn locatie bijwerken</button>
    </div>
    ${renderMapCalibration(floor, route.position.outsideMap)}
    <p class="map-help">${mapCalibrations[floor.id] ? 'De kaart gebruikt je opgeslagen afstelling. ' : 'De plaatsing op deze plattegrond is nog niet afgesteld op je apparaat. '}GPS blijft een schatting en bepaalt niet op welke verdieping je bent. <span class="app-version">${APP_VERSION}</span></p>
    <div class="arrival-box ${arrivalClass}">
      <div><div class="eyebrow">Aankomstcontrole</div><strong data-arrival-title>${discovered ? 'Locatie bereikt' : arrivalStatus.state === 'arrived' ? 'Aankomst bevestigd' : 'XP pas bij echte aankomst'}</strong><small data-arrival-text>${escapeHtml(arrivalText)}</small></div>
      <span class="arrival-distance">${arrivalStatus.distanceMeters == null ? '—' : formatDistance(arrivalStatus.distanceMeters)}</span>
    </div>
    <div class="route-instructions">
      <div class="route-step"><span>1</span><div><strong>Ga naar ${escapeHtml(floor.name)}</strong><small>De route start bij jouw actuele GPS-positie. Zonder bruikbare indoor-GPS valt de app terug op de centrale trap/lift.</small></div></div>
      <div class="route-step"><span>2</span><div><strong>Volg de blauwe lijn</strong><small>De lijn volgt het ingestelde gangen-netwerk op deze plattegrond.</small></div></div>
      <div class="route-step"><span>3</span><div><strong>${discovered ? `Lokaal ${escapeHtml(target.local)} ontdekt` : 'Aangekomen bij de bestemming'}</strong><small>${discovered ? 'Deze locatie is al ontdekt.' : `De app bevestigt je aankomst met ${ARRIVAL.requiredConfirmations} opeenvolgende GPS-metingen binnen ${ARRIVAL.radiusMeters} m. Daarna wordt ${XP_LOCAL} XP automatisch toegekend.`}</small></div></div>
    </div>
    <div class="action-row route-actions">
      <span class="arrival-note ${arrivalStatus.state === 'arrived' || discovered ? 'done' : ''}">${discovered ? '✓ XP toegekend bij aankomst' : 'Geen XP door alleen op de knop te drukken.'}</span>
      <button class="secondary" data-go="buildings">Andere bestemming</button>
    </div>
  </section>`;
}

function renderNoMapRoute(target) {
  if (!target) {
    return `<div class="card"><h2>Route voltooid ✓</h2><p>Alle locaties zijn ontdekt. Bekijk je badges en XP in je profiel.</p></div>`;
  }
  return `<section class="card">
    <div class="eyebrow">Route</div><h2>${escapeHtml(target.local)}</h2>
    <p style="margin-top:6px">Voor deze verdieping is nog geen digitale plattegrond toegevoegd. Open <strong>Gebouwen</strong> om de bestemming te kiezen en een routekaart toe te voegen.</p>
    <div class="action-row" style="margin-top:14px"><button class="secondary" data-go="buildings">Naar Gebouwen</button></div>
  </section>`;
}

function renderBuildings() {
  return `<section class="screen">
    <div class="hero"><div class="eyebrow">Campus</div><h1>Gebouwen</h1><p>Kies een gebouw, verdieping en lokaal. Daarna geeft de Route-pagina je de route.</p></div>
    <div class="building-list">${BUILDINGS.map(b => `<article class="building-row">
      <div class="row-main"><div class="big-icon">${b.code}</div><div><h3>${b.name}</h3><div class="kicker">${b.floors.length} ${b.floors.length === 1 ? 'verdieping' : 'verdiepingen'}</div>
      <div class="floor-chips">${b.floors.map(f => `<span class="chip ${state.visitedFloors.includes(f.id) ? 'done' : ''}">${f.name}${state.visitedFloors.includes(f.id) ? ' ✓' : ''}</span>`).join('')}</div></div></div>
      <button class="secondary" data-building="${b.id}">Open</button>
    </article>`).join('')}</div>
    <div id="building-detail">${selectedBuildingId ? renderBuildingDetail(selectedBuildingId) : ''}</div>
  </section>`;
}

function renderBuildingDetail(buildingId) {
  const b = BUILDINGS.find(x => x.id === buildingId);
  if (!b) return '';
  return `<section class="card" style="margin-top:2px">
    <div class="detail-header"><div class="detail-title"><div class="big-icon">${b.code}</div><div><div class="eyebrow">Gebouw</div><h2>${b.name}</h2><p>Kies een verdieping en daarna een lokaal voor de route.</p></div></div><button class="icon-button" data-close-detail aria-label="Sluiten">×</button></div>
    <div class="floor-list" style="margin-top:16px">${b.floors.map(f => {
      const visited = state.visitedFloors.includes(f.id);
      return `<div class="floor-card ${visited ? 'visited' : ''}"><div><strong>${f.name}</strong><small>${f.locals.length} locaties · ${visited ? 'bezocht' : 'nog te ontdekken'}</small></div><button class="${visited ? 'secondary' : 'primary'}" data-floor="${f.id}" data-building-id="${b.id}">${visited ? 'Bekijk ✓' : 'Bekijk route'}</button></div>`;
    }).join('')}</div>
  </section>
  <div class="floor-map-list">${b.floors.filter(f => f.mapImage).map(renderFloorMap).join('')}</div>`;
}

function renderFloorMap(floor) {
  const visited = state.visitedFloors.includes(floor.id);
  return `<section class="card floor-map-card">
    <div class="section-head map-head"><div><div class="eyebrow">Plattegrond</div><h2>${escapeHtml(floor.name)}</h2></div><span class="map-status ${visited ? 'done' : ''}">${visited ? 'Verdieping bezocht ✓' : 'Nog te ontdekken'}</span></div>
    <p class="map-help">Tik op een lokaal en de app maakt de route op basis van de plattegrond.</p>
    <div class="floor-map" aria-label="Interactieve plattegrond ${escapeHtml(floor.name)}">
      <img src="${floor.mapImage}" alt="Plattegrond ${escapeHtml(floor.name)}" loading="lazy">
      <div class="map-markers">${floor.locals.map(local => {
        const pos = floor.markers?.[local] || { x: 50, y: 50 };
        const done = state.discoveredLocals.includes(local);
        const hasRoute = Boolean(floor.graph?.nodes && floor.markers?.[local]);
        return `<button class="map-marker ${done ? 'done' : ''}" style="left:${pos.x}%;top:${pos.y}%" data-route-local="${escapeHtml(local)}" data-route-floor="${floor.id}" aria-label="Route naar lokaal ${escapeHtml(local)}">
          <span>${escapeHtml(local)}</span><i>${hasRoute ? 'Route' : '+' + XP_LOCAL}</i>
        </button>`;
      }).join('')}</div>
    </div>
  </section>`;
}

function renderInfo() {
  return `<section class="screen"><div class="hero"><div class="eyebrow">Informatie</div><h1>Zo werkt de route</h1><p>GPS begeleidt je naar de campus en wordt gebruikt als dynamisch startpunt van de binnenroute. Geen QR-code scanner.</p></div>
    <div class="card"><div class="info-row"><strong>Offline gebruik</strong><span>Plattegrond + route + XP blijven lokaal beschikbaar</span></div><div class="info-row"><strong>GPS naar campus</strong><span>Live locatie</span></div><div class="info-row"><strong>Route binnen gebouw</strong><span>GPS + plattegrond + gangen-netwerk</span></div><div class="info-row"><strong>Aankomst lokaal</strong><span>GPS-proximiteit + bevestigingen</span></div><div class="info-row"><strong>Ontdek een lokaal</strong><span>+${XP_LOCAL} XP bij aankomst</span></div><div class="info-row"><strong>Nieuwe verdieping</strong><span>+${XP_FLOOR} XP bij eerste lokaal op die verdieping</span></div><div class="info-row"><strong>Badges</strong><span>Automatisch</span></div></div>
    <div class="card"><h2>GPS & privacy</h2><p style="margin-top:8px">De GPS-positie blijft in deze demo in de browser en wordt gebruikt voor de campuscheck en als dynamisch startpunt van de binnenroute. Geen QR-code scanner.</p><div class="action-row" style="margin-top:14px"><button class="secondary" data-action="gps-start">GPS activeren</button><button class="secondary" data-action="reset">Wis mijn voortgang</button></div></div>
  </section>`;
}

function renderProfile() {
  const lvl = levelFromXP(state.xp);
  const nextLevelXP = XP_PER_LEVEL - xpInLevel(state.xp);
  return `<section class="screen"><div class="hero"><div class="eyebrow">Profiel</div><h1>Jouw voortgang</h1></div>
    <div class="card profile-head"><div class="avatar">JS</div><div style="flex:1"><h2>Jan de Student</h2><p>Level ${lvl} · Verkenner</p><div class="progress" style="margin-top:10px"><span style="width:${xpInLevel(state.xp)}%"></span></div><div class="kicker" style="margin-top:5px">${state.xp} XP totaal · ${nextLevelXP} XP tot volgend level</div></div></div>
    <div class="grid-3"><div class="card stat"><span>Badges</span><strong>${BADGES.filter(badgeUnlocked).length}</strong><span>van ${BADGES.length}</span></div><div class="card stat"><span>Locaties</span><strong>${localCount()}</strong><span>van ${totalLocals()}</span></div><div class="card stat"><span>Verdiepingen</span><strong>${floorCount()}</strong><span>van ${totalFloors()}</span></div></div>
    <div class="section-head"><div><div class="eyebrow">Verzameling</div><h2>Badges</h2></div></div><div class="badge-grid">${BADGES.map(renderBadge).join('')}</div>
    <div class="section-head"><div><div class="eyebrow">XP overzicht</div><h2>Recente activiteit</h2></div></div><div class="timeline">${renderActivity()}</div>
  </section>`;
}

function renderBadge(badge) {
  const unlocked = badgeUnlocked(badge);
  return `<article class="badge ${unlocked ? '' : 'locked'}"><div class="badge-icon">${badge.icon}</div><div><div class="badge-name">${badge.name}</div><div class="badge-req">${badge.text}</div></div><div class="kicker">${unlocked ? 'Vrijgespeeld ✓' : 'Nog vergrendeld'}</div></article>`;
}

function renderActivity() {
  if (!state.activity.length) return `<div class="card"><p>Nog geen activiteit. Start GPS en kies een bestemming om een route te bekijken.</p></div>`;
  return state.activity.slice().reverse().slice(0, 8).map(a => `<div class="activity"><div class="activity-dot">${a.type === 'floor' ? '▦' : '+'}</div><div><strong>${escapeHtml(a.label)}</strong><span>${a.xp > 0 ? `+${a.xp} XP` : ''}</span></div></div>`).join('');
}

function findNextUndiscoveredLocal() {
  for (const b of BUILDINGS) for (const f of b.floors) for (const local of f.locals) {
    if (!state.discoveredLocals.includes(local)) return local;
  }
  return null;
}

function discoverLocal(local, options = {}) {
  if (!local || state.discoveredLocals.includes(local)) return false;
  if (!gps.insideCampus) {
    startGPS();
    showToast('Je moet eerst binnen de GPS-campuszone zijn.');
    return false;
  }
  const details = findLocalDetails(local);
  if (!details) return false;
  if (options.requireArrival) {
    const status = targetArrivalStatus({ ...details, local });
    if (status.state !== 'arrived') return false;
  }

  if (details && !state.visitedFloors.includes(details.floor.id)) {
    state.visitedFloors.push(details.floor.id);
    state.xp += XP_FLOOR;
    state.activity.push({ type: 'floor', label: `${details.floor.name} bezocht`, xp: XP_FLOOR, at: Date.now() });
  }
  state.discoveredLocals.push(local);
  state.xp += XP_LOCAL;
  state.activity.push({ type: 'local', label: `Lokaal ${local} ontdekt`, xp: XP_LOCAL, at: Date.now() });
  saveState();
  const lvl = levelFromXP(state.xp);
  showToast(`+${XP_LOCAL} XP · ${local} ontdekt${xpInLevel(state.xp) === 0 ? ` · Level ${lvl}!` : ''}`);
  resetArrivalTracking();
  return true;
}

function visitFloor(floorId) {
  if (!floorId) return;
  const floor = BUILDINGS.flatMap(b => b.floors).find(f => f.id === floorId);
  if (!floor) return;
  if (!gps.insideCampus) startGPS();
}

function startRouteTo(local, floorId) {
  const details = findLocalDetails(local);
  routeTarget = details ? { local, floorId: floorId || details.floor.id } : { local, floorId };
  resetArrivalTracking(local);
  currentRoute = 'route';
  selectedBuildingId = null;

  if (gps.supported && geoWatchId === null) {
    startGPS({ silent: true });
    render();
  } else {
    render();
  }
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function scheduleGpsUiUpdate() {
  if (currentRoute !== 'route' || document.visibilityState !== 'visible' || gpsUiTimer !== null) return;
  // Ook de laatste fix uit een snelle reeks wordt zichtbaar; updates worden
  // samengevoegd in plaats van weggegooid.
  const delay = Math.max(0, GPS_TRACKING.renderIntervalMs - (Date.now() - lastRenderedGpsAt));
  gpsUiTimer = setTimeout(() => {
    gpsUiTimer = null;
    lastRenderedGpsAt = Date.now();
    updateGpsUi();
  }, delay);
}

function updateGpsUi() {
  if (currentRoute !== 'route') return;
  const card = document.querySelector('.gps-card');
  if (!card) return;
  const ui = gpsStatusMarkup();
  const live = gps.active && isGpsFresh() && !gps.error;
  card.className = `card gps-card ${ui.tone}`;
  card.querySelector('[data-gps-title]').textContent = ui.title;
  card.querySelector('[data-gps-text]').textContent = ui.text;
  const startButton = card.querySelector('[data-action="gps-start"]');
  startButton.textContent = ui.button;
  startButton.disabled = ui.disabled;
  const liveStatus = card.querySelector('.gps-live');
  liveStatus.hidden = !gps.active;
  liveStatus.classList.toggle('is-stale', !live);
  card.querySelector('[data-gps-live-text]').textContent = `${live ? 'Live locatie · ' : ''}${gpsUpdateLabel()}`;
  const campusLink = card.querySelector('[data-campus-route]');
  campusLink.href = buildGoogleMapsUrl();
  campusLink.hidden = !gps.active || !isGpsFresh() || gps.insideCampus || offlineMode;
  card.querySelector('[data-gps-offline]').hidden = !gps.active || gps.insideCampus || !offlineMode;

  const target = getRouteTarget();
  const mapCard = document.querySelector('.route-map-card');
  if (!target || !mapCard || mapCard.dataset.currentTarget !== target.local) return;
  const route = routePointsForTarget(target);
  const polyline = route.points.map(point => `${point.x},${point.y}`).join(' ');
  const display = routeMapDisplay(route, target.floor);
  mapCard.querySelectorAll('.route-path, .route-shadow').forEach(line => line.setAttribute('points', polyline));
  const marker = mapCard.querySelector('.route-start-marker');
  marker.style.left = `${display.marker.x}%`;
  marker.style.top = `${display.marker.y}%`;
  marker.classList.toggle('is-stale', !display.liveOnMap);
  marker.classList.toggle('is-outside', route.position.outsideMap);
  marker.setAttribute('aria-label', route.position.label);
  marker.querySelector('span').textContent = display.markerText;
  const accuracyArea = mapCard.querySelector('.gps-accuracy-area');
  for (const [name, value] of Object.entries({ cx: display.marker.x, cy: display.marker.y, rx: display.radiusX, ry: display.radiusY })) accuracyArea.setAttribute(name, String(value));
  accuracyArea.toggleAttribute('hidden', !route.position.known || route.position.outsideMap);
  accuracyArea.classList.toggle('is-stale', !route.position.live);
  mapCard.querySelector('.route-map').classList.toggle('is-ready', display.liveOnMap);
  const mapStatus = mapCard.querySelector('.map-status');
  mapStatus.classList.toggle('done', display.liveOnMap);
  mapStatus.textContent = display.label;
  mapCard.querySelector('[data-position-label]').textContent = route.position.label;
  const accuracy = gps.active && gps.accuracy != null ? `GPS ±${Math.round(gps.accuracy)} m` : 'GPS niet actief';
  mapCard.querySelector('[data-route-distance]').textContent = `${accuracy} · ${display.distance}`;
  mapCard.querySelector('[data-location-note]').textContent = display.note;
  mapCard.querySelector('[data-calibration-readiness]').textContent = calibrationStatusText(target.floor);
  const chosenLocal = mapCard.querySelector('[data-calibration-local]').value;
  mapCard.querySelectorAll('[data-action="calibrate-map"], [data-action="calibration-second-point"]').forEach(button => { button.disabled = !chosenLocal; });
  const calibrationPanel = mapCard.querySelector('.map-calibration');
  if (route.position.outsideMap && !mapCalibrations[target.floor.id] && !calibrationPanel.dataset.revealed) {
    calibrationPanel.open = true;
    calibrationPanel.dataset.revealed = 'true';
  }
  const status = targetArrivalStatus(target);
  const discovered = state.discoveredLocals.includes(target.local);
  mapCard.querySelector('.arrival-box').classList.toggle('done', discovered || status.state === 'arrived');
  mapCard.querySelector('[data-arrival-title]').textContent = discovered ? 'Locatie bereikt' : status.state === 'arrived' ? 'Aankomst bevestigd' : 'XP pas bij echte aankomst';
  mapCard.querySelector('[data-arrival-text]').textContent = discovered ? 'XP is al toegekend voor deze locatie.' : status.text;
  mapCard.querySelector('.arrival-distance').textContent = status.distanceMeters == null ? '—' : formatDistance(status.distanceMeters);
}

function requestGpsPosition() {
  if (!gps.supported || geoWatchId === null || gpsRefreshPending || document.visibilityState !== 'visible') return;
  const session = gpsSession;
  const previousFix = gps.updatedAt;
  gpsRefreshPending = true;
  navigator.geolocation.getCurrentPosition(position => {
    if (session !== gpsSession) return;
    gpsRefreshPending = false;
    handlePosition(position);
  }, error => {
    if (session !== gpsSession) return;
    gpsRefreshPending = false;
    // Een inmiddels geslaagde watch-meting heeft voorrang op een oudere fout.
    if (gps.updatedAt === previousFix) handlePositionError(error);
  }, GPS_TRACKING.options);
}

function startGPS(options = {}) {
  if (!gps.supported) return showToast('GPS wordt niet ondersteund door deze browser.');
  if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return showToast('GPS werkt alleen via HTTPS of localhost.');
  if (options.restart) stopGPS();
  gpsPermissionDenied = false;
  gps.error = null;
  gps.active = true;
  if (geoWatchId === null) {
    const session = ++gpsSession;
    geoWatchId = navigator.geolocation.watchPosition(position => {
      if (session === gpsSession) handlePosition(position);
    }, error => {
      if (session === gpsSession) handlePositionError(error);
    }, GPS_TRACKING.options);

    // Vraag alleen een aanvullende fix als de watcher even geen nieuwe meting
    // geeft. Er staat maximaal één aanvullend locatieverzoek tegelijk open.
    clearInterval(gpsKeepAliveTimer);
    gpsKeepAliveTimer = setInterval(() => {
      if (document.visibilityState !== 'visible' || geoWatchId === null) return;
      if (!isGpsFresh()) resetArrivalTracking(routeTarget?.local || null);
      if (gps.updatedAt == null || Date.now() - gps.updatedAt >= GPS_TRACKING.pollIntervalMs) requestGpsPosition();
      scheduleGpsUiUpdate();
    }, GPS_TRACKING.pollIntervalMs);
  }
  requestGpsPosition();
  if (!options.silent) render();
  else scheduleGpsUiUpdate();
}

function handlePosition(position) {
  if (!gps.active || !position?.coords) return;
  const { latitude, longitude, accuracy } = position.coords;
  if (![latitude, longitude, accuracy].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0) return;
  const measuredAt = Number.isFinite(position.timestamp) ? position.timestamp : Date.now();
  if (Date.now() - measuredAt > GPS_TRACKING.staleAfterMs || (gps.updatedAt != null && measuredAt <= gps.updatedAt)) return;
  if (gps.updatedAt != null && measuredAt - gps.updatedAt > GPS_TRACKING.staleAfterMs) resetArrivalTracking(routeTarget?.local || null);
  const distance = haversineDistance(latitude, longitude, CAMPUS.latitude, CAMPUS.longitude);
  const previousInside = gps.insideCampus;
  gps = { ...gps, active: true, error: null, latitude, longitude, accuracy, distanceMeters: distance, insideCampus: distance <= CAMPUS.radiusMeters, updatedAt: measuredAt };
  const pending = pendingMapCalibration;
  if (pending && measuredAt >= pending.requestedAt && Date.now() <= pending.expiresAt) {
    const floor = BUILDINGS.flatMap(building => building.floors).find(floor => floor.id === pending.floorId);
    if (floor && calibrationReadiness(floor).ready) setMapCalibration(floor, pending.local, pending.addSecondPoint);
  }
  // Bewaar bruikbare posities ook wanneer een ander scherm geopend is.
  for (const building of BUILDINGS) for (const floor of building.floors) {
    if (floor.gpsMap) floorLocation(floor);
  }
  if (gps.insideCampus && !previousInside) showToast('Je bent aangekomen op de campus ✓');
  const didDiscover = checkRouteArrival();
  if (didDiscover) render({ focus: false });
  else scheduleGpsUiUpdate();
}

function handlePositionError(error) {
  const messages = { 1: 'Locatie-toestemming geweigerd. Geef de browser toestemming voor locatie.', 2: 'Je locatie kon niet worden bepaald.', 3: 'De GPS-meting duurde te lang.' };
  gps.error = messages[error.code] || 'Onbekende GPS-fout.';

  // Bij een tijdelijke timeout (code 3) blijft de automatische watcher actief.
  // Alleen een expliciete weigering stopt de live controle.
  if (error.code === 1) {
    gpsPermissionDenied = true;
    stopGPS();
  } else {
    gps.active = true;
  }
  resetArrivalTracking(routeTarget?.local || null);
  scheduleGpsUiUpdate();
}

function stopGPS() {
  cancelPendingMapCalibration();
  gpsSession += 1;
  if (geoWatchId !== null && 'geolocation' in navigator) navigator.geolocation.clearWatch(geoWatchId);
  geoWatchId = null;
  clearInterval(gpsKeepAliveTimer);
  gpsKeepAliveTimer = null;
  gpsRefreshPending = false;
  clearTimeout(gpsUiTimer);
  gpsUiTimer = null;
  gps.active = false;
  resetArrivalTracking(routeTarget?.local || null);
}

function autoStartGPS(options = {}) {
  if (!gps.supported || gpsPermissionDenied || document.visibilityState !== 'visible') return;
  if (geoWatchId !== null && !options.restart) return;
  startGPS({ silent: true, restart: options.restart });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function bindPageEvents() {
  document.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => navigate(el.dataset.go)));

  document.querySelectorAll('[data-building]').forEach(btn => btn.addEventListener('click', () => {
    selectedBuildingId = btn.dataset.building;
    const holder = document.getElementById('building-detail');
    holder.innerHTML = renderBuildingDetail(selectedBuildingId);
    holder.scrollIntoView({ behavior: 'smooth', block: 'start' });
    bindPageEvents();
  }));

  document.querySelectorAll('[data-close-detail]').forEach(btn => btn.addEventListener('click', () => {
    selectedBuildingId = null;
    const detail = document.getElementById('building-detail');
    if (detail) detail.innerHTML = '';
  }));

  document.querySelectorAll('[data-floor]').forEach(btn => btn.addEventListener('click', () => {
    visitFloor(btn.dataset.floor);
    selectedBuildingId = btn.dataset.buildingId;
    const holder = document.getElementById('building-detail');
    holder.innerHTML = renderBuildingDetail(selectedBuildingId);
    bindPageEvents();
  }));

  document.querySelectorAll('[data-route-local]').forEach(btn => btn.addEventListener('click', () => {
    startRouteTo(btn.dataset.routeLocal, btn.dataset.routeFloor);
  }));

  document.querySelector('[data-action="gps-start"]')?.addEventListener('click', startGPS);
  document.querySelector('[data-action="gps-refresh"]')?.addEventListener('click', () => {
    if (geoWatchId === null) startGPS();
    else requestGpsPosition();
  });

  for (const [action, secondPoint] of [['calibrate-map', false], ['calibration-second-point', true]]) {
    document.querySelector(`[data-action="${action}"]`)?.addEventListener('click', () => {
      const target = getRouteTarget();
      const local = document.querySelector('[data-calibration-local]')?.value;
      if (target?.floor?.gpsMap) setMapCalibration(target.floor, local, secondPoint);
    });
  }
  document.querySelectorAll('[data-current-local]').forEach(button => button.addEventListener('click', () => {
    const target = getRouteTarget();
    if (!target?.floor?.gpsMap) return;
    const local = button.dataset.currentLocal;
    document.querySelector('[data-calibration-local]').value = local;
    document.querySelectorAll('[data-current-local]').forEach(option => option.setAttribute('aria-pressed', String(option.dataset.currentLocal === local)));
    document.querySelector('[data-calibration-choice]').textContent = `Gekozen: ${localLabel(target.floor, local)}`;
    document.querySelectorAll('[data-action="calibrate-map"], [data-action="calibration-second-point"]').forEach(action => { action.disabled = false; });
  }));
  document.querySelector('[data-action="calibration-reset"]')?.addEventListener('click', () => {
    const target = getRouteTarget();
    if (target?.floor?.gpsMap) resetMapCalibration(target.floor);
  });

  document.querySelector('[data-action="discover-route-target"]')?.addEventListener('click', () => {
    const target = getRouteTarget();
    if (!target) return navigate('profile');
    const didDiscover = discoverLocal(target.local, { requireArrival: true });
    if (didDiscover) { routeTarget = null; render(); }
    else showToast('Je bent nog niet nauwkeurig genoeg bij de bestemming.');
  });

  document.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
    if (!window.confirm('Wil je alle XP, ontdekte locaties en badges resetten?')) return;
    state = defaultState();
    routeTarget = null;
    saveState();
    render();
    showToast('Voortgang gewist');
  });
}

function navigate(route) {
  currentRoute = route;
  if (route !== 'buildings') selectedBuildingId = null;
  render();
}

document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.route)));

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  const install = document.getElementById('installBtn');
  install.hidden = false;
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  document.getElementById('installBtn').hidden = true;
});

window.addEventListener('pagehide', stopGPS);
window.addEventListener('pageshow', event => {
  if (event.persisted) autoStartGPS({ restart: true });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(registration => registration.update()).catch(console.error));
}

window.addEventListener('offline', () => {
  offlineMode = true;
  if (currentRoute === 'route') render();
});

window.addEventListener('online', () => {
  offlineMode = false;
  if (currentRoute === 'route') render();
  autoStartGPS();
});

// Start de live locatie automatisch zodra de app zichtbaar is.
// Na eenmalige toestemming blijft de positie daarna doorlopend bijgewerkt.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') autoStartGPS({ restart: true });
  else stopGPS();
});

render();
setTimeout(autoStartGPS, 250);
