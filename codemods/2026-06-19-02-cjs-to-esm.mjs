/**
* 2026-06-19  CJS -> ESM
*
* Converts the generated stdlib-style modules (and their tests, benchmarks, and
* examples) from CommonJS to native ES modules:
*
*   var X = require( 'm' );              ->  import X from 'm';
*   var j = require( 'path' ).join;      ->  import { join as j } from 'node:path';
*   var n = require( './f.js' ).member;  ->  import { member as n } from './f.js';
*   var n = require( '@stdlib/x' ).m;    ->  import _n from '@stdlib/x'; const n = _n.m;
*   var d = require( './d.json' );        ->  import d from './d.json' with { type: 'json' };
*   module.exports = X;                  ->  export default X;
*   module.exports = require( './b.js' );->  export { default } from './b.js';
*   module.exports.foo = foo;            ->  export { foo };
*
* Two passes:
*   1. Top-level declaration lines (with optional trailing `// ...` comment, which
*      is dropped) are rewritten directly to clean import/export statements.
*   2. Any residual `require()` expression on a non-comment line (lazy requires
*      inside test callbacks, object literals, etc.) is hoisted to a generated
*      top-level import and the call site is replaced with the binding. ESM has no
*      in-function imports, so this is the only correct lowering.
*
* `@stdlib/*` (and other bare CJS) packages expose directory subpaths with no
* `exports` map, which ESM cannot resolve, so each bare specifier is resolved via
* the CommonJS resolver to an explicit file (e.g. `@stdlib/array/float64` ->
* `@stdlib/array/float64/lib/index.js`).
*
* The per-module `lib/index.js` carries a dead `tryRequire('./native.js')` native
* fallback shim (no module in this pure-JS port ships a native.js); those collapse
* to a clean re-export of `./main.js` (+ `./ndarray.js` when present).
*
* Idempotent: files with no `require(`/`module.exports` are skipped. Designed to run
* against a clean CJS tree.
*
*   node codemods/2026-06-19-cjs-to-esm.mjs --dry ddot     # preview one module
*   node codemods/2026-06-19-cjs-to-esm.mjs                # apply to whole repo
*/

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { createRequire } from 'node:module';
import { run } from './_harness.mjs';

const require = createRequire( import.meta.url );
const NODE_BUILTINS = new Set([ 'path', 'fs', 'os', 'util', 'assert', 'crypto', 'stream', 'events', 'url' ]);
const bareCache = new Map();

function resolveBare( spec ) {
	if ( bareCache.has( spec ) ) return bareCache.get( spec );
	let mapped = spec;
	try {
		const abs = require.resolve( spec );
		const m = abs.split( /node_modules[\\/]/ ).pop();
		if ( m && m !== abs ) mapped = m.split( '\\' ).join( '/' );
	} catch {
		console.error( `WARN unresolved bare specifier: ${spec}` );
	}
	bareCache.set( spec, mapped );
	return mapped;
}

function resolveRelative( spec, fromFile ) {
	if ( /\.(js|mjs|cjs|json)$/.test( spec ) ) return spec;
	const base = dirname( fromFile );
	if ( existsSync( resolve( base, spec + '.js' ) ) ) return spec + '.js';
	// Directory require: check package.json main before falling back to index.js
	const dir = resolve( base, spec );
	const pkgPath = resolve( dir, 'package.json' );
	if ( existsSync( pkgPath ) ) {
		try {
			const pkg = JSON.parse( readFileSync( pkgPath, 'utf8' ) );
			if ( pkg.main ) {
				const entryAbs = resolve( dir, pkg.main );
				const entryFile = existsSync( entryAbs + '.js' ) ? entryAbs + '.js'
					: existsSync( resolve( entryAbs, 'index.js' ) ) ? resolve( entryAbs, 'index.js' )
					: entryAbs;
				const rel = relative( base, entryFile ).replace( /\\/g, '/' );
				return rel.startsWith( '.' ) ? rel : './' + rel;
			}
		} catch {}
	}
	if ( existsSync( resolve( base, spec, 'index.js' ) ) ) return spec.replace( /\/$/, '' ) + '/index.js';
	return spec.replace( /\/$/, '' ) + '/index.js';
}

function resolveSpec( spec, fromFile ) {
	if ( spec.startsWith( '.' ) ) return resolveRelative( spec, fromFile );
	if ( spec.startsWith( 'node:' ) ) return spec;
	if ( NODE_BUILTINS.has( spec ) ) return `node:${spec}`;
	return resolveBare( spec );
}

function importFrom( spec ) {
	return spec.endsWith( '.json' ) ? `'${spec}' with { type: 'json' }` : `'${spec}'`;
}

// True for specifiers whose named properties are real ESM named exports (our own
// relative modules) or node builtins. Bare CJS packages are not.
function hasNamedExports( spec ) {
	return spec.startsWith( '.' ) || spec.startsWith( 'node:' ) || NODE_BUILTINS.has( spec );
}

function memberImport( name, resolved, member ) {
	const tmp = `${name}$cjs`;
	return `import ${tmp} from ${importFrom( resolved )};\nconst ${name} = ${tmp}.${member};`;
}

