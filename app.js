async function safeFetch(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.error('safeFetch failed for', url, e);
    return null;
  }
}

const expiryDate = expiry ? new Date(expiry) : (data.timeLeft? new Date(Date.now()+data.timeLeft*1000): null);
cycles[c.key] = {raw:data, expiry: expiryDate, name: c.name, color: c.color, effect: c.effect};
} else delete cycles[c.key]; }
await Promise.all([fetchBaro(), fetchEvents(), fetchDevstreams(), fetchStatus()]); renderCards(); }


async function fetchBaro(){ const data = await fetchFromHub(`/${platform}/voidTrader`) || await fetchFromHub(`/voidTrader`); const el=document.getElementById('baro'); if(!data) return el.textContent='No data for Baro.'; const arrives = data.start ? new Date(data.start).toLocaleString([], {hour12:false}) : (data.startString || '—'); const leaves = data.end ? new Date(data.end).toLocaleString([], {hour12:false}) : (data.endString || '—'); const location = data.location || data.node || 'Unknown'; el.innerHTML = `<div><strong>${data.user||'Void Trader'}</strong> — Arrives: ${arrives} — Leaves: ${leaves}<br>Location: <span class="muted">${location}</span></div>`; }


async function fetchEvents(){ const events = await fetchFromHub(`/${platform}/events`) || await fetchFromHub(`/events`) || await fetchFromHub(`/news`); const el=document.getElementById('eventsList'); if(!events) return el.textContent='No events/alerts found.'; let html='<div style="display:grid;gap:8px">'; const list = Array.isArray(events)?events:(events.data||[]); if(list.length===0) html+='<div class="muted">No active events.</div>'; for(const ev of list.slice(0,20)){ const title = ev.description || ev.message || ev.type || ev.title || JSON.stringify(ev).slice(0,60); html+=`<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.02)"><strong>${title}</strong><div class="muted small">Ends: ${ev.expiry? new Date(ev.expiry).toLocaleString([], {hour12:false}) : '—'}</div></div>`; } html+='</div>'; el.innerHTML = html; }


async function fetchDevstreams(){ const el=document.getElementById('devstreamList'); const news = await fetchFromHub(`/news`) || await fetchFromHub(`/alerts`) || []; let html='<div style="display:grid;gap:10px">'; html+='<div class="muted">Official news:</div>'; if(Array.isArray(news) && news.length>0){ for(const n of news.slice(0,6)) html+=`<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.02)"><strong>${n.title||n.message||n.description}</strong><div class="muted small">${n.date? new Date(n.date).toLocaleString([], {hour12:false}) : ''}</div></div>`; } else html+='<div class="muted">No recent news found.</div>'; html+='<div style="margin-top:8px" class="muted">Known devstream channels (Twitch):</div>'; const channels = ['DigitalExtreme','Twitch.TV/Warframe']; for(const c of channels) html+=`<div class="muted">${c}</div>`; html+='</div>'; el.innerHTML = html; }


async function fetchStatus(){ const playersData = Array.from({length:12}, (_,i)=>({t:i, v: Math.floor(3000 + Math.random()*5000)})); const loadData = Array.from({length:12}, (_,i)=>({t:i, v: Math.random()*100})); drawLineChart('playersChart', playersData); drawLineChart('loadChart', loadData); }


