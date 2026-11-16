/* IDEAS: oferta flash, etiquetas, combos, eventos, adviento, testimonios, buscador FAQ, galería, compartir, instalar app.
   Todo se edita en assets/config.js (CR.ideas = {...}); si no pones nada se usan estos valores por defecto. */
(()=>{
const D=document,$=s=>D.querySelector(s),C=window.CR||{},I=Object.assign({
  oferta:{titulo:'🎁 OFERTA DE NAVIDAD',texto:'Pregunta por tu descuento navideño en el ticket',items:[14,9,22],fin:''},
  hot:[14,9,22,17],nuevo:[20,21],
  combos:[
    {t:'Combo Navidad Extremo',i:['Lamborghini Urus','Kawasaki Ninja H2','VIP de Todito'],p:'Precio especial por ticket'},
    {t:'Combo Pareja Parchada',i:['Ferrari 488 Pista Spider','Ducati Multistrada','VIP Choclitos'],p:'Precio especial por ticket'}],
  eventos:[
    {f:'12-07',t:'Noche de Velitas',d:'Tradición colombiana: enciende tu velita 🕯️'},
    {f:'12-16',t:'Inicio de las Novenas',d:'Comienzan los aguinaldos y villancicos 🎶'},
    {f:'12-24',t:'Nochebuena',d:'Cena, familia y sorpresas del staff 🎄'},
    {f:'12-25',t:'¡Navidad!',d:'Feliz Navidad de parte de Colombia Reals 🎅'},
    {f:'12-31',t:'Año Viejo',d:'Despide el año con estilo 🎆'},
    {f:'01-01',t:'Año Nuevo',d:'Empieza el año con todo 🥳'}],
  adviento:[],            /* 25 textos de premio (opcional). Vacío = "sorpresa del staff" */
  testimonios:[]          /* [{n:'Nombre',t:'Texto',f:'url-foto'}] — solo reseñas reales con permiso */
},C.ideas||{});
const tk=()=>C.ticketUrl||C.invite||'#',cp=t=>{try{navigator.clipboard.writeText(t)}catch(e){}},
T=m=>{let t=$('#crt');if(!t){t=D.createElement('div');t.id='crt';D.body.appendChild(t)}t.textContent=m;t.classList.add('show');clearTimeout(T.t);T.t=setTimeout(()=>t.classList.remove('show'),3000)},
me=()=>{const m=window.crMe;return m?' · Discord: '+m.name+(m.guest?'':' ('+m.id+')'):''},
ticket=txt=>{cp(txt+me());T('Copiamos tu pedido, pégalo en el ticket 🎫');if(tk()!=='#')window.open(tk(),'_blank','noopener')},
title=n=>{try{const x=data.find(y=>y.n==n);return x?x.title:''}catch(e){return ''}},
mk=(h,id)=>{const s=D.createElement('section');s.className='sec ix';if(id)s.id=id;s.innerHTML=h;return s},
p2=v=>String(v).padStart(2,'0');
const now=new Date(),Y=now.getFullYear();

/* ---------- 1) Oferta con cuenta regresiva + novedades ---------- */
function oferta(){
  const o=I.oferta,box=D.createElement('div');box.className='ix-offer';
  const chips=(o.items||[]).map(n=>title(n)?`<button type="button" data-q="${title(n).replace(/"/g,'&quot;')}">${title(n)}</button>`:'').join('');
  const nn=(I.nuevo||[]).length;
  box.innerHTML=`<div class="l"><b>${o.titulo}</b><small>${o.texto}</small></div><div class="t" id="ixT">--:--:--</div><div class="c">${chips}${nn?`<span class="nw">🆕 ${nn} novedades esta semana</span>`:''}</div>`;
  const ref=$('#xNav')||$('.hero');if(ref)ref.after(box);
  const end=()=>{if(o.fin){const e=new Date(o.fin);if(e>new Date())return e}const e=new Date();e.setHours(23,59,59,999);return e};
  const tick=()=>{if(D.hidden)return;let d=Math.max(0,end()-new Date());$('#ixT').textContent=p2(Math.floor(d/36e5))+':'+p2(Math.floor(d/6e4)%60)+':'+p2(Math.floor(d/1e3)%60)};
  tick();setInterval(tick,1000);
  box.addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;const s=$('#search');if(!s)return;s.value=b.dataset.q;s.dispatchEvent(new Event('input',{bubbles:true}));$('#catalogo').scrollIntoView({behavior:'smooth'})});
}

