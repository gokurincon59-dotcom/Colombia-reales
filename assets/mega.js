/* ===== MEGA ACTUALIZACIÓN · 3D para celulares + Discord + app instalable =====
   Sin librerías: CSS 3D + pointer events + giroscopio. Se carga después de extra.js. */
(()=>{'use strict';
const D=document,H=D.documentElement,C=window.CR||{};
const $=(s,r)=>(r||D).querySelector(s),$$=(s,r)=>[...(r||D).querySelectorAll(s)];
const el=(t,c,h)=>{const e=D.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const INV=C.invite||'https://discord.gg/TwFXh8CN';
const CODE=(INV.match(/discord\.gg\/([\w-]+)/i)||[])[1]||'TwFXh8CN';
const IS_FAC=/facciones(\.html)?$/.test(location.pathname);
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const touchy=matchMedia('(pointer:coarse)').matches||(navigator.maxTouchPoints||0)>0;
if(touchy)H.classList.add('mg-touch');

/* ---------- Ajustes guardados ---------- */
const KEY='cr_mg',cfg=Object.assign({fx3d:1,gyro:0},(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}})());
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}};
const on3d=()=>!!cfg.fx3d&&!reduce&&!H.classList.contains('calm');
const toast=m=>{const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show','on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show','on'),2600)};
const vib=n=>{try{if(touchy&&navigator.vibrate)navigator.vibrate(n||8)}catch(e){}};
const copy=async t=>{try{await navigator.clipboard.writeText(t);return true}catch(e){const a=el('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';D.body.appendChild(a);a.select();let ok=false;try{ok=D.execCommand('copy')}catch(x){}a.remove();return ok}};

/* Orientación del teléfono (compartida por todos los efectos 3D): x,y entre -1 y 1 */
const G={x:0,y:0,on:false};
const vis=new WeakMap(); /* qué elementos están en pantalla */
const io=new IntersectionObserver(es=>es.forEach(e=>vis.set(e.target,e.isIntersecting)),{rootMargin:'80px'});
const watch=e=>{if(e){io.observe(e);vis.set(e,true)}};

/* ======================================================================
   1) DISCORD: botón flotante, enlaces, sección con cubo 3D y contadores
   ====================================================================== */
const DCP='M20 4.5A17 17 0 0 0 15.8 3l-.5 1a15 15 0 0 0-4.6 0l-.5-1A17 17 0 0 0 4 4.5C1.4 8.4.7 12.2 1 16a17 17 0 0 0 5.2 2.6l1.1-1.800c-.6-.2-1.200-.5-1.700-.9l.4-.3a12 12 0 0 0 10.200 0l.4.3c-.5.4-1.100.7-1.700.9l1.100 1.800A17 17 0 0 0 23 16c.4-4.400-.7-8.200-3-11.500ZM8.700 13.700c-1 0-1.800-.9-1.800-2s.8-2 1.800-2 1.800.9 1.800 2-.8 2-1.800 2Zm6.600 0c-1 0-1.800-.9-1.800-2s.8-2 1.800-2 1.800.9 1.800 2-.8 2-1.800 2Z';
const ICO=(s)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="${DCP}"/></svg>`;

{ /* botón flotante */
  const a=el('a','',ICO(22)+'<span>Discord</span>');a.id='mgDc';a.href=INV;a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','Unirme al Discord de Colombia Reals');
  D.body.appendChild(a);
}
{ /* enlace en el pie y botón del inicio */
  const f=$('footer');if(f){f.append(' · ');const a=el('a','','💬 Discord');a.href=INV;a.target='_blank';a.rel='noopener';a.style.color='var(--acl)';f.appendChild(a)}
  const hb=$$('.hero .btn,.hero-inner .btn').pop();
  if(hb){const a=el('a','btn',ICO(18)+' ÚNETE AL DISCORD');a.href=INV;a.target='_blank';a.rel='noopener';a.style.cssText='background:linear-gradient(135deg,#5865F2,#3b46c4);box-shadow:0 0 25px rgba(88,101,242,.6);display:inline-flex;align-items:center;gap:8px';hb.after(' ',a)}
  const faq=$('.faq');if(faq){const d=el('details','',`<summary>¿Cómo entro al servidor de Discord?</summary>Entra con esta invitación: <a href="${INV}" target="_blank" rel="noopener" style="color:var(--acl)">${INV.replace(/^https?:\/\//,'')}</a>. Ahí abres tu ticket de ventas, ves las novedades y hablas con la comunidad.`);faq.appendChild(d)}
}

/* sección Discord */
const sec=el('section','mg-sec','');sec.id='discord';
sec.innerHTML=`<h2>Únete a la <span>comunidad</span></h2><p>Tickets de ventas, novedades, canjes y soporte, todo en nuestro Discord.</p>
<div class="mg-dc"><div class="mg-stage" id="mgStage" aria-label="Cubo 3D de Colombia Reals. Arrástralo para girarlo"><div class="mg-cube" id="mgCube">
<b class="fa"><img src="assets/logo-cr.webp" alt="" width="120" height="94"></b>
<b class="fb">${ICO(60).replace('width="60" height="60"','')}DISCORD</b>
<b class="fc"><em>🎁</em>CANJE</b><b class="fd"><em>★</em>VIP</b><b class="fe"><em>🎄</em>NAVIDAD</b><b class="ff"><em>🇨🇴</em></b>
</div><div class="mg-tap">Toca o arrastra</div></div>
<div class="mg-dct"><h3>COLOMBIA REALS · DISCORD</h3>
<div class="mg-live" id="mgLive" hidden></div>
<ul><li><span>🎫</span>Abre tu ticket de ventas</li><li><span>🎁</span>Canjea tus códigos de Navidad</li><li><span>📢</span>Entérate primero de lo nuevo</li><li><span>🤝</span>Conoce a la comunidad</li></ul>
<div class="mg-act"><a class="btn mg-join" href="${INV}" target="_blank" rel="noopener">${ICO(20)} ENTRAR AL SERVIDOR</a>
<button type="button" class="mg-b" id="mgCopy">🔗 Copiar invitación</button><button type="button" class="mg-b" id="mgShare" hidden>📤 Compartir</button><button type="button" class="mg-b" id="mgInst" hidden>📲 Instalar app</button></div>
<small>${INV.replace(/^https?:\/\//,'')}</small></div></div>`;
{const anchor=IS_FAC?$('footer'):($('#faq')||$('footer'));if(anchor)anchor.before(sec);else D.body.appendChild(sec)}
$('#mgCopy').onclick=async()=>{vib();toast(await copy(INV)?'Invitación copiada 🔗':'Copia: '+INV)};
if(navigator.share){const b=$('#mgShare');b.hidden=false;b.onclick=()=>{vib();navigator.share({title:'Colombia Reals',text:'Únete al Discord de Colombia Reals',url:INV}).catch(()=>{})}}

/* contadores en vivo (si Discord no responde, simplemente no se muestran) */
(async()=>{const box=$('#mgLive');let d=null;
  try{const c=JSON.parse(sessionStorage.getItem('cr_mglive')||'null');if(c&&Date.now()-c.t<6e5)d=c.d}catch(e){}
  if(!d){try{const ac=new AbortController(),to=setTimeout(()=>ac.abort(),6000);const r=await fetch('https://discord.com/api/v9/invites/'+CODE+'?with_counts=true',{signal:ac.signal});clearTimeout(to);if(!r.ok)return;const j=await r.json();d={m:j.approximate_member_count,p:j.approximate_presence_count};try{sessionStorage.setItem('cr_mglive',JSON.stringify({t:Date.now(),d}))}catch(e){}}catch(e){return}}
  if(!d||(!d.m&&!d.p))return;const f=n=>Number(n).toLocaleString('es-CO');
  box.innerHTML=(d.p?`<span><i></i>${f(d.p)} en línea</span>`:'')+(d.m?`<span><i class="g"></i>${f(d.m)} miembros</span>`:'');box.hidden=false})();

/* ======================================================================
   2) INCLINACIÓN 3D de tarjetas: dedo / ratón (y giroscopio, ver abajo)
   ====================================================================== */
const TILT='.item,.casilla,.vc,.ovc,.steps>div,#xNav .cd>div';
const MAX=13;let act=null,pend=null,raf=0;
const gl=e=>{let g=e.querySelector(':scope>.mg-gl');if(!g){g=el('i','mg-gl');g.setAttribute('aria-hidden','true');e.appendChild(g);if(getComputedStyle(e).position==='static')e.style.position='relative'}return g};
const put=(e,x,y)=>{e.style.setProperty('--rx',((.5-y)*2*MAX).toFixed(2)+'deg');e.style.setProperty('--ry',((x-.5)*2*MAX).toFixed(2)+'deg');e.style.setProperty('--mgx',(x*100).toFixed(1)+'%');e.style.setProperty('--mgy',(y*100).toFixed(1)+'%')};
const begin=(e,ev)=>{if(act&&act.el!==e)free(act.el);act={el:e};gl(e);e.classList.remove('mg-rel');e.classList.add('mg-t');upd(ev)};
const upd=ev=>{pend=ev;if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(!act||!pend)return;const r=act.el.getBoundingClientRect();if(!r.width)return;put(act.el,clamp((pend.clientX-r.left)/r.width,0,1),clamp((pend.clientY-r.top)/r.height,0,1))})};
const free=e=>{if(!e)return;e.style.setProperty('--rx','0deg');e.style.setProperty('--ry','0deg');e.classList.add('mg-rel');clearTimeout(e._mt);e._mt=setTimeout(()=>{if(!(act&&act.el===e)&&e!==gyCard){e.classList.remove('mg-t','mg-rel')}},600);if(act&&act.el===e)act=null};
const pick=t=>{const e=t&&t.closest&&t.closest(TILT);return e&&!e.closest('#modal,#cjM,#cfg,#xPan')?e:null};
D.addEventListener('pointerdown',ev=>{if(!on3d()||ev.pointerType==='mouse')return;const e=pick(ev.target);if(e){vib(6);begin(e,ev)}},{passive:true});
D.addEventListener('pointermove',ev=>{if(!on3d())return;
  if(ev.pointerType==='mouse'){const e=pick(ev.target);if(!e){if(act)free(act.el);return}if(!act||act.el!==e)begin(e,ev);else upd(ev)}
  else if(act)upd(ev)},{passive:true});
['pointerup','pointercancel'].forEach(n=>D.addEventListener(n,ev=>{if(act&&ev.pointerType!=='mouse')free(act.el)},{passive:true}));
D.addEventListener('pointerout',ev=>{if(ev.pointerType==='mouse'&&act&&!act.el.contains(ev.relatedTarget))free(act.el)},{passive:true});

/* ======================================================================
   3) GIROSCOPIO: mueve el fondo, el inicio, el cubo, el carrusel y la tarjeta del centro
   ====================================================================== */
let gyRaf=0,gyCard=null,gyT=0;
const heroIn=$('.hero-inner'),cityBg=$('.city-bg');
function gyApply(){gyRaf=0;if(!G.on)return;
  if(heroIn)heroIn.style.transform=`translate3d(${(-G.x*9).toFixed(1)}px,${(-G.y*6).toFixed(1)}px,0) rotateY(${(G.x*5).toFixed(2)}deg) rotateX(${(-G.y*4).toFixed(2)}deg)`;
  if(cityBg)cityBg.style.transform=`translate3d(${(-G.x*12).toFixed(1)}px,${(-G.y*12).toFixed(1)}px,0) scale(1.07)`;
  if(gyCard&&!act){gyCard.style.setProperty('--rx',(-G.y*MAX).toFixed(2)+'deg');gyCard.style.setProperty('--ry',(G.x*MAX).toFixed(2)+'deg');gyCard.style.setProperty('--mgx',(50+G.x*40).toFixed(1)+'%');gyCard.style.setProperty('--mgy',(50+G.y*40).toFixed(1)+'%')}
}
function gyEvent(e){if(e.beta==null&&e.gamma==null)return;
  const ang=(screen.orientation&&screen.orientation.angle)||window.orientation||0;
  let x=0,y=0;if(!ang||ang===180||ang===-180){const s=ang?-1:1;x=s*clamp((e.gamma||0)/32,-1,1);y=s*clamp(((e.beta||0)-(ang?-55:55))/32,-1,1)}
  G.x+=(x-G.x)*.2;G.y+=(y-G.y)*.2;if(!gyRaf)gyRaf=requestAnimationFrame(gyApply)}
function gyPick(){if(!G.on)return;const vh=innerHeight;let best=null,bd=1e9;
  $$('.item,.casilla,.vc,.ovc').forEach(e=>{const r=e.getBoundingClientRect();if(r.bottom<0||r.top>vh||r.width<60)return;const d=Math.abs(r.top+r.height/2-vh/2);if(d<bd){bd=d;best=e}});
  if(best===gyCard)return;const old=gyCard;gyCard=best;if(old&&!(act&&act.el===old)){free(old)}if(best&&!(act&&act.el===best)){gl(best);best.classList.remove('mg-rel');best.classList.add('mg-t')}}
addEventListener('scroll',()=>{if(!G.on||gyT)return;gyT=setTimeout(()=>{gyT=0;gyPick()},140)},{passive:true});
async function gyStart(fromGesture){
  if(typeof DeviceOrientationEvent==='undefined'){toast('Tu navegador no tiene giroscopio');return false}
  try{if(typeof DeviceOrientationEvent.requestPermission==='function'){if(!fromGesture)return false;const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted'){toast('Permiso del giroscopio denegado');return false}}}
  catch(e){toast('No pudimos activar el giroscopio');return false}
  addEventListener('deviceorientation',gyEvent,true);G.on=true;H.classList.add('mg-gyro');gyPick();return true}
function gyStop(){removeEventListener('deviceorientation',gyEvent,true);G.on=false;G.x=G.y=0;H.classList.remove('mg-gyro');
  if(heroIn)heroIn.style.transform='';if(cityBg)cityBg.style.transform='';if(gyCard){free(gyCard);gyCard=null}}
const syncGy=()=>{$$('[data-mg=gyro]').forEach(i=>i.checked=G.on);const b=$('#mgGy');if(b)b.textContent=G.on?'📱 Giroscopio activado · toca para apagar':'📱 Activar giroscopio 3D'};
async function gyToggle(){if(G.on){gyStop();cfg.gyro=0;save();syncGy();return}
  const ok=await gyStart(true);cfg.gyro=ok?1:0;save();syncGy();if(ok){vib(15);toast('Inclina tu celular 📱')}}
if(cfg.gyro){ /* Android: arranca solo; iPhone exige un toque */
  if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission!=='function')gyStart(false).then(syncGy);
  else addEventListener('click',()=>{if(!G.on&&cfg.gyro)gyStart(true).then(syncGy)},{once:true})}

/* ======================================================================
   4) CUBO 3D (arrastra, toca para girar, reacciona al giroscopio)
   ====================================================================== */
{const st=$('#mgStage'),cb=$('#mgCube');
 if(st&&cb){let ry=32,rx=-18,vy=0,vx=0,drag=false,lx=0,ly=0,mv=0,run=false,last=0,seen=true;
  const idleV=()=>(on3d()&&!H.classList.contains('lite')?0.28:0);
  const draw=()=>{cb.style.transform=`rotateX(${(rx-G.y*14).toFixed(2)}deg) rotateY(${(ry+G.x*20).toFixed(2)}deg)`};
  const loop=t=>{run=false;if(!seen||D.hidden){return}const dt=clamp((t-last)/16.67,.2,3);last=t;
    if(!drag){ry+=vy*dt;vy+=(idleV()-vy)*.035*dt;rx+=(-18-rx)*.04*dt;rx+=vx*dt;vx*=.92}
    draw();run=true;requestAnimationFrame(loop)};
  const kick=()=>{if(!run){run=true;last=performance.now();requestAnimationFrame(loop)}};
  st.addEventListener('pointerdown',e=>{drag=true;mv=0;lx=e.clientX;ly=e.clientY;try{st.setPointerCapture(e.pointerId)}catch(x){}st.classList.add('dg');kick()});
  st.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;mv+=Math.abs(dx)+Math.abs(dy);ry+=dx*.65;vy=dx*.55;rx=clamp(rx-dy*.5,-75,75)});
  const up=()=>{if(!drag)return;drag=false;st.classList.remove('dg');if(mv<8){vy=(Math.random()<.5?-1:1)*(16+Math.random()*8);vx=(Math.random()-.5)*4;vib(12)}};
  st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);
  new IntersectionObserver(es=>{seen=es[0].isIntersecting;if(seen)kick()}).observe(st);
  D.addEventListener('visibilitychange',()=>{if(!D.hidden)kick()});draw();kick()}}

