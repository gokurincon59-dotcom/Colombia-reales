// Prueba la lógica del servidor sin Netlify (store en memoria + Discord simulado).
// Uso:  node herramientas/probar_servidor.mjs
import { handle } from '../netlify/functions/lib/logic.mjs';
import assert from 'node:assert/strict';

const mem = new Map();
const store = { get: async k => (mem.has(k) ? structuredClone(mem.get(k)) : null), set: async (k, v) => { mem.set(k, structuredClone(v)); }, del: async k => { mem.delete(k); }, keys: async p => [...mem.keys()].filter(k => k.startsWith(p)) };
const CID = '111';
const fakeFetch = async (u, o) => { const t = (o.headers.Authorization || '').replace('Bearer ', ''); const id = t.replace('tok-', ''); return { ok: !!id, json: async () => ({ user: { id, username: 'user' + id }, application: { id: CID } }) }; };
const deps = { store, fetch: fakeFetch, clientId: CID, admins: ['999'], cfg: {}, noCache: true };
const call = async (method, path, tok, body) => { const r = await handle(new Request('https://x.test/api' + path, { method, headers: { authorization: tok ? 'Bearer tok-' + tok : '', 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }), deps); return { s: r.status, d: await r.json() }; };
const realNow = Date.now; let offset = 0; Date.now = () => realNow() + offset;
const day = n => { offset = n * 864e5; };
let n = 0; const ok = (name) => console.log('✔', name, ++n);

// ping + públicas
let r = await call('GET', '/ping'); assert.equal(r.d.ok, true); assert.equal(r.d.daily, true); ok('ping');
r = await call('GET', '/daily'); assert.equal(r.d.ok, true); const code1 = r.d.code; assert.match(code1, /^DIA-\d{4}-/); assert.equal(r.d.left, 10);
r = await call('GET', '/daily'); assert.equal(r.d.code, code1); ok('código del día estable');
r = await call('GET', '/mine'); assert.equal(r.s, 401); ok('rutas privadas piden sesión');

// canje del código del día: 1 por persona, límite de cupos
r = await call('POST', '/redeem', '1', { code: code1 }); assert.equal(r.s, 200, JSON.stringify(r.d));
r = await call('POST', '/redeem', '1', { code: code1 }); assert.equal(r.s, 409);
r = await call('GET', '/daily'); assert.equal(r.d.left, 9); ok('canje diario y cupos');

// límite por persona (per) creado por admin
r = await call('POST', '/admin/codes', '999', { kind: 'discount', value: 10, qty: 1, max: 5, per: 2, len: 8, lot: 'Prueba' }); assert.equal(r.s, 200, JSON.stringify(r.d));
const pc = r.d.made[0]; assert.equal(pc.per, 2);
for (let i = 0; i < 2; i++) { r = await call('POST', '/redeem', '2', { code: pc.code }); assert.equal(r.s, 200); }
r = await call('POST', '/redeem', '2', { code: pc.code }); assert.equal(r.s, 409); assert.match(r.d.error, /máximo/);
r = await call('GET', '/mine', '2'); assert.equal(r.d.claimed.filter(x => x.code === pc.code).length, 2); ok('límite por persona');

// racha: avanza por días y entrega hitos
r = await call('POST', '/streak', '3'); assert.equal(r.d.days, 1);
r = await call('POST', '/streak', '3'); assert.equal(r.d.days, 1, 'mismo día no suma');
day(1); r = await call('POST', '/streak', '3'); assert.equal(r.d.days, 2);
day(2); r = await call('POST', '/streak', '3'); assert.equal(r.d.days, 3); assert.equal(r.d.rewards.length, 1); assert.match(r.d.rewards[0].code, /^RAC-/);
r = await call('POST', '/redeem', '3', { code: r.d.rewards[0].code }); assert.equal(r.s, 200, 'el premio de racha se canjea');
day(5); r = await call('GET', '/streak', '3'); assert.equal(r.d.days, 0, 'racha rota'); ok('racha e hitos');
r = await call('POST', '/streak', '4'); const other = await call('POST', '/redeem', '4', { code: 'RAC-NOEXISTE' }); assert.equal(other.s, 404);

// ruleta: un giro por día; algún usuario termina ganando un código personal
day(0); let won = null, tries = 0;
for (let u = 100; u < 400 && !won; u++) { r = await call('POST', '/spin', String(u)); tries++; assert.equal(r.s, 200); assert.ok(r.d.idx >= 0 && r.d.idx < r.d.labels.length); if (r.d.win) won = { u: String(u), ...r.d }; }
assert.ok(won, 'alguien debe ganar en ' + tries + ' giros'); assert.match(won.code, /^RUL-/);
r = await call('POST', '/spin', won.u); assert.equal(r.s, 409);
r = await call('POST', '/redeem', 'otro', { code: won.code }); assert.equal(r.s, 403, 'código de ruleta es personal');
r = await call('POST', '/redeem', won.u, { code: won.code }); assert.equal(r.s, 200); ok('ruleta');

// pedidos por ítem
await call('POST', '/track', '1', { n: 14 }); await call('POST', '/track', '1', { n: 14 }); await call('POST', '/track', '2', { n: 14 }); await call('POST', '/track', '2', { n: 9 });
r = await call('GET', '/top'); assert.deepEqual(r.d.top.map(x => [x.n, x.c]), [[14, 2], [9, 1]]); ok('más pedidos');

// inventario
r = await call('POST', '/admin/stock', '5', { n: 14, left: 3 }); assert.equal(r.s, 403);
r = await call('POST', '/admin/stock', '999', { n: 14, left: 3 }); assert.equal(r.d.stock[14], 3);
r = await call('POST', '/admin/stock', '999', { n: 14, delta: -2 }); assert.equal(r.d.stock[14], 1);
r = await call('GET', '/stock'); assert.equal(r.d.stock[14], 1); ok('inventario');

// estadísticas, alertas y registro
r = await call('POST', '/admin/codes', '999', { kind: 'prize', prize: 'Skin', qty: 1, max: 4, len: 8, exp: new Date(realNow() + 864e5).toISOString().slice(0, 10) });
const lowc = r.d.made[0]; for (const u of ['a', 'b', 'c']) await call('POST', '/redeem', u, { code: lowc.code });
r = await call('GET', '/admin/stats', '999'); assert.equal(r.s, 200); assert.ok(r.d.totals.claims >= 8); assert.equal(r.d.byDay.length, 14);
assert.ok(r.d.alerts.some(a => a.type === 'low' && a.code === lowc.code), 'alerta de agotándose');
assert.ok(r.d.alerts.some(a => a.type === 'soon' && a.code === lowc.code), 'alerta de vence pronto');
assert.ok(r.d.alerts.some(a => a.type === 'stock' && a.n === 14), 'alerta de inventario bajo');
r = await call('POST', '/admin/claim', '999', { code: lowc.code, uid: 'a', action: 'deliver' }); assert.equal(r.s, 200);
r = await call('GET', '/admin/log', '999'); assert.ok(r.d.log.length > 5); assert.ok(r.d.log.some(x => x.act === 'entregar')); assert.ok(r.d.log.some(x => x.act === 'crear'));
r = await call('GET', '/admin/log', '5'); assert.equal(r.s, 403); ok('estadísticas, alertas y registro');

// resumen del año
r = await call('GET', '/year?y=' + new Date().getUTCFullYear()); assert.ok(r.d.redeems >= 8 && r.d.players >= 5); ok('resumen del año');

// día especial (24/12) usa el regalo especial
const real = Date.now; Date.now = () => Date.parse('2027-12-24T15:00:00Z'); mem.delete('d:2027-12-24');
r = await call('GET', '/daily'); assert.equal(r.d.special, true); assert.match(r.d.reward, /Nochebuena/); Date.now = real; ok('código especial de Nochebuena');

// login de administrador con usuario y contraseña
deps.adminUser = 'Colombia_reales'; deps.adminPass = 'clave-de-prueba-123';
const raw = async (method, path, headers, body) => { const rs = await handle(new Request('https://x.test/api' + path, { method, headers: { 'content-type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined }), deps); let d = {}; try { d = await rs.json(); } catch (e) {} return { s: rs.status, d }; };
r = await raw('POST', '/admin/login', { 'x-nf-client-connection-ip': '1.1.1.1' }, { user: 'Colombia_reales', pass: 'mala' }); assert.equal(r.s, 401);
r = await raw('POST', '/admin/login', { 'x-nf-client-connection-ip': '1.1.1.1' }, { user: 'Colombia_reales', pass: 'clave-de-prueba-123' }); assert.equal(r.s, 200); const adm = r.d.token; assert.match(adm, /^adm\./);
r = await raw('GET', '/admin/me', { authorization: 'Bearer ' + adm }); assert.equal(r.s, 200); assert.equal(r.d.user.name, 'Colombia_reales');
r = await raw('GET', '/admin/codes', { authorization: 'Bearer ' + adm }); assert.equal(r.s, 200);
r = await raw('GET', '/admin/me', { authorization: 'Bearer ' + adm.slice(0, -2) + 'xx' }); assert.equal(r.s, 401, 'token alterado');
r = await raw('GET', '/mine', { authorization: 'Bearer ' + adm }); assert.equal(r.s, 403, 'la sesión de admin no sirve para rutas de jugador');
r = await raw('GET', '/admin/me', { authorization: 'Basic ' + Buffer.from('Colombia_reales:clave-de-prueba-123').toString('base64') }); assert.equal(r.s, 200, 'Basic del generador');
r = await raw('GET', '/admin/me', { authorization: 'Basic ' + Buffer.from('Colombia_reales:otra').toString('base64') }); assert.equal(r.s, 401);
for (let i = 0; i < 5; i++) await raw('POST', '/admin/login', { 'x-nf-client-connection-ip': '2.2.2.2' }, { user: 'x', pass: 'y' });
r = await raw('POST', '/admin/login', { 'x-nf-client-connection-ip': '2.2.2.2' }, { user: 'Colombia_reales', pass: 'clave-de-prueba-123' }); assert.equal(r.s, 429, 'bloqueo tras 5 fallos');
const t0 = Date.now; Date.now = () => t0() + 13 * 3600e3; r = await raw('GET', '/admin/me', { authorization: 'Bearer ' + adm }); assert.equal(r.s, 401, 'la sesión vence a las 12 h'); Date.now = t0;
ok('login de administrador (usuario y contraseña)');
console.log('\nTodo bien:', n, 'grupos de pruebas');
