/* Lógica del servidor de códigos (sin dependencias de Netlify para poder probarla).
   Recibe un "store" con get/set/del/keys y una función fetch. */
import { randomInt, createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { staffHandle } from './staff.mjs';

const AL = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (error, s = 400) => J({ error }, s);
const norm = c => String(c || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 60);
const rnd = n => { let s = ''; for (let i = 0; i < n; i++) s += AL[randomInt(AL.length)]; return s.match(/.{1,4}/g).join('-'); };
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const expired = c => c.exp && new Date(c.exp + 'T23:59:59-05:00') < new Date();   // hora de Colombia
const full = c => c.max > 0 && c.claims.length >= c.max;
const notYet = c => c.startAt && Date.now() < c.startAt;
const ended = c => c.endAt && Date.now() >= c.endAt;
const isOpen = c => c.active !== false && !expired(c) && !full(c) && !ended(c);
const ts = v => { const t = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v || '') ? Date.parse(v + ':00-05:00') : 0; return t > 0 ? t : 0; };
const reward = c => c.kind === 'discount' ? c.value + '% de descuento' : c.prize;


/* ---------- Fechas (hora de Colombia, UTC-5) ---------- */
const COT = () => new Date(Date.now() - 5 * 3600e3);
const dayStr = d => (d || COT()).toISOString().slice(0, 10);
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/* ---------- Configuración de premios (editable con variables de entorno en Netlify) ---------- */
const okR = r => r && (r.kind === 'prize' ? !!clip(r.prize, 80) : (+r.value >= 1 && +r.value <= 100));
const normR = r => r.kind === 'prize' ? { kind: 'prize', value: 0, prize: clip(r.prize, 80) } : { kind: 'discount', value: Math.round(+r.value), prize: '' };
const parseJ = (s, d, type) => { try { const v = JSON.parse(s); return (type === 'obj' ? v && typeof v === 'object' && !Array.isArray(v) : Array.isArray(v) && v.length) ? v : d; } catch (e) { return d; } };
const DEF_DAILY = [{ kind: 'discount', value: 5 }, { kind: 'discount', value: 10 }, { kind: 'prize', prize: 'Skin sorpresa' }, { kind: 'discount', value: 7 }, { kind: 'prize', prize: 'Sorpresa del staff' }];
const DEF_SPECIAL = { '12-24': 'Regalo de Nochebuena', '12-25': 'Regalo de Navidad', '12-31': 'Regalo de Año Viejo', '01-01': 'Regalo de Año Nuevo' };
const DEF_SPIN = [{ none: true, w: 45 }, { kind: 'discount', value: 5, w: 30 }, { kind: 'discount', value: 10, w: 15 }, { kind: 'discount', value: 15, w: 8 }, { kind: 'prize', prize: 'Premio sorpresa del staff', w: 2 }];
const DEF_STREAK = [{ days: 3, kind: 'discount', value: 3 }, { days: 7, kind: 'discount', value: 7 }, { days: 15, kind: 'discount', value: 15 }];
const spinNorm = a => a.filter(p => p && (p.none || okR(p))).map(p => p.none ? { none: true, w: Math.max(1, +p.w || 1), label: clip(p.label, 40) || 'Suerte para la próxima' } : { ...normR(p), w: Math.max(1, +p.w || 1) });

export function mkCfg(raw = {}) {
  let daily = parseJ(raw.daily, DEF_DAILY).filter(okR).map(normR); if (!daily.length) daily = DEF_DAILY.map(normR);
  let spin = spinNorm(parseJ(raw.spin, DEF_SPIN)); if (spin.length < 2) spin = spinNorm(DEF_SPIN);
  let streak = parseJ(raw.streak, DEF_STREAK).filter(r => r && +r.days >= 2 && okR(r)).map(r => ({ ...normR(r), days: Math.round(+r.days) })).sort((a, b) => a.days - b.days); if (!streak.length) streak = DEF_STREAK.map(r => ({ ...normR(r), days: r.days }));
  const sp = parseJ(raw.special, {}, 'obj'), special = {};
  for (const [k, v] of Object.entries({ ...DEF_SPECIAL, ...sp })) if (/^\d{2}-\d{2}$/.test(k)) { const r = typeof v === 'string' ? { kind: 'prize', prize: v } : v; if (okR(r)) special[k] = normR(r); }
  return { dailyOn: raw.dailyOn !== '0', spinOn: raw.spinOn !== '0', streakOn: raw.streakOn !== '0', dailyMax: Math.min(500, Math.max(1, Math.round(+raw.dailyMax) || 10)), daily, spin, streak, special };
}

