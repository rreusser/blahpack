#!/usr/bin/env node

/**
* Builds `dist/`: self-contained ES modules for browsers, CDNs and notebooks
* (ticket 0112; docs/ndarray-layer.md, "Distribution").
*
* Output:
*   dist/_stdlib.js                     every stdlib module the library imports,
*                                       converted from CommonJS and bundled once
*   dist/<pkg>/<routine>.js        one file per `./<pkg>/<routine>`
*                                       export in package.json: the routine and
*                                       its in-library dependencies, minified;
*                                       stdlib imports point at _stdlib.js by
*                                       a path relative to the file
*   dist/THIRD_PARTY_LICENSES.txt       licenses of the vendored stdlib packages
*
* A page that loads several routines downloads `_stdlib.js` once; dependencies
* shared between routines (BLAS, dlamch, …) are repeated in each routine's
* file. The doc measures that trade-off against the alternatives.
*
* Usage:
*   node bin/build-dist.mjs [--out <dir>]     (default: dist/)
*/

import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve( import.meta.dirname, '..' );
const args = process.argv.slice( 2 );
const OUT = path.resolve( ROOT, ( args.indexOf( '--out' ) >= 0 ) ? args[ args.indexOf( '--out' ) + 1 ] : 'dist' );
const RUNTIME = '_stdlib.js';
const pkg = JSON.parse( fs.readFileSync( path.join( ROOT, 'package.json' ), 'utf8' ) );
const COMMON = { bundle: true, minify: true, format: 'esm', platform: 'browser', target: 'es2020', legalComments: 'none', logLevel: 'error' };
const BANNER = `/*! ${pkg.name} ${pkg.version} | ${pkg.license} | ${pkg.homepage} | stdlib (Apache-2.0) is vendored in ${RUNTIME}: see THIRD_PARTY_LICENSES.txt */`;

// Entries: every routine the package exports, so the browser build and the
// exports map can never disagree.
const entries = {};
for ( const [ sub, file ] of Object.entries( pkg.exports ) ) {
	const m = /^\.\/(\w+\/\w+)$/.exec( sub );
	if ( m ) {
		entries[ m[ 1 ] ] = path.join( ROOT, file );
	}
}
if ( Object.keys( entries ).length === 0 ) {
	throw new Error( 'no `./<pkg>/<routine>` entries in package.json exports' );
}

// Pass 1: the exact set of stdlib specifiers the routines import, read from
// esbuild's own resolution (not a regex over source).
const scan = await build( { ...COMMON, entryPoints: entries, outdir: OUT, write: false, metafile: true, external: [ '@stdlib/*' ] } );
const specs = new Set();
for ( const o of Object.values( scan.metafile.outputs ) ) {
	for ( const i of o.imports ) {
		if ( i.external && i.path.startsWith( '@stdlib/' ) ) {
			specs.add( i.path );
		}
	}
}
const ids = new Map( [ ...specs ].sort().map( ( s, i ) => [ s, `s${i}` ] ) );

fs.rmSync( OUT, { recursive: true, force: true } );

// Pass 2: the vendored runtime, one named export per specifier.
const runtime = await build( {
	...COMMON,
	stdin: { contents: [ ...ids ].map( ( [ s, id ] ) => `export { default as ${id} } from '${s}';` ).join( '\n' ), resolveDir: ROOT, loader: 'js' },
	outfile: path.join( OUT, RUNTIME ),
	metafile: true,
	banner: { js: `/*! stdlib (https://github.com/stdlib-js/stdlib) | Apache-2.0 | vendored by ${pkg.name} ${pkg.version}: see THIRD_PARTY_LICENSES.txt */` }
} );

// Pass 3: one file per routine; each stdlib import becomes an import of the
// runtime by its path relative to the output file. Entries are built in
// groups of equal depth (`<pkg>/<routine>`, later `<pkg>/<routine>/ndarray`),
// one relative path per group.
function toRuntime( spec ) {
	return {
		name: 'stdlib-to-runtime',
		setup( b ) {
			b.onResolve( { filter: /^@stdlib\// }, ( a ) => {
				if ( !ids.has( a.path ) ) {
					throw new Error( `stdlib import missing from the runtime: ${a.path} (imported by ${a.importer})` );
				}
				return { path: a.path, namespace: 'stdlib' };
			} );
			b.onLoad( { filter: /.*/, namespace: 'stdlib' }, ( a ) => ( { contents: `export { ${ids.get( a.path )} as default } from '${spec}';`, loader: 'js' } ) );
			b.onResolve( { filter: /.*/ }, ( a ) => ( a.path === spec ? { path: a.path, external: true } : undefined ) );
		}
	};
}
const byDepth = new Map();
for ( const [ name, file ] of Object.entries( entries ) ) {
	const spec = path.posix.relative( path.posix.dirname( name ), RUNTIME ).replace( /^(?!\.)/, './' );
	byDepth.set( spec, { ...byDepth.get( spec ), [ name ]: file } );
}
for ( const [ spec, group ] of byDepth ) {
	await build( { ...COMMON, entryPoints: group, outdir: OUT, plugins: [ toRuntime( spec ) ], banner: { js: BANNER } } );
}

// Licenses of every stdlib package with code in the runtime.
const vendored = new Map();
for ( const input of Object.keys( runtime.metafile.inputs ) ) {
	const m = /node_modules\/(@stdlib\/[^/]+)\//.exec( input );
	if ( m && !vendored.has( m[ 1 ] ) ) {
		const dir = path.join( ROOT, 'node_modules', m[ 1 ] );
		vendored.set( m[ 1 ], JSON.parse( fs.readFileSync( path.join( dir, 'package.json' ), 'utf8' ) ).version );
	}
}
const texts = new Map(); // license text -> packages that ship it
for ( const name of [ ...vendored.keys() ].sort() ) {
	for ( const f of [ 'LICENSE', 'NOTICE' ] ) {
		const p = path.join( ROOT, 'node_modules', name, f );
		if ( fs.existsSync( p ) ) {
			const t = fs.readFileSync( p, 'utf8' ).trim();
			texts.set( t, [ ...( texts.get( t ) || [] ), `${name}@${vendored.get( name )} (${f})` ] );
		}
	}
}
const parts = [ `${RUNTIME} bundles code from the following stdlib packages:\n\n` + [ ...vendored ].sort().map( ( [ n, v ] ) => `  ${n}@${v}` ).join( '\n' ) ];
for ( const [ t, from ] of texts ) {
	parts.push( `${'='.repeat( 78 )}\n${from.join( ', ' )}\n${'='.repeat( 78 )}\n\n${t}` );
}
fs.writeFileSync( path.join( OUT, 'THIRD_PARTY_LICENSES.txt' ), parts.join( '\n\n' ) + '\n' );

console.log( `dist build: ${Object.keys( entries ).length} routines, ${ids.size} stdlib imports from ${vendored.size} stdlib packages → ${path.relative( ROOT, OUT ) || '.'}/` );
