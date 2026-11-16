(()=>{'use strict';
/* Colombia Reals PRO · Centro de cuenta. Sin librerías. Todo falla en silencio: nunca rompe el catálogo. */
const D=document,H=D.documentElement,CFG=window.CR||{},API=(CFG.apiUrl||'')+'/api',KEY='cr_pro_v1',PLUS='cr_plus_v1';
const $=(s,r=D)=>r.querySelector(s),E=v=>String(v??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const day=(t=Date.now())=>{const d=new Date(t-5*36e5);return d.toISOString().slice(0,10)};
const rd=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
const S=Object.assign({theme:'dark',notifs:[],tickets:[],log:[],days:[],seen:{}},rd(KEY,{}));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}};
const plus=()=>Object.assign({cart:[],fav:[],orders:[],ach:[]},rd(PLUS,{}));
const tok=()=>{try{const t=JSON.parse(localStorage.getItem('cr_sess')||'null');return t&&t.e>Date.now()?t.t:''}catch{return ''}};
const api=async p=>{const t=tok();if(!t)return null;try{const r=await fetch(API+p,{headers:{Authorization:'Bearer '+t}});return r.ok?await r.json():null}catch{return null}};
const fmt=t=>new Date(t).toLocaleString('es-CO',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
let net={claimed:[],assigned:[],user:null};

/* ---------- Modo oscuro / claro ---------- */
const applyTheme=()=>{H.classList.toggle('cr-light',S.theme==='light');const m=$('meta[name=theme-color]');if(m)m.content=S.theme==='light'?'#f6f0f1':'#090506'};
const logAct=t=>{S.log.unshift({t,at:Date.now()});S.log=S.log.slice(0,40);save()};
const toggleTheme=()=>{S.theme=S.theme==='light'?'dark':'light';applyTheme();logAct(S.theme==='light'?'Activaste el modo ligero':'Activaste el modo oscuro');save()};
applyTheme();

/* ---------- Notificaciones ---------- */
const notify=(id,t,m)=>{if(S.seen['n:'+id])return;S.seen['n:'+id]=1;S.notifs.unshift({id,t,m,at:Date.now(),read:0});S.notifs=S.notifs.slice(0,50);save();badge()};
const unread=()=>S.notifs.filter(n=>!n.read).length;
function badge(){const b=$('#crproBell');if(!b)return;const n=unread();b.classList.toggle('has',n>0);$('b',b).textContent=n>9?'9+':n}
async function sync(){
  const m=await api('/mine');if(m){net={claimed:m.claimed||[],assigned:m.assigned||[],user:m.user||null};
    net.claimed.forEach(c=>{const k=c.code+':'+c.at;if(c.delivered)notify('del:'+k,'📦 Pedido entregado','Tu canje '+c.reward+' ya fue entregado.')});
    net.assigned.forEach(c=>notify('as:'+c.code,'🎁 Tienes un código personal',c.reward+' · código '+c.code+(c.exp?' · vence '+c.exp:'')))}
  const f=await api('/flash');if(f&&f.flash)notify('fl:'+f.flash.title+f.flash.end,'⚡ '+f.flash.title,f.flash.text||'Oferta relámpago activa.');
  const d=await (async()=>{try{const r=await fetch(API+'/daily');return r.ok?r.json():null}catch{return null}})();
  if(d&&d.ok&&d.left>0)notify('day:'+d.date,'🎄 Código del día','Hoy hay '+d.left+' cupos: '+d.reward+'.');
  achieve();badge()}

/* ---------- Estadísticas y logros ---------- */
function stats(){const p=plus();return{fav:p.fav.length,cart:p.cart.length,orders:p.orders.length,claimed:net.claimed.length,
  delivered:net.claimed.filter(c=>c.delivered).length,pending:net.claimed.filter(c=>!c.delivered).length,
  visits:S.days.length,tickets:S.tickets.length,notifs:S.notifs.length}}
const ACH=[
 ['visita','👋 Bienvenido','Entra al catálogo',s=>s.visits>=1,s=>s.visits,1],
 ['fav','♥ Coleccionista','Guarda 3 favoritos',s=>s.fav>=3,s=>s.fav,3],
 ['fav10','💖 Gran gusto','Guarda 10 favoritos',s=>s.fav>=10,s=>s.fav,10],
 ['cart','🛒 Primer carrito','Añade un producto al carrito',s=>s.cart>=1,s=>s.cart,1],
 ['ped','🎫 Pedido preparado','Prepara un pedido',s=>s.orders>=1,s=>s.orders,1],
 ['can','🎁 Primer canje','Canjea un código',s=>s.claimed>=1,s=>s.claimed,1],
 ['ent','📦 Entrega recibida','Recibe una entrega',s=>s.delivered>=1,s=>s.delivered,1],
 ['v3','🔥 Constante','Visita 3 días distintos',s=>s.visits>=3,s=>s.visits,3],
 ['v7','🏅 Fiel','Visita 7 días distintos',s=>s.visits>=7,s=>s.visits,7],
 ['tk','🛟 Pidió ayuda','Crea un ticket de soporte',s=>s.tickets>=1,s=>s.tickets,1],
 ['nav','🎄 Espíritu navideño','Entra en diciembre',()=>new Date().getMonth()===11,()=>new Date().getMonth()===11?1:0,1],
 ['tema','🌙 A tu estilo','Cambia el modo claro/oscuro',()=>S.log.some(l=>/modo (ligero|oscuro)/.test(l.t)),()=>S.log.some(l=>/modo (ligero|oscuro)/.test(l.t))?1:0,1]];
function achieve(){const s=stats();S.ach=S.ach||{};ACH.forEach(([id,t,d,ok])=>{if(ok(s)&&!S.ach[id]){S.ach[id]=Date.now();notify('ach:'+id,'🏆 Logro desbloqueado',t.replace(/^\S+\s/,'')+' · '+d);logAct('Logro: '+t)}});save()}

/* ---------- Ventana (modal) ---------- */
function modal(title,body){const old=$('#crproOv');if(old)old.remove();const o=D.createElement('div');o.id='crproOv';o.className='crpro-ov';
  o.innerHTML='<section class="crpro-box" role="dialog" aria-modal="true"><button class="crpro-x" aria-label="Cerrar">×</button><h2>'+title+'</h2>'+body+'</section>';
  D.body.append(o);requestAnimationFrame(()=>o.classList.add('on'));
  const close=()=>{o.remove();D.removeEventListener('keydown',esc)},esc=e=>{if(e.key==='Escape')close()};
  o.addEventListener('click',e=>{if(e.target===o||e.target.closest('.crpro-x'))close()});D.addEventListener('keydown',esc);return o}

const TABS=[['perfil','👤 Perfil'],['notif','🔔 Avisos'],['seg','📦 Seguimiento'],['tk','🎫 Soporte'],['act','📊 Actividad'],['logros','🏆 Logros']];
function hub(tab='perfil'){
  const o=modal('Mi centro','<div class="crpro-tabs">'+TABS.map(([k,t])=>'<button data-t="'+k+'" class="'+(k===tab?'on':'')+'">'+t+(k==='notif'&&unread()?' ('+unread()+')':'')+'</button>').join('')+'</div><div id="crproBody"></div>');
  const show=k=>{$('#crproBody',o).innerHTML=VIEWS[k]();o.querySelectorAll('.crpro-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===k));
    if(k==='notif'){S.notifs.forEach(n=>n.read=1);save();badge()}wire(o,k,show)};
  o.querySelector('.crpro-tabs').onclick=e=>{const b=e.target.closest('button');if(b)show(b.dataset.t)};show(tab)}

const VIEWS={
 perfil(){const u=net.user||window.crMe||{},s=stats(),av=u.avatar&&/^https:\/\/cdn\.discordapp\.com\//.test(u.avatar)?'<img src="'+E(u.avatar)+'" alt="" width="56" height="56" style="border-radius:50%">':'<div class="crpro-st" style="width:56px;height:56px;padding:14px">'+E((u.name||'CR').slice(0,2).toUpperCase())+'</div>';
  return '<div style="display:flex;gap:12px;align-items:center">'+av+'<div><b style="font-size:18px">'+E(u.name||'Invitado')+'</b><div class="crpro-muted">'+(tok()?'Discord conectado':'Inicia sesión con Discord para ver tus canjes')+'</div></div></div>'+
  '<h3>Resumen</h3><div class="crpro-grid"><div class="crpro-st"><b>'+s.fav+'</b>Favoritos</div><div class="crpro-st"><b>'+s.cart+'</b>Carrito</div><div class="crpro-st"><b>'+s.claimed+'</b>Canjes</div><div class="crpro-st"><b>'+s.visits+'</b>Días de visita</div><div class="crpro-st"><b>'+Object.keys(S.ach||{}).length+'/'+ACH.length+'</b>Logros</div></div>'+
  '<h3>Apariencia</h3><button class="crpro-btn" data-act="theme">'+(S.theme==='light'?'🌙 Cambiar a modo oscuro':'☀️ Cambiar a modo ligero')+'</button>'},
 notif(){return S.notifs.length?'<div class="crpro-list">'+S.notifs.map(n=>'<div class="crpro-it'+(n.read?'':' unread')+'"><div><b>'+E(n.t)+'</b><small>'+E(n.m)+'</small></div><small>'+fmt(n.at)+'</small></div>').join('')+'</div><p><button class="crpro-btn" data-act="clearN">Borrar avisos</button></p>':'<p class="crpro-muted">No tienes avisos todavía. Te avisaremos de entregas, códigos y ofertas.</p>'},
 seg(){if(!tok())return '<p class="crpro-muted">Inicia sesión con Discord para ver el seguimiento de tus canjes.</p>';
  return net.claimed.length?'<div class="crpro-list">'+net.claimed.map(c=>{const late=!c.delivered&&Date.now()-c.at>864e5;
   return '<div class="crpro-it" style="display:block"><b>'+E(c.reward)+'</b> <small>Código '+E(c.code)+' · '+fmt(c.at)+'</small><ol class="crpro-tl"><li class="ok">✔ Canjeado</li><li class="'+(c.delivered?'ok':late?'warn':'ok')+'">'+(late?'⚠ En revisión (+24 h)':'✔ En revisión')+'</li><li class="'+(c.delivered?'ok':'')+'">'+(c.delivered?'✔ Entregado':'⏳ Pendiente')+'</li></ol>'+(late?'<p class="crpro-muted">Pasaron más de 24 horas. Abre un ticket y nuestro staff lo revisa.</p>':'')+'</div>'}).join('')+'</div>':'<p class="crpro-muted">Aún no tienes canjes. Cuando canjees un código verás aquí cada paso de tu entrega.</p>'},
 tk(){return '<form class="crpro-f" id="crproTk"><select name="cat"><option>Compra</option><option>Entrega pendiente</option><option>Problema con un código</option><option>Soporte técnico</option><option>Otro</option></select><select name="ref"><option value="">Sin código asociado</option>'+net.claimed.map(c=>'<option>'+E(c.code)+'</option>').join('')+'</select><input name="sub" maxlength="80" placeholder="Asunto" required><textarea name="desc" maxlength="800" placeholder="Cuéntanos qué pasó" required></textarea><button class="crpro-btn p" type="submit">🎫 Crear ticket y abrir Discord</button></form>'+
  '<p class="crpro-muted">Los tickets se atienden en el canal de Discord del servidor: aquí se prepara el mensaje (se copia solo) y queda tu historial.</p><h3>Mis tickets</h3>'+(S.tickets.length?'<div class="crpro-list">'+S.tickets.map((t,i)=>'<div class="crpro-it"><div><b>#'+t.id+' · '+E(t.sub)+'</b><small>'+E(t.cat)+(t.ref?' · '+E(t.ref):'')+' · '+fmt(t.at)+'</small></div><button class="crpro-btn" data-act="tk" data-i="'+i+'">'+(t.done?'✅ Resuelto':'Marcar resuelto')+'</button></div>').join('')+'</div>':'<p class="crpro-muted">Aún no has creado tickets.</p>')},
 act(){const s=stats(),last=[...Array(7)].map((_,i)=>day(Date.now()-(6-i)*864e5)),mx=1;
  return '<div class="crpro-grid"><div class="crpro-st"><b>'+s.claimed+'</b>Canjes</div><div class="crpro-st"><b>'+s.delivered+'</b>Entregados</div><div class="crpro-st"><b>'+s.pending+'</b>Pendientes</div><div class="crpro-st"><b>'+s.tickets+'</b>Tickets</div></div><h3>Visitas (7 días)</h3><div class="crpro-bars" style="margin-bottom:22px">'+last.map(d=>{const v=S.days.includes(d)?1:0;return '<i class="'+(v?'':'z')+'" style="height:'+(v?100:6)+'%"><span>'+d.slice(8)+'</span></i>'}).join('')+'</div><h3>Actividad reciente</h3>'+(S.log.length?'<div class="crpro-list">'+S.log.slice(0,12).map(l=>'<div class="crpro-it"><span>'+E(l.t)+'</span><small>'+fmt(l.at)+'</small></div>').join('')+'</div>':'<p class="crpro-muted">Tu actividad aparecerá aquí.</p>')},
 logros(){const s=stats();S.ach=S.ach||{};return '<div class="crpro-list">'+ACH.map(([id,t,d,ok,pr,goal])=>{const got=!!S.ach[id],v=Math.min(goal,pr(s));return '<div class="crpro-it crpro-ach'+(got?' ok':'')+'" style="display:block"><b>'+(got?'🏅 ':'🔒 ')+E(t)+'</b> <small>'+E(d)+(got?' · '+fmt(S.ach[id]):' · '+v+'/'+goal)+'</small><div class="crpro-bar"><i style="width:'+Math.round(v/goal*100)+'%"></i></div></div>'}).join('')+'</div>'}
};
function wire(o,k,show){
  o.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const a=b.dataset.act;
    if(a==='theme'){toggleTheme();show(k)}
    if(a==='clearN'){S.notifs=[];save();badge();show(k)}
    if(a==='tk'){const t=S.tickets[+b.dataset.i];if(t){t.done=!t.done;save();show(k)}}});
  const f=$('#crproTk',o);if(f)f.onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(f)),id=String(Date.now()).slice(-5),u=(net.user||window.crMe||{}).name||'Invitado';
    const msg='🎫 TICKET #'+id+'\nUsuario: '+u+'\nCategoría: '+v.cat+(v.ref?'\nCódigo: '+v.ref:'')+'\nAsunto: '+v.sub+'\nDetalle: '+v.desc;
    S.tickets.unshift({id,cat:v.cat,ref:v.ref,sub:v.sub,desc:v.desc,at:Date.now()});logAct('Creaste el ticket #'+id);achieve();save();
    try{navigator.clipboard.writeText(msg)}catch{}const url=CFG.ticketUrl||CFG.invite;if(url)window.open(url,'_blank','noopener');show('tk')}}

