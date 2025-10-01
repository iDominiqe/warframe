const { useState, useEffect } = React;
const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = Recharts;

// --- i18n ---
const resources = {
  en: { translation: { "Home":"Home","Events":"Events","DevStreams":"DevStreams","Status":"Status","Wiki":"Wiki" } },
  ru: { translation: { "Home":"Главная","Events":"События","DevStreams":"Девстримы","Status":"Статус","Wiki":"Вики" } }
};
i18next.init({ lng: localStorage.getItem("lang") || "en", resources });

// --- API ---
const API_BASE = "https://hub.warframestat.us/";

async function fetchCycles() {
  const res = await fetch(API_BASE + "cycles");
  return res.json();
}
async function fetchBaro() {
  const res = await fetch(API_BASE + "events/baro");
  return res.json();
}
async function fetchStatus() {
  const res = await fetch(API_BASE + "status");
  return res.json();
}

// --- Navbar ---
function Navbar({ setPage }) {
  const changeLang = (lang) => { i18next.changeLanguage(lang); localStorage.setItem("lang", lang); };
  return React.createElement('div', {className:"navbar"},
    React.createElement('div', {},
      ["Home","Events","DevStreams","Status","Wiki"].map(p =>
        React.createElement('button',{onClick:()=>setPage(p.toLowerCase()), key:p}, i18next.t(p))
      )
    ),
    React.createElement('div', {},
      React.createElement('button',{onClick:()=>changeLang("en")},"EN"),
      React.createElement('button',{onClick:()=>changeLang("ru")},"RU")
    )
  );
}

// --- Theme Toggle ---
function ThemeToggle({theme,setTheme}) {
  const toggle = ()=> { const t = theme==="dark"?"light":"dark"; setTheme(t); localStorage.setItem("theme",t); };
  return React.createElement('button',{className:"theme-toggle",onClick:toggle},"🌗");
}

// --- Location Card ---
function LocationCard({location,data}) {
  const time = new Date(data.expiry*1000).toLocaleTimeString("en-GB",{hour12:false});
  return React.createElement('div',{className:"location-card"},
    React.createElement('h3',{},location),
    React.createElement('p',{},`Time: ${time}`)
  );
}

// --- Cycle Timer ---
function CycleTimer() {
  const [cycles,setCycles] = useState({});
  const [intervalSec,setIntervalSec] = useState(30);

  useEffect(()=>{
    async function load(){ const data = await fetchCycles(); setCycles(data); }
    load();
    const timer = setInterval(load, intervalSec*1000);
    return ()=>clearInterval(timer);
  },[intervalSec]);

  return React.createElement('div',{className:"cycles-container"},
    React.createElement('div',{className:"interval-selector"},
      [30,60,120].map(s=>React.createElement('button',{onClick:()=>setIntervalSec(s),key:s},`${s}s`))
    ),
    React.createElement('div',{className:"location-grid"},
      Object.keys(cycles).map(loc=>React.createElement(LocationCard,{key:loc,location:loc,data:cycles[loc]}))
    )
  );
}

// --- Baro Alert ---
function BaroAlert() {
  const [baro,setBaro] = useState(null);
  useEffect(()=>{ fetchBaro().then(setBaro); },[]);
  if(!baro) return null;
  const time = new Date(baro.expiry*1000).toLocaleTimeString("en-GB",{hour12:false});
  return React.createElement('div',{className:"baro-alert"},
    React.createElement('h3',{},`Baro Ki'Teer arrives at ${time}`),
    React.createElement('p',{},`Location: ${baro.location}`)
  );
}

// --- Server Status ---
function ServerStatusPage() {
  const [data,setData] = useState([{name:"Servers",load:0,players:0}]);
  useEffect(()=>{ fetchStatus().then(s=>{
    setData([{name:"Servers",load:s.loadAvg[0],players:s.playerCount}]);
  }); },[]);
  return React.createElement('div',{style:{width:"95%",height:"300px",margin:"20px auto"}},
    React.createElement(ResponsiveContainer,null,
      React.createElement(BarChart,{data:data},
        React.createElement(XAxis,{dataKey:"name"}),
        React.createElement(YAxis,null),
        React.createElement(Tooltip,null),
        React.createElement(Bar,{dataKey:"load",fill:"#00aaff"}),
        React.createElement(Bar,{dataKey:"players",fill:"#ffaa00"})
      )
    )
  );
}

// --- Placeholder pages ---
const EventsPage = ()=>React.createElement('div',{},React.createElement('h2',{},'Events & Alerts'));
const DevStreamsPage = ()=>React.createElement('div',{},React.createElement('h2',{},'DevStreams & News'));
const WikiPage = ()=>React.createElement('div',{},React.createElement('h2',{},'Wiki'));

// --- Main App ---
function App(){
  const [page,setPage]=React.useState("home");
  const [theme,setTheme]=React.useState(localStorage.getItem("theme")||"dark");

  return React.createElement('div',{className:"app "+theme},
    React.createElement(Navbar,{setPage}),
    React.createElement(ThemeToggle,{theme,setTheme}),
    page==="home"?React.createElement(React.Fragment,null,
      React.createElement(CycleTimer,null),
      React.createElement(BaroAlert,null)
    ):page==="status"?React.createElement(ServerStatusPage,null):
    page==="events"?React.createElement(EventsPage,null):
    page==="devstreams"?React.createElement(DevStreamsPage,null):
    page==="wiki"?React.createElement(WikiPage,null):null
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));

// --- Canvas background (stars, moon, fog) ---
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.getElementById("canvas-bg").appendChild(canvas);
const ctx = canvas.getContext("2d");

function drawStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<100;i++){
    ctx.fillStyle = "rgba(255,255,255,"+Math.random()+")";
    ctx.beginPath();
    ctx.arc(Math.random()*canvas.width,Math.random()*canvas.height,Math.random()*2,0,Math.PI*2);
    ctx.fill();
  }
  // Moon
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(canvas.width-100,100,50,0,Math.PI*2);
  ctx.fill();
}
setInterval(drawStars,1000/30);
window.addEventListener("resize",()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; });