/* ======================================================================
   5) CARRUSEL 3D de destacados (solo en el catálogo)
   ====================================================================== */
if(!IS_FAC&&typeof data!=='undefined'&&Array.isArray(data)&&data.length>=4){
 const pool=data.filter(x=>/^(Autos|Ediciones|Motos)/i.test(x.cat));const src=pool.length>=6?pool:data,N=Math.min(8,src.length);
 const items=Array.from({length:N},(_,i)=>src[Math.floor(i*src.length/N)]);
 const s=el('section','mg-sec','');s.id='destacados';
 s.innerHTML=`<h2>Destacados <span>en 3D</span></h2><p>Desliza para girar el carrusel y toca el carro del frente para verlo en grande.</p>
 <div class="mg-rw"><div class="mg-rg" id="mgRg" role="region" aria-label="Carrusel 3D de vehículos destacados"><div class="mg-ring" id="mgRing"></div></div>
 <div class="mg-nav"><button type="button" id="mgPv" aria-label="Anterior">‹</button><div class="mg-cap" id="mgCap" aria-live="polite"></div><button type="button" id="mgNx" aria-label="Siguiente">›</button></div>
 <button type="button" class="mg-b mg-gy" id="mgGy">📱 Activar giroscopio 3D</button><div class="mg-tip">Arrastra · inclina tu celular · toca para abrir</div></div>`;
 const anchor=$('#xNav')||$('.hero');if(anchor)anchor.after(s);else $('main')&&$('main').before(s);
 const rg=$('#mgRg'),ring=$('#mgRing'),cap=$('#mgCap'),step=360/N;
 const cards=items.map((x,i)=>{const a=el('a','',`<img src="assets/catalogo/t/${x.n}.webp" alt="" width="480" height="300" decoding="async" ${i<3?'':'loading="lazy"'}><span></span>`);
   a.querySelector('span').textContent=x.title;a.querySelector('img').alt=x.title;a.href='#catalogo';a.style.setProperty('--a',(i*step)+'deg');a.dataset.i=i;a.setAttribute('role','button');a.setAttribute('aria-label',x.title);ring.appendChild(a);return a});
 let R=0,rot=0,v=0,tgt=null,drag=false,lx=0,mv=0,lastT=0,t0=0,run=false,seen=true,front=-1,down=null;
 const sizeIt=()=>{const w=rg.clientWidth||320,cw=clamp(w*.46,128,230);R=(cw/2)/Math.tan(Math.PI/N)+10;rg.style.setProperty('--cw',cw+'px');ring.style.setProperty('--cw',cw+'px');ring.style.setProperty('--r',R+'px')};
 sizeIt();addEventListener('resize',sizeIt);
 const auto=()=>on3d()&&!H.classList.contains('lite');
 const frontIdx=()=>((Math.round(-rot/step)%N)+N)%N;
 const paint=()=>{ring.style.transform=`translateZ(${-R}px) rotateX(${(-G.y*7).toFixed(2)}deg) rotateY(${(rot+G.x*12).toFixed(2)}deg)`;
   cards.forEach((c,i)=>{const d=Math.abs((((i*step+rot)%360)+540)%360-180);/*0=frente*/c.style.opacity=(.3+.7*Math.max(0,1-d/110)).toFixed(2)});
   const f=frontIdx();if(f!==front){front=f;cap.textContent=items[f].title}};
 const loop=t=>{run=false;if(!seen||D.hidden)return;const dt=clamp((t-lastT)/16.67,.2,3);lastT=t;
   if(!drag){
     if(Math.abs(v)>.12){rot+=v*dt;v*=Math.pow(.94,dt);tgt=null;t0=t}
     else if(tgt!=null){rot+=(tgt-rot)*Math.min(1,.14*dt);if(Math.abs(tgt-rot)<.03){rot=tgt;tgt=null}}
     else if(auto()&&t-t0>3800){rot-=.09*dt;if(!G.on)v=0}
     else{const sn=Math.round(rot/step)*step;rot+=(sn-rot)*Math.min(1,.1*dt)}}
   paint();run=true;requestAnimationFrame(loop)};
 const kick=()=>{if(!run){run=true;lastT=performance.now();requestAnimationFrame(loop)}};
 const goTo=i=>{const cur=rot,base=-i*step;tgt=base+Math.round((cur-base)/360)*360;v=0;t0=performance.now();kick()};
 const move=d=>{tgt=Math.round(rot/step)*step+d*step;v=0;t0=performance.now();kick();vib(8)};
 rg.addEventListener('pointerdown',e=>{drag=true;mv=0;lx=e.clientX;v=0;tgt=null;down=e.target.closest('a');try{rg.setPointerCapture(e.pointerId)}catch(x){}rg.classList.add('dg');t0=performance.now();kick()});
 rg.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx;lx=e.clientX;mv+=Math.abs(dx);rot+=dx*.32;v=dx*.32;t0=performance.now()});
 const up=e=>{if(!drag)return;drag=false;rg.classList.remove('dg');t0=performance.now();
   if(mv<7&&down){const i=+down.dataset.i;if(i===frontIdx()){vib(10);try{list=data;show(data.findIndex(y=>y.n===items[i].n))}catch(x){location.hash='catalogo'}}else{goTo(i);vib(8)}}down=null};
 rg.addEventListener('pointerup',up);rg.addEventListener('pointercancel',()=>{drag=false;rg.classList.remove('dg')});
 rg.addEventListener('click',e=>e.preventDefault(),true);
 rg.tabIndex=0;rg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')move(1);if(e.key==='ArrowRight')move(-1);if(e.key==='Enter'){const i=frontIdx();try{list=data;show(data.findIndex(y=>y.n===items[i].n))}catch(x){}}});
 $('#mgPv').onclick=()=>move(1);$('#mgNx').onclick=()=>move(-1);
 const gb=$('#mgGy');gb.onclick=gyToggle;syncGy();
 new IntersectionObserver(es=>{seen=es[0].isIntersecting;if(seen)kick()}).observe(rg);
 D.addEventListener('visibilitychange',()=>{if(!D.hidden)kick()});paint();kick();
}