/* ---------- 2) Etiquetas Más pedido / Nuevo + filtros ---------- */
function badges(){
  const g=$('#grid');if(!g)return;
  const mark=()=>g.querySelectorAll('.item:not([data-bx])').forEach(c=>{c.dataset.bx=1;const im=c.querySelector('img');const m=(im&&im.src.match(/\/t\/(\d+)\.webp/));if(!m)return;const n=+m[1];
    if((I.hot||[]).includes(n)){c.classList.add('b-hot');c.insertAdjacentHTML('afterbegin','<i class="bdg hot">🔥 MÁS PEDIDO</i>')}
    if((I.nuevo||[]).includes(n)){c.classList.add('b-new');c.insertAdjacentHTML('afterbegin','<i class="bdg nw">🆕 NUEVO</i>')}});
  new MutationObserver(mark).observe(g,{childList:true});mark();
  const f=$('#filters');if(!f)return;
  [['🔥 Lo más pedido','only-hot'],['🆕 Nuevo','only-new']].forEach(([t,c])=>{const b=D.createElement('button');b.className='filter';b.textContent=t;b.dataset.noload='';
    b.onclick=()=>{const all=[...f.querySelectorAll('.filter')].find(x=>x.textContent==='Todos');all&&all.click();f.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));g.classList.remove('only-hot','only-new');g.classList.add(c)};f.appendChild(b)});
  f.addEventListener('click',e=>{const b=e.target.closest('.filter');if(b&&!/🔥|🆕/.test(b.textContent))g.classList.remove('only-hot','only-new')},true);
}

/* ---------- 3) Combos ---------- */
const combos=()=>I.combos&&I.combos.length?mk(`<h2>Combos <span>navideños</span></h2><p>Lleva más y paga menos · Se piden por ticket</p><div class="ix-combos">${I.combos.map((c,i)=>`<div class="ix-cb"><b>${c.t}</b><ul>${c.i.map(x=>`<li>${x}</li>`).join('')}</ul><em>${c.p}</em><button type="button" class="btn" data-cb="${i}">🎫 PEDIR COMBO</button></div>`).join('')}</div>`,'combos'):null;

/* ---------- 4) Calendario de eventos ---------- */
function eventos(){
  if(!I.eventos||!I.eventos.length)return null;
  const ev=I.eventos.map(e=>{const full=e.f.length>5,mm=full?+e.f.slice(5,7):+e.f.slice(0,2),dd=full?+e.f.slice(8,10):+e.f.slice(3,5);
    let dt=new Date(full?+e.f.slice(0,4):Y,mm-1,dd,23,59,59);if(!full&&dt<now)dt=new Date(Y+1,mm-1,dd,23,59,59);return {t:e.t,desc:e.d||'',dt,mm,dd}}).sort((a,b)=>a.dt-b.dt).filter(e=>e.dt>=now);
  if(!ev.length)return null;
  const mon=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  return mk(`<h2>Calendario de <span>eventos</span></h2><p>No te pierdas ninguna fecha</p><div class="ix-ev">${ev.map((e,i)=>`<div class="ix-e${i===0?' nx':''}"><div class="dt"><b>${p2(e.dd)}</b><small>${mon[e.mm-1]}</small></div><div><h4>${e.t}${i===0?' <em>PRÓXIMO</em>':''}</h4><p>${e.desc}</p></div></div>`).join('')}</div>`,'eventos');
}

/* ---------- 5) Calendario de adviento ---------- */
function adviento(){
  const K='cr_adv'+Y;let op=[];try{op=JSON.parse(localStorage.getItem(K)||'[]')}catch(e){}
  const m=now.getMonth(),d=now.getDate(),late=(m===0&&d<=6),day=late?99:(m===11?d:0);
  const s=mk(`<h2>Calendario de <span>adviento</span></h2><p id="ixAd"></p><div class="ix-adv" id="ixAdG"></div>`,'adviento');
  const g=s.querySelector('#ixAdG'),pr=I.adviento||[];
  for(let n=1;n<=25;n++){const b=D.createElement('button');b.type='button';b.dataset.d=n;b.className='dr'+(n>day?' lk':'')+(op.includes(n)?' op':'');b.innerHTML=`<b>${n}</b><small>${n>day?'🔒':op.includes(n)?'🎁':'🎄'}</small>`;g.appendChild(b)}
  s.querySelector('#ixAd').textContent=day>0?'Abre la puerta de hoy y reclama tu sorpresa por ticket':`Se abre el 1 de diciembre · faltan ${Math.max(1,Math.ceil((new Date(Y,11,1)-now)/864e5))} días`;
  g.addEventListener('click',e=>{const b=e.target.closest('.dr');if(!b)return;const n=+b.dataset.d;if(n>day){T('🔒 Esa puerta se abre el '+n+' de diciembre');return}
    if(!op.includes(n)){op.push(n);try{localStorage.setItem(K,JSON.stringify(op))}catch(x){}b.classList.add('op');b.querySelector('small').textContent='🎁'}
    const txt=pr[n-1]||'Sorpresa del staff: abre un ticket y menciona esta puerta';
    let o=$('#ixAM');if(!o){o=D.createElement('div');o.id='ixAM';o.innerHTML='<div class="b"><h3></h3><p></p><div class="r"><button type="button" data-x>Cerrar</button><button type="button" class="ok" data-t>🎫 Reclamar por ticket</button></div></div>';D.body.appendChild(o);o.onclick=ev=>{if(ev.target===o||ev.target.dataset.x!=null)o.classList.remove('on');if(ev.target.dataset.t!=null){o.classList.remove('on');ticket('🎄 ADVIENTO ✔ Abrí la puerta '+o.dataset.n+': '+o.dataset.p)}}}
    o.dataset.n=n;o.dataset.p=txt;o.querySelector('h3').textContent='🎄 Puerta '+n;o.querySelector('p').textContent=txt;o.classList.add('on')});
  return s;
}

