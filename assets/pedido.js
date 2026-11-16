/* Mi pedido: elige varios ítems y envíalos juntos al ticket. Compartir ítem, contador de resultados. */
(()=>{try{
const K='cr_pedido',$=s=>document.querySelector(s),CFG=window.CR||{};
let P=[];try{P=JSON.parse(localStorage.getItem(K)||'[]')}catch(e){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(P))}catch(e){}};
const has=n=>P.some(x=>x.n==n),noCot=c=>/^(Beneficios|Información)$/.test(c);
const mk=(t,id,h)=>{const e=document.createElement(t);if(id)e.id=id;if(h)e.innerHTML=h;document.body.appendChild(e);return e};
const T=m=>{const t=$('#pdT')||mk('div','pdT');t.textContent=m;t.classList.add('on');clearTimeout(T.h);T.h=setTimeout(()=>t.classList.remove('on'),2200)};
const fab=mk('button','pdF','🛒 Mi pedido <b>0</b>');
const pan=mk('div','pdP','<div class="pd-box"><div class="pd-h"><h3>🛒 Mi pedido</h3><button id="pdX" aria-label="Cerrar">✕</button></div><div id="pdL"></div><textarea id="pdN" rows="2" placeholder="Notas para el staff (opcional)"></textarea><div class="pd-a"><button class="pd-g" id="pdC">Vaciar</button><button class="pd-b" id="pdS">🎫 Copiar y abrir ticket</button></div></div>');
function list(){const L=$('#pdL');L.replaceChildren();if(!P.length){L.innerHTML='<div class="pd-e">Aún no agregas nada. Pulsa “＋ Pedido” en cualquier ítem.</div>';return}
P.forEach(x=>{const r=document.createElement('div');r.className='pd-r';r.innerHTML='<img alt="" loading="lazy"><div><b></b><small></small></div><button aria-label="Quitar">🗑</button>';r.querySelector('img').src='assets/catalogo/t/'+x.n+'.webp';r.querySelector('b').textContent=x.t;r.querySelector('small').textContent=x.c;r.querySelector('button').onclick=()=>{P=P.filter(y=>y.n!=x.n);save();sync()};L.appendChild(r)})}
function sync(){fab.style.display=P.length?'block':'none';fab.querySelector('b').textContent=P.length;
document.querySelectorAll('.pd-add').forEach(b=>{const o=has(b.dataset.n);b.classList.toggle('on',o);b.textContent=o?'✔ En pedido':'＋ Pedido'});
const m=$('#pdMa');if(m){const o=has(m.dataset.n);m.classList.toggle('on',o);m.textContent=o?'✔ En tu pedido':'＋ Agregar al pedido'}list()}
const tog=it=>{const i=P.findIndex(x=>x.n==it.n);i<0?P.push(it):P.splice(i,1);save();sync();T(i<0?'Añadido a tu pedido 🛒':'Quitado del pedido')};
fab.onclick=()=>pan.classList.add('open');$('#pdX').onclick=()=>pan.classList.remove('open');pan.onclick=e=>{if(e.target===pan)pan.classList.remove('open')};
$('#pdC').onclick=()=>{P=[];save();sync()};
$('#pdS').onclick=()=>{if(!P.length)return T('Agrega algo primero');const n=$('#pdN').value.trim();
const msg='Hola, quiero cotizar:\n'+P.map(x=>'• '+x.t+' ('+x.c+')').join('\n')+(n?'\nNotas: '+n:'');
try{navigator.clipboard.writeText(msg)}catch(e){}T('Copiamos tu pedido, pégalo en el ticket 🎫');window.open(CFG.ticketUrl||CFG.invite,'_blank','noopener')};
/* botón en cada tarjeta */
const grid=$('#grid');
const deco=()=>{grid.querySelectorAll('.item:not([data-pd])').forEach(c=>{c.dataset.pd=1;const m=(c.querySelector('img')||{}).src&&c.querySelector('img').src.match(/\/t\/(\d+)\.webp/);if(!m)return;
const t=c.querySelector('h3').textContent,k=c.querySelector('.tag').textContent;if(noCot(k))return;
const b=document.createElement('button');b.className='pd-add';b.dataset.n=m[1];b.type='button';b.onclick=e=>{e.stopPropagation();tog({n:m[1],t,c:k})};c.appendChild(b)});
const cnt=$('#pdR')||(()=>{const d=document.createElement('div');d.id='pdR';d.className='pd-count';grid.before(d);return d})();
cnt.textContent=grid.style.display==='none'?'':grid.querySelectorAll('.item').length+' resultado(s)';sync()};
if(grid)new MutationObserver(deco).observe(grid,{childList:true,attributes:true,attributeFilter:['style']});
/* modal: agregar y compartir */
const cap=$('#modalCaption'),box=$('#tkM')&&$('#tkM').parentNode;
if(cap&&box){const w=document.createElement('div');w.id='pdM';w.innerHTML='<button id="pdMa" type="button"></button><button id="pdMs" type="button">🔗 Compartir</button>';box.after(w);
const cur=()=>{const im=($('#modalImg')||{}).src||'',m=im.match(/catalogo\/(?:t\/)?(\d+)\.webp/),p=cap.textContent.match(/^(.*?) · (.*?)\s+\(\d+\/\d+\)$/);return m&&p?{n:m[1],t:p[1],c:p[2]}:null};
$('#pdMa').onclick=()=>{const x=cur();if(x)tog(x)};
$('#pdMs').onclick=async()=>{const x=cur();if(!x)return;const u=location.origin+location.pathname+'?i='+x.n;try{if(navigator.share)await navigator.share({title:x.t,url:u});else{await navigator.clipboard.writeText(u);T('Enlace copiado 🔗')}}catch(e){}};
new MutationObserver(()=>{const x=cur();if(!x)return;$('#pdMa').dataset.n=x.n;$('#pdMa').style.display=noCot(x.c)?'none':'';sync()}).observe(cap,{childList:true,characterData:true,subtree:true})}
sync();
}catch(e){console.warn('pedido.js',e)}})();
