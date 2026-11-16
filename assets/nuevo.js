(()=>{const C=window.CR||{},A=C.apiUrl||'',D=document;let T='';
try{const t=JSON.parse(localStorage.getItem('cr_sess')||'null');if(t&&t.e>Date.now())T=t.t}catch(e){}
const dias=d=>Math.ceil((d-Date.now())/864e5),Y=new Date().getFullYear();
(C.proximamente||[]).length&&(()=>{const l=C.proximamente.filter(x=>Date.parse(x.f)>Date.now()),at=D.getElementById('catalogo');if(!l.length||!at)return;
 const x=D.createElement('section');x.id='crX';x.innerHTML='<h3>⏳ Próximamente</h3><div class="g">'+l.map(r=>'<div class="k"><b>'+String(r.t).replace(/</g,'&lt;')+'</b><small>en '+dias(Date.parse(r.f))+' días · '+r.f+'</small></div>').join('')+'</div>';at.before(x)})();
if(!T)return;const H={Authorization:'Bearer '+T},E=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
const out=()=>{try{localStorage.removeItem('cr_sess')}catch(e){}location.href='login.html'};
const go=async p=>{const r=await fetch(A+'/api'+p,{headers:H});return r.json()};
fetch('https://discord.com/api/users/@me',{headers:H}).then(r=>r.json()).then(u=>{if(!u.id)return;const n=u.global_name||u.username,
 a=u.avatar?'https://cdn.discordapp.com/avatars/'+u.id+'/'+u.avatar+'.png?size=64':'assets/logo-cr.webp';
 const b=D.createElement('div');b.id='crU';b.innerHTML='<img src="'+a+'" alt=""><span>'+E(n)+'</span><button type="button">Salir</button>';
 b.lastChild.onclick=out;D.body.appendChild(b)}).catch(()=>{});
const m=D.createElement('div');m.id='crM';m.innerHTML='<div><b>📦 Estado de tus canjes</b><ul id="crL"></ul><button class="crB" type="button">Cerrar</button></div>';
m.onclick=e=>{if(e.target==m||e.target.tagName=='BUTTON')m.style.display='none'};D.body.appendChild(m);
const p=D.createElement('div');p.id='crP';p.innerHTML='<button class="crB" type="button">📦 Mi entrega</button>';
p.firstChild.onclick=async()=>{const l=D.getElementById('crL');l.innerHTML='<li>Cargando…</li>';m.style.display='flex';
 try{const d=await go('/status');l.innerHTML=d.ok&&d.items.length?d.items.map(x=>'<li>'+E(x.reward)+' <small>('+E(x.code)+')</small><i>'+(x.delivered?'✅ Entregado':'⏳ Pendiente')+'</i></li>').join(''):'<li>Aún no tienes canjes.</li>'}
 catch(e){l.innerHTML='<li>No se pudo consultar. Inténtalo más tarde.</li>'}};D.body.appendChild(p);
go('/flash').then(d=>{if(!d.ok)return;const f=d.flash,b=D.createElement('div');b.id='crF';D.body.prepend(b);
 const t=()=>{const s=Math.max(0,Math.floor((f.end-Date.now())/1000));if(!s){b.remove();return}
  b.textContent='⚡ '+f.title+(f.text?' · '+f.text:'')+' — termina en '+String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');setTimeout(t,1000)};t()}).catch(()=>{});
})();