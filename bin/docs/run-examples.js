#!/usr/bin/env node
/**
* Runs every JSDoc @example in lib/ as an ESM module and checks its result
* annotations. An example fails if it throws or if a claim it makes is false.
*
* Annotations (stdlib style):
*
*   var info = f( … );
*   // returns 0                       the value of the previous statement
*   // x => <Float64Array>[ 1.0, 2.0 ]  the value of an expression (x, x[ 0 ], out.info)
*   var y = f( … ); // returns 3.0      inline form
*
* Values: numbers (`~0.973` means "equal to the digits shown"), NaN, Infinity,
* true/false/null, 'strings', and `[ … ]` arrays of those, optionally typed
* (`<Float64Array>[ … ]`, `<Complex128Array>[ re, im, … ]`). Anything else
* (`{ info: 0, … }`, `<integer>`, `...`) is not a checkable claim and fails.
*
* Examples run from test/build/doctest/<pid>/ (inside the package, so the
* self-import `@rreusser/blahpack/...` resolves through package.json "exports").
*
* Usage: node bin/docs/run-examples.js [--verbose] [routine ...]
*
* @module bin/docs/run-examples
*/

import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { extractAll, ROOT } from './extract.js';


// ANNOTATIONS //

/**
* Parses an annotation value into a JSON-able expectation, or throws.
*
* @private
* @param {string} src - value text
* @returns {Object} expectation
*/
function parseValue( src ) {
	let s = src.trim().replace( /;$/, '' );
	let type = null;
	const t = /^<(\w+)>\s*/.exec( s );
	if ( t ) {
		type = t[ 1 ];
		s = s.slice( t[ 0 ].length );
	}
	if ( /^\[[\s\S]*\]$/.test( s ) ) {
		const inner = s.slice( 1, -1 ).trim();
		const items = inner ? inner.split( ',' ).map( ( x ) => scalar( x.trim() ) ) : [];
		return { 'kind': 'array', type, items };
	}
	if ( type && type !== 'number' && type !== 'boolean' ) {
		throw new Error( 'typed non-array annotation <' + type + '>' );
	}
	return scalar( s );
}

function scalar( s ) {
	let m;
	if ( s === 'true' || s === 'false' ) {
		return { 'kind': 'exact', 'value': s === 'true' };
	}
	if ( s === 'null' ) {
		return { 'kind': 'exact', 'value': null };
	}
	if ( /^'[^']*'$/.test( s ) ) {
		return { 'kind': 'exact', 'value': s.slice( 1, -1 ) };
	}
	if ( /^[+-]?NaN$/.test( s ) ) {
		return { 'kind': 'nan' };
	}
	if ( /^[+-]?Infinity$/.test( s ) ) {
		return { 'kind': 'num', 'value': ( s[ 0 ] === '-' ) ? -Infinity : Infinity, 'tol': 0 };
	}
	m = /^(~)?\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)$/i.exec( s );
	if ( m ) {
		const value = Number( m[ 2 ] );
		if ( !m[ 1 ] ) {
			return { 'kind': 'num', value, 'tol': 1e-12 * Math.max( 1, Math.abs( value ) ) };
		}
		// "~" means equal to the digits shown: half a unit in the last place.
		const mant = m[ 2 ].replace( /e.*$/i, '' );
		const exp = Number( ( /e([+-]?\d+)$/i.exec( m[ 2 ] ) || [ 0, 0 ] )[ 1 ] );
		const dec = ( mant.split( '.' )[ 1 ] || '' ).length;
		return { 'kind': 'num', value, 'tol': 0.5 * Math.pow( 10, exp - dec ) * 1.001 };
	}
	throw new Error( 'not a checkable value: ' + s );
}

/**
* Instruments an example: each annotation becomes a check call.
*
* @private
* @param {string} code - example code
* @returns {Object} `{ code, claims }`
*/
function instrument( code ) {
	const lines = code.split( '\n' );
	const out = [];
	let claims = 0;
	let prev = null; // name of the previous statement's value
	for ( let i = 0; i < lines.length; i++ ) {
		let line = lines[ i ];
		let m = /^(.*?;)\s*\/\/\s*returns\s+(.+)$/.exec( line );
		if ( m && !/^\s*\/\//.test( line ) ) {
			// Inline: `var x = f(); // returns 3`
			const d = /^\s*(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=/.exec( m[ 1 ] );
			const stmt = d ? m[ 1 ] : '__v = ( ' + m[ 1 ].replace( /;\s*$/, '' ) + ' );';
			out.push( stmt );
			out.push( check( d ? d[ 1 ] : '__v', m[ 2 ], i ) );
			claims += 1;
			prev = null;
			continue;
		}
		m = /^\s*\/\/\s*returns\s+(.+)$/.exec( line );
		if ( m ) {
			if ( !prev ) {
				out.push( fail( 'a `// returns` with no statement before it', i ) );
			} else {
				out.push( check( prev, m[ 1 ], i ) );
			}
			claims += 1;
			continue;
		}
		m = /^\s*\/\/\s*([A-Za-z_$][\w$]*(?:\s*\[\s*\d+\s*\]|\.[A-Za-z_$][\w$]*)*)\s*=>\s*(.+)$/.exec( line );
		if ( m ) {
			out.push( check( m[ 1 ], m[ 2 ], i ) );
			claims += 1;
			continue;
		}
		if ( /^\s*\/\//.test( line ) || !line.trim() ) {
			out.push( line );
			continue;
		}
		// Track the previous statement for a following `// returns`.
		m = /^\s*(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=/.exec( line );
		if ( m ) {
			prev = m[ 1 ];
		} else if ( /;\s*$/.test( line ) && !/^\s*(import|export)\b/.test( line ) && !/^\s*[}\])]/.test( line ) ) {
			line = '__v = ( ' + line.replace( /;\s*$/, '' ) + ' );';
			prev = '__v';
		} else {
			prev = null;
		}
		out.push( line );
	}
	return { 'code': out.join( '\n' ), claims };
}

