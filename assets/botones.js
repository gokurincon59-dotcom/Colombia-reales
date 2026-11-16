/* ===== BOTONES: muestra solo la información del botón elegido (index.html y facciones.html) ===== */
(()=>{
const D=document,B=D.body;
if(!B||D.getElementById('crTabs'))return;
const FAC=/facciones(\.html)?$/.test(location.pathname);

/* Cada botón: [id, icono, texto]. RULES: [id del botón, selectores de lo que muestra]. Edita aquí para mover secciones. */
const TABS=FAC?[
 ['elegir','🏁','Elegir facción'],['ilegal','⚔️','Ilegal'],['eln','🌙','ELN'],['mansion','🏰','Mansión'],['ecopetrol','🏢','Ecopetrol'],
 ['incluye','✅','Todas incluyen'],['comparar','📊','Comparar'],['comprar','🎫','Cómo comprar'],['comunidad','💬','Comunidad'],['faq','❓','FAQ'],['info','📋','Condiciones']
]:[
 ['inicio','🏠','Inicio'],['navidad','🎄','Navidad'],['catalogo','🚗','Catálogo'],['vip','⭐','VIP'],['facciones','⚔️','Facciones'],
 ['comprar','🎫','Cómo comprar'],['comunidad','💬','Comunidad'],['faq','❓','FAQ'],['info','📋','Condiciones']
];
const RULES=FAC?[
 ['elegir','.hero,#xNav,#elige,.cta'],['ilegal','#facciones'],['eln','#eln'],['mansion','#mansion'],['ecopetrol','#ecopetrol'],
 ['incluye','#incluye'],['comparar','#comparar'],['comprar','#comprar'],['comunidad','#discord'],['faq','#faq'],['info','#info']
]:[
 ['inicio','.hero,.mq,section.cta'],
 ['navidad','#xNav,.ix-offer,#fsHoy,#adviento,#eventos,#combos,#fsYear'],
 ['catalogo','#destacados,#fsTop,#crX,main>.toolbar,main>.cats,main>#filters,main>#cnt,main>#casillas,main>#grid,main>#empty'],
 ['vip','#vip,#comparar'],['facciones','#facciones-inicio'],['comprar','#comprar'],['comunidad','#discord'],['faq','#faq'],['info','#info']
];
const DEFAULT=TABS[0][0],NAMES=TABS.map(t=>t[0]);
/* contenedores cuyos hijos se reparten entre botones (en facciones, los dos bloques viejos de pestañas también) */
const PARENTS=FAC?['body','main','#t-ilegal','#t-legal']:['body','main'];
const CAND='section,.mq,.ix-offer,.toolbar,.cats,#filters,#cnt,#casillas,#grid,#empty';
const groupOf=el=>{for(const [g,s] of RULES){try{if(el.matches(s))return g}catch(e){}}return null};
let cur=null;

/* en facciones se reemplazan las pestañas viejas (Ilegales/Legales): ahora hay un botón por facción */
if(FAC){const st=D.createElement('style');st.textContent='#tabs{display:none!important}#t-ilegal,#t-legal{display:block!important}';D.head.appendChild(st)}

/* etiqueta cada bloque con su botón (lo desconocido hereda el del bloque anterior) */
function tag(){
  PARENTS.forEach(q=>{
    const par=q==='body'?B:D.querySelector(q);if(!par)return;let last=null;
    [...par.children].forEach(el=>{
      if(!el.matches(CAND))return;
      if(par!==B&&par.tagName==='MAIN'&&!el.matches('section,.toolbar,.cats,#filters,#cnt,#casillas,#grid,#empty'))return;
      let g=el.dataset.crg||groupOf(el);
      if(!g&&el.matches('section,.ix-offer'))g=last;
      if(g){el.dataset.crg=g;last=g;if(cur)el.classList.toggle('crh',g!==cur)}
    });
  });
}

/* barra de botones */
const anchor=D.createElement('div');anchor.id='crTabsA';
const bar=D.createElement('div');bar.id='crTabs';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','Secciones');
bar.innerHTML=TABS.map(t=>`<button type="button" role="tab" data-tab="${t[0]}" aria-selected="false"><span>${t[1]}</span>${t[2]}</button>`).join('');
const hdr=D.querySelector('header');
if(hdr){hdr.after(anchor);anchor.after(bar)}else{B.prepend(anchor);anchor.after(bar)}
const upd=()=>{if(!hdr)return;bar.style.setProperty('--crhh',getComputedStyle(hdr).position==='sticky'?hdr.offsetHeight+'px':'0px')};
let raf=0;const sched=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(upd)};
addEventListener('scroll',sched,{passive:true});addEventListener('resize',sched);upd();

function setTab(g,opts){
  opts=opts||{};if(!NAMES.includes(g))g=DEFAULT;
  const changed=g!==cur;cur=g;
  D.querySelectorAll('[data-crg]').forEach(el=>el.classList.toggle('crh',el.dataset.crg!==g));
  bar.querySelectorAll('button').forEach(b=>{const on=b.dataset.tab===g;b.classList.toggle('on',on);b.setAttribute('aria-selected',on);if(on&&changed)try{const p=b.parentElement;p.scrollLeft+=b.getBoundingClientRect().left-p.getBoundingClientRect().left-(p.clientWidth-b.offsetWidth)/2}catch(e){}});
  const xb=D.getElementById('xBar');if(xb)xb.querySelectorAll('a').forEach(a=>{const h=a.getAttribute('href')||'';if(h[0]==='#')a.classList.toggle('on',h.slice(1)===g)});
  B.dataset.crtab=g;
  if(opts.url!==false){try{history[opts.replace?'replaceState':'pushState'](null,'',location.pathname+location.search+'#'+(opts.hash||g))}catch(e){}}
  if(changed&&opts.scroll!==false){
    const y=anchor.getBoundingClientRect().top+scrollY-(parseFloat(bar.style.getPropertyValue('--crhh'))||0);
    scrollTo({top:Math.max(0,g===DEFAULT&&!FAC?0:y),behavior:'auto'});
  }
  setTimeout(()=>dispatchEvent(new Event('scroll')),60);
}

const tabOfEl=el=>{const h=el&&el.closest&&el.closest('[data-crg]');return h?h.dataset.crg:null};
function resolve(name){
  if(!name)return null;
  if(NAMES.includes(name))return {tab:name,el:null};
  const el=D.getElementById(name);const t=tabOfEl(el);
  return t?{tab:t,el}:null;
}
function go(name,opts){
  const r=resolve(name);if(!r)return false;
  setTab(r.tab,Object.assign({hash:name,scroll:!r.el},opts));
  if(r.el)setTimeout(()=>{const y=r.el.getBoundingClientRect().top+scrollY-(hdr?hdr.offsetHeight:0)-(bar.offsetHeight||0)-8;scrollTo({top:Math.max(0,y),behavior:'smooth'})},80);
  return true;
}

bar.addEventListener('click',e=>{const b=e.target.closest('button[data-tab]');if(b)setTab(b.dataset.tab)});
D.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented)return;
  const n=a.getAttribute('href').slice(1);if(resolve(n)){e.preventDefault();go(n)}
},true);
/* si otro script hace scrollIntoView a algo oculto, abre primero su botón */
const sv=Element.prototype.scrollIntoView;
Element.prototype.scrollIntoView=function(){
  try{const h=this.closest&&this.closest('.crh');if(h&&h.dataset.crg)setTab(h.dataset.crg,{scroll:false,url:false})}catch(e){}
  return sv.apply(this,arguments);
};
addEventListener('popstate',()=>go((location.hash||'').slice(1)||DEFAULT,{url:false}));
addEventListener('hashchange',()=>{const n=(location.hash||'').slice(1),r=resolve(n);if(r&&r.tab!==cur)go(n,{url:false})});

/* arranque */
tag();
const first=(location.hash||'').slice(1),wantItem=!FAC&&new URLSearchParams(location.search).get('i');
const init=first&&resolve(first)?first:(wantItem?'catalogo':DEFAULT);
setTab(resolve(init).tab,{scroll:false,replace:true,hash:init,url:!!(first||wantItem)});
if(first&&resolve(first)&&!NAMES.includes(first))setTimeout(()=>go(first,{url:false}),400);
/* los scripts del sitio agregan bloques tarde (oferta, adviento, lista de deseos…): se etiquetan al llegar */
let t=0;const mo=new MutationObserver(()=>{clearTimeout(t);t=setTimeout(tag,80)});
mo.observe(B,{childList:true});const mn=D.querySelector('main');if(mn)mo.observe(mn,{childList:true});
})();
