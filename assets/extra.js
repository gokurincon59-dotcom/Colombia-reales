/* Actualización grande: panel de Navidad, música, trineo, chispas, compartir, cuenta regresiva, barra móvil. */
(()=>{
const D=document,H=D.documentElement,C=window.CR||{},$=(s,r)=>(r||D).querySelector(s);
const el=(t,c,h)=>{const e=D.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const KEY='cr_xcfg',def={lights:1,aurora:1,sparkle:0,sleigh:1,music:0};
let cfg=Object.assign({},def);try{Object.assign(cfg,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}};
const lite=()=>H.classList.contains('lite'),mob=matchMedia('(max-width:650px)').matches;
const apply=()=>{['lights','aurora','sparkle','sleigh'].forEach(k=>H.classList.toggle('x'+'no'+k,!cfg[k]))};

/* 1) Barra de progreso */
const pg=el('div');pg.id='xProg';D.body.appendChild(pg);let tk=0;
addEventListener('scroll',()=>{if(tk)return;tk=1;requestAnimationFrame(()=>{tk=0;const m=H.scrollHeight-innerHeight;pg.style.transform='scaleX('+(m>0?scrollY/m:0)+')'})},{passive:true});

/* 2) Música: "Jingle Bells" (dominio público) sintetizada, sin archivos */
let ac,mt,playing=false;
const N={E:329.63,G:392,C:261.63,D:293.66,F:349.23,A:440};
const mel=[['E',1],['E',1],['E',2],['E',1],['E',1],['E',2],['E',1],['G',1],['C',1.5],['D',.5],['E',4],['F',1],['F',1],['F',1.5],['F',.5],['F',1],['E',1],['E',1],['E',.5],['E',.5],['E',1],['D',1],['D',1],['E',1],['D',2],['G',2]];
function note(f,t,d){const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=f;o.connect(g);g.connect(ac.destination);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.02);g.gain.exponentialRampToValueAtTime(.0008,t+d*.95);o.start(t);o.stop(t+d);setTimeout(()=>D.dispatchEvent(new Event('fx:beat')),Math.max(0,(t-ac.currentTime)*1000))}
function loop(){if(!playing)return;let t=ac.currentTime+.1;const b=.32;mel.forEach(([n,d])=>{note(N[n],t,d*b);t+=d*b});mt=setTimeout(loop,(t-ac.currentTime)*1000+1200)}
function music(on){
  if(on){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();ac.resume();playing=true;loop()}catch(e){playing=false}}
  else{playing=false;clearTimeout(mt);if(ac)ac.suspend()}
}

/* 3) Panel de Navidad */
const fab=el('button','','🎄');fab.id='xFab';fab.type='button';fab.setAttribute('aria-label','Menú navideño');
const pan=el('div','',`<h4>MENÚ NAVIDEÑO</h4>
<label>🎵 Villancico<input type="checkbox" data-k="music"></label><label>💡 Luces<input type="checkbox" data-k="lights"></label>
<label>🌌 Aurora de fondo<input type="checkbox" data-k="aurora"></label><label>✨ Chispas del mouse<input type="checkbox" data-k="sparkle"></label>
<label>🛷 Trineo de Papá Noel<input type="checkbox" data-k="sleigh"></label><small>Apaga lo que quieras: se recuerda tu elección. La música solo suena si la activas.</small>`);pan.id='xPan';
D.body.append(fab,pan);
pan.querySelectorAll('input').forEach(i=>{i.checked=!!cfg[i.dataset.k];i.onchange=()=>{cfg[i.dataset.k]=i.checked?1:0;save();apply();if(i.dataset.k=='music')music(i.checked);if(i.dataset.k=='sleigh'&&i.checked)fly()}});
fab.onclick=e=>{e.stopPropagation();pan.classList.toggle('on')};
D.addEventListener('click',e=>{if(!pan.contains(e.target))pan.classList.remove('on')});
if(cfg.music){const once=()=>{music(true);pan.querySelector('[data-k=music]').checked=true};['pointerdown','keydown'].forEach(v=>addEventListener(v,once,{once:true}))}
apply();

/* 4) Chispas con el mouse (solo computador) */
if(!mob&&!matchMedia('(pointer:coarse)').matches){
  const pool=[];for(let i=0;i<14;i++){const s=el('div','xSp');D.body.appendChild(s);pool.push(s)}let k=0,last=0;
  addEventListener('pointermove',e=>{const n=performance.now();if(n-last<45||lite()||!cfg.sparkle)return;last=n;const s=pool[k++%pool.length];
    s.style.transition='none';s.style.opacity='1';s.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0) scale(1)`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{s.style.transition='opacity .7s,transform .7s';s.style.opacity='0';s.style.transform=`translate3d(${e.clientX+(Math.random()-.5)*26}px,${e.clientY+16+Math.random()*16}px,0) scale(.2)`}))},{passive:true});
}

/* 5) Trineo volador: aparece cada cierto tiempo */
const SL=`<svg viewBox="0 0 260 90" width="100%"><g fill="#5b3522" stroke="#c48a58" stroke-width="1.2"><path d="M20 52c8-2 14-8 20-8l6-12 4 2-2 10c6 0 10 4 16 4l8-4 2 4-8 6c-4 6-10 8-16 8l-6 10h-4l4-10c-6-2-8-4-12-4l-4 10h-4l4-10c-6 0-10-4-8-6z"/><path d="M98 50c8-2 14-8 20-8l6-12 4 2-2 10c6 0 10 4 16 4l8-4 2 4-8 6c-4 6-10 8-16 8l-6 10h-4l4-10c-6-2-8-4-12-4l-4 10h-4l4-10c-6 0-10-4-8-6z"/></g>
<circle cx="14" cy="50" r="5" fill="#ff2a3a"/><circle cx="14" cy="50" r="10" fill="#ff2a3a" opacity=".35"/>
<path d="M60 38l-14-16m14 16l-4-18M138 36l-14-16m14 16l-4-18" stroke="#c48a58" stroke-width="3" stroke-linecap="round" fill="none"/>
<path d="M60 52q60-4 130 6" stroke="#ffd66b" stroke-width="1.5" fill="none"/>
<path d="M170 44h60c4 0 8 4 6 10l-6 12h-62z" fill="#c8101f"/><path d="M162 72h84c6 0 10-4 8-8" stroke="#ffd66b" stroke-width="4" stroke-linecap="round" fill="none"/>
<circle cx="200" cy="38" r="12" fill="#f2c9a4"/><path d="M188 36c0-12 10-18 22-14l4 10z" fill="#d6101f"/><circle cx="214" cy="22" r="4" fill="#fff"/><rect x="188" y="34" width="26" height="5" rx="2.5" fill="#fff"/><path d="M190 46q10 10 22 0v8h-22z" fill="#fff"/></svg>`;
const sl=el('div','',SL);sl.id='xSl';sl.setAttribute('aria-hidden','true');D.body.appendChild(sl);
function fly(){if(D.hidden||lite()||!cfg.sleigh)return;sl.classList.remove('go');void sl.offsetWidth;sl.classList.add('go')}
sl.addEventListener('animationend',()=>sl.classList.remove('go'));
setTimeout(fly,6000);setInterval(fly,60000);

/* 6) Sección especial: cuenta regresiva en vivo */
const hero=$('.hero');
if(hero&&!$('#xNav')){
  const s=el('section','sec','');s.id='xNav';
  s.innerHTML=`<h2>NAVIDAD <span>COLOMBIA REALS</span></h2><div class="cd" id="xCd"><div><b id="xd">00</b><span>Días</span></div><div><b id="xh">00</b><span>Horas</span></div><div><b id="xm">00</b><span>Min</span></div><div><b id="xs">00</b><span>Seg</span></div></div><p id="xTx">Faltan estos días para la Navidad. Aprovecha las membresías VIP y los artículos exclusivos de temporada.</p><div class="bt"><a class="btn" href="#catalogo">🎁 Ver catálogo</a><a class="btn" href="#vip">⭐ Membresías VIP</a></div>`;
  hero.after(s);
  const t=()=>{const n=new Date(),y=n.getFullYear();let x=new Date(y,11,25);if(n>new Date(y,11,26))x=new Date(y+1,11,25);let d=Math.max(0,x-n);
    const p=(v)=>String(v).padStart(2,'0'),dd=Math.floor(d/864e5),hh=Math.floor(d/36e5)%24,mm=Math.floor(d/6e4)%60,ss=Math.floor(d/1e3)%60;
    $('#xd').textContent=p(dd);$('#xh').textContent=p(hh);$('#xm').textContent=p(mm);$('#xs').textContent=p(ss);
    if(n.getMonth()==11&&n.getDate()==25){$('#xTx').textContent='🎄 ¡Feliz Navidad! Gracias por ser parte de Colombia Reals.'}};
  t();setInterval(()=>{if(!D.hidden)t()},1000);
}

/* 7) Compartir producto + enlace directo (?i=ID) */
const share=async(id)=>{const u=location.origin+location.pathname+'?i='+id;
  try{if(navigator.share&&matchMedia('(pointer:coarse)').matches){await navigator.share({title:'Colombia Reals',url:u});return}}catch(e){}
  try{await navigator.clipboard.writeText(u)}catch(e){const t=el('textarea');t.value=u;D.body.appendChild(t);t.select();try{D.execCommand('copy')}catch(x){}t.remove()}
  const to=$('#toast');if(to){to.textContent='Enlace copiado 🔗';to.classList.add('on','show');setTimeout(()=>to.classList.remove('on','show'),1800)}};
const idOf=c=>{const im=c.querySelector('img');const m=im&&(im.currentSrc||im.src).match(/\/t\/(\d+)\.webp/);return m&&m[1]};
const deco=c=>{if(c.dataset.xs)return;const id=idOf(c);if(!id)return;c.dataset.xs=1;const b=el('button','xShr','🔗');b.type='button';b.setAttribute('aria-label','Compartir');b.onclick=e=>{e.stopPropagation();share(id)};c.appendChild(b)};
const scan=()=>D.querySelectorAll('.item').forEach(deco);
let ob;const grid=$('.grid');if(grid){ob=new MutationObserver(scan);ob.observe(grid,{childList:true,subtree:true});scan()}
const want=new URLSearchParams(location.search).get('i');
if(want){let n=0,clicked=0;const tr=setInterval(()=>{if(!clicked&&!D.querySelector('.item')){const b=[...D.querySelectorAll('.filter')].find(x=>/^todos/i.test(x.textContent.trim()));if(b){clicked=1;b.click()}}const c=[...D.querySelectorAll('.item')].find(x=>idOf(x)==want);if(c){clearInterval(tr);c.scrollIntoView({block:'center'});c.click()}else if(++n>40)clearInterval(tr)},250)}

/* 8) Barra inferior para celulares */
const here=location.pathname.split('/').pop()||'index.html',fac=here=='facciones.html',tk2=C.ticketUrl||(typeof CFG!='undefined'&&CFG.ticketUrl)||(typeof TICKET!='undefined'&&TICKET)||C.invite||(fac?'#comparar':'#comprar');
const bar=el('div','',`<a href="${fac?'index.html':'#inicio'}" class="${fac?'':'on'}"><span>🏠</span>Inicio</a><a href="${fac?'index.html#catalogo':'#catalogo'}"><span>🚗</span>Catálogo</a><a href="${fac?'index.html#vip':'#vip'}"><span>⭐</span>VIP</a><a href="facciones.html" class="${fac?'on':''}"><span>⚔️</span>Facciones</a><a href="${tk2}"${/^http/.test(tk2)?' target="_blank" rel="noopener"':''}><span>🎫</span>${/^http/.test(tk2)?'Ticket':'Comprar'}</a>`);
bar.id='xBar';bar.setAttribute('role','navigation');bar.setAttribute('aria-label','Navegación');D.body.appendChild(bar);
})();
