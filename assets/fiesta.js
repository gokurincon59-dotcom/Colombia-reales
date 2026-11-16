/* ===== FIESTA · retención y ventas =====
   Código del día · Racha de visitas · Ruleta diaria · Lista de deseos · Armar combo · Regalar
   Cupos "Quedan X" · Los más pedidos · Adviento con cuenta regresiva · Resumen del año.
   Todo lo que necesita servidor (/api/*) se oculta solo si el servidor no responde.
   Opciones en assets/config.js → window.CR.fiesta = { stock:{}, precios:{}, comboDescuento:{}, resumen:{} } */
(()=>{'use strict';
const D=document,H=D.documentElement,C=window.CR||{},F=Object.assign({stock:{},precios:{},comboDescuento:{},resumen:{}},C.fiesta||{});
const $=(s,r)=>(r||D).querySelector(s),$$=(s,r)=>[...(r||D).querySelectorAll(s)];
const el=(t,c,h)=>{const e=D.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p2=v=>String(v).padStart(2,'0');
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const tok=()=>{const t=ld('cr_sess',null);return t&&t.e>Date.now()?t.t:''};
const cop=v=>'$'+Math.round(v).toLocaleString('es-CO');
const copy=t=>{try{navigator.clipboard.writeText(t)}catch(e){}};
const season=()=>window.CRSeason||'xmas';
const items=()=>{try{return data}catch(e){return []}};
const itemOf=n=>items().find(x=>x.n==n);
const titleOf=n=>{const x=itemOf(n);return x?x.title:'Ítem '+n};
const me=()=>{const m=window.crMe;return m?' · Discord: '+m.name+(m.guest?'':' ('+m.id+')'):''};
const ticketUrl=()=>C.ticketUrl||C.invite||'#';
const T=m=>{let t=$('#crt');if(!t){t=el('div');t.id='crt';D.body.appendChild(t)}t.textContent=m;t.classList.add('show');clearTimeout(T.t);T.t=setTimeout(()=>t.classList.remove('show'),3200)};
const toTicket=txt=>{copy(txt+me());T('Copiamos tu pedido, pégalo en el ticket 🎫');if(ticketUrl()!=='#')window.open(ticketUrl(),'_blank','noopener')};
const dbg=e=>{if(window.__fsDebug||/[?&]fsdebug=1/.test(location.search))console.error('[fiesta]',e)};
const safe=fn=>{try{const r=fn();if(r&&r.catch)r.catch(dbg)}catch(e){dbg(e)}};

async function api(p,opt){
  const h={'content-type':'application/json'},t=tok();if(t)h.Authorization='Bearer '+t;
  let r;try{r=await fetch((C.apiUrl||'')+'/api'+p,{...opt,headers:h})}catch(e){throw new Error('Sin conexión con el servidor.')}
  let d={};try{d=await r.json()}catch(e){}
  if(!r.ok)throw new Error(d.error||('Error '+r.status));return d}
const track=ns=>{if(!tok())return;[...new Set(ns)].forEach(n=>api('/track',{method:'POST',body:JSON.stringify({n:+n})}).catch(()=>{}))};
const openItem=n=>{try{const i=data.findIndex(x=>x.n==n);if(i<0)return;list=data;show(i)}catch(e){}};
const openCanje=code=>{const b=$('#canje');if(!b){T('Código copiado: '+code);return}b.click();setTimeout(()=>{const i=D.getElementById('cjC');if(i){i.value=code;i.focus()}},30)};

/* ---------- Ventana emergente genérica ---------- */
function modal(html,cls){
  const o=el('div','fs-ov',`<div class="fs-b ${cls||''}" role="dialog" aria-modal="true"><button type="button" class="fs-x" aria-label="Cerrar">✕</button>${html}</div>`);
  D.body.appendChild(o);requestAnimationFrame(()=>o.classList.add('on'));
  const kd=e=>{if(e.key==='Escape')close()},close=()=>{D.removeEventListener('keydown',kd);o.classList.remove('on');setTimeout(()=>o.remove(),220);if(o.onclose)o.onclose()};
  D.addEventListener('keydown',kd);o.addEventListener('click',e=>{if(e.target===o||e.target.closest('.fs-x'))close()});o.close=close;return o}

/* ---------- 1) HOY: código del día · racha · ruleta ---------- */
function hoy(){
  const ref=$('#catalogo');if(!ref||$('#fsHoy'))return;
  const s=el('section','sec fs-hoy','<h2>Hoy en <span>Colombia Reals</span></h2><p>Entra cada día: código, racha y ruleta</p><div class="fs-grid"><div class="fs-card" id="fsDay"></div><div class="fs-card" id="fsStreak"></div><div class="fs-card" id="fsSpin"></div></div>');
  s.id='fsHoy';ref.before(s);
  safe(()=>dayCard($('#fsDay')));safe(()=>streakCard($('#fsStreak')));safe(()=>spinCard($('#fsSpin')));
}
const needLogin=(box,t,sub)=>{box.innerHTML=`<small>${t}</small><b>Inicia sesión con Discord</b><span>${sub}</span>`};

async function dayCard(box){
  let d;try{d=await api('/daily')}catch(e){box.remove();return}
  if(!d.ok){box.remove();return}
  box.innerHTML=`<small>🎁 CÓDIGO DEL DÍA${d.special?' · ESPECIAL':''}</small><code>${esc(d.code)}</code><b>${esc(d.reward)}</b><span>${d.left>0?`Quedan <em>${d.left}</em> de ${d.max} cupos`:'Cupos agotados por hoy'}</span><span class="fs-t" id="fsDT"></span><button type="button" class="fs-btn ok"${d.left>0?'':' disabled'}>🎟️ CANJEAR AHORA</button>`;
  $('button',box).onclick=()=>{copy(d.code);openCanje(d.code)};
  const end=Date.parse(d.date+'T23:59:59-05:00')+1000,t=$('#fsDT',box);
  const tick=()=>{if(D.hidden)return;const ms=Math.max(0,end-Date.now());t.textContent='Cambia en '+p2(Math.floor(ms/36e5))+':'+p2(Math.floor(ms/6e4)%60)+':'+p2(Math.floor(ms/1e3)%60)};
  tick();setInterval(tick,1000)}

async function streakCard(box){
  if(!tok()){needLogin(box,'🔥 RACHA DE VISITAS','para sumar días seguidos y ganar premios');return}
  let d;try{d=await api('/streak',{method:'POST'})}catch(e){box.remove();return}
  if(!d.ok){box.remove();return}
  const top=d.milestones.length?d.milestones[d.milestones.length-1].days:7;
  const dots=d.milestones.map(m=>`<i class="${d.days>=m.days?'on':''}" style="left:${Math.min(100,m.days/top*100)}%" title="${esc(m.reward)}">${m.days}</i>`).join('');
  box.innerHTML=`<small>🔥 RACHA DE VISITAS</small><b class="fs-big">${d.days} ${d.days===1?'día':'días'}</b><div class="fs-bar"><u style="width:${Math.min(100,d.days/top*100)}%"></u>${dots}</div><span>${d.next?`Próximo premio: <em>${esc(d.next.reward)}</em> a los ${d.next.days} días`:'¡Completaste todos los premios del mes! 🏆'}</span>`;
  if(d.rewards&&d.rewards.length){
    const r=d.rewards[d.rewards.length-1],o=modal(`<h3>🔥 ¡RACHA DE ${r.days} DÍAS!</h3><div class="fs-win"><small>Ganaste</small><b>${esc(r.reward)}</b><code>${esc(r.code)}</code><small>Vence el ${esc(r.exp)}</small></div><div class="fs-act"><button type="button" class="fs-btn ok">🎟️ CANJEAR AHORA</button></div>`,'win');
    $('.ok',o).onclick=()=>{copy(r.code);o.close();openCanje(r.code)}}}

async function spinCard(box){
  if(!tok()){needLogin(box,'🎰 RULETA DIARIA','para girar gratis una vez al día');return}
  let d;try{d=await api('/spin')}catch(e){box.remove();return}
  if(!d.ok){box.remove();return}
  const paint=can=>{box.innerHTML=`<small>🎰 RULETA DIARIA</small><b class="fs-big">${can?'¡Tienes un giro!':'Ya giraste hoy'}</b><span>${can?'Gira gratis, una vez al día':'Vuelve mañana por otro giro'}</span><button type="button" class="fs-btn${can?' ok':''}">${can?'🎰 GIRAR':'VER RULETA'}</button>`;$('button',box).onclick=()=>wheel(d.labels,can,()=>paint(false))};
  paint(d.can)}

const PAL=['#7a0a18','#0f6b36','#b3121f','#1d1d22','#0b8a3c','#8f1021'];
function wheelSVG(labels){
  const n=labels.length,a=2*Math.PI/n,R=134,c=140,pt=(r,t)=>[(c+r*Math.sin(t)).toFixed(1),(c-r*Math.cos(t)).toFixed(1)];
  let h='<svg viewBox="0 0 280 280" class="fs-wh" aria-hidden="true">';
  labels.forEach((l,i)=>{const [x1,y1]=pt(R,i*a),[x2,y2]=pt(R,(i+1)*a),mid=(i+.5)*a*180/Math.PI,txt=l.length>18?l.slice(0,17)+'…':l;
    h+=`<path d="M${c} ${c}L${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}Z" fill="${PAL[i%PAL.length]}" stroke="#ffd66b" stroke-width="1.5"/><text x="${c}" y="${c-R*.62}" transform="rotate(${mid.toFixed(1)} ${c} ${c})" text-anchor="middle" fill="#fff" font-size="${n>6?8:10}" font-weight="700" font-family="Poppins,Arial,sans-serif">${esc(txt)}</text>`});
  return h+`<circle cx="${c}" cy="${c}" r="16" fill="#ffd66b" stroke="#7a0a18" stroke-width="3"/></svg>`}
function wheel(labels,can,done){
  const o=modal(`<h3>🎰 RULETA DIARIA</h3><div class="fs-wrap"><i class="fs-ptr"></i><div class="fs-spin">${wheelSVG(labels)}</div></div><div class="fs-res" id="fsRes">${can?'Pulsa girar y que la suerte te acompañe 🍀':'Ya usaste tu giro de hoy. ¡Vuelve mañana!'}</div><div class="fs-act"><button type="button" class="fs-btn ok" id="fsGo"${can?'':' disabled'}>🎰 GIRAR</button></div>`,'wheel');
  const b=$('#fsGo',o),res=$('#fsRes',o),sp=$('.fs-spin',o);
  b.onclick=async()=>{b.disabled=true;res.textContent='Girando…';let d;
    try{d=await api('/spin',{method:'POST'})}catch(e){res.textContent=e.message;return}
    const a=360/labels.length;sp.style.transform=`rotate(${360*6-(d.idx+.5)*a}deg)`;
    setTimeout(()=>{done();
      if(d.win){res.innerHTML=`🎉 ¡Ganaste <b>${esc(d.reward)}</b>!<br><code>${esc(d.code)}</code><small>Vence el ${esc(d.exp)}</small>`;b.disabled=false;b.textContent='🎟️ CANJEAR AHORA';b.onclick=()=>{copy(d.code);o.close();openCanje(d.code)}}
      else{res.innerHTML=`${esc(d.label||'Suerte para la próxima')} 🍀<br><small>Vuelve mañana por otro giro</small>`}},4500)}}

/* ---------- 2) Adviento: la puerta de hoy brilla + cuenta regresiva ---------- */
function advento(tries){
  const s=$('#adviento'),p=$('#ixAd');
  if(!s||!p||!$('#ixAdG')){if((tries||0)<30)setTimeout(()=>advento((tries||0)+1),700);return}
  if(s.dataset.fs)return;s.dataset.fs=1;
  const now=new Date(),Y=now.getFullYear(),m=now.getMonth(),dd=now.getDate();
  if(m===11&&dd>=1&&dd<=25){const b=$$('#ixAdG .dr')[dd-1];if(b)b.classList.add('fs-today')}
  if(m===0||(m===11&&dd>=25))return;
  const t=el('div','fs-advt');p.after(t);
  const tick=()=>{if(D.hidden)return;const n=new Date(),beforeDec=n.getMonth()<11,end=beforeDec?new Date(Y,11,1):new Date(n.getFullYear(),n.getMonth(),n.getDate()+1),ms=Math.max(0,end-n),dn=beforeDec?1:n.getDate()+1;
    t.innerHTML=`⏳ Puerta <b>${dn}</b> en <b>${beforeDec?Math.floor(ms/864e5)+' d ':''}${p2(Math.floor(ms/36e5)%24)}:${p2(Math.floor(ms/6e4)%60)}:${p2(Math.floor(ms/1e3)%60)}</b>`};
  tick();setInterval(tick,1000)}

/* ---------- 3) Cupos "Quedan X" ---------- */
const STOCK=Object.assign({},F.stock);
function paintStock(){
  $$('#grid .item').forEach(c=>{const im=$('img',c),m=im&&im.src.match(/\/t\/(\d+)\.webp/);if(!m)return;
    const n=+m[1],left=STOCK[n];let b=$('.fs-stk',c);
    if(left==null){if(b)b.remove();c.classList.remove('fs-out');return}
    if(!b){b=el('i','fs-stk');c.appendChild(b)}
    b.textContent=left<=0?'AGOTADO':(left<=3?'🔥 ':'⏳ ')+'Quedan '+left;b.classList.toggle('out',left<=0);c.classList.toggle('fs-out',left<=0)})}
async function stock(){
  const g=$('#grid');if(g)new MutationObserver(paintStock).observe(g,{childList:true});
  try{const d=await api('/stock');if(d.ok)Object.assign(STOCK,d.stock)}catch(e){}
  paintStock()}

/* ---------- 4) Los más pedidos ---------- */
async function masPedidos(){
  const ref=$('#fsHoy')||$('#catalogo');if(!ref||$('#fsTop'))return;
  let rows=[],ranked=false;
  try{const d=await api('/top');rows=(d.top||[]).filter(r=>itemOf(r.n)).slice(0,6);ranked=rows.length>=3}catch(e){}
  if(!ranked){const hot=(C.ideas&&C.ideas.hot)||[14,9,22,17];rows=hot.filter(itemOf).map(n=>({n}))}
  if(!rows.length)return;
  const s=el('section','sec fs-topsec',`<h2>Los más <span>pedidos</span></h2><p>${ranked?'Lo que más piden nuestros jugadores por ticket':'Favoritos de la comunidad'}</p><div class="fs-tops">${rows.map((r,i)=>`<button type="button" class="fs-tp" data-n="${r.n}"><img src="assets/catalogo/t/${r.n}.webp" alt="${esc(titleOf(r.n))}" loading="lazy" width="240" height="150"><i>${ranked?['🥇','🥈','🥉'][i]||'#'+(i+1):'🔥'}</i><span>${esc(titleOf(r.n))}</span></button>`).join('')}</div>`);
  s.id='fsTop';ref.after(s);s.addEventListener('click',e=>{const b=e.target.closest('[data-n]');if(b)openItem(b.dataset.n)})}

/* ---------- 5) Lista de deseos (♥) + combo + regalo ---------- */
const favs0=()=>(ld('cr_favs',[])||[]).filter(n=>itemOf(n));
function setFavs(a){sv('cr_favs',a);try{favs.length=0;a.forEach(x=>favs.push(x))}catch(e){}try{render()}catch(e){}dock()}
let dk;
function dock(){
  const n=favs0().length;
  if(!dk){dk=el('div','fs-dock');dk.innerHTML='<button type="button" id="fsWish" aria-label="Mi lista de deseos">🛍️<b></b></button>';D.body.appendChild(dk);$('#fsWish').onclick=wishlist}
  dk.style.display=n?'flex':'none';$('b',dk).textContent=n}
function wishlist(){
  const a=favs0();if(!a.length){T('Toca el ♥ de un vehículo para guardarlo');return}
  const o=modal(`<h3>🛍️ MI LISTA</h3><p class="fs-sub">${a.length} ${a.length===1?'ítem guardado':'ítems guardados'}</p><div class="fs-list">${a.map(n=>`<div class="fs-li" data-n="${n}"><img src="assets/catalogo/t/${n}.webp" alt="" width="96" height="60"><span>${esc(titleOf(n))}</span><button type="button" data-g="${n}" aria-label="Regalar" title="Regalar">🎁</button><button type="button" data-r="${n}" aria-label="Quitar" title="Quitar">✕</button></div>`).join('')}</div><div class="fs-act"><button type="button" class="fs-btn" id="fsCb"${a.length>1?'':' disabled'}>🧩 ARMAR COMBO</button><button type="button" class="fs-btn ok" id="fsAll">🎫 PEDIR MI LISTA</button></div>`,'list');
  o.addEventListener('click',e=>{
    const r=e.target.closest('[data-r]'),g=e.target.closest('[data-g]'),i=e.target.closest('.fs-li img,.fs-li span');
    if(r){setFavs(favs0().filter(n=>n!=r.dataset.r));o.close();if(favs0().length)wishlist()}
    else if(g){o.close();gift(+g.dataset.g)}
    else if(i){o.close();openItem(i.closest('.fs-li').dataset.n)}});
  $('#fsCb',o).onclick=()=>{o.close();combo(a)};
  $('#fsAll',o).onclick=()=>{track(a);toTicket('Hola, quiero cotizar mi lista: '+a.map(titleOf).join(', '))}}

function combo(pre){
  let sel=(pre||[]).slice(0,4);const all=items().filter(x=>!/^(Beneficios|Información)$/.test(x.cat)),cats=[...new Set(all.map(x=>x.cat))];
  const o=modal(`<h3>🧩 ARMA TU COMBO</h3><p class="fs-sub">Elige de 2 a 4 ítems y pídelo por ticket</p><div class="fs-chips" id="fsCh"></div><div class="fs-row"><select id="fsSel" aria-label="Elegir ítem">${cats.map(c=>`<optgroup label="${esc(c)}">${all.filter(x=>x.cat===c).map(x=>`<option value="${x.n}">${esc(x.title)}</option>`).join('')}</optgroup>`).join('')}</select><button type="button" class="fs-btn" id="fsAdd">Agregar</button></div><div class="fs-sum" id="fsSum"></div><div class="fs-act"><button type="button" class="fs-btn ok" id="fsGo">🎫 PEDIR COMBO</button></div>`,'combo');
  const pr=F.precios||{},calc=()=>{const known=sel.length>1&&sel.every(n=>+pr[n]>0),sub=sel.reduce((s,n)=>s+(+pr[n]||0),0),pc=+(F.comboDescuento||{})[sel.length]||0;return{known,sub,pc,total:sub*(1-pc/100)}};
  const paint=()=>{$('#fsCh',o).innerHTML=sel.map(n=>`<span>${esc(titleOf(n))}<button type="button" data-r="${n}" aria-label="Quitar">✕</button></span>`).join('')||'<em>Aún no eliges nada</em>';
    const c=calc();let h;
    if(sel.length<2)h='Agrega al menos 2 ítems para armar el combo';
    else if(c.known)h=`Subtotal ${cop(c.sub)}${c.pc?`<br>Descuento por combo ${c.pc}%`:''}<br><b>Total estimado ${cop(c.total)}</b>`;
    else h=`<b>Precio especial por ticket</b>${c.pc?`<br>Descuento por combo: ${c.pc}%`:''}`;
    $('#fsSum',o).innerHTML=h;$('#fsGo',o).disabled=sel.length<2;$('#fsAdd',o).disabled=sel.length>=4};
  $('#fsAdd',o).onclick=()=>{const n=+$('#fsSel',o).value;if(!sel.includes(n)&&sel.length<4)sel.push(n);paint()};
  o.addEventListener('click',e=>{const r=e.target.closest('[data-r]');if(r){sel=sel.filter(n=>n!=r.dataset.r);paint()}});
  $('#fsGo',o).onclick=()=>{const c=calc();track(sel);toTicket('Hola, quiero cotizar este combo: '+sel.map(titleOf).join(' + ')+(c.known?' · Total estimado: '+cop(c.total)+(c.pc?' (con '+c.pc+'% de descuento por combo)':''):c.pc?' · Descuento por combo: '+c.pc+'%':''))};
  paint()}

function gift(n){
  const x=itemOf(n);if(!x)return;const mine=(window.crMe&&window.crMe.name)||'';
  const o=modal(`<h3>🎁 REGALAR</h3><p class="fs-sub">${esc(x.title)}</p><img class="fs-gimg" src="assets/catalogo/t/${n}.webp" alt=""><input id="fsPara" maxlength="40" placeholder="Para (usuario de Discord)" autocomplete="off"><textarea id="fsMsg" maxlength="140" rows="2" placeholder="Mensaje (opcional): ¡Feliz Navidad! 🎄"></textarea><div class="fs-act"><button type="button" class="fs-btn" id="fsLk">🔗 COPIAR TARJETA</button><button type="button" class="fs-btn ok" id="fsRq">🎫 PEDIR POR TICKET</button></div><p class="fs-note">La tarjeta es un aviso bonito para quien recibe. El regalo se entrega cuando lo pides por ticket y el staff lo confirma.</p>`,'gift');
  const v=()=>({para:$('#fsPara',o).value.trim(),msg:$('#fsMsg',o).value.trim()});
  $('#fsLk',o).onclick=()=>{const {para,msg}=v(),q=new URLSearchParams({regalo:n});if(mine)q.set('de',mine);if(para)q.set('para',para);if(msg)q.set('msg',msg);copy(location.href.split(/[?#]/)[0]+'?'+q);T('Enlace de regalo copiado 🎁 Compártelo por Discord o WhatsApp')};
  $('#fsRq',o).onclick=()=>{const {para,msg}=v();track([n]);toTicket('Hola, quiero REGALAR: '+x.title+(para?' a '+para:'')+(msg?' · Mensaje: "'+msg+'"':''))}}

function giftBtn(tries){
  const t=$('#tkM');if(!t||!t.parentNode){if((tries||0)<30)setTimeout(()=>giftBtn((tries||0)+1),700);return}
  if($('#fsGiftB'))return;
  const b=el('button','btn ix-mb','🎁 REGALAR');b.id='fsGiftB';b.type='button';b.dataset.noload='';b.onclick=()=>{try{gift(list[cur].n)}catch(e){}};t.parentNode.appendChild(b);
  t.addEventListener('click',()=>{try{track([list[cur].n])}catch(e){}});
  const sync=()=>{try{b.style.display=t.style.display==='none'?'none':''}catch(e){}};new MutationObserver(sync).observe(t,{attributes:true,attributeFilter:['style']});sync()}

function giftIn(){
  const q=new URLSearchParams(location.search),n=+q.get('regalo'),x=n&&itemOf(n);if(!x)return;
  const de=esc((q.get('de')||'').slice(0,40)),para=esc((q.get('para')||'').slice(0,40)),msg=esc((q.get('msg')||'').slice(0,140));
  const o=modal(`<div class="fs-box">🎁</div><h3>${para?'¡'+para+', ':'¡'}${de||'alguien especial'} quiere regalarte algo!</h3><img class="fs-gimg" src="assets/catalogo/t/${n}.webp" alt=""><div class="fs-win"><b>${esc(x.title)}</b>${msg?`<p>“${msg}”</p>`:''}</div><p class="fs-note">${de?esc(de):'Quien te lo regala'} debe pedirlo por ticket para completarlo. ¡Mientras tanto, mira el catálogo!</p><div class="fs-act"><button type="button" class="fs-btn ok">👀 VER EN EL CATÁLOGO</button></div>`,'gift recv');
  $('.ok',o).onclick=()=>{o.close();openItem(n)};
  o.onclose=()=>{try{history.replaceState(null,'',location.href.split('?')[0]+location.hash)}catch(e){}}}

/* ---------- 6) Resumen del año (temporada de Año Nuevo) ---------- */
function resumen(){
  const q=new URLSearchParams(location.search);if(season()!=='ny'&&!q.get('resumen'))return;
  const ref=$('#fsHoy')||$('#catalogo');if(!ref||$('#fsYear'))return;
  const now=new Date(),y=now.getMonth()===0?now.getFullYear()-1:now.getFullYear();
  const b=el('section','sec fs-year',`<div><b>🎆 Resumen ${y}</b><span>Mira cómo fue el año en Colombia Reals</span></div><button type="button" class="fs-btn ok">VER RESUMEN</button>`);b.id='fsYear';ref.before(b);
  $('button',b).onclick=async()=>{let d=null;try{d=await api('/year?y='+y)}catch(e){}
    const R=F.resumen||{},top=d&&d.top?d.top.filter(r=>itemOf(r.n)).slice(0,3):[];
    modal(`<div class="fs-box">🎆</div><h3>${esc(R.titulo||'Tu año en Colombia Reals '+y)}</h3>${d&&d.ok?`<div class="fs-stats"><div><b>${d.redeems}</b><small>canjes</small></div><div><b>${d.players}</b><small>jugadores</small></div><div><b>${d.delivered}</b><small>entregas</small></div></div>`:''}${top.length?`<p class="fs-sub">Lo más pedido: ${top.map(r=>esc(titleOf(r.n))).join(' · ')}</p>`:''}<p class="fs-msg">${esc(R.mensaje||'Gracias por acompañarnos todo el año. ¡Feliz Año Nuevo de parte de todo el staff de Colombia Reals! 🥳')}</p><p class="fs-note">🎁 El código del día de hoy es un regalo especial de Año Nuevo.</p>`,'year')}}

/* ---------- Arranque ---------- */
const ph=()=>{
  safe(hoy);safe(masPedidos);safe(resumen);safe(stock);safe(dock);safe(()=>giftBtn(0));safe(()=>advento(0));safe(giftIn);
  D.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.fav'))setTimeout(dock,120)});
};
const go=()=>{if(window.__fsGo)return;window.__fsGo=1;ph()};
if(D.readyState==='complete')setTimeout(go,300);else addEventListener('load',()=>setTimeout(go,300));
setTimeout(go,2500);
})();
