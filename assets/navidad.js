/* Capa navideña: gorro, luces, aurora, cuenta regresiva, ticket, modo ligero. Sin dependencias. */
(()=>{
const D=document,H=D.documentElement,C=window.CR||{};
const nav=navigator,cn=nav.connection||{};
if(cn.saveData||(nav.deviceMemory&&nav.deviceMemory<=4)||(nav.hardwareConcurrency&&nav.hardwareConcurrency<=4))H.classList.add('lite');
D.addEventListener('visibilitychange',()=>H.classList.toggle('nv-hid',D.hidden));
const el=(t,c,h)=>{const e=D.createElement(t);if(c)e.className=c;if(h)e.innerHTML=h;return e};
const HAT='<svg viewBox="0 0 64 56" width="100%" height="100%"><path d="M6 44C8 22 24 6 46 8c4 .4 8 3 8 8 0 6-4 10-4 18l-8 10z" fill="#d6101f"/><path d="M6 44C8 22 24 6 46 8c-12 6-22 18-24 36z" fill="#f2323f" opacity=".55"/><path d="M2 42c0-5 5-9 11-8l36 6c6 1 10 5 9 10-1 4-6 6-11 5L11 50C5 49 2 46 2 42z" fill="#fff"/><circle cx="52" cy="11" r="7.5" fill="#fff"/></svg>';
function hat(img){
  if(!img||img.dataset.nv||!img.offsetWidth)return;const w=img.offsetWidth;if(w<44)return;img.dataset.nv=1;
  const p=img.offsetParent||img.parentElement;if(getComputedStyle(p).position=='static')p.style.position='relative';
  const h=el('div','nv-hat',HAT),s=w*.62;h.style.cssText=`width:${s}px;height:${s*.875}px;left:${img.offsetLeft-s*.12}px;top:${img.offsetTop-s*.52}px`;p.appendChild(h);
}
const hats=()=>{};/* el logo ya incluye gorro y cuernos */
/* Fondo aurora + luces flotantes */
function bg(){
  if(D.querySelector('.nv-bg'))return;const b=el('div','nv-bg','<i class="a1"></i><i class="a2"></i><i class="a3"></i>'),cols=['#ffd66b','#ff5a66','#6dffa8','#fff'];
  if(!H.classList.contains('lite'))for(let i=0;i<14;i++){const e=el('b'),s=4+Math.random()*7,c=cols[i%4];e.style.cssText=`left:${Math.random()*100}%;width:${s}px;height:${s}px;background:${c};box-shadow:0 0 ${s*2}px ${c};--dx:${(Math.random()-.5)*80}px;animation-duration:${18+Math.random()*22}s;animation-delay:${-Math.random()*30}s`;b.appendChild(e)}
  D.body.prepend(b);
}
/* Guirnalda */
function lights(){
  if(D.querySelector('.nv-lights'))return;const n=Math.min(40,Math.ceil(innerWidth/48)),u=el('div','nv-lights'),c=['#ff2a3a','#ffd23f','#22d36a','#2f8bff','#ff5fb0'];u.setAttribute('aria-hidden','true');
  for(let i=0;i<n;i++){const s=el('s');s.style.setProperty('--c',c[i%5]);u.appendChild(s)}D.body.appendChild(u);
}
/* Cuenta regresiva */
function ribbon(){
  const now=new Date(),y=now.getFullYear(),nav=new Date(y,11,25),d=Math.ceil((nav-now)/864e5);
  if(now>new Date(y+1,0,7)||(now.getMonth()==0&&now.getDate()>6)||sessionStorage.getItem&&(()=>{try{return sessionStorage.getItem('nv_x')}catch(e){return 0}})())return;
  const r=el('div','nv-rib','<span>'+(d>0?`🎄 Faltan <b>${d}</b> ${d==1?'día':'días'} para Navidad · Felices fiestas de Colombia Reals 🎅`:d==0?'🎄 <b>¡FELIZ NAVIDAD!</b> Te desea todo el equipo de Colombia Reals 🎁':'🎉 <b>¡FELIZ AÑO NUEVO!</b> Gracias por ser parte de Colombia Reals 🥳')+'</span>');
  const x=el('button','',"✕");x.setAttribute('aria-label','Cerrar');x.onclick=()=>{r.remove();try{sessionStorage.setItem('nv_x',1)}catch(e){}};r.appendChild(x);
  const hd=D.querySelector('header');hd?hd.parentNode.insertBefore(r,hd):D.body.prepend(r);
}
function ticket(){
  const u=C.ticketUrl||C.invite;if(!u||D.querySelector('.nv-tk'))return;
  const a=el('a','nv-tk','🎫 <span>Abrir ticket</span>');a.href=u;a.target='_blank';a.rel='noopener';D.body.appendChild(a);
}
function go(){bg();lights();ribbon();ticket();hats();setTimeout(hats,500);setTimeout(hats,1500)}
if(D.readyState=='loading')D.addEventListener('DOMContentLoaded',go);else go();
addEventListener('load',()=>{hats();new MutationObserver(()=>hats()).observe(D.body,{childList:true,subtree:true});setTimeout(()=>{},0)});

/* ===== VELOCIDAD PERCIBIDA ===== */
(()=>{
  /* 1) Service worker: la segunda visita carga casi al instante (solo con https o localhost) */
  if('serviceWorker' in navigator&&(location.protocol=='https:'||location.hostname=='localhost'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
  /* 2) Al acercar el dedo/mouse a una tarjeta, se descarga ya la foto grande: el visor abre sin espera */
  const seen=new Set(),pre=src=>{if(!src||seen.has(src)||seen.size>60)return;seen.add(src);const i=new Image();i.decoding='async';i.src=src};
  const warm=e=>{const c=e.target.closest&&e.target.closest('.item');if(!c)return;const im=c.querySelector('img');if(im)pre((im.currentSrc||im.src).replace('/catalogo/t/','/catalogo/'))};
  D.addEventListener('pointerover',warm,{passive:true});D.addEventListener('touchstart',warm,{passive:true});
  /* 3) Al acercar el mouse a un enlace interno, se precarga esa página */
  const lk=new Set();D.addEventListener('pointerover',e=>{const a=e.target.closest&&e.target.closest('a[href$=".html"]');if(!a||lk.has(a.href)||a.origin!=location.origin)return;lk.add(a.href);const l=D.createElement('link');l.rel='prefetch';l.href=a.href;D.head.appendChild(l)},{passive:true});
})();
})();
