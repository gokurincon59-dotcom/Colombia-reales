/* ULTRA: nieve desde el borde blanco del encabezado + cargando al abrir botones */
(()=>{
const D=document,H=D.documentElement;
/* ---- Nieve ---- */
const lite=H.classList.contains('lite')||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4);
const cv=D.createElement('canvas');cv.id='ultraSnow';D.body.appendChild(cv);
const cx=cv.getContext('2d');let W=0,Hh=0,dpr=1;
function size(){W=innerWidth;Hh=innerHeight;cv.width=W*dpr;cv.height=Hh*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
size();addEventListener('resize',size);
H.classList.add('nosnow'); /* apaga la nieve vieja: una sola capa de nieve */
const N=lite?14:(W<700?22:34),fl=[];
const hb=()=>{const h=D.querySelector('header');return h?Math.max(0,h.getBoundingClientRect().bottom):0};
function mk(f,y0){f.x=Math.random()*W;f.y=y0;f.r=1+Math.random()*2.4;f.v=.8+Math.random()*1.4+f.r*.3;f.s=Math.random()*6.28;f.w=.4+Math.random()*.8;f.a=.55+Math.random()*.45}
for(let i=0;i<N;i++){const f={};mk(f,hb()+Math.random()*(Hh-hb()));fl.push(f)}
let run=true,lastT=0,lastSc=0,slow=false;
addEventListener('scroll',()=>{lastSc=performance.now()},{passive:true});
D.addEventListener('visibilitychange',()=>{run=!D.hidden;if(run)requestAnimationFrame(loop)});
function loop(n){if(!run)return;requestAnimationFrame(loop);
  if(n-lastT<42||n-lastSc<120||D.body.classList.contains('paused')||H.classList.contains('ultra-fast'))return;lastT=n;
  cx.clearRect(0,0,W,Hh);const top=hb();cx.fillStyle='#fff';
  for(const f of fl){f.y+=f.v;f.s+=.04;f.x+=Math.sin(f.s)*f.w;
    if(f.y>Hh+6||f.x<-10||f.x>W+10)mk(f,top-2);
    if(f.y<top)f.y=top;
    cx.globalAlpha=f.a*Math.min(1,(f.y-top)/30);
    cx.beginPath();cx.arc(f.x,f.y,f.r,0,6.283);cx.fill()}
}
requestAnimationFrame(loop);
/* Auto-ligero: si el equipo va lento, baja efectos solo */
(()=>{let c=0,t0=0;const m=n=>{if(!t0)t0=n;c++;if(n-t0<1800)return requestAnimationFrame(m);const fps=c/((n-t0)/1000);if(fps<50){H.classList.add('lite','ut-still');fl.length=Math.min(fl.length,15)}};setTimeout(()=>requestAnimationFrame(m),2500)})();
/* ---- Cargando ---- */
const L=D.createElement('div');L.id='crLoad';L.setAttribute('aria-hidden','true');
L.innerHTML='<div class="pf"><span class="o1"></span><span class="o2"></span><img alt="" decoding="async"></div><p>CARGANDO</p><div class="bar"><i></i></div>';D.body.appendChild(L);
const pim=L.querySelector('img');
function prof(){let s='';try{s=(window.crMe&&window.crMe.av)||(D.querySelector('.chip img')||{}).src||''}catch(e){}pim.onerror=()=>{pim.onerror=null;pim.src='assets/logo-cr.webp'};pim.src=s||'assets/logo-cr.webp'}
let t;function show(ms){prof();L.classList.add('on');clearTimeout(t);t=setTimeout(()=>L.classList.remove('on'),ms||450)}
window.crLoading=show;
const skip='#close,#prev,#next,.close,.nv,#crLoad,input,select,textarea,#cfgX,[data-noload]';
D.addEventListener('click',e=>{
  const b=e.target.closest('button,.btn,a[href],.card,.cat,.filter,nav a,.fab,[role=button]');
  if(!b||b.closest(skip))return;
  const a=b.closest('a[href]');if(a&&(a.getAttribute('href')||'').trim()==='#')return;
  show(b.closest('.card')?600:450)},true);

/* ---- Árbol 3D bajo el contador ---- */
function tree(){
  if(D.querySelector('.ultra-tree'))return;
  const tx=D.querySelector('#xNav #xTx');if(!tx)return;
  const W=220,Ht=270,CX=110,dp=Math.min(2,window.devicePixelRatio||1);
  let sd=11;const rn=()=>(sd=sd*16807%2147483647)/2147483647,rg=(a,b)=>a+(b-a)*rn();
  const cv=D.createElement('canvas');cv.width=W*dp;cv.height=Ht*dp;cv.style.cssText='width:'+W+'px;height:'+Ht+'px;display:block';
  const g=cv.getContext('2d');if(!g)return;g.scale(dp,dp);g.lineCap='round';
  /* sombra, tronco y silueta oscura (da profundidad) */
  g.save();g.translate(CX,246);g.scale(1,.2);let r=g.createRadialGradient(0,0,2,0,0,100);r.addColorStop(0,'rgba(0,0,0,.6)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.beginPath();g.arc(0,0,100,0,7);g.fill();g.restore();
  r=g.createLinearGradient(CX-8,0,CX+8,0);r.addColorStop(0,'#3b230f');r.addColorStop(.5,'#7a4b25');r.addColorStop(1,'#2e1b0b');g.fillStyle=r;g.fillRect(CX-8,214,16,32);
  g.fillStyle='#08200f';g.beginPath();g.moveTo(CX,24);g.lineTo(CX+84,234);g.lineTo(CX-84,234);g.fill();
  /* ramas: agujas una por una, más claras en las puntas y a la izquierda (luz) */
  for(let i=0;i<9;i++){
    const yT=34+i*21,hw=12+i*8.6,nb=10+i*3;
    for(let k=0;k<nb;k++){
      const sg=k%2?1:-1,y0=yT+rg(0,18),L=hw*rg(.6,1.06),dr=L*rg(.25,.5)+6,ex=CX+sg*L,ey=y0+dr,cx=CX+sg*L*.5,cy=y0+dr*.1-3;
      for(let t=0;t<=1.001;t+=.05){
        const m=1-t,x=m*m*CX+2*m*t*cx+t*t*ex,y=m*m*y0+2*m*t*cy+t*t*ey,lit=.5+(sg<0?.13:-.08)+t*.16-i*.012;
        for(let n=0;n<6;n++){
          const a=(sg>0?.35:Math.PI-.35)+rg(-1.15,1.15),ln=rg(7,13)*(.65+.35*t);
          g.strokeStyle='hsl('+rg(128,150).toFixed(0)+','+rg(48,66).toFixed(0)+'%,'+(12+22*lit+rg(-3,3)).toFixed(1)+'%)';g.lineWidth=rg(.9,1.6);
          g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*ln,y+Math.sin(a)*ln);g.stroke();
        }
      }
    }
  }
  /* guirnaldas doradas de cuentas */
  for(let s=0;s<4;s++){const y=74+s*40,w=(y-30)*.46;g.beginPath();g.moveTo(CX-w,y+8);g.quadraticCurveTo(CX,y+36,CX+w,y+8);
    g.setLineDash([0,6]);g.strokeStyle='#d9a63a';g.lineWidth=4;g.stroke();g.lineDashOffset=2;g.strokeStyle='#fff1b0';g.lineWidth=1.5;g.stroke();g.setLineDash([]);g.lineDashOffset=0}
  /* bolas brillantes */
  const oc=[['#ff3b3b','#7a0c14'],['#ffd34d','#8a5a00'],['#3a8bff','#0b2a6e'],['#e8eef5','#6c7a89'],['#ff6fb5','#7a1c4a']];
  for(let n=0;n<28;n++){const y=rg(62,214),w=(y-30)*.4,x=CX+rg(-w,w),R=rg(4,6.6),c=oc[n%5],q=g.createRadialGradient(x-R*.4,y-R*.45,R*.1,x,y,R);
    q.addColorStop(0,'#fff');q.addColorStop(.25,c[0]);q.addColorStop(1,c[1]);g.fillStyle=q;g.beginPath();g.arc(x,y,R,0,7);g.fill();g.fillStyle='#d9a63a';g.fillRect(x-1.5,y-R-2,3,2.5)}
  /* falda roja y regalos */
  g.fillStyle='#8c1020';g.beginPath();g.ellipse(CX,238,92,11,0,0,7);g.fill();g.fillStyle='#b3162b';g.beginPath();g.ellipse(CX,235,86,8,0,0,7);g.fill();
  const gf=(x,y,w,h,c,rb)=>{g.fillStyle=c;g.fillRect(x,y,w,h);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x,y,w,3);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+w-5,y,5,h);g.fillStyle=rb;g.fillRect(x+w/2-3,y,6,h);g.fillRect(x,y+h/2-3,w,6);g.beginPath();g.ellipse(x+w/2-5,y-3,6,4,-.5,0,7);g.ellipse(x+w/2+5,y-3,6,4,.5,0,7);g.fill()};
  gf(34,238,36,26,'#c8102e','#ffd34d');gf(146,240,40,24,'#1f6fd1','#f2f2f2');gf(90,246,28,18,'#1f9d55','#ff5fb0');
  /* estrella */
  const star=(x,y,R)=>{g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?R*.45:R;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}g.closePath()};
  g.save();g.shadowColor='#ffd66b';g.shadowBlur=18;g.fillStyle='#ffd45a';star(CX,22,12);g.fill();g.restore();g.fillStyle='#fff3b0';star(CX,22,6);g.fill();
  /* luces que titilan (HTML, para que parpadeen) */
  const C=['#ff2a3a','#ffd23f','#22d36a','#2f8bff','#ff5fb0','#ffffff'];
  const wrap=D.createElement('div');wrap.className='ultra-tree real';wrap.setAttribute('aria-hidden','true');
  const gl=D.createElement('div');gl.className='gl';const ro=D.createElement('div');ro.className='ro';ro.appendChild(cv);
  for(let n=0;n<42;n++){const t=n/42,y=46+t*170,w=(y-30)*.44,x=CX+Math.sin(t*15)*w,i=D.createElement('i');i.className='bu';
    i.style.cssText='--c:'+C[n%6]+';--d:'+(-rn()*1.4).toFixed(2)+'s;left:'+(x-2.5).toFixed(1)+'px;top:'+y.toFixed(1)+'px';ro.appendChild(i)}
  const sgl=D.createElement('div');sgl.className='sg';ro.appendChild(sgl);
  wrap.appendChild(gl);wrap.appendChild(ro);tx.after(wrap);
  if('IntersectionObserver' in window)new IntersectionObserver(es=>es.forEach(e=>wrap.classList.toggle('off',!e.isIntersecting))).observe(wrap);
}
let tr=0;const tryTree=()=>{tree();if(!D.querySelector('.ultra-tree')&&tr++<20)setTimeout(tryTree,300)};
if(D.readyState==='complete')tryTree();else addEventListener('load',tryTree);

