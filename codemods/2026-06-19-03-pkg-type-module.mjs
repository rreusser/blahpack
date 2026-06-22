/**
* 2026-06-19  package.json -> type: module
*
* The per-module package.json files carry no top-level `type`, so Node would treat
* their (now ESM) sources as CommonJS and fall back to slow syntax-detection. This
* adds `"type": "module"` to every module package.json.
*
* Only top-level package.json files inside a module directory are touched (matched
* by path); fixture/docs JSON is ignored. Idempotent: files that already declare
* `"type": "module"` are skipped.
*
*   node codemods/2026-06-19-pkg-type-module.mjs --dry
*   node codemods/2026-06-19-pkg-type-module.mjs
*/

import { run } from './_harness.mjs';

function transform( src, file ) {
	if ( !file.endsWith( '/package.json' ) ) return null;
	if ( /"type":\s*"module"/.test( src ) ) return null;
	// Insert a top-level "type": "module" immediately after the opening brace,
	// preserving the rest of the file (and its key order) verbatim.
	return src.replace( /^\{\n/, '{\n\t"type": "module",\n' );
}

run({
	name: 'pkg-type-module',
	roots: [ 'lib' ],
	extensions: [ '.json' ],
	transform
});