/* Crea un código automático (código del día, ruleta, racha) con el mismo formato que los del generador. */
async function mint(store, o) {
  const have = new Set((await store.keys('c:')).map(k => k.slice(2)));
  let code; do { code = o.pre + '-' + rnd(o.len || 8); } while (have.has(code));
  const c = { code, kind: o.kind, value: o.value || 0, prize: o.prize || '', lot: o.lot, desc: o.desc || '', max: o.max || 1, per: o.per || 1, exp: o.exp || '', users: o.users || [], createdAt: Date.now(), createdBy: { id: 'auto', name: o.lot }, claims: [] };
  await store.set('c:' + code, c);
  return c;
}

/* Registro de actividad */
async function log(store, by, act, info) {
  try { await store.set('l:' + Date.now() + '-' + randomInt(1000, 9999), { t: Date.now(), by: clip(by && by.name, 40), id: (by && by.id) || '', act, info: clip(info, 160) }); } catch (e) { /* el registro nunca debe romper una acción */ }
}

const yearCache = new Map();
async function topItems(store) {
  const ks = await store.keys('t:');
  return (await Promise.all(ks.map(async k => ({ n: +k.slice(2), c: Number(await store.get(k)) || 0 })))).filter(r => r.n > 0 && r.c > 0).sort((a, b) => b.c - a.c).slice(0, 8);
}

const cache = new Map();   // token -> {u, e}  (5 min, para no saturar a Discord)

/* ---------- Acceso de administrador con usuario y contraseña (ADMIN_USER / ADMIN_PASS en Netlify) ---------- */
const safeEq = (a, b) => { const A = Buffer.from(String(a || '')), B = Buffer.from(String(b || '')); return A.length === B.length && timingSafeEqual(A, B); };
const accounts = deps => {
  const out = [];
  if (deps.adminUser && deps.adminPass) out.push({ user: deps.adminUser, pass: deps.adminPass });
  // ADMIN_EXTRA = "usuario2:clave2,usuario3:clave3"  (más administradores)
  for (const part of String(deps.adminExtra || '').split(/[\n,;]+/)) { const i = part.indexOf(':'); if (i > 0) { const u = part.slice(0, i).trim(), p = part.slice(i + 1).trim(); if (u && p) out.push({ user: u, pass: p }); } }
  return out;
};
const adminOn = deps => accounts(deps).length > 0;
const findAcc = (u, p, deps) => { let hit = null; for (const a of accounts(deps)) { const okU = safeEq(u, a.user), okP = safeEq(p, a.pass); if (okU && okP) hit = a; } return hit; };
const adminUserObj = name => ({ id: 'admin:' + name, name, avatar: '', isAdmin: true });
const secretOf = deps => deps.adminSecret || createHash('sha256').update('cr-admin|' + accounts(deps).map(a => a.user + '\u0000' + a.pass).join('\u0001')).digest('hex');
const signOf = (p, deps) => createHmac('sha256', secretOf(deps)).update(p).digest('base64url');
const ADMIN_TTL = 12 * 3600e3;   // la sesión de administrador dura 12 horas
function mkAdminToken(name, deps) {
  const p = Buffer.from(JSON.stringify({ u: name, e: Date.now() + ADMIN_TTL })).toString('base64url');
  return 'adm.' + p + '.' + signOf(p, deps);
}
function adminFromToken(t, deps) {
  const m = /^adm\.([\w-]+)\.([\w-]+)$/.exec(t || '');
  if (!m || !safeEq(m[2], signOf(m[1], deps))) return null;
  try { const d = JSON.parse(Buffer.from(m[1], 'base64url').toString('utf8')); return d.e > Date.now() && accounts(deps).some(a => safeEq(d.u, a.user)) ? adminUserObj(d.u) : null; } catch (e) { return null; }
}
function adminFromBasic(h, deps) {   // compatibilidad con el encabezado Authorization: Basic ...
  const m = /^Basic (.+)$/i.exec(h || '');
  if (!m) return null;
  const raw = Buffer.from(m[1], 'base64').toString('utf8'), i = raw.indexOf(':');
  if (i < 0) return null;
  const a = findAcc(raw.slice(0, i), raw.slice(i + 1), deps);
  return a ? adminUserObj(a.user) : null;
}

async function who(req, deps) {
  const ah = req.headers.get('authorization') || '';
  if (adminOn(deps)) { const adm = adminFromBasic(ah, deps) || adminFromToken(ah.replace(/^Bearer\s+/i, '').trim(), deps); if (adm) return adm; }
  const t = ah.replace(/^Bearer\s+/i, '').trim();
  if (!t || t.startsWith('adm.') || /^Basic /i.test(ah)) return null;
  const hit = cache.get(t);
  if (hit && hit.e > Date.now()) return hit.u;
  let d;
  try {
    const r = await deps.fetch('https://discord.com/api/oauth2/@me', { headers: { Authorization: 'Bearer ' + t } });
    if (!r.ok) return null;
    d = await r.json();
  } catch (e) { return null; }
  // El token debe haber sido emitido para ESTA aplicación de Discord.
  if (!d.user || !d.application || d.application.id !== deps.clientId) return null;
  const u = { id: d.user.id, name: d.user.global_name || d.user.username, avatar: d.user.avatar ? `https://cdn.discordapp.com/avatars/${d.user.id}/${d.user.avatar}.png?size=64` : '' };
  cache.set(t, { u, e: Date.now() + 300000 });
  if (cache.size > 500) cache.clear();
  return u;
}

