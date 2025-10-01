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
    html += `<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.02)"><strong>${title}</strong><div class="muted small">Ends: ${ends}</div></div>`;
  }
  html += '</div>';
  if (eventsListEl) eventsListEl.innerHTML = html;
}

async function fetchDevstreams(){
  const news = await fetchFromHub('/news') || await fetchFromHub('/alerts') || [];
  let html = '<div style="display:grid;gap:10px">';
  if (Array.isArray(news) && news.length > 0) {
    for (const n of news.slice(0,6)) {
      html += `<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.02)"><strong>${n.title || n.message || n.description}</strong><div class="muted small">${n.date ? new Date(n.date).toLocaleString([], {hour12:false}) : ''}</div></div>`;
    }
  } else {
    html += '<div class="muted">No recent news found.</div>';
  }
  html += '<div style="margin-top:8px" class="muted">Known dev channels (Twitch): <span class="muted-tag">DigitalExtreme</span></div>';
  html += '</div>';
  if (devstreamListEl) devstreamListEl.innerHTML = html;
}

// ----- Status charts (mock + Chart.js) -----
function drawCharts(){
  if (playersChartEl) {
    const ctx = playersChartEl.getContext('2d');
    const data = {
      labels: Array.from({length:12}, (_,i)=>`${i}`),
      datasets: [{ label: 'Players', data: Array.from({length:12}, ()=>Math.floor(2000+Math.random()*8000)), borderColor: 'rgba(100,200,255,0.9)', tension:0.3 }]
    };
    new Chart(ctx, { type: 'line', data, options: { plugins:{legend:{display:false}} } });
  }
  if (loadChartEl) {
    const ctx = loadChartEl.getContext('2d');
    const data = {
      labels: Array.from({length:12}, (_,i)=>`${i}`),
      datasets: [{ label: 'Load', data: Array.from({length:12}, ()=>Math.random()*100), borderColor: 'rgba(200,150,255,0.9)', tension:0.3 }]
    };
    new Chart(ctx, { type: 'line', data, options: { plugins:{legend:{display:false}} } });
  }
}