/* ---------- 6) Testimonios (solo si los pones tú) ---------- */
const testi=()=>I.testimonios&&I.testimonios.length?mk(`<h2>Lo que dicen <span>nuestros jugadores</span></h2><p>Opiniones reales de la comunidad</p><div class="ix-ts">${I.testimonios.map(t=>`<div class="ix-t">${t.f?`<img src="${t.f}" alt="" loading="lazy">`:''}<p>“${t.t}”</p><b>— ${t.n}</b></div>`).join('')}</div>`,'testimonios'):null;

/* ---------- Montaje ---------- */
function mount(){
  if($('#ixMounted'))return;
  const ref=$('#comprar');if(!ref)return;
  const mark=D.createElement('i');mark.id='ixMounted';mark.hidden=true;D.body.appendChild(mark);
  [combos(),eventos(),adviento(),testi()].filter(Boolean).forEach(s=>ref.before(s));
  D.addEventListener('click',e=>{const b=e.target.closest('[data-cb]');if(!b)return;const c=I.combos[+b.dataset.cb];ticket('Hola, quiero cotizar el combo: '+c.t+' ('+c.i.join(' + ')+')')});
  oferta();badges();faqSearch();modalExtras();pwa();
}
/* ---------- FAQ con buscador ---------- */
function faqSearch(){
  const f=$('#faq .faq');if(!f||$('#ixFq'))return;
  const i=D.createElement('input');i.id='ixFq';i.type='search';i.placeholder='🔎 Busca tu duda…';i.className='ix-fq';f.before(i);
  i.oninput=()=>{const q=i.value.trim().toLowerCase();f.querySelectorAll('details').forEach(d=>{d.style.display=!q||d.textContent.toLowerCase().includes(q)?'':'none';if(q&&d.style.display==='')d.open=true})};
}
/* ---------- Galería a pantalla completa + compartir ---------- */
function modalExtras(){
  const t=$('#tkM');if(!t||$('#ixFs'))return;const w=t.parentNode;
  const mkb=(id,tx,fn)=>{const b=D.createElement('button');b.id=id;b.type='button';b.className='btn ix-mb';b.dataset.noload='';b.textContent=tx;b.onclick=fn;w.appendChild(b)};
  mkb('ixFs','⛶ PANTALLA COMPLETA',()=>{const m=$('#modal');try{D.fullscreenElement?D.exitFullscreen():m.requestFullscreen()}catch(e){T('Tu navegador no permite pantalla completa')}});
  mkb('ixSh','📤 COMPARTIR',async()=>{let x;try{x=list[cur]}catch(e){}if(!x)return;const url=location.origin.startsWith('http')?(location.origin+location.pathname+'#v'+x.n):location.href,txt='Mira este '+x.title+' en Colombia Reals 🚗🔥';
    if(navigator.share){try{await navigator.share({title:x.title,text:txt,url});return}catch(e){}}
    window.open('https://wa.me/?text='+encodeURIComponent(txt+' '+url),'_blank','noopener')});
}
/* ---------- Instalar app ---------- */
function pwa(){
  let ev;addEventListener('beforeinstallprompt',e=>{e.preventDefault();ev=e;if($('#ixPw'))return;const b=D.createElement('button');b.id='ixPw';b.type='button';b.textContent='📲 Instalar app';b.onclick=async()=>{b.remove();try{ev.prompt();await ev.userChoice}catch(x){}};D.body.appendChild(b)});
  addEventListener('appinstalled',()=>{const b=$('#ixPw');b&&b.remove()});
}
if(D.readyState==='complete')mount();else addEventListener('load',mount);
setTimeout(mount,2000);
})();