/* ---------- Instalación en la página ---------- */
function mount(){
  const nav=$('header nav')||$('header');if(nav&&!$('#crproBell')){const b=D.createElement('button');b.id='crproBell';b.type='button';b.className='crpro-bell';b.setAttribute('aria-label','Mi centro y notificaciones');b.innerHTML='🔔<b>0</b>';b.onclick=()=>hub(unread()?'notif':'perfil');nav.after(b);badge()}
  const tools=$('#crpTools');if(tools&&!$('#crproHub',tools)){const b=D.createElement('button');b.id='crproHub';b.type='button';b.textContent='🧰 Mi centro';b.onclick=()=>{const m=$('#lgA');if(m)m.classList.remove('open');hub()};tools.prepend(b)}}
/* los botones Perfil y Logros de colombia-plus abren el centro nuevo */
D.addEventListener('click',e=>{const b=e.target.closest('#crpProfile,#crpAch');if(!b)return;e.stopImmediatePropagation();e.preventDefault();const m=$('#lgA');if(m)m.classList.remove('open');hub(b.id==='crpAch'?'logros':'perfil')},true);

function boot(){const t=day();if(!S.days.includes(t)){S.days.push(t);S.days=S.days.slice(-60);logAct('Visitaste el catálogo')}
  mount();let q=0;new MutationObserver(()=>{if(q)return;q=setTimeout(()=>{q=0;mount()},300)}).observe(D.body,{childList:true,subtree:true});
  sync().catch(()=>{});setInterval(()=>{sync().catch(()=>{})},180000);achieve();
  if(/#(centro|soporte|seguimiento)$/.test(location.hash))hub(location.hash==='#soporte'?'tk':location.hash==='#seguimiento'?'seg':'perfil')}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
})();
