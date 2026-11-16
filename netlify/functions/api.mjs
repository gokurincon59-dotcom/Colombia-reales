/* Servidor de códigos de Colombia Reals (Netlify Functions + Netlify Blobs).
   Rutas: /api/redeem, /api/mine, /api/daily, /api/streak, /api/spin, /api/top, /api/stock, /api/admin/... */
import { getStore } from '@netlify/blobs';
import { handle } from './lib/logic.mjs';
import { preflight, withCors } from './lib/cors.mjs';

const blobs = getStore({ name: 'cr-codes', consistency: 'strong' });
const store = {
  get: k => blobs.get(k, { type: 'json' }),
  set: (k, v) => blobs.setJSON(k, v),
  del: k => blobs.delete(k),
  keys: async p => (await blobs.list({ prefix: p })).blobs.map(b => b.key)
};
const env = k => (globalThis.Netlify && Netlify.env.get(k)) || process.env[k] || '';
const list = v => v.split(/[\s,;]+/).filter(Boolean);

export default async (req) => {
  const allowed = list(env('ALLOWED_ORIGINS'));   // opcional: ej. https://mi-generador.netlify.app
  if (req.method === 'OPTIONS') return preflight(req, allowed);
  const res = await handle(req, {
    store,
    fetch,
    webhook: env('DISCORD_WEBHOOK_URL'),   // opcional: canal de Discord donde avisa cada canje
    clientId: env('DISCORD_CLIENT_ID') || '1569929106370338816',
    admins: list(env('ADMIN_DISCORD_IDS')),
    adminUser: env('ADMIN_USER'),      // acceso de administrador con usuario y contraseña
    adminPass: env('ADMIN_PASS'),
    adminExtra: env('ADMIN_EXTRA'),    // opcional: más administradores → usuario2:clave2,usuario3:clave3
    adminSecret: env('ADMIN_SECRET'),  // opcional: clave para firmar las sesiones (si no, se deriva de la contraseña)
    staffUsers: env('STAFF_USERS'),    // paneles por rango → usuario:clave:rol,usuario2:clave2:rol (ver LEEME.txt)
    staffSecret: env('STAFF_SECRET'),  // opcional: clave para firmar las sesiones del staff
    // Premios automáticos (opcionales). Ver LEEME.txt → "PREMIOS AUTOMÁTICOS".
    cfg: { daily: env('DAILY_REWARDS'), special: env('DAILY_SPECIAL'), dailyMax: env('DAILY_MAX'), dailyOn: env('DAILY_ON'), spin: env('SPIN_PRIZES'), spinOn: env('SPIN_ON'), streak: env('STREAK_REWARDS'), streakOn: env('STREAK_ON') }
  });
  return withCors(req, res, allowed);
};

export const config = { path: '/api/*' };
