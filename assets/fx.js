/* ===== FX · temporada automática · modo Nochebuena · animación del arma al canjear · fuegos artificiales =====
   Carga ANTES de fiesta.js. Opciones en assets/config.js → window.CR.tema = 'auto' | 'navidad' | 'newyear' | 'normal'
   Vista previa rápida: añade ?tema=normal  ?tema=newyear  ?nochebuena=1  ?fuegos=1  al final de la dirección. */
(()=>{'use strict';
const D=document,H=D.documentElement,C=window.CR||{};
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const q=new URLSearchParams(location.search),reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ---------- Temporada: Navidad (1 nov–25 dic) → Año Nuevo (26 dic–6 ene) → Normal ---------- */
const now=new Date(),mo=now.getMonth()+1,dy=now.getDate();
const MAP={navidad:'xmas',xmas:'xmas',newyear:'ny',anonuevo:'ny',ny:'ny',normal:'off',off:'off'};
const auto=(mo===11||(mo===12&&dy<=25))?'xmas':((mo===12&&dy>=26)||(mo===1&&dy<=6))?'ny':'off';
const season=MAP[String(q.get('tema')||C.tema||'auto').toLowerCase()]||auto;
window.CRSeason=season;H.classList.add('season-'+season);

/* ---------- Ajustes propios (se guardan en el navegador) ---------- */
const KEY='cr_fs',cfg=Object.assign({noche:'auto',arma:1},ld(KEY,{}));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}};

/* ---------- Modo Nochebuena: 24 dic desde las 6 p. m. hasta las 5 a. m. del 25 ---------- */
const nocheAuto=()=>{const n=new Date(),m=n.getMonth()+1,d=n.getDate(),h=n.getHours();return(m===12&&d===24&&h>=18)||(m===12&&d===25&&h<5)};
const noche=()=>{H.classList.toggle('fs-noche',season!=='off'&&(q.get('nochebuena')==='1'||String(cfg.noche)==='1'||(String(cfg.noche)==='auto'&&nocheAuto())))};
noche();setInterval(noche,60000);
/* las luces laten al ritmo del villancico (extra.js avisa cada nota con "fx:beat") */
D.addEventListener('fx:beat',()=>{if(!H.classList.contains('fs-noche'))return;const l=D.querySelector('.nv-lights');if(!l)return;l.classList.add('fs-beat');setTimeout(()=>l.classList.remove('fs-beat'),150)});

/* ---------- Opciones dentro del menú navideño (🎄) ---------- */
function menu(n){
  const p=D.getElementById('xPan');if(!p){if(n<30)setTimeout(()=>menu(n+1),500);return}
  if(p.dataset.fs)return;p.dataset.fs=1;
  const w=D.createElement('div');
  w.innerHTML='<label>🌙 Modo Nochebuena<select data-fs="noche"><option value="auto">Automático</option><option value="1">Siempre</option><option value="0">Apagado</option></select></label><label title="El sonido del disparo solo suena si activas 🎵 Villancico">💥 Animación al canjear<input type="checkbox" data-fs="arma"></label>';
  const s=p.querySelector('small'),k=[...w.children];s?s.before(...k):p.append(...k);
  const sel=p.querySelector('[data-fs=noche]'),chk=p.querySelector('[data-fs=arma]');
  sel.value=String(cfg.noche);chk.checked=!!cfg.arma;
  sel.onchange=()=>{cfg.noche=sel.value;save();noche()};chk.onchange=()=>{cfg.arma=chk.checked?1:0;save();if(cfg.arma)shot()}}

