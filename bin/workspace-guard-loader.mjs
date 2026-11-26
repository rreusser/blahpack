/**
* Preloaded by bin/workspace-guard.mjs (`--import`) in the test process. It
* defines `globalThis.__wsGuard` and registers a load hook that rewrites ONE
* wrapper (`WS_GUARD_TARGET`):
*
* -   every workspace parameter that the wrapper allocates when null is forced
*     to `null` at function entry, so the module's own test calls exercise the
*     null branch;
* -   that allocation goes through `__wsGuard`, which appends a guard region
*     filled with a sentinel.
*
* At exit, any changed sentinel means the routine wrote past what the wrapper
* allocated: the allocation is insufficient (CONVENTIONS D5c; ticket 0060).
* Findings are appended to `WS_GUARD_REPORT` as JSON lines.
*/

import fs from 'node:fs';
import { register } from 'node:module';
import { isMainThread } from 'node:worker_threads';
import * as espree from 'espree';

const SENTINEL = -1.2345678901234567e+300;
const ISENTINEL = -2147483647;
const BSENTINEL = 0xA5;
const allocs = [];

function guardOf( arr, n ) {
	// Float view of the region past `n` logical elements.
	if ( arr.constructor.name === 'Complex128Array' ) {
		return { 'view': new Float64Array( arr.buffer, arr.byteOffset, arr.length * 2 ), 'from': 2 * n, 'sentinel': SENTINEL };
	}
	if ( arr instanceof Float64Array || arr instanceof Float32Array ) {
		return { 'view': arr, 'from': n, 'sentinel': SENTINEL };
	}
	if ( arr instanceof Uint8Array ) {
		return { 'view': arr, 'from': n, 'sentinel': BSENTINEL };
	}
	return { 'view': arr, 'from': n, 'sentinel': ISENTINEL };
}

// Make `arr` report `n` elements while its storage runs into the guard
// region. A routine that sizes its blocking from `WORK.length` (e.g. zgebrd's
// lwork) must see exactly what the wrapper allocated, or it would legitimately
// use the guard region. `subarray` views keep the clamp (zgelss re-bases WORK
// with `WORK.subarray( offsetWork )`) but still extend into the guard, so an
// overrun through a view is still detected.
function clampLength( arr, n ) {
	const sub = arr.subarray;
	Object.defineProperty( arr, 'length', { 'value': n } );
	Object.defineProperty( arr, 'subarray', {
		'value': function subarray( begin, end ) {
			const b = Math.min( n, ( begin === void 0 ) ? 0 : ( ( begin < 0 ) ? Math.max( 0, n + begin ) : begin ) );
			const e = ( end === void 0 ) ? n : Math.min( n, ( end < 0 ) ? Math.max( 0, n + end ) : end );
			return clampLength( sub.call( arr, b ), Math.max( 0, e - b ) );
		}
	});
	return arr;
}

globalThis.__wsGuard = function wsGuard( Ctor, size, tag ) {
	const n = Math.max( 0, Math.floor( Number( size ) ) );
	const arr = new Ctor( n + Math.max( 64, n ) );
	const g = guardOf( arr, n );
	g.end = g.view.length; // real extent; clampLength hides it from `.length`
	for ( let i = g.from; i < g.end; i++ ) {
		g.view[ i ] = g.sentinel;
	}
	allocs.push( { 'tag': tag, 'n': n, 'g': g, 'test': globalThis.__wsCurrentTest || null } );
	return clampLength( arr, n );
};

// Wraps each top-level `test( name, fn )` of the module's own test files
// (rewritten by the load hook below), so an allocation knows which test made
// it. Only an allocation made inside a test that PASSED and does not expect a
// throw counts as verified: a throw test that happens to get past validation
// with junk inputs reaches the allocation but checks nothing (ticket 0066).
globalThis.__wsTestWrap = function wsTestWrap( expectsThrow, fn ) {
	return function wrapped( ...args ) {
		const ctx = { 'expectsThrow': expectsThrow, 'passed': false };
		const prev = globalThis.__wsCurrentTest;
		globalThis.__wsCurrentTest = ctx;
		let out;
		try {
			out = fn.apply( this, args );
		} catch ( err ) {
			globalThis.__wsCurrentTest = prev;
			throw err;
		}
		if ( out && typeof out.then === 'function' ) {
			return out.then( function onPass( v ) {
				ctx.passed = true;
				globalThis.__wsCurrentTest = prev;
				return v;
			}, function onFail( err ) {
				globalThis.__wsCurrentTest = prev;
				throw err;
			});
		}
		ctx.passed = true;
		globalThis.__wsCurrentTest = prev;
		return out;
	};
};

process.on( 'exit', function onExit() {
	const out = process.env.WS_GUARD_REPORT;
	if ( !out ) {
		return;
	}
	const lines = allocs.map( function each( a ) {
		let first = -1;
		let last = -1;
		for ( let i = a.g.from; i < a.g.end; i++ ) {
			if ( !Object.is( a.g.view[ i ], a.g.sentinel ) ) {
				if ( first < 0 ) {
					first = i;
				}
				last = i;
			}
		}
		const verified = Boolean( a.test && a.test.passed && !a.test.expectsThrow );
		return JSON.stringify( { 'tag': a.tag, 'n': a.n, 'verified': verified, 'overrun': first >= 0, 'firstBeyond': first - a.g.from, 'lastBeyond': last - a.g.from } );
	});
	if ( lines.length ) {
		fs.appendFileSync( out, lines.join( '\n' ) + '\n' );
	}
});

