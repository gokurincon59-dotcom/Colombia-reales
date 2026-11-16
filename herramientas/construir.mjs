/* Une y minifica los JS/CSS de cada página en un solo archivo (menos peticiones, menos peso).
   Uso:  node herramientas/construir.mjs        (necesita esbuild: usa "npx --yes esbuild" o la variable ESBUILD=/ruta/esbuild)
   Resultado: assets/index.min.js|css y assets/facciones.min.js|css  → son los que cargan index.html y facciones.html.
   Los archivos originales (mejoras.js, mega.css…) siguen siendo la fuente: edítalos y vuelve a ejecutar este script. */
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const A = (f) => join(raiz, 'assets', f);

const PAGINAS = {
  index: {
    js: ['mejoras', 'pulido', 'navidad', 'extra', 'ultra', 'ideas', 'mega', 'fx', 'fiesta', 'nuevo', 'botones'],
    css: ['mejoras', 'pulido', 'facciones-extra', 'navidad', 'diseno', 'extra', 'mega', 'ultra', 'ideas', 'fiesta', 'nuevo', 'botones'],
  },
  facciones: {
    js: ['mejoras', 'pulido', 'facciones-extra', 'navidad', 'extra', 'ultra', 'mega', 'botones'],
    css: ['mejoras', 'pulido', 'facciones-extra', 'navidad', 'diseno', 'extra', 'mega', 'ultra', 'botones'],
  },
};

function esbuild(codigo, loader) {
  const bin = process.env.ESBUILD;
  const args = ['--minify', '--charset=utf8', '--target=es2019', `--loader=${loader}`];
  const r = bin
    ? spawnSync(bin, args, { input: codigo, encoding: 'utf8', maxBuffer: 1 << 28 })
    : spawnSync('npx', ['--yes', 'esbuild', ...args], { input: codigo, encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error('esbuild falló: ' + (r.stderr || r.error));
  return r.stdout;
}

for (const [pagina, { js, css }] of Object.entries(PAGINAS)) {
  /* cada script va aislado en try/catch: si uno falla, los demás siguen funcionando como antes */
  const fuenteJs = js
    .map((n) => `try{\n${readFileSync(A(n + '.js'), 'utf8')}\n}catch(e){console.error('[${n}.js]',e)}`)
    .join('\n;\n');
  const fuenteCss = css.map((n) => readFileSync(A(n + '.css'), 'utf8')).join('\n');
  const outJs = esbuild(fuenteJs, 'js');
  const outCss = esbuild(fuenteCss, 'css');
  writeFileSync(A(pagina + '.min.js'), outJs);
  writeFileSync(A(pagina + '.min.css'), outCss);
  const antes = js.reduce((s, n) => s + readFileSync(A(n + '.js')).length, 0) + css.reduce((s, n) => s + readFileSync(A(n + '.css')).length, 0);
  console.log(`${pagina}: ${js.length} JS + ${css.length} CSS (${(antes / 1024).toFixed(0)} KB) → ${pagina}.min.js ${(outJs.length / 1024).toFixed(0)} KB + ${pagina}.min.css ${(outCss.length / 1024).toFixed(0)} KB`);
}
