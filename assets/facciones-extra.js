/* Tarjetas "Elige tu facción": cambian a la pestaña correcta y bajan a la sección */
(()=>{document.querySelectorAll('.ovc').forEach(c=>c.addEventListener('click',e=>{
  e.preventDefault();const id=c.getAttribute('href').slice(1),el=document.getElementById(id);if(!el)return;
  const w=el.closest('[id^=t-]');if(w&&typeof showTab==='function')showTab(w.id.slice(2));
  try{history.replaceState(null,'','#'+id)}catch(_){}
  setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),40)}))})();
