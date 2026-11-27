#!/usr/bin/env node

/**
* Checks the browser build in `dist/` (bin/build-dist.mjs; ticket 0112):
*
*   1. structure   one file per `./<pkg>/<routine>` export in package.json,
*                  plus `_stdlib.js` and `THIRD_PARTY_LICENSES.txt`, nothing else;
*   2. vendoring   every routine file imports only `_stdlib.js` (by its path relative to the file), the
*                  runtime imports nothing, and no file calls `require(`;
*   3. browser     headless Chromium loads every routine from a local server
*                  with no request to any other host; each default export and
*                  its `.ndarray` are functions; the CASES below give the same
*                  results, bit for bit, in the browser (dist/) and in Node (lib/);
*   4. size        gzipped sizes stay under BUDGET. Raising a budget is a
*                  deliberate edit to this file.
*
* Usage:
*   node bin/check-dist.mjs [--dir <dir>]     (default: dist/; run the build first)
*/

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve( import.meta.dirname, '..' );
const args = process.argv.slice( 2 );
const DIR = path.resolve( ROOT, ( args.indexOf( '--dir' ) >= 0 ) ? args[ args.indexOf( '--dir' ) + 1 ] : 'dist' );
const RUNTIME = '_stdlib.js';

// Gzipped bytes, about 30% above what the build measured when it was added
// (runtime 21.5 KB, largest routine zhegvx 33.8 KB, total 4.2 MB).
const BUDGET = {
	runtime: 28 * 1024,
	largestRoutine: 44 * 1024,
	total: 5.5 * 1024 * 1024
};

// Each case runs as `( ...defaultExports ) => result` against the routines it
// names, once in Node from lib/ and once in Chromium from dist/.
const CASES = [
	{
		routines: [ 'blas/ddot' ],
		body: `( ddot ) => {
			const x = new Float64Array( [ 1, 2, 3, 4 ] );
			return [ ddot( 4, x, 1, x, 1 ), ddot.ndarray( 2, x, 2, 1, x, 2, 1 ) ];
		}`
	},
	{
		routines: [ 'lapack/dgesv' ],
		body: `( dgesv ) => {
			const A = new Float64Array( [ 4, 1, 2, 3, 5, 1, 1, 2, 6 ] );
			const B = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
			const IPIV = new Int32Array( 3 );
			const info = dgesv( 'column-major', 3, 2, A, 3, IPIV, 1, B, 3 );
			return { info, A: Array.from( A ), B: Array.from( B ), IPIV: Array.from( IPIV ) };
		}`
	},
	{
		routines: [ 'lapack/dsyev', 'lapack/dgesvd' ],
		body: `( dsyev, dgesvd ) => {
			const N = 5;
			const S = new Float64Array( N * N );
			for ( let j = 0; j < N; j++ ) for ( let i = 0; i < N; i++ ) S[ i + j*N ] = 1 / ( i + j + 1 );
			const A = S.slice(), w = new Float64Array( N );
			const info1 = dsyev( 'column-major', 'compute-vectors', 'upper', N, A, N, w, 1, null );
			const G = S.slice(), s = new Float64Array( N ), U = new Float64Array( N*N ), VT = new Float64Array( N*N );
			const info2 = dgesvd( 'column-major', 'all-columns', 'all-rows', N, N, G, N, s, 1, U, N, VT, N, null );
			return { info1, w: Array.from( w ), A: Array.from( A ), info2, s: Array.from( s ), U: Array.from( U ), VT: Array.from( VT ) };
		}`
	}
];

const errors = [];
const fail = ( msg ) => errors.push( msg );
const gz = ( f ) => zlib.gzipSync( fs.readFileSync( f ) ).length;
const kb = ( n ) => `${( n / 1024 ).toFixed( 1 )} KB`;

// 1. Structure.
const pkg = JSON.parse( fs.readFileSync( path.join( ROOT, 'package.json' ), 'utf8' ) );
const routines = Object.keys( pkg.exports ).map( ( k ) => ( /^\.\/(\w+\/\w+)$/.exec( k ) || [] )[ 1 ] ).filter( Boolean );
if ( !fs.existsSync( DIR ) ) {
	console.error( `${path.relative( ROOT, DIR )}/ does not exist: run npm run build:dist first` );
	process.exit( 1 );
}
const found = fs.readdirSync( DIR, { recursive: true } ).filter( ( f ) => f.endsWith( '.js' ) ).map( ( f ) => f.split( path.sep ).join( '/' ) );
const want = new Set( [ RUNTIME, ...routines.map( ( r ) => `${r}.js` ) ] );
for ( const f of want ) {
	if ( !found.includes( f ) ) fail( `missing: ${f}` );
}
for ( const f of found ) {
	if ( !want.has( f ) ) fail( `unexpected file: ${f}` );
}
if ( !fs.existsSync( path.join( DIR, 'THIRD_PARTY_LICENSES.txt' ) ) ) fail( 'missing: THIRD_PARTY_LICENSES.txt' );

