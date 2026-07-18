/**
* 2026-06-19  Replace __dirname/__filename with import.meta equivalents
*
* ESM modules do not have __dirname or __filename globals. Node.js 21.2+
* provides import.meta.dirname and import.meta.filename as direct
* replacements. This migration does a simple text substitution in JS
* files that still use those identifiers after the CJS→ESM conversion.
*
* Only touches files that contain `__dirname` or `__filename` — all of
* which are test files in this project (no lib files use them).
*
*   node codemods/2026-06-19-04-dirname-esm.mjs --dry
*   node codemods/2026-06-19-04-dirname-esm.mjs
*/

import { run } from './_harness.mjs';

function transform( src ) {
	if ( !/__dirname\b/.test( src ) && !/__filename\b/.test( src ) ) return null;
	return src
		.replace( /__dirname\b/g, 'import.meta.dirname' )
		.replace( /__filename\b/g, 'import.meta.filename' );
}

run({
	name: 'dirname-esm',
	roots: [ 'lib' ],
	extensions: [ '.js' ],
	transform
});