// The hook runs in the loader thread; it rewrites the target wrapper's source.
if ( isMainThread && process.env.WS_GUARD_TARGET ) {
	register( new URL( import.meta.url ), { 'data': { 'target': process.env.WS_GUARD_TARGET, 'testDir': process.env.WS_GUARD_TESTDIR } } );
}

let target = null;
let testDir = null;

export async function initialize( data ) {
	target = data && data.target;
	testDir = data && data.testDir;
}

// Rewrites `test( name, fn )` at the top level of a test file into
// `test( name, globalThis.__wsTestWrap( expectsThrow, fn ) )`, where
// expectsThrow says whether fn's source asserts a throw.
function wrapTests( src ) {
	// espree 9 cannot parse import attributes (`with { type: 'json' }`, used
	// by JSON-fixture imports); parse a copy with them blanked to the same
	// length, so every range still points into `src`.
	const parseable = src.replace( /\bwith\s*\{[^}]*\}(?=\s*;)/g, ( m ) => ' '.repeat( m.length ) );
	const ast = espree.parse( parseable, { 'ecmaVersion': 2022, 'sourceType': 'module', 'range': true } );
	const edits = [];
	ast.body.forEach( function each( st ) {
		const c = st.type === 'ExpressionStatement' && st.expression;
		if ( !c || c.type !== 'CallExpression' || c.callee.type !== 'Identifier' || c.callee.name !== 'test' ) {
			return;
		}
		const fn = c.arguments[ c.arguments.length - 1 ];
		if ( !fn || ( fn.type !== 'FunctionExpression' && fn.type !== 'ArrowFunctionExpression' ) ) {
			return;
		}
		const body = src.slice( fn.range[ 0 ], fn.range[ 1 ] );
		const expectsThrow = /\.(throws|rejects)\s*\(/.test( body );
		edits.push( [ fn.range[ 1 ], fn.range[ 1 ], ' )' ] );
		edits.push( [ fn.range[ 0 ], fn.range[ 0 ], 'globalThis.__wsTestWrap( ' + expectsThrow + ', ' ] );
	});
	edits.sort( ( a, b ) => b[ 0 ] - a[ 0 ] );
	let out = src;
	for ( const e of edits ) {
		out = out.slice( 0, e[ 0 ] ) + e[ 2 ] + out.slice( e[ 1 ] );
	}
	return out;
}

const WORKSPACE = /^[A-Za-z]*work$/i;

// Rewrites the wrapper: force each null-allocated workspace parameter to
// null at entry, and allocate it through __wsGuard.
function transform( src, tagBase ) {
	const ast = espree.parse( src, { 'ecmaVersion': 2022, 'sourceType': 'module', 'range': true } );
	const edits = [];
	( function walk( node, fn ) {
		if ( !node || typeof node.type !== 'string' ) {
			return;
		}
		if ( node.type === 'FunctionDeclaration' && !fn ) {
			const names = node.params.filter( ( p ) => p.type === 'Identifier' && WORKSPACE.test( p.name ) ).map( ( p ) => p.name );
			const allocated = new Set();
			( function inner( n ) {
				if ( !n || typeof n.type !== 'string' ) {
					return;
				}
				if ( n.type === 'AssignmentExpression' && n.left.type === 'Identifier' && names.includes( n.left.name ) && n.right.type === 'NewExpression' && n.right.arguments.length === 1 ) {
					const r = n.right;
					edits.push( [ r.range[ 0 ], r.range[ 1 ], 'globalThis.__wsGuard( ' + src.slice( r.callee.range[ 0 ], r.callee.range[ 1 ] ) + ', ' + src.slice( r.arguments[ 0 ].range[ 0 ], r.arguments[ 0 ].range[ 1 ] ) + ', ' + JSON.stringify( tagBase + ':' + n.left.name ) + ' )' ] );
					allocated.add( n.left.name );
				}
				for ( const k of Object.keys( n ) ) {
					const v = n[ k ];
					if ( Array.isArray( v ) ) {
						v.forEach( inner );
					} else if ( v && typeof v.type === 'string' ) {
						inner( v );
					}
				}
			})( node.body );
			if ( allocated.size ) {
				const at = node.body.range[ 0 ] + 1;
				edits.push( [ at, at, ' ' + [ ...allocated ].map( ( x ) => x + ' = null;' ).join( ' ' ) ] );
			}
			return;
		}
		for ( const k of Object.keys( node ) ) {
			const v = node[ k ];
			if ( Array.isArray( v ) ) {
				v.forEach( ( c ) => walk( c, fn ) );
			} else if ( v && typeof v.type === 'string' ) {
				walk( v, fn );
			}
		}
	})( ast, false );
	edits.sort( ( a, b ) => b[ 0 ] - a[ 0 ] );
	let out = src;
	for ( const e of edits ) {
		out = out.slice( 0, e[ 0 ] ) + e[ 2 ] + out.slice( e[ 1 ] );
	}
	return out;
}

export async function load( url, context, nextLoad ) {
	if ( target && url === target ) {
		const res = await nextLoad( url, context );
		const tag = url.replace( /^.*\/lib\/[a-z]+\/base\//, '' ).replace( /\/lib\/.*$/, '' );
		return { 'format': 'module', 'source': transform( String( res.source ), tag ), 'shortCircuit': true };
	}
	if ( testDir && url.startsWith( testDir ) && /\/test[^/]*\.js$/.test( url ) ) {
		const res = await nextLoad( url, context );
		return { 'format': 'module', 'source': wrapTests( String( res.source ) ), 'shortCircuit': true };
	}
	return nextLoad( url, context );
}
