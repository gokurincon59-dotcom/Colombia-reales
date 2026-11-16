/* ===== CONFIGURACIÓN DEL LOGIN CON DISCORD (edita solo este archivo) =====
   1) Entra a https://discord.com/developers/applications → New Application → OAuth2.
   2) En "Redirects" agrega la dirección de tu sitio (la pantalla de entrada te la muestra al pulsar el botón).
   3) Copia el Client ID y pégalo abajo. Sube el sitio a internet (no funciona abriendo el archivo directo). */
window.CR={
  apiUrl:"",                          // servidor de códigos: vacío = este mismo sitio (déjalo así)
  redirectUri:"https://colombia-reales.netlify.app/", // ← debe ser IDÉNTICA a la que agregues en Discord → OAuth2 → Redirects (con la / final)
  clientId:"1569929106370338816",     // ← Client ID de tu aplicación de Discord
  guildId:"1343343204740894742",      // ID de tu servidor (para detectar el rol VIP)
  vipRoleIds:[],                      // IDs de los roles VIP, ej: ["123456789","987654321"]
  requireGuild:true,                  // true = además de tener Discord, hay que estar en TU servidor
  ticketUrl:"https://discord.com/channels/1343343204740894742/1382489928306266174", // canal de tickets de ventas: lo usan todos los botones de ticket
  invite:"https://discord.gg/TwFXh8CN", // invitación oficial al servidor de Discord

  /* ===== MEGA 7 (opcional) ===== */
  tema:"auto",   // "auto" (Navidad 1 nov–25 dic · Año Nuevo 26 dic–6 ene · Normal el resto) | "navidad" | "newyear" | "normal"
  proximamente:[],  // ej: [{t:"Skin nueva",f:"2026-12-20"}] → tarjetas "Próximamente" con cuenta regresiva
  fiesta:{
    stock:{},            // cupos fijos sin servidor, ej: {14:3, 9:5} → "Quedan 3". Lo que pongas en el panel tiene prioridad.
    precios:{},          // precios para calcular combos, ej: {14:350000, 9:500000}. Sin precio = "Precio especial por ticket".
    comboDescuento:{},   // % por cantidad de ítems del combo, ej: {2:5, 3:10, 4:12}
    resumen:{}           // Resumen del año: {titulo:"Tu año en Colombia Reals", mensaje:"Gracias por todo…"}
  }
};
