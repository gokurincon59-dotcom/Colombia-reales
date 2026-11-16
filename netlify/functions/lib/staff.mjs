/* Paneles de staff por rango: cada rango tiene su propio usuario y contraseña (variable STAFF_USERS en Netlify).
   Todo se valida aquí, en el servidor. Rutas: /api/staff/login, me, reports, tasks, news, team, log */
import { randomInt, createHmac, createHash, timingSafeEqual } from 'node:crypto';

/* id, nombre, nivel (1 = más bajo, 27 = más alto), grupo */
export const ROLES = [
  ['creador_contenido', 'Creador de contenido', 'creadores'],
  ['ayudante_aprueba', 'Ayudante (aprueba)', 'ayudantes'],
  ['soporte', 'Soporte', 'soporte'],
  ['ayudante', 'Ayudante', 'ayudantes'],
  ['ayudante_sobresaliente', 'Ayudante sobresaliente', 'ayudantes'],
  ['moderador_aprueba', 'Moderador (aprueba)', 'moderacion'],
  ['moderador_sobresaliente', 'Moderador sobresaliente', 'moderacion'],
  ['gamer_operator', 'Gamer operator', 'operacion'],
  ['game_operador_aprueba', 'Game operador (aprueba)', 'operacion'],
  ['gamer_operador_superior', 'Gamer operador superior', 'operacion'],
  ['encargado_eventos', 'Encargado de eventos', 'eventos'],
  ['ay_enc_creadores', 'Ayudante encargado de creadores de contenido', 'creadores'],
  ['enc_creadores', 'Encargado de creadores de contenido', 'creadores'],
  ['ay_enc_legal', 'Ayudante encargado de facción legal', 'legal'],
  ['enc_legal', 'Encargado de facción legal', 'legal'],
  ['ay_enc_ilegal', 'Ayudante encargado de facción ilegal', 'ilegal'],
  ['enc_ilegal', 'Encargado de facción ilegal', 'ilegal'],
  ['supervisor_aprendiz', 'Supervisor aprendiz', 'supervision'],
  ['supervisor_admin', 'Supervisor administrativo', 'supervision'],
  ['ai_aprendiz', 'Asuntos internos aprendiz', 'internos'],
  ['personal_ai', 'Personal de asuntos internos', 'internos'],
  ['superior_ai', 'Superior de asuntos internos', 'internos'],
  ['asuntos_internos', 'Asuntos internos', 'internos'],
  ['sub_jefe_admin', 'Sub jefe administrativo', 'direccion'],
  ['jefe_admin', 'Jefe administrativo', 'direccion'],
  ['sub_ceo', 'Sub CEO', 'direccion'],
  ['sub_fundador', 'Sub fundador', 'direccion']
].map(([id, name, group], i) => ({ id, name, group, level: i + 1 }));

export const GROUPS = {
  creadores: { name: 'Creadores de contenido', color: '#ff4fa3', funciones: ['Registrar videos, clips y transmisiones del servidor', 'Reportar métricas y propuestas de contenido', 'Coordinar con tu encargado de creadores'] },
  ayudantes: { name: 'Ayudantes', color: '#3bc4ff', funciones: ['Atender dudas de jugadores en tiempo real', 'Reportar casos que debe revisar un moderador', 'Seguir las tareas que te asigne tu superior'] },
  soporte: { name: 'Soporte', color: '#37d67a', funciones: ['Atender tickets y entregas de canjes', 'Reportar fallas del catálogo o del servidor', 'Dar seguimiento a pedidos pendientes'] },
  moderacion: { name: 'Moderación', color: '#ffb02e', funciones: ['Aplicar y registrar sanciones', 'Reportar incidentes y evidencia', 'Escalar casos graves a supervisión'] },
  operacion: { name: 'Operación de juego', color: '#9b7bff', funciones: ['Vigilar el estado del servidor de juego', 'Reportar bugs, caídas y mantenimientos', 'Coordinar reinicios y actualizaciones'] },
  eventos: { name: 'Eventos', color: '#ff7a3d', funciones: ['Planear y reportar eventos del servidor', 'Asignar tareas al equipo de apoyo', 'Publicar anuncios de eventos'] },
  legal: { name: 'Facciones legales', color: '#2f8cff', funciones: ['Supervisar las facciones legales (policía, EMS, etc.)', 'Revisar reportes de sus líderes', 'Reportar novedades al equipo de supervisión'] },
  ilegal: { name: 'Facciones ilegales', color: '#e01322', funciones: ['Supervisar las facciones ilegales y sus reglas', 'Revisar reportes de conflictos y guerras', 'Reportar novedades al equipo de supervisión'] },
  supervision: { name: 'Supervisión', color: '#00d1b2', funciones: ['Revisar el trabajo de ayudantes, moderadores y encargados', 'Ver todos los reportes del equipo', 'Consultar el registro de actividad'] },
  internos: { name: 'Asuntos internos', color: '#c9c9d4', funciones: ['Investigar quejas contra el staff', 'Revisar reportes y el registro de actividad', 'Reportar hallazgos a la dirección'] },
  direccion: { name: 'Dirección', color: '#ffd66b', funciones: ['Dirigir al equipo y publicar anuncios', 'Asignar tareas a cualquier rango inferior', 'Ver reportes, equipo y registro completo'] }
};

