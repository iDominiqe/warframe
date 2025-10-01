/* app.js — Warframe Cycles (single-file implementation)
   Copy this file as-is into your repo.
*/

const HUB_BASE = 'https://hub.warframestat.us';
const FALLBACK_BASE = 'https://api.warframestat.us';
let platform = localStorage.getItem('wf_platform') || 'pc';
const SYNC_MS = 30000; // 30 sec sync

const CYCLE_KEYS = [
  {key:'cetusCycle', name:'Cetus (Plains)', color:'#6fe3ff', effect:'night'},
  {key:'vallisCycle', name:'Orb Vallis', color:'#9be8a8', effect:'cold'},
  {key:'cambionCycle', name:'Cambion Drift', color:'#ffb86b', effect:'fog'},
  {key:'duviriCycle', name:'Duviri Paradox', color:'#d9a6ff', effect:'weird'},
  {key:'zarimanCycle', name:'Zariman', color:'#a6d0ff', effect:'night'},
  {key:'earthCycle', name:'Earth (Day/Night)', color:'#cfe8ff', effect:'day'}
];

const cycles = {}; // store fetched cycles

// UI elements
const cyclesEl = document.getElementById('cycles');
const lastSyncEl = document.getElementById('lastSync') || document.querySelector('#lastSync');
const syncIntervalEl = document.getElementById('syncInterval');
const baroEl = document.getElementById('baro');
const baroDetailedEl = document.getElementById('baroDetailed');
const eventsListEl = document.getElementById('eventsList');
const devstreamListEl = document.getElementById('devstreamList');
const playersChartEl = document.getElementById('playersChart');
const loadChartEl = document.getElementById('loadChart');

if (syncIntervalEl) syncIntervalEl.textContent = (SYNC_MS/1000) + 's';

// ----- fetch helpers -----
async function safeFetch(url){
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('Fetch failed:', url, e);
    return null;
  }
}

async function fetchFromHub(path){
  // try hub first, then fallback
  let url1 = HUB_BASE + path;
  let url2 = FALLBACK_BASE + path;
  let data = await safeFetch(url1);
  if (data) return data;
  return await safeFetch(url2);
}

// ----- fetch worldstate cycles -----
async function fetchAllCycles(){
  for (const c of CYCLE_KEYS){
    // try platform-prefixed endpoint (eg /pc/cetusCycle) then generic (/cetusCycle)
    let data = await fetchFromHub(`/${platform}/${c.key}`) || await fetchFromHub(`/${c.key}`);
    if (data){
      const expiry = data.expiry || data.EndTime || data.end || (data.timeLeft ? new Date(Date.now() + data.timeLeft*1000).toISOString() : null);
      const expiryDate = expiry ? new Date(expiry) : (data.timeLeft ? new Date(Date.now() + data.timeLeft*1000) : null);
      cycles[c.key] = { raw: data, expiry: expiryDate, name: c.name, color: c.color, effect: c.effect };
    } else {
      delete cycles[c.key];
    }
  }
}

// ----- Baro / Void Trader -----
async function fetchBaro(){
  const data = await fetchFromHub(`/${platform}/voidTrader`) || await fetchFromHub('/voidTrader');
  if (!data) {
    if (baroEl) baroEl.textContent = 'Baro: no data';
    if (baroDetailedEl) baroDetailedEl.textContent = 'Baro: no data';
    return;
  }
  const arrives = data.start ? new Date(data.start).toLocaleString([], {hour12:false}) : data.startString || '—';
  const leaves = data.end ? new Date(data.end).toLocaleString([], {hour12:false}) : data.endString || '—';
  const location = data.location || data.node || 'Unknown';
  if (baroEl) baroEl.innerHTML = `<div><strong>${data.user || 'Void Trader'}</strong> — Arrives: ${arrives} — Leaves: ${leaves}<br>Location: <span class="muted">${location}</span></div>`;
  if (baroDetailedEl) baroDetailedEl.innerHTML = `<div><strong>${data.user || 'Void Trader'}</strong></div>
    <div>Arrives: ${arrives}</div>
    <div>Leaves: ${leaves}</div>
    <div>Location: <span class="muted">${location}</span></div>
    <div class="muted small">Platform: ${platform}</div>`;
}

// ----- Events & Devstreams (simple) -----
async function fetchEvents(){
  const events = await fetchFromHub(`/${platform}/events`) || await fetchFromHub('/events') || await fetchFromHub('/news');
  if (!events) {
    if (eventsListEl) eventsListEl.textContent = 'No events/alerts found.';
    return;
  }
  let list = Array.isArray(events) ? events : (events.data || []);
  if (!list || list.length === 0) {
    if (eventsListEl) eventsListEl.textContent = 'No active events.';
    return;
  }
  let html = '<div style="display:grid;gap:8px">';
  for (const ev of list.slice(0,20)) {
    const title = ev.description || ev.message || ev.type || ev.title || (ev.id || 'Event');
    const ends = ev.expiry ? new Date(ev.expiry).toLocaleString([], {hour12:false}) : '—';
    html += `<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.02)"><strong>${ti