/* ---- Menús rápidos: pausa animaciones pesadas mientras hay un menú abierto ---- */
const sel='#xPan.on,#cfg.open,.lgm.open,.modal.open,#cjM.on';
let q=0;const upd=()=>{q=0;H.classList.toggle('ultra-fast',!!D.querySelector(sel))};
new MutationObserver(()=>{if(!q)q=requestAnimationFrame(upd)}).observe(D.body,{attributes:true,subtree:true,attributeFilter:['class']});

/* ---- Ajustes al lado del perfil ---- */
let ta=0;const moveCfg=()=>{const b=D.querySelector('#cfgB'),a=D.querySelector('header .acct');
  if(b&&a){if(b.nextElementSibling!==a)a.parentNode.insertBefore(b,a);b.classList.add('in-hd');return}
  if(ta++<30)setTimeout(moveCfg,300)};
if(D.readyState==='complete')moveCfg();else addEventListener('load',moveCfg);
D.addEventListener('cr:login',()=>setTimeout(moveCfg,50));
D.addEventListener('click',e=>{if(!e.target.closest('#cfgB'))return;const p=D.querySelector('#cfg'),h=D.querySelector('header');if(p&&h){const r=h.getBoundingClientRect();p.style.top=Math.max(8,r.bottom+8)+'px';p.style.maxHeight=(innerHeight-Math.max(8,r.bottom+8)-12)+'px'}},true);
})();