const getAll = async store => (await Promise.all((await store.keys('c:')).map(k => store.get(k)))).filter(Boolean);

export async function handle(req, deps) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, '').replace(/\/+$/, '') || '/';
  const m = req.method;
  const cfg = mkCfg(deps.cfg), store = deps.store;
  if (path === '/ping') return J({ ok: true, admins: deps.admins.length > 0 || adminOn(deps), login: adminOn(deps), daily: cfg.dailyOn, spin: cfg.spinOn, streak: cfg.streakOn });

  /* ---------- LOGIN DE ADMINISTRADOR (usuario + contraseña) ---------- */
  if (path === '/admin/login' && m === 'POST') {
    if (!adminOn(deps)) return fail('El acceso con usuario y contraseña no está activo: faltan ADMIN_USER y ADMIN_PASS en Netlify.', 503);
    const ip = String(req.headers.get('x-nf-client-connection-ip') || (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'x').trim().replace(/[^\w.:]/g, '_').slice(0, 60);
    const rk = 'al:' + ip, rr = await store.get(rk), fresh = rr && rr.t > Date.now() - 900e3;
    if (fresh && rr.n >= 5) return fail('Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.', 429);
    let b = {}; try { b = await req.json(); } catch (e) { /* cuerpo vacío */ }
    const acc = findAcc(clip(b.user, 80), String(b.pass == null ? '' : b.pass).slice(0, 200), deps);
    if (!acc) {
      await store.set(rk, { t: fresh ? rr.t : Date.now(), n: fresh ? rr.n + 1 : 1 });
      return fail('Usuario o contraseña incorrectos.', 401);
    }
    await store.del(rk);
    await log(store, adminUserObj(acc.user), 'login', 'Inicio de sesión de administrador');
    return J({ ok: true, token: mkAdminToken(acc.user, deps), exp: Date.now() + ADMIN_TTL, user: { name: acc.user } });
  }

  /* ---------- PANELES DE STAFF POR RANGO (sesión propia, ver lib/staff.mjs) ---------- */
  if (path.startsWith('/staff/')) return staffHandle(req, path, deps, log);

  /* ---------- PÚBLICAS (no piden sesión) ---------- */
  if (path === '/daily' && m === 'GET') {
    if (!cfg.dailyOn) return J({ ok: false });
    const d = dayStr();
    const rec = await store.get('d:' + d);
    let c = rec && await store.get('c:' + rec.code);
    if (!c) {
      const sp = cfg.special[d.slice(5)];
      const r = sp || cfg.daily[Math.floor(Date.parse(d + 'T00:00:00Z') / 864e5) % cfg.daily.length];
      c = await mint(store, { pre: 'DIA-' + d.slice(5, 7) + d.slice(8, 10), len: 4, ...r, max: cfg.dailyMax, exp: d, lot: 'Código del día', desc: 'Código público del ' + d });
      await store.set('d:' + d, { code: c.code });
    }
    return J({ ok: true, date: d, code: c.code, reward: reward(c), max: c.max, left: Math.max(0, c.max - c.claims.length), special: !!cfg.special[d.slice(5)] });
  }
  if (path === '/flash' && m === 'GET') {
    const f = await store.get('flash');
    return J({ ok: !!(f && f.end > Date.now()), flash: f && f.end > Date.now() ? f : null });
  }
  if (path === '/stock' && m === 'GET') return J({ ok: true, stock: (await store.get('stock')) || {} });
  if (path === '/top' && m === 'GET') return J({ ok: true, top: await topItems(store) });
  if (path === '/year' && m === 'GET') {
    const y = Math.round(+url.searchParams.get('y')) || COT().getUTCFullYear();
    const hit = yearCache.get(y);
    if (!deps.noCache && hit && hit.e > Date.now()) return J(hit.v);
    const all = await getAll(store); let redeems = 0, delivered = 0; const players = new Set();
    for (const c of all) for (const x of c.claims) if (new Date(x.at - 5 * 3600e3).getUTCFullYear() === y) { redeems++; players.add(x.uid); if (x.delivered) delivered++; }
    const v = { ok: true, year: y, redeems, players: players.size, delivered, top: await topItems(store) };
    yearCache.set(y, { v, e: Date.now() + 600000 });
    return J(v);
  }

  const user = await who(req, deps);
  if (!user) return fail('Inicia sesión con Discord para continuar.', 401);
  if (user.isAdmin && !path.startsWith('/admin')) return fail('Esta sesión es solo para el panel de administración.', 403);
  const body = async () => { try { return await req.json(); } catch (e) { return {}; } };

  /* Registro de jugadores: la primera vez que alguien inicia sesión con Discord queda registrado.
     Guarda nombre, avatar, fecha de registro, última visita y días de visita (1 por día). */
  if (!user.isAdmin) {
    try {
      const pk = 'p:' + user.id, today = dayStr(), now = Date.now();
      const p = await store.get(pk);
      if (!p) await store.set(pk, { id: user.id, name: clip(user.name, 40), avatar: user.avatar || '', first: now, last: now, days: 1, lastDay: today });
      else if (p.lastDay !== today || now - p.last > 600e3 || p.name !== clip(user.name, 40)) {
        await store.set(pk, { ...p, name: clip(user.name, 40), avatar: user.avatar || p.avatar || '', last: now, days: p.lastDay !== today ? (p.days || 0) + 1 : p.days, lastDay: today });
      }
    } catch (e) { /* el registro nunca debe romper una acción */ }
  }
  /* Jugadores bloqueados: no pueden canjear, girar la ruleta ni sumar racha. */
  if (!user.isAdmin && (path === '/redeem' || (m === 'POST' && (path === '/spin' || path === '/streak'))) && await store.get('x:' + user.id)) return fail('Tu cuenta está bloqueada. Abre un ticket con el staff.', 403);
  if (path === '/hello' && m === 'POST') return J({ ok: true });

  /* ---------- JUGADOR ---------- */
  if (path === '/status' && m === 'GET') {
    const mine = [];
    for (const c of await getAll(store)) for (const x of c.claims) if (x.uid === user.id) mine.push({ code: c.code, reward: reward(c), at: x.at, delivered: !!x.delivered });
    return J({ ok: true, items: mine.sort((a, b) => b.at - a.at).slice(0, 30) });
  }
  if (path === '/redeem' && m === 'POST') {
    const code = norm((await body()).code);
    if (code.length < 6) return fail('Escribe tu código completo.');
    // Límite de intentos: 10 códigos inválidos por hora y por cuenta.
    const rk = 'r:' + user.id, rr = await store.get(rk), fresh = rr && rr.t > Date.now() - 3600e3;
    if (fresh && rr.n >= 10) return fail('Demasiados intentos con códigos inválidos. Espera un rato e inténtalo de nuevo.', 429);
    const c = await store.get('c:' + code);
    if (!c) { await store.set(rk, { n: (fresh ? rr.n : 0) + 1, t: fresh ? rr.t : Date.now() }); return fail('Ese código no es válido.', 404); }
    if (c.active === false) return fail('Ese código no está activo.', 410);
    if (notYet(c)) return fail('Ese código todavía no está abierto.', 425);
    if (expired(c) || ended(c)) return fail('Ese código ya venció.', 410);
    if (c.users.length && !c.users.includes(user.id)) return fail('Este código es personal y no pertenece a tu cuenta de Discord.', 403);
    const per = c.per || 1, used = c.claims.filter(x => x.uid === user.id).length;
    if (used >= per) return fail(per > 1 ? 'Ya usaste este código el máximo de veces (' + per + ').' : 'Ya canjeaste este código.', 409);
    if (full(c)) return fail('Este código ya se agotó.', 409);
    c.claims.push({ uid: user.id, name: user.name, avatar: user.avatar, at: Date.now(), delivered: false });
    await store.set('c:' + code, c);
    await log(store, user, 'canje', code + ' · ' + reward(c));
    if (deps.webhook) { try { await deps.fetch(deps.webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: '🎁 **' + clip(user.name, 40) + '** canjeó `' + code + '` → ' + reward(c) }) }); } catch (e) { /* el aviso nunca rompe el canje */ } }
    return J({ ok: true, code, kind: c.kind, value: c.value, prize: c.prize, reward: reward(c), user });
  }

  if (path === '/mine' && m === 'GET') {
    const all = await getAll(store), claimed = [], assigned = [];
    for (const c of all) {
      const mine = c.claims.filter(x => x.uid === user.id);
      for (const x of mine) claimed.push({ code: c.code, reward: reward(c), kind: c.kind, at: x.at, delivered: !!x.delivered });
      if (mine.length < (c.per || 1) && c.users.includes(user.id) && isOpen(c)) assigned.push({ code: c.code, reward: reward(c), exp: c.exp });
    }
    claimed.sort((a, b) => b.at - a.at);
    return J({ user, claimed, assigned });
  }

  /* Cuenta un pedido por ítem (una vez por persona e ítem) para la vitrina "Los más pedidos". */
  if (path === '/track' && m === 'POST') {
    const n = Math.round(+(await body()).n);
    if (!(n >= 1 && n <= 999)) return fail('Ítem no válido.');
    const mk = 'u:' + n + ':' + user.id;
    if (await store.get(mk)) return J({ ok: true, dup: true });
    await store.set(mk, 1);
    await store.set('t:' + n, (Number(await store.get('t:' + n)) || 0) + 1);
    return J({ ok: true });
  }

  /* Racha de visitas: una visita por día; premios por hitos (una vez al mes cada uno). */
  if (path === '/streak' && (m === 'GET' || m === 'POST')) {
    if (!cfg.streakOn) return J({ ok: false });
    const k = 'k:' + user.id, today = dayStr(), rewards = [];
    const s = (await store.get(k)) || { last: '', days: 0, best: 0, aw: { ym: '', list: [] } };
    if (m === 'POST' && s.last !== today) {
      s.days = s.last === addDays(today, -1) ? s.days + 1 : 1;
      s.last = today; s.best = Math.max(s.best || 0, s.days);
      const ym = today.slice(0, 7);
      if (!s.aw || s.aw.ym !== ym) s.aw = { ym, list: [] };
      for (const r of cfg.streak) {
        if (s.days >= r.days && !s.aw.list.includes(r.days)) {
          s.aw.list.push(r.days);
          const c = await mint(store, { pre: 'RAC', ...r, users: [user.id], max: 1, exp: addDays(today, 14), lot: 'Racha de visitas', desc: 'Racha de ' + r.days + ' días' });
          rewards.push({ days: r.days, code: c.code, reward: reward(c), exp: c.exp });
          await log(store, user, 'racha', r.days + ' días · ' + c.code + ' · ' + reward(c));
        }
      }
      await store.set(k, s);
    }
    const alive = s.last === today || s.last === addDays(today, -1), days = alive ? s.days : 0;
    const next = cfg.streak.find(r => r.days > days);
    return J({ ok: true, days, best: s.best || 0, today: s.last === today, rewards, next: next ? { days: next.days, reward: reward(next) } : null, milestones: cfg.streak.map(r => ({ days: r.days, reward: reward(r) })) });
  }

  /* Ruleta diaria: un giro por persona y día; si gana, se crea un código personal (vence en 7 días). */
  if (path === '/spin' && (m === 'GET' || m === 'POST')) {
    if (!cfg.spinOn) return J({ ok: false });
    const k = 's:' + user.id, today = dayStr(), s = (await store.get(k)) || {};
    const labels = cfg.spin.map(p => p.none ? p.label : reward(p));
    if (m === 'GET') return J({ ok: true, can: s.date !== today, labels });
    if (s.date === today) return fail('Ya giraste hoy. ¡Vuelve mañana! 🎰', 409);
    await store.set(k, { date: today });
    let r = randomInt(cfg.spin.reduce((a, p) => a + p.w, 0)), idx = 0;
    for (; idx < cfg.spin.length - 1; idx++) { if (r < cfg.spin[idx].w) break; r -= cfg.spin[idx].w; }
    const p = cfg.spin[idx];
    if (p.none) return J({ ok: true, win: false, idx, label: labels[idx], labels });
    const c = await mint(store, { pre: 'RUL', ...p, users: [user.id], max: 1, exp: addDays(today, 7), lot: 'Ruleta diaria', desc: 'Ganado en la ruleta' });
    await log(store, user, 'ruleta', c.code + ' · ' + reward(c));
    return J({ ok: true, win: true, idx, code: c.code, reward: reward(c), exp: c.exp, labels });
  }

  /* ---------- ADMINISTRADOR ---------- */
  if (path.startsWith('/admin')) {
    if (!user.isAdmin && !deps.admins.length) return fail('Falta configurar ADMIN_USER y ADMIN_PASS (o ADMIN_DISCORD_IDS) en Netlify → Site configuration → Environment variables.', 403);
    if (!user.isAdmin && !deps.admins.includes(user.id)) return fail('Tu cuenta de Discord no es administradora. Usa el acceso con usuario y contraseña.', 403);

    if (path === '/admin/me') return J({ user });

    if (path === '/admin/codes' && m === 'GET') {
      const all = await getAll(store);
      all.sort((a, b) => b.createdAt - a.createdAt);
      return J({ user, codes: all.filter(c => !c.community), community: all.filter(c => c.community) });
    }

    if (path === '/admin/codes' && m === 'POST') {
      const b = await body();
      const kind = b.kind === 'prize' ? 'prize' : 'discount';
      const value = kind === 'discount' ? Math.round(+b.value) : 0;
      const prize = kind === 'prize' ? clip(b.prize, 80) : '';
      if (kind === 'discount' && !(value >= 1 && value <= 100)) return fail('El descuento debe estar entre 1% y 100%.');
      if (kind === 'prize' && !prize) return fail('Escribe cuál es el premio.');
      const users = [...new Set(String(b.users || '').split(/[\s,;]+/).filter(Boolean))];
      if (users.some(u => !/^\d{15,20}$/.test(u))) return fail('Los IDs de Discord son solo números de 17 a 19 dígitos. Ej: 123456789012345678');
      const personal = users.length > 0;
      const qty = personal ? users.length : Math.min(500, Math.max(1, Math.round(+b.qty) || 1));
      if (qty > 500) return fail('Máximo 500 códigos por lote.');
      const len = [8, 12, 16].includes(+b.len) ? +b.len : 12;
      const max = personal ? 1 : Math.min(9999, Math.max(1, Math.round(+b.max) || 1));
      const per = personal ? 1 : Math.min(10, Math.max(1, Math.round(+b.per) || 1));   // veces que una misma persona puede canjear
      const exp = /^\d{4}-\d{2}-\d{2}$/.test(b.exp || '') ? b.exp : '';
      const pre = String(b.prefix || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12);
      const have = new Set((await store.keys('c:')).map(k => k.slice(2)));
      const made = [];
      for (let i = 0; i < qty; i++) {
        let code; do { code = (pre ? pre + '-' : '') + rnd(len); } while (have.has(code));
        have.add(code);
        const c = { code, kind, value, prize, lot: clip(b.lot, 40), desc: clip(b.desc, 120), max, per, exp, users: personal ? [users[i]] : [], createdAt: Date.now() + i, createdBy: { id: user.id, name: user.name }, claims: [] };
        await store.set('c:' + code, c);
        made.push(c);
      }
      await log(store, user, 'crear', qty + ' código(s) · ' + (kind === 'discount' ? value + '% de descuento' : prize) + (b.lot ? ' · lote ' + clip(b.lot, 40) : ''));
      return J({ ok: true, made });
    }

    if (path === '/admin/codes' && m === 'DELETE') {
      const code = norm(url.searchParams.get('code'));
      if (!code || !(await store.get('c:' + code))) return fail('Código no encontrado.', 404);
      await store.del('c:' + code);
      await log(store, user, 'borrar', code);
      return J({ ok: true });
    }

    if (path === '/admin/claim' && m === 'POST' && Array.isArray((await req.clone().json().catch(() => ({}))).items)) {
      const b = await body(), by = new Map(); let n = 0;
      for (const it of b.items.slice(0, 300)) { const k = norm(it.code); if (!by.has(k)) by.set(k, await store.get('c:' + k)); const c = by.get(k); if (!c) continue; const x = c.claims.find(y => y.uid === String(it.uid) && !y.delivered); if (x) { x.delivered = true; x.by = user.name; x.dat = Date.now(); n++; } }
      for (const [k, c] of by) if (c) await store.set('c:' + k, c);
      await log(store, user, 'entregar en lote', n + ' canje(s)');
      return J({ ok: true, n });
    }
    if (path === '/admin/claim' && m === 'POST') {
      const b = await body(), code = norm(b.code), c = await store.get('c:' + code);
      if (!c) return fail('Código no encontrado.', 404);
      const i = c.claims.findIndex(x => x.uid === String(b.uid) && (b.at == null || x.at === +b.at));
      if (i < 0) return fail('Ese canje no existe.', 404);
      if (b.action === 'remove') c.claims.splice(i, 1);
      else if (b.action === 'deliver') { c.claims[i].delivered = true; c.claims[i].by = user.name; c.claims[i].dat = Date.now(); }
      else if (b.action === 'undeliver') { c.claims[i].delivered = false; delete c.claims[i].by; delete c.claims[i].dat; }
      else return fail('Acción no válida.');
      await store.set('c:' + code, c);
      await log(store, user, { remove: 'quitar canje', deliver: 'entregar', undeliver: 'desmarcar entrega' }[b.action], code + ' · ' + (c.claims[i] ? c.claims[i].name : 'canje quitado'));
      return J({ ok: true });
    }

    /* Estadísticas y alertas para el panel */
    if (path === '/admin/stats' && m === 'GET') {
      const all = await getAll(store), now = Date.now(), today = dayStr();
      let claims = 0, delivered = 0, late = 0; const byDay = {}, rew = {}, alerts = [];
      for (let i = 13; i >= 0; i--) byDay[addDays(today, -i)] = 0;
      for (const c of all) {
        for (const x of c.claims) {
          claims++; if (x.delivered) delivered++; else if (now - x.at > 864e5) late++;
          const d = dayStr(new Date(x.at - 5 * 3600e3)); if (d in byDay) byDay[d]++;
          rew[reward(c)] = (rew[reward(c)] || 0) + 1;
        }
        if (expired(c)) continue;
        if (c.active === false || ended(c)) continue;
        const left = c.max - c.claims.length, auto = c.createdBy && c.createdBy.id === 'auto';
        if (c.max > 1 && left > 0 && c.max > 0 && left <= Math.max(3, Math.ceil(c.max * 0.2))) alerts.push({ type: 'low', code: c.code, left, max: c.max, reward: reward(c), lot: c.lot });
        if (!auto && c.exp && left > 0 && c.exp <= addDays(today, 2)) alerts.push({ type: 'soon', code: c.code, left, exp: c.exp, reward: reward(c), lot: c.lot });
      }
      if (late) alerts.unshift({ type: 'late', count: late });
      const stock = (await store.get('stock')) || {};
      for (const [n, v] of Object.entries(stock)) if (v <= 2) alerts.push({ type: 'stock', n: +n, left: v });
      return J({ ok: true, totals: { codes: all.length, active: all.filter(isOpen).length, claims, delivered, pending: claims - delivered, late }, byDay: Object.entries(byDay).map(([d, n]) => ({ d, n })), topRewards: Object.entries(rew).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([r, n]) => ({ r, n })), alerts });
    }

    /* Código para todos (una vez por cuenta de Discord, con cupos y/o fecha de cierre) */
    if (path === '/admin/community' && m === 'POST') {
      const b = await body(), kind = b.kind === 'prize' ? 'prize' : 'discount';
      const value = kind === 'discount' ? Math.round(+b.value) : 0, prize = kind === 'prize' ? clip(b.prize, 80) : '';
      if (kind === 'discount' && !(value >= 1 && value <= 100)) return fail('El descuento debe estar entre 1% y 100%.');
      if (kind === 'prize' && !prize) return fail('Escribe cuál es el premio.');
      const max = Math.min(99999, Math.max(0, Math.round(+b.max) || 0)), startAt = ts(b.start), endAt = ts(b.end);
      if (!max && !endAt) return fail('Pon al menos un límite: cupos o fecha de cierre.');
      if (endAt && endAt <= Date.now()) return fail('La fecha de cierre ya pasó.');
      if (startAt && endAt && endAt <= startAt) return fail('El cierre debe ser después de la apertura.');
      let code = norm(b.code);
      if (code) { if (code.length < 6 || code.length > 40) return fail('El código debe tener entre 6 y 40 caracteres.'); if (await store.get('c:' + code)) return fail('Ya existe un código con ese nombre.', 409); }
      else { const pre = String(b.prefix || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12), have = new Set((await store.keys('c:')).map(k => k.slice(2))); do { code = (pre ? pre + '-' : '') + rnd(8); } while (have.has(code)); }
      const c = { code, community: true, kind, value, prize, lot: clip(b.lot, 40), desc: clip(b.desc, 120), max, per: 1, exp: '', users: [], active: true, start: clip(b.start, 16), end: clip(b.end, 16), startAt, endAt, createdAt: Date.now(), createdBy: { id: user.id, name: user.name }, claims: [] };
      await store.set('c:' + code, c);
      await log(store, user, 'crear', 'código para todos ' + code + ' · ' + reward(c));
      return J({ ok: true, made: [c] });
    }
    if (path === '/admin/community/update' && m === 'POST') {
      const b = await body(), c = await store.get('c:' + norm(b.code));
      if (!c || !c.community) return fail('Código no encontrado.', 404);
      const max = Math.min(99999, Math.max(0, Math.round(+b.max) || 0)), startAt = ts(b.start), endAt = ts(b.end);
      if (!max && !endAt) return fail('Debe quedar al menos un límite: cupos o fecha de cierre.');
      if (startAt && endAt && endAt <= startAt) return fail('El cierre debe ser después de la apertura.');
      Object.assign(c, { max, start: clip(b.start, 16), end: clip(b.end, 16), startAt, endAt });
      await store.set('c:' + c.code, c);
      await log(store, user, 'ampliar', c.code);
      return J({ ok: true, code: c });
    }
    if (path === '/admin/toggle' && m === 'POST') {
      const b = await body(), c = await store.get('c:' + norm(b.code));
      if (!c) return fail('Código no encontrado.', 404);
      c.active = !!b.active; await store.set('c:' + c.code, c);
      await log(store, user, c.active ? 'activar' : 'desactivar', c.code);
      return J({ ok: true });
    }
    if (path === '/admin/templates') {
      const tp = (await store.get('tpl')) || [];
      if (m === 'GET') return J({ ok: true, templates: tp });
      if (m === 'POST') {
        const b = await body(), kind = b.kind === 'prize' ? 'prize' : 'discount', name = clip(b.name, 40);
        const value = kind === 'discount' ? Math.round(+b.value) : 0, prize = kind === 'prize' ? clip(b.prize, 80) : '';
        if (!name) return fail('Escribe un nombre.');
        if (kind === 'discount' && !(value >= 1 && value <= 100)) return fail('El descuento debe estar entre 1% y 100%.');
        if (kind === 'prize' && !prize) return fail('Escribe cuál es el premio.');
        tp.push({ id: 't' + Date.now().toString(36) + randomInt(100, 999), name, kind, value, prize });
        await store.set('tpl', tp.slice(-60));
        return J({ ok: true, templates: tp.slice(-60) });
      }
      if (m === 'DELETE') { const id = url.searchParams.get('id'), nt = tp.filter(x => x.id !== id); await store.set('tpl', nt); return J({ ok: true, templates: nt }); }
    }

    /* Personas: registradas (entraron con Discord) y compradores (canjearon al menos un código) */
    if (path === '/admin/users' && m === 'GET') {
      const [pk, all] = [await store.keys('p:'), await getAll(store)];
      const people = new Map();
      for (const p of (await Promise.all(pk.map(k => store.get(k)))).filter(Boolean)) people.set(p.id, { id: p.id, name: p.name, avatar: p.avatar, first: p.first, last: p.last, days: p.days || 1, claims: 0, delivered: 0, pending: 0, lastClaim: 0, items: [] });
      for (const c of all) for (const x of c.claims) {
        let q = people.get(x.uid);
        if (!q) { q = { id: x.uid, name: x.name, avatar: x.avatar || '', first: x.at, last: x.at, days: 1, claims: 0, delivered: 0, pending: 0, lastClaim: 0, items: [] }; people.set(x.uid, q); }
        q.claims++; if (x.delivered) q.delivered++; else q.pending++;
        q.lastClaim = Math.max(q.lastClaim, x.at);
        q.items.push({ code: c.code, reward: reward(c), at: x.at, delivered: !!x.delivered });
      }
      for (const k of await store.keys('n:')) { const q = people.get(k.slice(2)); if (q) q.note = await store.get(k); }
      for (const k of await store.keys('x:')) { const q = people.get(k.slice(2)), v = await store.get(k); if (q) { q.banned = true; q.banReason = (v && v.reason) || ''; } }
      const users = [...people.values()].map(u => ({ ...u, items: u.items.sort((a, b) => b.at - a.at).slice(0, 20) })).sort((a, b) => b.first - a.first);
      const today = dayStr(), wk = Date.now() - 7 * 864e5;
      return J({ ok: true, users, totals: { registered: users.length, buyers: users.filter(u => u.claims).length, new7: users.filter(u => u.first > wk).length, active7: users.filter(u => u.last > wk).length, today } });
    }

    /* Notas internas y bloqueo de jugadores */
    if (path === '/admin/note' && m === 'POST') {
      const b = await body(), id = String(b.id || '').replace(/\D/g, '').slice(0, 20), note = clip(b.note, 300);
      if (!id) return fail('ID no válido.');
      if (note) await store.set('n:' + id, note); else await store.del('n:' + id);
      await log(store, user, 'nota', id + (note ? '' : ' · borrada'));
      return J({ ok: true });
    }
    if (path === '/admin/ban' && m === 'POST') {
      const b = await body(), id = String(b.id || '').replace(/\D/g, '').slice(0, 20);
      if (!id) return fail('ID no válido.');
      if (b.banned) await store.set('x:' + id, { reason: clip(b.reason, 120), at: Date.now(), by: clip(user.name, 40) }); else await store.del('x:' + id);
      await log(store, user, b.banned ? 'bloquear' : 'desbloquear', id + (b.banned && b.reason ? ' · ' + clip(b.reason, 80) : ''));
      return J({ ok: true });
    }

    /* Registro de actividad (últimas 200 acciones) */
    if (path === '/admin/log' && m === 'GET') {
      const ks = (await store.keys('l:')).sort().reverse();
      if (ks.length > 1500) await Promise.all(ks.slice(1000).map(k => store.del(k)));
      const rows = (await Promise.all(ks.slice(0, 200).map(k => store.get(k)))).filter(Boolean);
      return J({ ok: true, log: rows });
    }

    /* Inventario por ítem: {n, left} o {n, delta:-1}; left vacío = sin límite */
    if (path === '/admin/flash' && m === 'POST') {
      const b = await body(), mins = Math.min(Math.max(Math.round(+b.mins) || 60, 5), 720);
      const f = { title: clip(b.title, 60) || 'Oferta relámpago', text: clip(b.text, 160), items: (Array.isArray(b.items) ? b.items : []).map(Number).filter(n => n > 0).slice(0, 20), end: Date.now() + mins * 60000 };
      await store.set('flash', f); await log(store, user, 'oferta', f.title + ' · ' + mins + ' min');
      return J({ ok: true, flash: f });
    }
    if (path === '/admin/flash' && m === 'DELETE') { await store.del('flash'); return J({ ok: true }); }
    if (path === '/admin/stock' && m === 'POST') {
      const b = await body(), n = Math.round(+b.n);
      if (!(n >= 1 && n <= 999)) return fail('Número de ítem no válido.');
      const stock = (await store.get('stock')) || {};
      if (b.delta != null) stock[n] = Math.max(0, (stock[n] != null ? stock[n] : 0) + Math.round(+b.delta || 0));
      else if (b.left === '' || b.left == null) delete stock[n];
      else { const v = Math.round(+b.left); if (!(v >= 0 && v <= 9999)) return fail('La cantidad debe estar entre 0 y 9999.'); stock[n] = v; }
      await store.set('stock', stock);
      await log(store, user, 'inventario', '#' + n + ' → ' + (stock[n] != null ? stock[n] : 'sin límite'));
      return J({ ok: true, stock });
    }
  }
  return fail('Ruta no encontrada.', 404);
}