/* ======================================================================
   6) VISOR 3D del modal: gira con el dedo, pellizca para zoom, doble toque
   ====================================================================== */
{const m=$('#modal'),im=$('#modalImg'),box=m&&$('.modal-box',m);
 if(m&&im&&box){let rx=0,ry=0,s=1,drag=false,run=false,pts=new Map(),d0=0,s0=1,lt=0,lx=0,ly=0,hintT=0,mvd=0;
  const hint=el('div','mg-hint','👆 Arrastra para girar · ✌ pellizca para zoom · doble toque = acercar');box.appendChild(hint);
  const apply=()=>{im.style.setProperty('--mrx',rx.toFixed(2)+'deg');im.style.setProperty('--mry',ry.toFixed(2)+'deg');im.style.setProperty('--ms',s.toFixed(3));m.classList.toggle('mg-zm',s>1.02)};
  const reset=()=>{rx=ry=0;s=1;apply()};
  const loop=()=>{run=false;if(!m.classList.contains('open')||!im.classList.contains('mg-3d'))return;
    if(!drag){const tx=G.on?-G.y*10:0,ty=G.on?G.x*14:0;rx+=(tx-rx)*.09;ry+=(ty-ry)*.09;if(s<1.02&&Math.abs(rx-tx)<.02&&Math.abs(ry-ty)<.02&&!G.on){rx=tx;ry=ty}}
    apply();run=true;requestAnimationFrame(loop)};
  const kick=()=>{if(!run){run=true;requestAnimationFrame(loop)}};
  const sync=()=>{const on=on3d();im.classList.toggle('mg-3d',on);if(!on){im.style.removeProperty('--mrx');im.style.removeProperty('--mry');im.style.removeProperty('--ms');m.classList.remove('mg-zm')}};
  const open=()=>{sync();reset();if(on3d()){kick();clearTimeout(hintT);hint.classList.add('on');hintT=setTimeout(()=>hint.classList.remove('on'),4200)}};
  new MutationObserver(()=>{if(m.classList.contains('open'))open();else{hint.classList.remove('on');reset()}}).observe(m,{attributes:true,attributeFilter:['class']});
  new MutationObserver(()=>{if(m.classList.contains('open'))reset()}).observe(im,{attributes:true,attributeFilter:['src']});
  im.addEventListener('pointerdown',e=>{if(!im.classList.contains('mg-3d'))return;try{im.setPointerCapture(e.pointerId)}catch(x){}pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1){drag=true;mvd=0;im.classList.add('mg-dg');lx=e.clientX;ly=e.clientY}else mvd=99
    if(pts.size===2){const [a,b]=[...pts.values()];d0=Math.hypot(a.x-b.x,a.y-b.y)||1;s0=s}
    hint.classList.remove('on');kick()});
  im.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2){const [a,b]=[...pts.values()];s=clamp(s0*Math.hypot(a.x-b.x,a.y-b.y)/d0,1,3.2)}
    else if(drag){const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;mvd+=Math.abs(dx)+Math.abs(dy);ry=clamp(ry+dx*.34,-42,42);rx=clamp(rx-dy*.34,-32,32)}});
  const end=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);
    if(!pts.size){drag=false;im.classList.remove('mg-dg');const n=performance.now();if(e.type==='pointerup'&&mvd<8&&n-lt<320){s=s>1.3?1:2.2;vib(10);lt=0}else lt=(mvd<8?n:0)}
    else if(pts.size===1){const [p]=[...pts.values()];lx=p.x;ly=p.y;drag=true}};
  im.addEventListener('pointerup',end);im.addEventListener('pointercancel',end);
  im.addEventListener('wheel',e=>{if(!im.classList.contains('mg-3d'))return;e.preventDefault();s=clamp(s-e.deltaY*.0018,1,3.2)},{passive:false});
  im.addEventListener('dragstart',e=>e.preventDefault());
  if(m.classList.contains('open'))open();
  window.addEventListener('mg:fx',()=>{sync();if(m.classList.contains('open')){reset();kick()}});
 }}