function check( expr, value, line ) {
	let exp;
	try {
		exp = parseValue( value );
	} catch ( err ) {
		return fail( 'line ' + ( line + 1 ) + ': ' + err.message, line );
	}
	return '__check( ' + JSON.stringify( expr ) + ', () => ( ' + expr + ' ), ' + JSON.stringify( exp ) + ', ' + ( line + 1 ) + ' );';
}

function fail( msg, line ) {
	return '__fail( ' + JSON.stringify( msg ) + ', ' + ( line + 1 ) + ' );';
}

const PRELUDE = `
let __v;
const __errors = [];
function __fail( msg ) { __errors.push( msg ); }
function __num( a, e ) {
	if ( e.kind === 'nan' ) { return a !== a; }
	if ( e.kind === 'exact' ) { return a === e.value; }
	if ( typeof a !== 'number' ) { return false; }
	if ( e.value === Infinity || e.value === -Infinity ) { return a === e.value; }
	return Math.abs( a - e.value ) <= e.tol;
}
function __flat( a ) {
	if ( a && a.constructor && /^Complex(128|64)Array$/.test( a.constructor.name ) ) {
		const F = a.constructor.name === 'Complex64Array' ? Float32Array : Float64Array;
		return Array.from( new F( a.buffer, a.byteOffset, a.length * 2 ) );
	}
	return Array.from( a );
}
function __show( a ) {
	try { return ( a && typeof a === 'object' && 'length' in a ) ? '[ ' + __flat( a ).join( ', ' ) + ' ]' : String( a ); } catch ( e ) { return String( a ); }
}
function __check( src, get, e, line ) {
	let a;
	try { a = get(); } catch ( err ) { __errors.push( 'line ' + line + ': ' + src + ' threw ' + err.message ); return; }
	if ( e.kind === 'array' ) {
		const ok = a && typeof a === 'object' && 'length' in a && ( !e.type || a.constructor.name === e.type || ( e.type === 'Array' && Array.isArray( a ) ) );
		const f = ok ? __flat( a ) : null;
		if ( !ok || f.length !== e.items.length || e.items.some( ( x, i ) => !__num( f[ i ], x ) ) ) {
			__errors.push( 'line ' + line + ': ' + src + ' is ' + ( a && a.constructor ? '<' + a.constructor.name + '>' : '' ) + __show( a ) );
		}
		return;
	}
	if ( !__num( a, e ) ) {
		__errors.push( 'line ' + line + ': ' + src + ' is ' + __show( a ) );
	}
}
`;
const POSTLUDE = `
if ( __errors.length ) { console.error( 'CLAIMS: ' + __errors.join( ' | ' ) ); process.exit( 3 ); }
`;


// MAIN //

const args = process.argv.slice( 2 );
const verbose = args.includes( '--verbose' );
const only = args.filter( ( a ) => !a.startsWith( '--' ) );

// One directory per run, so concurrent runs never delete each other's files.
const dir = join( ROOT, 'test', 'build', 'doctest', String( process.pid ) );
mkdirSync( dir, { 'recursive': true } );
process.on( 'exit', () => {
	if ( !verbose ) {
		rmSync( dir, { 'recursive': true, 'force': true } );
	}
});

let ran = 0;
let claims = 0;
const failures = [];
for ( const r of extractAll( only.length ? { only } : {} ) ) {
	r.examples.forEach( ( code, i ) => {
		const file = join( dir, r.name + '.' + i + '.mjs' );
		const inst = instrument( code );
		// Imports must stay first in a module; the prelude goes after them.
		const lines = inst.code.split( '\n' );
		const k = lines.reduce( ( last, l, j ) => ( /^\s*import\s/.test( l ) ? j + 1 : last ), 0 );
		writeFileSync( file, lines.slice( 0, k ).join( '\n' ) + '\n' + PRELUDE + lines.slice( k ).join( '\n' ) + '\n' + POSTLUDE );
		const res = spawnSync( process.execPath, [ file ], { 'encoding': 'utf8', 'timeout': 20000 } );
		ran += 1;
		claims += inst.claims;
		if ( res.status !== 0 ) {
			const err = res.stderr || '';
			const msg = ( /CLAIMS: (.*)/.exec( err ) || [] )[ 1 ] || err.split( '\n' ).find( ( l ) => /Error|error:/.test( l ) ) || ( 'exit ' + res.status );
			failures.push( r.name + '#' + i + ': ' + msg.trim() + ( verbose ? '\n    ' + file : '' ) );
		}
	});
}
console.log( 'examples run: ' + ran + ', claims checked: ' + claims + ', failed: ' + failures.length );
for ( const f of failures ) {
	console.log( '  ' + f );
}
process.exitCode = failures.length ? 1 : 0;