const roleOf = id => ROLES.find(r => r.id === id);
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (e, s = 400) => J({ error: e }, s);
const safeEq = (a, b) => { const A = Buffer.from(String(a || '')), B = Buffer.from(String(b || '')); return A.length === B.length && timingSafeEqual(A, B); };

/* STAFF_USERS = "usuario:clave:rol_id, usuario2:clave2:rol_id" (la clave no puede llevar comas ni dos puntos) */
export const staffAccounts = deps => {
  const out = [];
  for (const part of String(deps.staffUsers || '').split(/[\n,;]+/)) {
    const [u, p, r] = part.split(':').map(s => (s || '').trim());
    if (u && p && roleOf(r)) out.push({ user: u, pass: p, role: r });
  }
  return out;
};
const secretOf = deps => deps.staffSecret || deps.adminSecret || createHash('sha256').update('cr-staff|' + String(deps.staffUsers || '')).digest('hex');
const signOf = (p, deps) => createHmac('sha256', secretOf(deps)).update(p).digest('base64url');
const TTL = 10 * 3600e3;
const mkToken = (acc, deps) => { const p = Buffer.from(JSON.stringify({ u: acc.user, r: acc.role, e: Date.now() + TTL })).toString('base64url'); return 'stf.' + p + '.' + signOf(p, deps); };
function fromToken(h, deps) {
  const m = /^stf\.([\w-]+)\.([\w-]+)$/.exec(String(h || '').replace(/^Bearer\s+/i, '').trim());
  if (!m || !safeEq(m[2], signOf(m[1], deps))) return null;
  try { const d = JSON.parse(Buffer.from(m[1], 'base64url').toString('utf8')); const acc = staffAccounts(deps).find(a => a.user === d.u && a.role === d.r); return d.e > Date.now() && acc ? { user: acc.user, role: roleOf(acc.role) } : null; } catch (e) { return null; }
}

/* Permisos según el nivel del rango */
const can = lv => ({
  review: lv >= 11,    // ver y revisar reportes de rangos inferiores
  assign: lv >= 11,    // asignar tareas a rangos inferiores
  news: lv >= 11,      // publicar anuncios
  team: lv >= 18,      // ver el equipo
  log: lv >= 18        // ver el registro de actividad
});

const mkId = () => Date.now() + '-' + randomInt(1000, 9999);