function rebuildIndex( src, file ) {
	const headerMatch = src.match( /^\/\*\*[\s\S]*?\*\/\n/ );
	const header = headerMatch ? headerMatch[ 0 ].trimEnd() : '';
	const dir = dirname( file );
	const mainMatch = src.match( /require\(\s*'(\.\/[a-z0-9_]+\.js)'\s*\)/i );
	const mainSpec = mainMatch ? mainMatch[ 1 ] : './main.js';
	const lines = [];
	if ( header ) lines.push( header, '' );
	lines.push( `export { default } from '${mainSpec}';` );
	if ( existsSync( resolve( dir, 'ndarray.js' ) ) ) {
		lines.push( `export { default as ndarray } from './ndarray.js';` );
	}
	return lines.join( '\n' ) + '\n';
}

// Trailing-comment-tolerant line terminator: matches `;` plus an optional
// `// ...` comment (which is dropped).
const END = ';(?:[ \\t]*\\/\\/[^\\n]*)?$';

function injectImports( text, importLines ) {
	if ( !importLines.length ) return text;
	const block = importLines.join( '\n' ) + '\n';
	const header = text.match( /^\/\*\*[\s\S]*?\*\/\n/ );
	if ( header ) {
		const at = header[ 0 ].length;
		return text.slice( 0, at ) + '\n' + block + text.slice( at );
	}
	return block + text;
}

function transform( src, file ) {
	if ( !/\brequire\(/.test( src ) && !/\bmodule\.exports\b/.test( src ) ) return null;

	if ( /\/lib\/index\.js$/.test( file ) && /tryRequire\(/.test( src ) && /native\.js/.test( src ) ) {
		return rebuildIndex( src, file );
	}

	let out = src;
	out = out.replace( /^'use strict';\n\n/m, '' ).replace( /^'use strict';\n/m, '' );

	// --- Pass 1: top-level declarations --------------------------------------

	// var NAME = require( 'SPEC' ).MEMBER;
	out = out.replace(
		new RegExp( `^var ([A-Za-z0-9_$]+) = require\\(\\s*'([^']+)'\\s*\\)\\.([A-Za-z0-9_$]+)${END}`, 'gm' ),
		( _m, name, spec, member ) => {
			const resolved = resolveSpec( spec, file );
			if ( hasNamedExports( spec ) ) {
				return name === member
					? `import { ${member} } from ${importFrom( resolved )};`
					: `import { ${member} as ${name} } from ${importFrom( resolved )};`;
			}
			return memberImport( name, resolved, member );
		}
	);

	// var NAME = require( 'SPEC' );
	out = out.replace(
		new RegExp( `^var ([A-Za-z0-9_$]+) = require\\(\\s*'([^']+)'\\s*\\)${END}`, 'gm' ),
		( _m, name, spec ) => `import ${name} from ${importFrom( resolveSpec( spec, file ) )};`
	);

	// module.exports = require( 'SPEC' );
	out = out.replace(
		new RegExp( `^module\\.exports = require\\(\\s*'([^']+)'\\s*\\)${END}`, 'gm' ),
		( _m, spec ) => `export { default } from ${importFrom( resolveSpec( spec, file ) )};`
	);

	// module.exports.MEMBER = IDENT;
	out = out.replace(
		new RegExp( `^module\\.exports\\.([A-Za-z0-9_$]+) = ([A-Za-z0-9_$]+)${END}`, 'gm' ),
		( _m, member, ident ) => ( member === ident ? `export { ${ident} };` : `export { ${ident} as ${member} };` )
	);

	// module.exports = { key: val, ... };  (multi-line object literal)
	out = out.replace(
		/^module\.exports = \{([\s\S]*?)\n\};/m,
		( _m, body ) => {
			const pairs = [ ...body.matchAll( /^\s*([A-Za-z0-9_$]+)\s*:\s*([A-Za-z0-9_$]+)\s*,?/gm ) ]
				.map( ( [ , key, val ] ) => `\t${key}: ${val},` );
			return `export default {\n${pairs.join( '\n' )}\n};`;
		}
	);

	// module.exports = IDENT;
	out = out.replace(
		new RegExp( `^module\\.exports = ([A-Za-z0-9_$]+)${END}`, 'gm' ),
		( _m, ident ) => `export default ${ident};`
	);

	// --- Pass 2: residual inline require() expressions -----------------------
	// (lazy requires inside functions, object literals, etc.)

	const generated = [];
	const byKey = new Map();
	let counter = 0;

	function binding( spec, member ) {
		const resolved = resolveSpec( spec, file );
		const named = member && hasNamedExports( spec );
		const key = `${resolved}::${named ? member : ''}`;
		if ( byKey.has( key ) ) {
			const id = byKey.get( key );
			return member && !named ? `${id}.${member}` : id;
		}
		const id = `__imp${counter++}`;
		byKey.set( key, id );
		if ( named ) {
			generated.push( `import { ${member} as ${id} } from ${importFrom( resolved )};` );
			return id;
		}
		generated.push( `import ${id} from ${importFrom( resolved )};` );
		return member ? `${id}.${member}` : id;
	}

	out = out.split( '\n' ).map( ( line ) => {
		if ( /^\s*\*/.test( line ) || /^\s*\/\//.test( line ) ) return line; // comment line
		if ( !/require\(/.test( line ) ) return line;
		return line.replace(
			/require\(\s*'([^']+)'\s*\)(?:\.([A-Za-z0-9_$]+))?/g,
			( _m, spec, member ) => binding( spec, member )
		);
	}).join( '\n' );

	out = injectImports( out, generated );

	return out;
}

run({
	name: 'cjs-to-esm',
	roots: [ 'lib' ],
	extensions: [ '.js' ],
	transform
});