/* ======================================================================
   7) Menú navideño: interruptores nuevos (3D y giroscopio)
   ====================================================================== */
{const pan=$('#xPan');
 if(pan){const sm=$('small',pan),mk=(k,t)=>{const l=el('label','',`${t}<input type="checkbox" data-mg="${k}">`);return l};
  const l1=mk('fx3d','🧊 Efectos 3D'),parts=[l1];if(touchy&&typeof DeviceOrientationEvent!=='undefined')parts.push(mk('gyro','📱 Giroscopio'));
  sm?sm.before(...parts):pan.append(...parts);
  const i1=$('input',l1);i1.checked=!!cfg.fx3d;i1.onchange=()=>{cfg.fx3d=i1.checked?1:0;save();dispatchEvent(new Event('mg:fx'));if(!cfg.fx3d&&act)free(act.el)};
  const i2=$('[data-mg=gyro]',pan);if(i2){i2.checked=G.on;i2.onchange=()=>gyToggle()}}}

/* ======================================================================
   8) App instalable (PWA), avisos de conexión y vibración al tocar
   ====================================================================== */
{const btn=$('#mgInst'),standalone=matchMedia('(display-mode:standalone)').matches||navigator.standalone;let dip=null;
 const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
 if(!standalone&&btn){
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;btn.hidden=false});
  if(ios){btn.hidden=false;btn.textContent='📲 Cómo instalar'}
  btn.onclick=async()=>{vib();if(dip){dip.prompt();try{await dip.userChoice}catch(e){}dip=null;btn.hidden=true}else toast('Toca Compartir ⬆ y luego “Añadir a pantalla de inicio”')};
  addEventListener('appinstalled',()=>{btn.hidden=true;toast('¡App instalada! 🎉')})}}
addEventListener('offline',()=>toast('Sin conexión: mostrando la copia guardada 📴'));
addEventListener('online',()=>toast('Conexión recuperada ✅'));
if(touchy)D.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.btn,.filter,.mg-b,#xBar a,.fav'))vib(6)},{passive:true});

/* primera vez en un celular: pista corta */
if(touchy&&on3d()){try{if(!localStorage.getItem('cr_mg_hint')){localStorage.setItem('cr_mg_hint',1);setTimeout(()=>toast('✨ Toca y arrastra las tarjetas: se inclinan en 3D'),3500)}}catch(e){}}
})();