/* ---------- Animación del arma al canjear ---------- */
const GUN='<svg viewBox="0 0 230 130" class="fx-svg" aria-hidden="true"><rect x="22" y="30" width="170" height="30" rx="5" fill="#34343a"/><rect x="22" y="30" width="170" height="8" rx="4" fill="#4a4a52"/><rect x="40" y="44" width="116" height="3" fill="#ffd66b"/><rect x="190" y="37" width="30" height="14" rx="3" fill="#25252a"/><rect x="30" y="24" width="8" height="8" fill="#25252a"/><rect x="172" y="24" width="8" height="8" fill="#25252a"/><polygon points="50,60 104,60 96,124 56,124" fill="#202025"/><polygon points="56,70 100,70 96,100 60,100" fill="#2d2d33"/><path d="M108 60v16q0 16-18 16h-8" fill="none" stroke="#34343a" stroke-width="6"/><rect x="92" y="62" width="6" height="16" rx="2" fill="#ffd66b"/></svg>';
function bang(){
  try{if(!ld('cr_xcfg',{}).music)return;
    const ac=new(window.AudioContext||window.webkitAudioContext)(),t0=ac.currentTime+.58,len=Math.floor(ac.sampleRate*.35),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);
    const s=ac.createBufferSource(),g=ac.createGain(),f=ac.createBiquadFilter(),o=ac.createOscillator(),og=ac.createGain();
    s.buffer=buf;g.gain.value=.22;f.type='lowpass';f.frequency.value=1800;s.connect(f);f.connect(g);g.connect(ac.destination);s.start(t0);
    o.frequency.setValueAtTime(140,t0);o.frequency.exponentialRampToValueAtTime(40,t0+.22);og.gain.setValueAtTime(.3,t0);og.gain.exponentialRampToValueAtTime(.001,t0+.27);o.connect(og);og.connect(ac.destination);o.start(t0);o.stop(t0+.3);
    setTimeout(()=>{try{ac.close()}catch(e){}},2200)}catch(e){}}
function shot(){
  if(D.querySelector('.fx-gun'))return;
  const o=D.createElement('div');o.className='fx-gun';o.setAttribute('aria-hidden','true');
  o.innerHTML='<div class="fx-g">'+GUN+'<i class="fx-flash"></i><span class="fx-cs"></span></div><b class="fx-bang">¡PUM!</b>';
  const cs=o.querySelector('.fx-cs');
  for(let i=0;i<5;i++){const c=D.createElement('i');c.style.cssText=`--dx:${-30-Math.random()*90}px;--dy:${120+Math.random()*60}px;--dr:${200+Math.random()*400}deg;animation-delay:${.6+i*.05}s`;cs.appendChild(c)}
  D.body.appendChild(o);bang();
  const b=D.querySelector('#cjM .b');if(b){setTimeout(()=>{b.classList.add('fx-shake');setTimeout(()=>b.classList.remove('fx-shake'),420)},600)}
  setTimeout(()=>o.remove(),2700)}
function watch(){
  const hook=()=>{const m=D.getElementById('cjM'),R=m&&m.querySelector('#cjR');if(!R||m.dataset.fx)return false;m.dataset.fx=1;
    new MutationObserver(()=>{const w=R.querySelector('.win');if(w&&R.style.display!=='none'&&!w.dataset.fx){w.dataset.fx=1;if(cfg.arma&&!reduce&&!H.classList.contains('calm'))shot()}}).observe(R,{childList:true,attributes:true,attributeFilter:['style']});return true};
  if(hook())return;const ob=new MutationObserver(()=>{if(hook())ob.disconnect()});ob.observe(D.body,{childList:true})}

/* ---------- Fuegos artificiales (Año Nuevo) ---------- */
function fireworks(){
  if(season!=='ny'&&q.get('fuegos')!=='1')return;if(reduce||H.classList.contains('lite')||H.classList.contains('calm'))return;
  const cv=D.createElement('canvas');cv.id='fsFw';cv.setAttribute('aria-hidden','true');D.body.appendChild(cv);
  const x=cv.getContext('2d'),col=['#ffd66b','#ff4a58','#6dffa8','#7fb6ff','#ffffff'];let W,Hh,P=[],next=0,last=0;
  const rs=()=>{W=cv.width=innerWidth;Hh=cv.height=innerHeight};rs();addEventListener('resize',rs);
  const burst=()=>{const cx=W*(.15+Math.random()*.7),cy=Hh*(.12+Math.random()*.38),c=col[Math.random()*col.length|0];for(let i=0;i<34;i++){const a=i/34*6.283+Math.random()*.2,v=2+Math.random()*2.6;P.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c})}};
  (function loop(t){requestAnimationFrame(loop);if(D.hidden||D.body.classList.contains('paused')||t-last<33)return;last=t;
    if(t>next){burst();next=t+1400+Math.random()*2200}
    x.clearRect(0,0,W,Hh);P=P.filter(p=>p.l>0);for(const p of P){p.x+=p.vx;p.y+=p.vy;p.vy+=.07;p.vx*=.985;p.l-=.022;x.globalAlpha=Math.max(0,p.l);x.fillStyle=p.c;x.fillRect(p.x,p.y,2.4,2.4)}x.globalAlpha=1})(0)}

const start=()=>{menu(0);watch();fireworks()};
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',start);else start();
})();
