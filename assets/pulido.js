(()=>{const $=s=>document.querySelector(s),red=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* header compacto al hacer scroll */
const hd=$('header');if(hd){let t=0;addEventListener('scroll',()=>{if(t)return;t=1;requestAnimationFrame(()=>{t=0;hd.classList.toggle('stuck',scrollY>60)})},{passive:true})}
/* sección activa en el menú */
const links=[...document.querySelectorAll('nav a[href^="#"]')],map=new Map();links.forEach(a=>{const e=document.getElementById(a.getAttribute('href').slice(1));if(e)map.set(e,a)});
if(map.size&&'IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.remove('on'));map.get(e.target).classList.add('on')}}),{rootMargin:'-35% 0px -60% 0px'});map.forEach((_,e)=>io.observe(e))}
/* brasas + indicador de scroll */
const bg=$('.city-bg');if(bg&&!red){const w=document.createElement('div');w.className='embers';for(let i=0;i<22;i++){const s=document.createElement('i');s.style.cssText=`left:${Math.random()*100}%;--dx:${(Math.random()*160-80)|0}px;animation-duration:${9+Math.random()*12}s;animation-delay:-${Math.random()*18}s;width:${2+Math.random()*3}px;height:${2+Math.random()*3}px`;w.appendChild(s)}bg.appendChild(w)}
const hi=$('.hero-inner');if(hi){const c=document.createElement('span');c.className='cue';c.setAttribute('aria-hidden','true');hi.appendChild(c)}
/* tilt 3D suave en tarjetas (solo ratón) */
if(!red&&matchMedia('(hover:hover) and (pointer:fine)').matches){let cur=null,raf=0;
document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.item,.ovc');if(cur&&cur!==c){cur.style.transform='';cur.classList.remove('tilt')}cur=c;if(!c)return;if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.classList.add('tilt');c.style.transform=`perspective(800px) rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*9).toFixed(2)}deg) translateY(-6px)`})});
document.addEventListener('pointerleave',()=>{if(cur){cur.style.transform='';cur.classList.remove('tilt');cur=null}},true)}
/* footer ampliado */
const f=$('footer');if(f){const ix=location.pathname.endsWith('facciones.html')?'index.html':'';const g=document.createElement('div');g.innerHTML=`<div class="ftl"></div><div class="ftg"><div><div class="fb"><img src="assets/logo-cr.webp" alt=""><b>COLOMBIA REALS</b></div><p>El catálogo oficial de la comunidad: vehículos, motos, skins, membresías VIP y facciones para tu rol en la ciudad.</p></div>
<div><h5>Catálogo</h5><a href="${ix}#catalogo">Vehículos y motos</a><a href="${ix}#vip">Membresías VIP</a><a href="facciones.html">Facciones</a></div>
<div><h5>Ayuda</h5><a href="${ix}#comprar">Cómo comprar</a><a href="${ix||'index.html'}#faq">Preguntas frecuentes</a><a href="${ix}#info">Condiciones</a></div>
<div><h5>Compra por ticket</h5><a class="fbtn" data-ft target="_blank" rel="noopener">🎫 ABRIR TICKET</a><p>Las ventas se hacen por ticket en nuestro Discord.</p></div></div>`;f.prepend(...g.children);
const u=(typeof TICKET!=='undefined')?TICKET:(typeof CFG!=='undefined'?CFG.ticketUrl:'#');f.querySelectorAll('[data-ft]').forEach(a=>a.href=u)}
})();