function drawLineChart(id, data){ const cn=document.getElementById(id); if(!cn) return; const ctx=cn.getContext('2d'); const w=cn.width; const h=cn.height; ctx.clearRect(0,0,w,h); ctx.beginPath(); const maxV=Math.max(...data.map(d=>d.v))+1; for(let i=0;i<data.length;i++){ const x=10 + i*((w-20)/(data.length-1)); const y=h-10 - data[i].v/maxV*(h-20); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.strokeStyle='rgba(100,200,255,0.9)'; ctx.lineWidth=2; ctx.stroke(); }


// render cards & star map
const cyclesEl = document.getElementById('cycles'); function renderCards(){ cyclesEl.innerHTML=''; for(const conf of CYCLE_KEYS){ const obj = cycles[conf.key]; const card = document.createElement('div'); card.className='cycle-card'; const expiry = obj && obj.expiry ? obj.expiry : null; const timeText = expiry ? timeLeftString(expiry) : '—'; card.innerHTML = `<div class="orbit-canvas"><canvas id="c-${conf.key}" width="86" height="86"></canvas></div><div class="cycle-info"><h3>${conf.name}</h3><div class="time" id="time-${conf.key}">${timeText}</div><div class="ends muted" id="ends-${conf.key}">${expiry? 'Ends: '+expiry.toLocaleString([], {hour12:false}) : 'No data'}</div></div><div class="tooltip" id="tip-${conf.key}">Hover to see details</div>`; cyclesEl.appendChild(card); setupMiniOrbit(`c-${conf.key}`, conf, obj); if(conf.effect && obj){ if(conf.effect==='night') card.classList.add('effect-night'); if(conf.effect==='fog') card.classList.add('effect-fog'); } } renderStarMap(); }


function timeLeftString(dt){ const ms=Math.max(0, dt - Date.now()); const s=Math.floor(ms/1000); const hh=Math.floor(s/3600); const mm=Math.floor((s%3600)/60); const ss=s%60; return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; }


function setupMiniOrbit(canvasId, conf, obj){ const cn=document.getElementById(canvasId); if(!cn) return; const ctx=cn.getContext('2d'); function draw(){ ctx.clearRect(0,0,cn.width,cn.height); ctx.fillStyle='rgba(255,255,255,0.02)'; ctx.beginPath(); ctx.roundRect(4,4,78,78,8); ctx.fill(); const cx=cn.width/2, cy=cn.height/2; const R=22; let frac=0; if(obj && obj.expiry){ const remaining=Math.max(0, obj.expiry - Date.now()); const period=Math.max(60*1000, (obj.raw && obj.raw.cycleLength? obj.raw.cycleLength*1000 : remaining)); frac = 1 - remaining/period; } const angle = frac * Math.PI*2; const px = cx + Math.cos(angle)*R; const py = cy + Math.sin(angle)*R; ctx.beginPath(); ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1; ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.fillStyle=conf.color || 'rgba(255,255,255,0.12)'; ctx.arc(px,py,6,0,Math.PI*2); ctx.fill(); }
draw(); function tick(){ const el=document.getElementById('time-'+canvasId.replace('c-','')); const endsEl=document.getElementById('ends-'+canvasId.replace('c-','')); const tip=document.getElementById('tip-'+canvasId.replace('c-','')); if(obj && obj.expiry){ el.textContent = timeLeftString(obj.expiry); endsEl.textContent = 'Ends: '+ obj.expiry.toLocaleString([], {hour12:false}); tip.innerHTML = `State: ${obj.raw.state||obj.raw.status||'—'}<br>Expiry: ${obj.expiry.toLocaleString([], {hour12:false})}`; } else { el.textContent='—'; endsEl.textContent='No data'; tip.textContent='No data'; } draw(); requestAnimationFrame(tick); } requestAnimationFrame(tick); }


// star map
const mainCanvas = document.getElementById('mainOrbit'); const mctx = mainCanvas.getContext('2d'); function renderStarMap(){ const DPR = devicePixelRatio||1; mainCanvas.width = mainCanvas.clientWidth*DPR; mainCanvas.height = 420*DPR; const w=mainCanvas.width; const h=mainCanvas.height; mctx.clearRect(0,0,w,h); mctx.fillStyle='rgba(255,255,255,0.02)'; for(let i=0;i<120;i++){ mctx.fillRect(Math.random()*w, Math.random()*h, Math.random()*1.5, Math.random()*1.5); } const cx=w/2, cy=h/2; mctx.beginPath(); mctx.fillStyle='rgba(255,200,80,0.95)'; mctx.arc(cx,cy,30*DPR,0,Math.PI*2); mctx.fill(); CYCLE_KEYS.forEach((conf,i)=>{ const r = 70 + i*46; const obj = cycles[conf.key]; let frac=0; if(obj && obj.expiry){ const remaining = Math.max(0,obj.expiry - Date.now()); const period = Math.max(60*1000, (obj.raw && obj.raw.cycleLength? obj.raw.cycleLength*1000 : remaining)); frac = 1 - remaining/period; } const angle = frac * Math.PI*2 + (Date.now()/8000)*(0.2/(i+1)); const px = cx + Math.cos(angle)*r; const py = cy + Math.sin(angle)*r; mctx.beginPath(); mctx.strokeStyle='rgba(255,255,255,0.04)'; mctx.lineWidth=1; mctx.arc(cx,cy,r,0,Math.PI*2); mctx.stroke(); mctx.beginPath(); mctx.fillStyle = conf.color; mctx.arc(px,py,12*DPR,0,Math.PI*2); mctx.fill(); mctx.font = `${12*DPR}px Arial`; mctx.fillStyle='rgba(255,255,255,0.85)'; mctx.fillText(conf.name, px+14*DPR, py+4*DPR); if(conf.effect==='night'){ mctx.beginPath(); mctx.fillStyle='rgba(255,255,255,0.08)'; mctx.arc(px-8*DPR,py-10*DPR,4*DPR,0,Math.PI*2); mctx.fill(); } }); }
function animateStarMap(){ renderStarMap(); requestAnimationFrame(animateStarMap); } animateStarMap();


// sync loop
let syncTimer=null; async function startSync(){ await fetchAll(true); if(syncTimer) clearInterval(syncTimer); syncTimer = setInterval(fetchAll, SYNC_MS); } startSync();


// extras
CanvasRenderingContext2D.prototype.roundRect = CanvasRenderingContext2D.prototype.roundRect || function(x,y,w,h,r){ if(typeof r==='undefined') r=6; this.beginPath(); this.moveTo(x+r,y); this.arcTo(x+w,y,x+w,y+h,r); this.arcTo(x+w,y+h,x,y+h,r); this.arcTo(x,y+h,x,y,r); this.arcTo(x,y,x+w,y,r); this.closePath(); return this; }


window.addEventListener('keydown', e=>{ if(e.key==='t') document.getElementById('themeToggle').click(); if(e.key==='l') setLang(LANG==='en'?'ru':'en'); });


document.getElementById('createWikiBtn').addEventListener('click', ()=>{ const name = prompt('New wiki page title (example):'); if(!name) return; const div = document.createElement('div'); div.className='muted'; div.textContent = name; document.getElementById('wikiList').appendChild(div); });
