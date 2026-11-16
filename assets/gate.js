/* ===== TEMA: el color elegido cambia SOLO las líneas/acentos rojos ===== */
window.crTheme=function(h){h=/^#[0-9a-f]{6}$/i.test(h)?h:'#ff1825';const n=i=>parseInt(h.slice(i,i+2),16),a=[n(1),n(3),n(5)],
mix=(b,t)=>'#'+a.map((v,i)=>Math.round(v*(1-t)+b[i]*t).toString(16).padStart(2,'0')).join(''),s=document.documentElement.style;
s.setProperty('--ac',h);s.setProperty('--ac2',mix([0,0,0],.38));s.setProperty('--acl',mix([255,255,255],.35));s.setProperty('--acd',mix([11,5,6],.74));s.setProperty('--acm',mix([11,5,6],.62));s.setProperty('--acr',a.join(' '))};
try{crTheme((JSON.parse(localStorage.getItem('cr_cfg')||'{}')).color)}catch(e){crTheme()}
/* ===== PUERTA DE ENTRADA: sin sesión de Discord no se ve el catálogo =====
   Se carga en <head>, antes de que se pinte la página. */
(()=>{
const C=window.CR||{},K='cr_sess',D=document,H=D.documentElement;
const dev=(location.protocol=='file:'||/^(localhost|127\.0\.0\.1)$/.test(location.hostname));
try{if(sessionStorage.getItem('cr_dev')&&dev)return}catch(e){}
const hasTok0=/access_token=/.test(location.hash)||(()=>{try{const t=JSON.parse(localStorage.getItem(K)||'null');return t&&t.e>Date.now()}catch(e){return false}})();
const toLogin=e=>{try{sessionStorage.setItem('cr_ret',location.href.split('#')[0])}catch(x){}location.replace('login.html'+(e?'?e='+e:''))};
if(!hasTok0){toLogin();return}
H.classList.add('cr-lock');
const st=D.createElement('style');st.textContent=`
html.cr-lock{background:#090506;overflow:hidden}
html.cr-lock body>*:not(#crGate){display:none!important}
#crGate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto;color:#fff;font-family:Poppins,"Segoe UI",Arial,sans-serif;
background:radial-gradient(ellipse at 50% 110%,#5a1018 0,#1a080c 45%,#050304 85%)}
#crGate:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 58px,rgba(255,40,55,.05) 59px 60px),repeating-linear-gradient(0deg,transparent 0 58px,rgba(255,40,55,.05) 59px 60px);mask-image:radial-gradient(ellipse at center,#000 20%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse at center,#000 20%,transparent 75%)}
#crGate .gb{position:relative;width:min(460px,100%);text-align:center;background:rgba(14,6,8,.92);border:1px solid #5a1a22;border-radius:18px;padding:34px 28px 26px;box-shadow:0 0 60px rgba(255,20,35,.25),inset 0 0 40px rgba(255,20,35,.06)}
#crGate .gb:before{content:"";position:absolute;left:24px;right:24px;top:0;height:4px;border-radius:0 0 4px 4px;background:linear-gradient(90deg,#FCD116 50%,#003893 50% 75%,#CE1126 75%)}
#crGate img.lg{width:96px;height:96px;object-fit:contain;filter:drop-shadow(0 0 16px #ff1727)}
#crGate h1{margin:10px 0 2px;font-family:"Bebas Neue",Impact,"Arial Narrow",sans-serif;font-weight:400;font-size:40px;letter-spacing:5px;line-height:1}
#crGate .sub{color:#ff6870;font-size:11px;letter-spacing:5px;margin-bottom:18px}
#crGate p{color:#d5cacc;font-size:14px;line-height:1.6;margin:0 0 16px}
#crGate ul{list-style:none;margin:0 0 22px;padding:0;text-align:left;display:grid;gap:8px;font-size:13px;color:#e6dadd}
#crGate li{display:flex;gap:10px;align-items:center;padding:9px 12px;background:rgba(255,24,37,.07);border:1px solid #3a141b;border-radius:10px}
#crGate li span{font-size:17px}
#crGate .dcb{width:100%;display:flex;align-items:center;justify-content:center;gap:12px;border:0;border-radius:50px;padding:15px 20px;background:#5865F2;color:#fff;font-family:"Bebas Neue",Impact,sans-serif;font-size:22px;letter-spacing:3px;cursor:pointer;box-shadow:0 0 28px rgba(88,101,242,.55);transition:transform .2s,box-shadow .2s}
#crGate .dcb:hover{transform:translateY(-2px);box-shadow:0 0 40px rgba(88,101,242,.8)}
#crGate .nt{margin-top:14px;font-size:11px;color:#8e8589;line-height:1.5}
#crGate .nt a{color:#ff6870}
#crGate .ld{display:none;padding:34px 0 20px}
#crGate .sp{width:46px;height:46px;margin:0 auto 16px;border:4px solid #3a141b;border-top-color:#ff1825;border-radius:50%;animation:crsp 1s linear infinite}
@keyframes crsp{to{transform:rotate(360deg)}}
#crGate.chk .ld{display:block}#crGate.chk .mn{display:none}
#crGate .er{display:none;background:rgba(255,24,37,.12);border:1px solid #ff4550;border-radius:10px;padding:10px 12px;margin:0 0 16px;font-size:13px;color:#ffb3b8}
#crGate .ad{display:none;text-align:left;margin-top:14px;background:rgba(255,184,0,.07);border:1px dashed #ffb800;border-radius:10px;padding:12px 14px;font-size:12px;color:#e6dadd;line-height:1.55}
#crGate .ad b{color:#ffd36b}#crGate code{background:#000;padding:1px 6px;border-radius:4px;word-break:break-all;color:#ffd36b}
#crGate .dv{display:none;margin-top:12px;background:none;border:1px solid #555;color:#bbb;border-radius:30px;padding:8px 16px;font-size:12px;cursor:pointer}
@media(max-width:480px){#crGate h1{font-size:34px}#crGate .gb{padding:30px 18px 22px}}`;
D.head.appendChild(st);
const base=C.redirectUri||(location.origin+location.pathname.replace(/[^/]*$/,''));
const ICO='<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.74 19.74 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.1 13.1 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.099.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>';
let G,done=false;
function build(){
  G=D.createElement('div');G.id='crGate';G.setAttribute('role','dialog');G.setAttribute('aria-modal','true');G.setAttribute('aria-label','Inicia sesión');
  G.innerHTML=`<div class="gb"><img class="lg" src="assets/logo-cr.webp" alt="Colombia Reals">
<div class="ld"><div class="sp"></div><p>Verificando tu cuenta de Discord…</p></div>
<div class="mn"><h1>COLOMBIA REALS</h1><div class="sub">CATÁLOGO OFICIAL</div>
<p>Para ver el catálogo, las membresías VIP y las facciones necesitas iniciar sesión con tu cuenta de <b>Discord</b>.</p>
<div class="er" id="crEr"></div>
<ul><li><span>🚗</span>Vehículos, motos, skins y artículos exclusivos</li><li><span>⭐</span>Membresías VIP y detección automática de tu rol</li><li><span>⚔</span>Catálogo de facciones legales e ilegales</li><li><span>♥</span>Favoritos y pedidos por ticket más rápidos</li></ul>
<button class="dcb" id="crGo">${ICO}<span>INICIAR SESIÓN CON DISCORD</span></button>
<div class="ad" id="crAd"><b>⚙️ Solo administrador</b><br>1) Crea una aplicación en discord.com/developers/applications.<br>2) En OAuth2 → Redirects agrega: <code id="crRd"></code><br>3) Pega el Client ID en <code>assets/config.js</code>.<br>4) Sube el sitio a internet: no funciona abriendo el archivo directo.</div>
<button class="dv" id="crDv">Entrar en modo prueba (solo en tu PC)</button>
<div class="nt">🔒 Nunca vemos tu contraseña: el acceso lo gestiona Discord.<br>¿No tienes cuenta? <a href="https://discord.com/register" target="_blank" rel="noopener">Créala gratis en Discord</a>.${C.invite?' · <a href="'+C.invite+'" target="_blank" rel="noopener">Únete al servidor</a>':''}</div></div></div>`;
  D.body.appendChild(G);
  const hasTok=/access_token=/.test(location.hash)||(()=>{try{const t=JSON.parse(localStorage.getItem(K)||'null');return t&&t.e>Date.now()}catch(e){return false}})();
  if(hasTok){G.classList.add('chk');setTimeout(()=>{if(!done)G.classList.remove('chk')},9000)}
  G.querySelector('#crGo').onclick=login;
  if(dev){const b=G.querySelector('#crDv');b.style.display='inline-block';b.onclick=()=>{try{sessionStorage.setItem('cr_dev',1)}catch(e){}unlock()}}
}
function login(){
  if(!C.clientId||location.protocol=='file:'){const a=G.querySelector('#crAd');a.style.display='block';G.querySelector('#crRd').textContent=location.protocol=='file:'?'(primero sube el sitio a internet)':base;return}
  const sc=['identify'];if(C.requireGuild&&C.guildId)sc.push('guilds');if(C.guildId&&C.vipRoleIds&&C.vipRoleIds.length)sc.push('guilds.members.read');
  try{sessionStorage.setItem('cr_ret',location.href.split('#')[0])}catch(e){}
  location.href='https://discord.com/oauth2/authorize?client_id='+C.clientId+'&response_type=token&redirect_uri='+encodeURIComponent(base)+'&scope='+encodeURIComponent(sc.join(' '));
}
function unlock(){
  done=true;H.classList.remove('cr-lock');if(G)G.remove();
  try{const r=sessionStorage.getItem('cr_ret');sessionStorage.removeItem('cr_ret');
    if(r){const n=r.split('/').pop(),c=location.pathname.split('/').pop()||'index.html';if(n&&n!=c&&n!='index.html'&&/\.html$/.test(n))location.replace(n)}}catch(e){}
  dispatchEvent(new Event('resize'));
}
function show(msg){if(!G)return;G.classList.remove('chk');if(msg){const e=G.querySelector('#crEr');e.textContent=msg;e.style.display='block'}}
D.addEventListener('cr:login',unlock);
D.addEventListener('cr:nologin',()=>toLogin('expired'));
D.addEventListener('cr:denied',()=>toLogin('denied'));
D.addEventListener('cr:error',()=>toLogin('error'));
if(D.readyState=='loading')D.addEventListener('DOMContentLoaded',build);else build();
})();
