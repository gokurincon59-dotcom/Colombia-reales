/* Colombia Reals Plus · módulos ordenados. Todo se guarda por usuario en localStorage. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CFG=window.CR||{};

/* ===== 1. ALMACÉN (por usuario) ===== */
const uid=()=>(window.crMe&&window.crMe.id)||'invitado';
const K=k=>`crp_${uid()}_${k}`;
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(K(k)))??d}catch{return d}};
const set=(k,v)=>{try{localStorage.setItem(K(k),JSON.stringify(v))}catch{}};

/* ===== 2. AVISOS Y NOTIFICACIONES ===== */
function toast(t){const e=$('#cr-toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2400)}
function notify(t){const n=get('notif',[]);n.unshift({t,d:Date.now(),r:0});set('notif',n.slice(0,40));toast('🔔 '+t);badges()}

/* ===== 3. LOGROS ===== */
const LOGROS={primero:['🌟','Primera visita'],fav3:['♥','3 favoritos'],carro:['🛒','Primer pedido'],ticket:['🎫','Abriste un ticket'],regalo:['🎁','Reclamaste un regalo'],noche:['🌙','Probaste el modo oscuro/ligero'],visitas5:['🏆','5 visitas']};
function logro(id){const l=get('logros',[]);if(l.includes(id)||!LOGROS[id])return;l.push(id);set('logros',l);notify(`Logro: ${LOGROS[id][0]} ${LOGROS[id][1]}`)}

/* ===== 4. TEMA OSCURO / LIGERO ===== */
function tema(t){document.documentElement.dataset.crt=t;localStorage.setItem('crp_tema',t)}
tema(localStorage.getItem('crp_tema')||'dark');

/* ===== 5. NAVIDAD CONFIGURABLE ===== */
const fx=()=>Object.assign({nieve:true,densidad:50,luces:true},JSON.parse(localStorage.getItem('crp_fx')||'{}'));
let snowT;function nieve(){clearInterval(snowT);$$('.cr-snow').forEach(e=>e.remove());const f=fx();if(!f.nieve)return;
 snowT=setInterval(()=>{const e=document.createElement('span');e.className='cr-snow';e.textContent='❄';e.style.left=Math.random()*100+'vw';e.style.fontSize=8+Math.random()*12+'px';e.style.animationDuration=6+Math.random()*6+'s';document.body.appendChild(e);setTimeout(()=>e.remove(),12000)},Math.max(120,1500-f.densidad*14))}

/* ===== 6. FAVORITOS Y CARRITO (botones sobre las tarjetas) ===== */
const favs=()=>get('favs',[]),cart=()=>get('cart',[]);
function cardId(c){const i=$('img',c);const m=i&&(i.currentSrc||i.src||'').match(/catalogo\/(?:t\/)?(\d+)\.webp/);return m?m[1]:null}
function cardName(c){const h=$('h3,h2,h4,strong',c);return h?h.textContent.trim():'Ítem '+cardId(c)}
function decorar(){$$('#grid > *').forEach(c=>{const id=cardId(c);if(!id||c.dataset.crd)return;c.dataset.crd=id;if(getComputedStyle(c).position==='static')c.style.position='relative';
 const q=document.createElement('div');q.className='cr-qa';q.innerHTML=`<button data-a="f" aria-label="Favorito">♥</button><button data-a="c" aria-label="Agregar al carrito">🛒</button>`;c.appendChild(q)});
 const F=favs();$$('#grid > [data-crd]').forEach(c=>$('[data-a=f]',c)?.classList.toggle('on',F.includes(c.dataset.crd)))}
document.addEventListener('click',e=>{const b=e.target.closest('.cr-qa button');if(!b)return;e.preventDefault();e.stopPropagation();const c=b.closest('[data-crd]'),id=c.dataset.crd;
 if(b.dataset.a==='f'){let F=favs();F=F.includes(id)?F.filter(x=>x!==id):[...F,id];set('favs',F);toast(F.includes(id)?'♥ Guardado en favoritos':'Quitado de favoritos');if(F.length>=3)logro('fav3')}
 else{const C=cart();if(!C.find(x=>x.id===id)){C.push({id,n:cardName(c)});set('cart',C);toast('🛒 Agregado al carrito')}else toast('Ya está en tu carrito')}
 decorar();badges()},true);

/* ===== 7. BUSCADOR Y FILTROS ===== */
function barra(){const g=$('#grid');if(!g||$('#cr-bar'))return;const b=document.createElement('div');b.id='cr-bar';
 b.innerHTML=`<input id="cr-q" type="search" placeholder="🔎 Buscar por nombre…" aria-label="Buscar"><button class="cr-b g" id="cr-ff">♥ Solo favoritos</button><button class="cr-b g" id="cr-cl">Limpiar</button>`;g.parentNode.insertBefore(b,g);
 const run=()=>{const q=$('#cr-q').value.toLowerCase().trim(),only=$('#cr-ff').classList.contains('on'),F=favs();$$('#grid > [data-crd]').forEach(c=>{c.style.display=(!q||c.textContent.toLowerCase().includes(q))&&(!only||F.includes(c.dataset.crd))?'':'none'})};
 $('#cr-q').oninput=run;$('#cr-ff').onclick=e=>{e.target.classList.toggle('on');e.target.style.outline=e.target.classList.contains('on')?'2px solid var(--cr-ac)':'';run()};
 $('#cr-cl').onclick=()=>{$('#cr-q').value='';$('#cr-ff').classList.remove('on');$('#cr-ff').style.outline='';run()}}

/* ===== 8. PANEL LATERAL (pestañas) ===== */
const ESTADOS=['Recibido','En revisión','Preparando','Entregado'];
const fecha=d=>new Date(d).toLocaleString('es-CO',{dateStyle:'short',timeStyle:'short'});
const VISTAS={
 perfil(){const m=window.crMe;if(!m)return`<div class="cr-c">Inicia sesión con Discord para ver tu perfil.<button class="cr-b" onclick="location.href='login.html'">Entrar con Discord</button></div>`;
  return`<div class="cr-c"><div class="cr-row"><b>${esc(m.name)}</b><span>${m.vip?'💎 VIP':'Miembro'}</span></div><small>Visitas: ${m.visits||1} · Desde ${new Date(m.joined||Date.now()).toLocaleDateString('es-CO')}</small></div>
  <div class="cr-c">Favoritos: <b>${favs().length}</b> · Pedidos: <b>${get('orders',[]).length}</b> · Logros: <b>${get('logros',[]).length}/${Object.keys(LOGROS).length}</b></div>`},
 favoritos(){const F=favs();return F.length?F.map(id=>`<div class="cr-c cr-row"><span>♥ Ítem #${id}</span><button class="cr-b g" data-do="unfav" data-id="${id}">Quitar</button></div>`).join(''):'<div class="cr-c">Aún no tienes favoritos. Toca ♥ en una tarjeta.</div>'},
 carrito(){const C=cart();return C.length?C.map(x=>`<div class="cr-c cr-row"><span>${esc(x.n)}</span><button class="cr-b g" data-do="rm" data-id="${x.id}">✕</button></div>`).join('')+`<button class="cr-b" data-do="pedir">Crear pedido y abrir ticket</button>`:'<div class="cr-c">Tu carrito está vacío.</div>'},
 avisos(){const n=get('notif',[]);n.forEach(x=>x.r=1);set('notif',n);badges();return n.length?n.map(x=>`<div class="cr-c">${esc(x.t)}<small>${fecha(x.d)}</small></div>`).join(''):'<div class="cr-c">Sin notificaciones.</div>'},
 eventos(){const h=new Date(),d=h.getMonth()===11?h.getDate():0,ok=d>=1&&d<=25,hecho=get('adv',[]).includes(d);
  const ev=[['12-07','🕯️ Noche de Velitas'],['12-16','🎶 Novenas'],['12-24','🎄 Nochebuena'],['12-25','🎁 Navidad'],['12-31','🎆 Fin de año']].map(e=>`<div class="cr-c cr-row"><span>${e[1]}</span><small>${e[0]}</small></div>`).join('');
  return`<div class="cr-c"><b>🎁 Regalo de Adviento</b>${ok?`<button class="cr-b" data-do="regalo" ${hecho?'disabled':''}>${hecho?'Ya reclamado hoy':'Reclamar regalo del día '+d}</button>`:'<small>Disponible del 1 al 25 de diciembre.</small>'}</div>`+ev},
 soporte(){const T=get('tickets',[]);return`<div class="cr-c"><select id="cr-tt"><option>Compra</option><option>Entrega</option><option>VIP</option><option>Otro</option></select><textarea id="cr-td" rows="3" placeholder="Describe tu caso"></textarea><button class="cr-b" data-do="ticket">Registrar y abrir ticket en Discord</button></div>`+T.map(t=>`<div class="cr-c"><div class="cr-row"><b>#${t.n} · ${esc(t.c)}</b><small>${fecha(t.d)}</small></div>${esc(t.m)}</div>`).join('')},
 entregas(){const O=get('orders',[]);return O.length?O.map(o=>`<div class="cr-c"><div class="cr-row"><b>Pedido #${o.n}</b><small>${fecha(o.d)}</small></div><small>${o.i.map(esc).join(', ')}</small><div class="cr-step">${ESTADOS.map((_,i)=>`<i class="${i<=o.s?'on':''}"></i>`).join('')}</div><div class="cr-row"><b>${ESTADOS[o.s]}</b>${o.s<3?`<button class="cr-b g" data-do="avanza" data-id="${o.n}">Avanzar</button>`:''}</div></div>`).join(''):'<div class="cr-c">Sin pedidos aún.</div>'},
 stats(){const a=get('act',{});return`<div class="cr-c">Visitas a este dispositivo: <b>${a.v||0}</b></div><div class="cr-c">Favoritos <b>${favs().length}</b> · Carrito <b>${cart().length}</b></div><div class="cr-c">Últimos movimientos<small>${(a.l||[]).map(x=>esc(x)).join('<br>')||'—'}</small></div>`},
 logros(){const l=get('logros',[]);return Object.entries(LOGROS).map(([k,v])=>`<div class="cr-c cr-row" style="opacity:${l.includes(k)?1:.4}"><span>${v[0]} ${v[1]}</span><span>${l.includes(k)?'✔':'🔒'}</span></div>`).join('')},
 ajustes(){const f=fx(),t=document.documentElement.dataset.crt;return`<div class="cr-c cr-row"><span>Tema</span><button class="cr-b g" data-do="tema">${t==='dark'?'🌙 Oscuro':'☀️ Ligero'}</button></div><div class="cr-c"><label><input type="checkbox" id="cr-n" ${f.nieve?'checked':''} style="width:auto"> ❄ Nieve</label><label>Densidad <input type="range" id="cr-d" min="0" max="100" value="${f.densidad}"></label></div><div class="cr-c"><button class="cr-b g" id="cr-pwa">📲 Instalar como aplicación</button></div>`}};
const TABS=[['perfil','👤 Perfil'],['favoritos','♥ Favoritos'],['carrito','🛒 Carrito'],['avisos','🔔 Avisos'],['eventos','🎁 Eventos'],['soporte','🎫 Soporte'],['entregas','📦 Entregas'],['stats','📊 Actividad'],['logros','🏆 Logros'],['ajustes','⚙ Ajustes']];
let tab='perfil';
function pintar(){$('#cr-tabs').innerHTML=TABS.map(t=>`<button class="${t[0]===tab?'on':''}" data-tab="${t[0]}">${t[1]}</button>`).join('');$('#cr-body').innerHTML=VISTAS[tab]();
 const n=$('#cr-n');if(n){n.onchange=()=>{const f=fx();f.nieve=n.checked;localStorage.setItem('crp_fx',JSON.stringify(f));nieve()};$('#cr-d').onchange=e=>{const f=fx();f.densidad=+e.target.value;localStorage.setItem('crp_fx',JSON.stringify(f));nieve()}}
 const p=$('#cr-pwa');if(p)p.onclick=async()=>{if(!window.__crInst)return toast('Usa «Agregar a pantalla de inicio» en el menú del navegador');window.__crInst.prompt();window.__crInst=null}}
function abrir(t){tab=t||tab;$('#cr-panel').classList.add('on');pintar()}
function actividad(t){const a=get('act',{v:0,l:[]});a.l=[`${fecha(Date.now())} · ${t}`,...(a.l||[])].slice(0,8);set('act',a)}

document.addEventListener('click',e=>{
 const t=e.target.closest('[data-tab]');if(t){tab=t.dataset.tab;pintar();return}
 const x=e.target.closest('[data-do]');if(!x)return;const a=x.dataset.do,id=x.dataset.id;
 if(a==='unfav')set('favs',favs().filter(i=>i!==id));
 if(a==='rm')set('cart',cart().filter(i=>i.id!==id));
 if(a==='tema'){tema(document.documentElement.dataset.crt==='dark'?'light':'dark');logro('noche')}
 if(a==='regalo'){const A=get('adv',[]);A.push(new Date().getDate());set('adv',A);logro('regalo');notify('🎁 Regalo reclamado: abre un ticket para recibirlo')}
 if(a==='avanza'){const O=get('orders',[]);const o=O.find(o=>o.n==id);if(o&&o.s<3){o.s++;set('orders',O);notify(`Pedido #${o.n}: ${ESTADOS[o.s]}`)}}
 if(a==='pedir'){const C=cart(),O=get('orders',[]),n=O.length+1;O.unshift({n,d:Date.now(),s:0,i:C.map(c=>c.n)});set('orders',O);set('cart',[]);logro('carro');actividad('Pedido #'+n);notify('Pedido #'+n+' creado');if(CFG.ticketUrl)window.open(CFG.ticketUrl,'_blank','noopener');tab='entregas'}
 if(a==='ticket'){const m=$('#cr-td').value.trim();if(!m)return toast('Describe tu caso');const T=get('tickets',[]);T.unshift({n:T.length+1,c:$('#cr-tt').value,m,d:Date.now()});set('tickets',T);logro('ticket');actividad('Ticket registrado');notify('Ticket registrado');if(CFG.ticketUrl)window.open(CFG.ticketUrl,'_blank','noopener')}
 pintar();decorar();badges()});

/* ===== 9. INSIGNIAS DEL DOCK ===== */
function badges(){const s={'cr-bf':favs().length,'cr-bc':cart().length,'cr-bn':get('notif',[]).filter(n=>!n.r).length};
 for(const k in s){const e=$('#'+k);if(e){e.textContent=s[k];e.style.display=s[k]?'':'none'}}}

/* ===== 10. ARRANQUE ===== */
function init(){
 const d=document.createElement('div');d.id='cr-dock';
 d.innerHTML=`<button data-open="favoritos" aria-label="Favoritos">♥<b id="cr-bf"></b></button><button data-open="carrito" aria-label="Carrito">🛒<b id="cr-bc"></b></button><button data-open="avisos" aria-label="Avisos">🔔<b id="cr-bn"></b></button><button data-open="perfil" aria-label="Menú">☰</button>`;
 const p=document.createElement('aside');p.id='cr-panel';p.setAttribute('aria-label','Centro Colombia Reals');p.innerHTML=`<header><b>Centro Colombia Reals</b><button class="cr-b g" id="cr-x" aria-label="Cerrar">✕</button></header><nav id="cr-tabs"></nav><div id="cr-body"></div>`;
 const t=document.createElement('div');t.id='cr-toast';t.setAttribute('role','status');document.body.append(d,p,t);
 d.onclick=e=>{const b=e.target.closest('[data-open]');if(b)abrir(b.dataset.open)};$('#cr-x').onclick=()=>p.classList.remove('on');
 barra();decorar();new MutationObserver(()=>{decorar();barra()}).observe(document.body,{childList:true,subtree:true});
 const a=get('act',{v:0,l:[]});a.v=(a.v||0)+1;set('act',a);logro('primero');if(a.v>=5)logro('visitas5');
 nieve();badges();
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__crInst={prompt:()=>e.prompt()}});
 document.addEventListener('cr:login',()=>{decorar();badges();notify('Bienvenido a Colombia Reals')});
 if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')p.classList.remove('on')})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