export async function staffHandle(req, path, deps, log) {
  const store = deps.store, m = req.method;
  if (!staffAccounts(deps).length) return fail('Los paneles de staff no están activos: falta la variable STAFF_USERS en Netlify.', 503);
  const body = async () => { try { return await req.json(); } catch (e) { return {}; } };

  if (path === '/staff/login' && m === 'POST') {
    const ip = String(req.headers.get('x-nf-client-connection-ip') || (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'x').trim().replace(/[^\w.:]/g, '_').slice(0, 60);
    const rk = 'sl:' + ip, rr = await store.get(rk), fresh = rr && rr.t > Date.now() - 900e3;
    if (fresh && rr.n >= 5) return fail('Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.', 429);
    const b = await body(), u = clip(b.user, 80), p = String(b.pass == null ? '' : b.pass).slice(0, 200);
    let hit = null; for (const a of staffAccounts(deps)) { if (safeEq(u, a.user) & safeEq(p, a.pass)) hit = a; }
    if (!hit) { await store.set(rk, { t: fresh ? rr.t : Date.now(), n: fresh ? rr.n + 1 : 1 }); return fail('Usuario o contraseña incorrectos.', 401); }
    await store.del(rk);
    const role = roleOf(hit.role);
    await store.set('s:last:' + hit.user, { user: hit.user, role: role.id, t: Date.now() });
    await log(store, { id: 'staff:' + hit.user, name: hit.user }, 'login staff', role.name);
    return J({ ok: true, token: mkToken(hit, deps), exp: Date.now() + TTL });
  }

  const s = fromToken(req.headers.get('authorization'), deps);
  if (!s) return fail('Sesión de staff no válida o vencida.', 401);
  const { role, user } = s, lv = role.level, P = can(lv), by = { id: 'staff:' + user, name: user + ' (' + role.name + ')' };
  const keys = async p => (await store.keys(p)).sort().reverse();
  const lower = id => { const r = roleOf(id); return r && r.level < lv ? r : null; };

  if (path === '/staff/me' && m === 'GET') {
    const g = GROUPS[role.group];
    const news = (await Promise.all((await keys('s:n:')).slice(0, 15).map(k => store.get(k)))).filter(Boolean);
    return J({ ok: true, user, role: { id: role.id, name: role.name, level: lv, total: ROLES.length, group: g.name, color: g.color, funciones: g.funciones }, can: P, news, roles: P.assign ? ROLES.filter(r => r.level < lv).map(r => ({ id: r.id, name: r.name })) : [] });
  }

  if (path === '/staff/reports' && m === 'GET') {
    const rows = (await Promise.all((await keys('s:r:')).slice(0, 300).map(k => store.get(k)))).filter(Boolean);
    return J({ ok: true, reports: rows.filter(r => r.by === user || (P.review && (roleOf(r.role) || { level: 99 }).level < lv)).slice(0, 80) });
  }
  if (path === '/staff/reports' && m === 'POST') {
    const b = await body(), title = clip(b.title, 80), text = clip(b.text, 1500);
    if (!title || !text) return fail('Escribe el título y el detalle del reporte.');
    const r = { id: mkId(), t: Date.now(), by: user, role: role.id, roleName: role.name, title, text, status: 'pendiente' };
    await store.set('s:r:' + r.id, r); await log(store, by, 'reporte', title);
    return J({ ok: true, report: r });
  }
  if (path === '/staff/reports/review' && m === 'POST') {
    const b = await body(), r = await store.get('s:r:' + clip(b.id, 40));
    if (!r) return fail('Reporte no encontrado.', 404);
    if (!P.review || !lower(r.role)) return fail('No tienes permiso para revisar este reporte.', 403);
    if (!['aprobado', 'rechazado', 'pendiente'].includes(b.status)) return fail('Estado no válido.');
    r.status = b.status; r.rev = user; r.note = clip(b.note, 200);
    await store.set('s:r:' + r.id, r); await log(store, by, 'revisar reporte', b.status + ' · ' + r.title);
    return J({ ok: true, report: r });
  }

  if (path === '/staff/tasks' && m === 'GET') {
    const rows = (await Promise.all((await keys('s:t:')).slice(0, 300).map(k => store.get(k)))).filter(Boolean);
    return J({ ok: true, tasks: rows.filter(t => t.to === role.id || t.by === user).slice(0, 80) });
  }
  if (path === '/staff/tasks' && m === 'POST') {
    if (!P.assign) return fail('Tu rango no puede asignar tareas.', 403);
    const b = await body(), to = lower(clip(b.to, 40)), text = clip(b.text, 300);
    if (!to) return fail('Elige un rango inferior al tuyo.'); if (!text) return fail('Escribe la tarea.');
    const t = { id: mkId(), t: Date.now(), by: user, byRole: role.name, to: to.id, toName: to.name, text, done: false };
    await store.set('s:t:' + t.id, t); await log(store, by, 'tarea', to.name + ' · ' + text);
    return J({ ok: true, task: t });
  }
  if (path === '/staff/tasks/done' && m === 'POST') {
    const b = await body(), t = await store.get('s:t:' + clip(b.id, 40));
    if (!t || (t.to !== role.id && t.by !== user)) return fail('Tarea no encontrada.', 404);
    t.done = !!b.done; await store.set('s:t:' + t.id, t);
    return J({ ok: true, task: t });
  }

  if (path === '/staff/news' && m === 'POST') {
    if (!P.news) return fail('Tu rango no puede publicar anuncios.', 403);
    const b = await body(), title = clip(b.title, 80), text = clip(b.text, 600);
    if (!title) return fail('Escribe el título del anuncio.');
    const n = { id: mkId(), t: Date.now(), by: user, role: role.name, title, text };
    await store.set('s:n:' + n.id, n); await log(store, by, 'anuncio staff', title);
    return J({ ok: true, news: n });
  }

  if (path === '/staff/team' && m === 'GET') {
    if (!P.team) return fail('Tu rango no puede ver el equipo.', 403);
    const last = Object.fromEntries((await Promise.all((await store.keys('s:last:')).map(k => store.get(k)))).filter(Boolean).map(x => [x.user, x.t]));
    return J({ ok: true, team: staffAccounts(deps).map(a => ({ user: a.user, role: roleOf(a.role).name, level: roleOf(a.role).level, last: last[a.user] || 0 })).sort((a, b) => b.level - a.level) });
  }
  if (path === '/staff/log' && m === 'GET') {
    if (!P.log) return fail('Tu rango no puede ver el registro.', 403);
    const rows = (await Promise.all((await keys('l:')).slice(0, 400).map(k => store.get(k)))).filter(r => r && String(r.id).startsWith('staff:'));
    return J({ ok: true, log: rows.slice(0, 100) });
  }
  return fail('Ruta no encontrada.', 404);
}