// ----- Render cycles/cards/mini orbits -----
function formatHMS(ms){
  const s = Math.floor(ms/1000);
  const hh = Math.floor(s/3600);
  const mm = Math.floor((s%3600)/60);
  const ss = s%60;
  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

function renderCards(){
  if (!cyclesEl) return;
  cyclesEl.innerHTML = '';
  for (const conf of CYCLE_KEYS){
    const obj = cycles[conf.key] || null;
    const card = document.createElement('div');
    card.className = 'cycle-card';
    card.innerHTML = `
      <div class="orbit-canvas"><canvas id="c-${conf.key}" width="86" height="86"></canvas></div>
      <div class="cycle-info">
        <h3>${conf.name}</h3>
        <div class="time" id="time-${conf.key}">--:--:--</div>
        <div class="ends muted" id="ends-${conf.key}">Ends: —</div>
      </div>
      <div class="tooltip" id="tip-${conf.key}">Hover to see details</div>
    `;
    cyclesEl.appendChild(card);
    setupMiniOrbit(`c-${conf.key}`, conf, obj);
    if (obj && obj.effect) {
      if (obj.effect === 'night') card.classList.add('effect-night');
      if (obj.effect === 'fog') card.classList.add('effect-fog');
    }
  }
  renderStarMap(); // update main star map
}

function setupMiniOrbit(canvasId, conf, obj){
  const cn = document.getElementById(canvasId);
  if (!cn) return;
  const ctx = cn.getContext('2d');

  function draw(){
    ctx.clearRect(0,0,cn.width,cn.height);
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.beginPath(); ctx.roundRect?.(4,4,78,78,8); ctx.fill?.();

    const cx = cn.width/2, cy = cn.height/2;
    const R = 22;
    let frac = 0;
    if (obj && obj.expiry) {
      const remaining = Math.max(0, obj.expiry - Date.now());
      const period = Math.max(60*1000, (obj.raw && obj.raw.cycleLength ? obj.raw.cycleLength*1000 : remaining));
      frac = 1 - remaining/period;
    }
    const angle = frac * Math.PI * 2;
    const px = cx + Math.cos(angle) * R;
    const py = cy + Math.sin(angle) * R;

    ctx.beginPath(); ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1; ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.fillStyle = conf.color || 'rgba(255,255,255,0.12)'; ctx.arc(px,py,6,0,Math.PI*2); ctx.fill();
  }

  draw();

  function tick(){
    const el = document.getElementById('time-'+canvasId.replace('c-',''));
    const endsEl = document.getElementById('ends-'+canvasId.replace('c-',''));
    const tip = document.getElementById('tip-'+canvasId.replace('c-',''));
    if (obj && obj.expiry){
      const diff = Math.max(0, obj.expiry - Date.now());
      el.textContent = formatHMS(diff);
      endsEl.textContent = 'Ends: ' + obj.expiry.toLocaleString([], {hour12:false});
      tip.innerHTML = `State: ${obj.raw.state || obj.raw.status || '—'}<br>Expiry: ${obj.expiry.toLocaleString([], {hour12:false})}`;
    } else {
      el.textContent = '—';
      endsEl.textContent = 'No data';
      tip.textContent = 'No data';
    }
    draw();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ----- Star map (main) -----
const mainCanvas = document.getElementById('mainOrbit');
const mctx = mainCanvas ? mainCanvas.getContext('2d') : null;

function renderStarMap(){
  if (!mctx || !mainCanvas) return;
  const DPR = devicePixelRatio || 1;
  mainCanvas.width = mainCanvas.clientWidth * DPR;
  mainCanvas.height = 420 * DPR;
  const w = mainCanvas.width, h = mainCanvas.height;
  mctx.clearRect(0,0,w,h);

  // background stars
  mctx.fillStyle = 'rgba(255,255,255,0.02)';
  for (let i=0;i<120;i++){
    mctx.fillRect(Math.random()*w, Math.random()*h, Math.random()*1.5, Math.random()*1.5);
  }

  // sun
  const cx=w/2, cy=h/2;
  mctx.beginPath(); mctx.fillStyle='rgba(255,200,80,0.95)'; mctx.arc(cx,cy,30*DPR,0,Math.PI*2); mctx.fill();

  CYCLE_KEYS.forEach((conf, i)=>{
    const r = 70 + i*46;
    const obj = cycles[conf.key] || null;
    let frac = 0;
    if (obj && obj.expiry){
      const remaining = Math.max(0, obj.expiry - Date.now());
      const period = Math.max(60*1000, (obj.raw && obj.raw.cycleLength ? obj.raw.cycleLength*1000 : remaining));
      frac = 1 - remaining/period;
    }
    const angle = frac * Math.PI*2 + (Date.now()/8000)*(0.2/(i+1));
    const px = cx + Math.cos(angle)*r;
    const py = cy + Math.sin(angle)*r;

    // orbit line
    mctx.beginPath(); mctx.strokeStyle='rgba(255,255,255,0.04)'; mctx.lineWidth=1; mctx.arc(cx,cy,r,0,Math.PI*2); mctx.stroke();
    // planet
    mctx.beginPath(); mctx.fillStyle = conf.color; mctx.arc(px,py,12*DPR,0,Math.PI*2); mctx.fill();
    // label
    mctx.font = `${12*DPR}px Arial`; mctx.fillStyle = 'rgba(255,255,255,0.85)'; mctx.fillText(conf.name, px+14*DPR, py+4*DPR);

    // small moon icon for night
    if (conf.effect === 'night') {
      mctx.beginPath(); mctx.fillStyle = 'rgba(255,255,255,0.08)'; mctx.arc(px-8*DPR, py-10*DPR, 4*DPR, 0, Math.PI*2); mctx.fill();
    }
  });
}

// animate main canvas
function animateStarMap(){
  renderStarMap();
  requestAnimationFrame(animateStarMap);
}
animateStarMap();

// ----- background canvas (parallax stars + moon) -----
function drawBackground(){
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const stars = Array.from({length:200}, ()=>({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*1.5 }));
  let tick = 0;

  function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // gradient sky
    const g = ctx.createLinearGradient(0,0,0,canvas.height);
    g.addColorStop(0, '#03040a');
    g.addColorStop(1, 'rgba(2,6,23,0.9)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // moving stars
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    stars.forEach(s=>{
      ctx.beginPath(); ctx.arc((s.x + tick*0.02) % canvas.width, s.y, s.r, 0, Math.PI*2); ctx.fill();
    });

    // moon
    const mx = canvas.width - 120 + Math.sin(tick/300)*8;
    const my = 100 + Math.cos(tick/400)*6;
    ctx.beginPath(); ctx.fillStyle='rgba(255,240,200,0.95)'; ctx.arc(mx,my,48,0,Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(mx+18, my-8, 20, 0, Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    tick++;
    requestAnimationFrame(loop);
  }
  loop();
}
drawBackground();

// ----- sync loop -----
let syncTimer = null;
async function fullSync(force=false){
  await fetchAllCycles();
  renderCards();
  await fetchBaro();
  await fetchEvents();
  await fetchDevstreams();
  drawCharts();
  if (lastSyncEl) lastSyncEl.textContent = new Date().toLocaleTimeString([], {hour12:false});
}

async function startSync(){
  await fullSync(true);
  if (syncTimer) clearInterval(syncTimer);
  syncTimer = setInterval(fullSync, SYNC_MS);
}
startSync();

// ----- simple router for pages -----
function route(){
  const hash = location.hash || '#/';
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  if (hash.startsWith('#/events')) document.getElementById('page-events').classList.add('active');
  else if (hash.startsWith('#/devstreams')) document.getElementById('page-devstreams').classList.add('active');
  else if (hash.startsWith('#/status')) document.getElementById('page-status').classList.add('active');
  else if (hash.startsWith('#/wiki')) document.getElementById('page-wiki').classList.add('active');
  else if (hash.startsWith('#/baro')) document.getElementById('page-baro').classList.add('active');
  else document.getElementById('page-home').classList.add('active');
}
window.addEventListener('hashchange', route); route();

// ----- UI bindings -----
document.getElementById('platformSelect').value = platform;
document.getElementById('platformSelect').addEventListener('change', e => {
  platform = e.target.value; localStorage.setItem('wf_platform', platform); fullSync(true);
});
document.getElementById('themeToggle').addEventListener('click', ()=> {
  document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
});
document.getElementById('createWikiBtn')?.addEventListener('click', ()=> {
  const name = prompt('New wiki page title:'); if (!name) return;
  const div = document.createElement('div'); div.className='muted'; div.textContent = name; document.getElementById('wikiList').appendChild(div);
});

// small polyfill for roundRect
CanvasRenderingContext2D.prototype.roundRect = CanvasRenderingContext2D.prototype.roundRect || function(x,y,w,h,r){
  if (typeof r === 'undefined') r = 6;
  this.beginPath(); this.moveTo(x+r,y); this.arcTo(x+w,y,x+w,y+h,r); this.arcTo(x+w,y+h,x,y+h,r); this.arcTo(x,y+h,x,y,r); this.arcTo(x,y,x+w,y,r); this.closePath(); return this;
};