// 2. Vendoring: imports are read from the minified output by pattern.
// `(?<!["'.\w$])` skips a property named `from`/`import` (`"from",function…`).
const IMPORT = /(?<!["'.\w$])(?:from|import)\s*["']([^"']+)["']|(?<!["'.\w$])import\s*\(/g;
for ( const f of found.filter( ( x ) => want.has( x ) ) ) {
	const src = fs.readFileSync( path.join( DIR, f ), 'utf8' );
	for ( const m of src.matchAll( IMPORT ) ) {
		const spec = m[ 1 ];
		if ( spec === void 0 ) fail( `${f}: dynamic import()` );
		else if ( f === RUNTIME || spec !== path.posix.relative( path.posix.dirname( f ), RUNTIME ).replace( /^(?!\.)/, './' ) ) fail( `${f}: imports ${spec}` );
	}
	if ( /\brequire\s*\(/.test( src ) ) fail( `${f}: calls require()` );
}

// 4. Size.
let total = 0;
let largest = [ '', 0 ];
for ( const f of found.filter( ( x ) => want.has( x ) ) ) {
	const n = gz( path.join( DIR, f ) );
	total += n;
	if ( f !== RUNTIME && n > largest[ 1 ] ) largest = [ f, n ];
}
const runtimeSize = fs.existsSync( path.join( DIR, RUNTIME ) ) ? gz( path.join( DIR, RUNTIME ) ) : 0;
if ( runtimeSize > BUDGET.runtime ) fail( `${RUNTIME} is ${kb( runtimeSize )} gzipped; budget ${kb( BUDGET.runtime )}` );
if ( largest[ 1 ] > BUDGET.largestRoutine ) fail( `${largest[ 0 ]} is ${kb( largest[ 1 ] )} gzipped; budget ${kb( BUDGET.largestRoutine )}` );
if ( total > BUDGET.total ) fail( `dist/ is ${kb( total )} gzipped; budget ${kb( BUDGET.total )}` );

// 3. Browser.
const expected = [];
for ( const c of CASES ) {
	const fns = [];
	for ( const r of c.routines ) {
		fns.push( ( await import( pathToFileURL( path.join( ROOT, 'lib', r, 'lib', 'index.js' ) ) ) ).default );
	}
	expected.push( JSON.stringify( ( 0, eval )( c.body )( ...fns ) ) );
}
const page = `<!doctype html><meta charset="utf-8"><script type="module">
const routines = ${JSON.stringify( routines )};
const cases = [ ${CASES.map( ( c ) => `{ routines: ${JSON.stringify( c.routines )}, fn: ${c.body} }` ).join( ',\n' )} ];
const bad = [];
const mods = {};
await Promise.all( routines.map( async ( r ) => {
	try {
		const m = ( await import( './dist/' + r + '.js' ) ).default;
		if ( typeof m !== 'function' || typeof m.ndarray !== 'function' ) bad.push( r + ': default export or .ndarray is not a function' );
		mods[ r ] = m;
	} catch ( e ) { bad.push( r + ': ' + e.message ); }
} ) );
const results = [];
for ( const c of cases ) {
	try { results.push( JSON.stringify( c.fn( ...c.routines.map( ( r ) => mods[ r ] ) ) ) ); }
	catch ( e ) { results.push( 'threw: ' + e.message ); }
}
window.done = { bad, results };
</script>`;
const server = http.createServer( ( req, res ) => {
	const url = decodeURIComponent( req.url.split( '?' )[ 0 ] );
	if ( url === '/' ) {
		res.writeHead( 200, { 'content-type': 'text/html' } );
		return res.end( page );
	}
	const f = path.join( DIR, url.replace( /^\/dist\//, '' ) );
	if ( !url.startsWith( '/dist/' ) || !f.startsWith( DIR ) || !fs.existsSync( f ) ) {
		res.writeHead( 404 );
		return res.end();
	}
	res.writeHead( 200, { 'content-type': 'text/javascript' } );
	return res.end( fs.readFileSync( f ) );
} );
await new Promise( ( r ) => server.listen( 0, '127.0.0.1', r ) );
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
try {
	const tab = await browser.newPage();
	const requests = [];
	tab.on( 'request', ( q ) => requests.push( q.url() ) );
	tab.on( 'pageerror', ( e ) => fail( `page error: ${e.message}` ) );
	await tab.goto( origin + '/' );
	await tab.waitForFunction( () => window.done, null, { timeout: 120000 } );
	const { bad, results } = await tab.evaluate( () => window.done );
	bad.forEach( fail );
	requests.filter( ( u ) => !u.startsWith( origin ) ).forEach( ( u ) => fail( `request outside dist/: ${u}` ) );
	CASES.forEach( ( c, i ) => {
		if ( results[ i ] !== expected[ i ] ) fail( `case ${c.routines.join( '+' )}: browser ${results[ i ]} !== node ${expected[ i ]}` );
	} );
	console.log( `browser: ${routines.length} routines loaded in ${requests.length - 1} requests; ${CASES.length} cases compared with Node` );
} finally {
	await browser.close();
	server.close();
}

console.log( `size (gzipped): ${RUNTIME} ${kb( runtimeSize )}, largest routine ${largest[ 0 ]} ${kb( largest[ 1 ] )}, total ${kb( total )}` );
if ( errors.length ) {
	errors.slice( 0, 50 ).forEach( ( e ) => console.error( `FAIL ${e}` ) );
	console.error( `${errors.length} problem(s)` );
	process.exit( 1 );
}
console.log( 'dist OK' );
