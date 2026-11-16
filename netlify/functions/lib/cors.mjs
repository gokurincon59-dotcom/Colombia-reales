/* Permite que el sitio del generador (otro dominio) hable con este servidor.
   Se autentica con el token de Discord en el encabezado Authorization (no con cookies). */
export function corsHeaders(req, allowed) {
  const origin = req.headers.get('origin') || '';
  const ok = !allowed.length || allowed.includes('*') || allowed.includes(origin);
  const h = { 'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS', 'access-control-allow-headers': 'authorization,content-type', 'access-control-max-age': '86400', 'vary': 'Origin' };
  if (ok) h['access-control-allow-origin'] = !allowed.length || allowed.includes('*') ? '*' : origin;
  return h;
}
export function preflight(req, allowed) { return new Response(null, { status: 204, headers: corsHeaders(req, allowed) }); }
export function withCors(req, res, allowed) {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(corsHeaders(req, allowed))) out.headers.set(k, v);
  return out;
}
