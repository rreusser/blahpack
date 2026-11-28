#!/usr/bin/env node

/**
* Codemod: fold each module's `lib/main.js` into its `lib/index.js` and delete
* `main.js` (ticket 0124).
*
* `main.js` only attaches `strided.js` to the `<routine>.js` function as
* `.strided` and default-exports the result. stdlib keeps that in a separate
* file because its `index.js` chooses between a native addon and `main.js`;
* there are no native addons here. The new `index.js` is the old `index.js`
* license header, then `main.js`'s body unchanged (the imports, the
* `setReadOnly` call and the typed default export that gives `.strided` its
* type for tsc), then `export { strided };` so every module has the named
* export.
*
* A module is changed only when both files have exactly the known shape;
* anything else is reported and left alone. Rerunning is a no-op, so another
* branch can apply it to itself.
*
* Usage:
*   node bin/codemod-fold-main.mjs [--dry] <routine> [...]
*   node bin/codemod-fold-main.mjs [--dry] --all
*   node bin/codemod-fold-main.mjs --check     exit 1 if any lib/main.js remains
*/

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve( import.meta.dirname, '..' );
const argv = process.argv.slice( 2 );
const DRY = argv.includes( '--dry' );
const CHECK = argv.includes( '--check' );
const ALL = argv.includes( '--all' );
const only = new Set( argv.filter( ( a ) => !a.startsWith( '-' ) ) );

function modules() {
	const out = [];
	for ( const pkg of [ 'blas', 'lapack', 'arpack' ] ) {
		const dir = path.join( ROOT, 'lib', pkg );
		if ( !fs.existsSync( dir ) ) {
			continue;
		}
		for ( const r of fs.readdirSync( dir ).sort() ) {
			if ( fs.existsSync( path.join( dir, r, 'lib' ) ) ) {
				out.push( { pkg, routine: r, lib: path.join( dir, r, 'lib' ) } );
			}
		}
	}
	return out;
}

// Source with comments removed and whitespace collapsed, for shape matching.
function code( src ) {
	return src.replace( /\/\*[\s\S]*?\*\//g, '' ).replace( /^\s*\/\/.*$/gm, '' ).replace( /\s+/g, ' ' ).trim();
}

const MAIN_SHAPE = new RegExp( '^' + [
	"import setReadOnly from '@stdlib/utils/[\\w-]+/lib/index\\.js';",
	"import ([\\w$]+) from '\\./([\\w]+)\\.js';",
	"import strided from '\\./strided\\.js';",
	"setReadOnly\\( \\1, 'strided', strided \\);",
	'export default \\( \\1 \\);'
].join( ' ' ) + '$' );
const INDEX_SHAPES = [
	"export { default } from './main.js'; export { default as strided } from './strided.js';",
	"import main from './main.js'; export default main;"
];

if ( CHECK ) {
	const left = modules().filter( ( m ) => fs.existsSync( path.join( m.lib, 'main.js' ) ) );
	if ( left.length ) {
		console.error( `${left.length} module(s) still have lib/main.js (fix: node bin/codemod-fold-main.mjs --all):\n  ` + left.slice( 0, 20 ).map( ( m ) => `${m.pkg}/${m.routine}` ).join( '\n  ' ) );
		process.exit( 1 );
	}
	console.log( 'no lib/main.js remains' );
	process.exit( 0 );
}
if ( !ALL && only.size === 0 ) {
	console.error( 'usage: node bin/codemod-fold-main.mjs [--dry] (--all | <routine> ...) | --check' );
	process.exit( 2 );
}

const counts = { folded: 0, done: 0 };
const skipped = [];
for ( const m of modules() ) {
	if ( !ALL && !only.has( m.routine ) ) {
		continue;
	}
	const mainPath = path.join( m.lib, 'main.js' );
	const indexPath = path.join( m.lib, 'index.js' );
	if ( !fs.existsSync( mainPath ) ) {
		counts.done += 1;
		continue;
	}
	const main = fs.readFileSync( mainPath, 'utf8' );
	const index = fs.readFileSync( indexPath, 'utf8' );
	const shape = MAIN_SHAPE.exec( code( main ) );
	const at = `${m.pkg}/${m.routine}`;
	if ( !shape ) {
		skipped.push( `${at}: main.js has an unexpected shape` );
		continue;
	}
	if ( !main.includes( `/** @type {typeof ${shape[ 1 ]} & { strided: typeof strided }} */ ( ${shape[ 1 ]} )` ) ) {
		skipped.push( `${at}: main.js default export lacks the .strided type cast` );
		continue;
	}
	if ( shape[ 2 ] !== m.routine ) {
		skipped.push( `${at}: main.js wraps ./${shape[ 2 ]}.js, not ./${m.routine}.js` );
		continue;
	}
	if ( !INDEX_SHAPES.includes( code( index ) ) ) {
		skipped.push( `${at}: index.js has an unexpected shape` );
		continue;
	}
	// Everything above the first statement, minus any trailing section
	// markers (`// MODULES //`): main.js's body brings its own.
	const header = index.slice( 0, index.search( /^(?:import|export)\b/m ) ).replace( /(?:\s*\/\/ [A-Z ]+ \/\/)+\s*$/, '' ).trimEnd();
	const start = main.indexOf( '// MODULES //' );
	if ( start < 0 ) {
		skipped.push( `${at}: main.js has no // MODULES // section` );
		continue;
	}
	const body = main.slice( start ).trimEnd();
	const out = `${header}\n\n${body}\nexport { strided };\n`;
	if ( !DRY ) {
		fs.writeFileSync( indexPath, out );
		fs.unlinkSync( mainPath );
	}
	counts.folded += 1;
}

console.log( `${DRY ? 'would fold' : 'folded'}: ${counts.folded}; already folded: ${counts.done}; skipped: ${skipped.length}` );
for ( const s of skipped ) {
	console.log( `  skipped ${s}` );
}
process.exitCode = skipped.length ? 1 : 0;
