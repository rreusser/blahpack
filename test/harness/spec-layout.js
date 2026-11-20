/**
* Spec-driven layout invariance: re-run ANY valid call under other storage
* layouts and require bit-exact results (CONVENTIONS S13, T7).
*
* The routine's spec (spec/<routine>.json, via lint/lib/spec.cjs) says which
* `ndarray.js` arguments are arrays and which follow them as strides and
* offset. Given one canonical call (every array column-major / unit-stride /
* zero-offset, as fixture tests are written), this helper realizes each
* non-workspace array again under each layout below, NaN-poisons every slot
* outside the logical elements, runs the routine, maps every array back to
* canonical order, and asserts:
*
*   - the return value and every array's logical elements agree with the
*     canonical run: bit-identical (`Object.is`) under the pure-addressing
*     `offset` layout, and within a relative tolerance (`opts.tol`, scaled by
*     each array's largest canonical magnitude) under `row-major`/`negative`,
*     where the layout-adaptive BLAS kernels (dgemv, dsymv, dtrmv, …) may
*     legitimately reorder a summation (test/harness/LEARNINGS.md 2026-07-18).
*     A stride or offset bug addresses the wrong elements and misses by O(1);
*   - every poisoned slot is still poison: nothing wrote outside the array.
*     Limitation: a write that only SCALES a slot (`dlascl` walking the wrong
*     stride) leaves NaN poison NaN, bit for bit (V8 keeps NaN payloads through
*     arithmetic), so it is caught only through the logical elements it skips.
*     Choose inputs whose outputs depend on every scaled element.
*
* Layouts: `offset` (unit stride, padded column-major, non-zero offsets),
* `row-major` (row-major matrices with padded leading dimension, vector stride
* 2), `negative` (vector stride −3, i.e. walked backwards from the offset).
* Workspace arrays are passed as fresh copies with their own (unit) stride
* (D5b); their contents are unobservable.
*
* @example
* import { specLayoutInvariant } from '../../../../../test/harness/spec-layout.js';
* specLayoutInvariant( 'dsterf', dsterf, [ N, d, 1, 0, e, 1, 0 ] );
*/

import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire( import.meta.url );
const specLib = require( '../../lint/lib/spec.cjs' );

const LAYOUTS = [ 'offset', 'row-major', 'negative' ];
const EXACT = { 'offset': true };
const TOL = 1e-10;
const INT_POISON = -2147483647;


// FUNCTIONS //

function isComplex( arr ) {
	return !!arr && arr.BYTES_PER_ELEMENT === 16 && !!arr.buffer;
}

function isTyped( arr ) {
	return !!arr && ArrayBuffer.isView( arr ) || isComplex( arr );
}

// Float64/Int32/... view of an array's own storage, and the number of view
// slots per logical element (2 for complex).
function flat( arr ) {
	if ( isComplex( arr ) ) {
		return { 'v': new Float64Array( arr.buffer, arr.byteOffset, arr.length * 2 ), 'w': 2 };
	}
	return { 'v': arr, 'w': 1 };
}

// The poison as it is actually stored in `v` (the integer sentinel wraps in
// narrower types: Uint8Array holds it as 1).
function poisonValue( v ) {
	if ( v instanceof Float64Array || v instanceof Float32Array ) {
		return NaN;
	}
	return ( v instanceof Uint8Array || v instanceof Int8Array || v instanceof Uint8ClampedArray ) ? ( ( v instanceof Int8Array ) ? -77 : 171 ) : INT_POISON;
}

function isPoison( v, x ) {
	return ( v instanceof Float64Array || v instanceof Float32Array ) ? Number.isNaN( x ) : x === poisonValue( v );
}

function alloc( like, len ) {
	return new like.constructor( Math.max( len, 1 ) );
}

// The array arguments of a call, from the spec: [{ index, kind, ... }].
function arraysOf( spec, args ) {
	const out = [];
	let pos = 0;
	specLib.baseGroups( spec ).forEach( function each( g ) {
		const n = g.names.length;
		const arr = args[ pos ];
		const hasOffset = n >= 2 && /^offset/.test( g.names[ n - 1 ] );
		if ( hasOffset && isTyped( arr ) ) {
			out.push({
				'index': pos,
				'name': g.names[ 0 ],
				'rank': n - 2, // 0: element, 1: vector, 2: matrix
				'workspace': g.param.role === 'workspace'
			});
		}
		pos += n;
	});
	return out;
}

// Logical shape of an array in the canonical call.
function shapeOf( a, args, routine ) {
	const arr = args[ a.index ];
	const len = arr.length;
	let s1;
	let off;
	if ( a.rank === 0 ) {
		return { 'n': 1, 'off': args[ a.index + 1 ] };
	}
	if ( a.rank === 1 ) {
		s1 = args[ a.index + 1 ];
		off = args[ a.index + 2 ];
		assert.ok( s1 >= 1, routine + ': canonical call must use a positive stride for `' + a.name + '`' );
		return { 'n': ( len > off ) ? Math.floor( ( len - 1 - off ) / s1 ) + 1 : 0, 's': s1, 'off': off };
	}
	s1 = args[ a.index + 1 ];
	off = args[ a.index + 3 ];
	assert.equal( s1, 1, routine + ': canonical call must pass `' + a.name + '` column-major (strideA1 = 1)' );
	const rows = Math.max( args[ a.index + 2 ], 1 );
	return { 'rows': rows, 'cols': ( len > off ) ? Math.ceil( ( len - off ) / rows ) : 0, 'ld': args[ a.index + 2 ], 'off': off };
}

// Canonical position (in logical elements) of each logical element, in a
// fixed logical order, for the canonical call.
function canonicalIndices( a, sh ) {
	const idx = [];
	let i;
	let j;
	if ( a.rank === 0 ) {
		return [ sh.off ];
	}
	if ( a.rank === 1 ) {
		for ( i = 0; i < sh.n; i++ ) {
			idx.push( sh.off + ( i * sh.s ) );
		}
		return idx;
	}
	for ( j = 0; j < sh.cols; j++ ) {
		for ( i = 0; i < sh.rows; i++ ) {
			idx.push( sh.off + i + ( j * sh.ld ) );
		}
	}
	return idx;
}

// Realize an array under a layout: { arr, addr: [stride(s)..., offset], idx }.
function realize( a, sh, layout, src ) {
	let stride;
	let off;
	let len;
	let ld;
	let s1;
	let s2;
	const idx = [];
	let i;
	let j;
	if ( a.rank === 0 ) {
		off = ( layout === 'offset' ) ? 1 : 2;
		return { 'len': off + 1, 'addr': [ off ], 'idx': [ off ] };
	}
	if ( a.rank === 1 ) {
		if ( layout === 'offset' ) {
			stride = 1;
			off = 3;
		} else if ( layout === 'row-major' ) {
			stride = 2;
			off = 1;
		} else {
			stride = -3;
			off = ( Math.max( sh.n - 1, 0 ) * 3 ) + 2;
		}
		for ( i = 0; i < sh.n; i++ ) {
			idx.push( off + ( i * stride ) );
		}
		len = Math.max( off, ( sh.n > 0 ) ? off + ( ( sh.n - 1 ) * Math.max( stride, 0 ) ) : 0 ) + 3;
		return { 'len': len, 'addr': [ stride, off ], 'idx': idx };
	}
	if ( layout === 'row-major' ) {
		ld = sh.cols + 3;
		s1 = ld;
		s2 = 1;
		off = 2;
		len = off + ( sh.rows * ld ) + 1;
	} else {
		ld = sh.rows + ( ( layout === 'offset' ) ? 2 : 1 );
		s1 = 1;
		s2 = ld;
		off = ( layout === 'offset' ) ? 5 : 0;
		len = off + ( sh.cols * ld ) + 1;
	}
	for ( j = 0; j < sh.cols; j++ ) {
		for ( i = 0; i < sh.rows; i++ ) {
			idx.push( off + ( i * s1 ) + ( j * s2 ) );
		}
	}
	return { 'len': len, 'addr': [ s1, s2, off ], 'idx': idx };
}

function copyArgs( args ) {
	return args.map( function map( x ) {
		if ( isComplex( x ) ) {
			return new x.constructor( new Float64Array( new Float64Array( x.buffer, x.byteOffset, x.length * 2 ) ) );
		}
		if ( ArrayBuffer.isView( x ) ) {
			return x.slice();
		}
		return x;
	});
}

function maxAbs( v, idx, w ) {
	let m = 0;
	let i;
	let c;
	for ( i = 0; i < idx.length; i++ ) {
		for ( c = 0; c < w; c++ ) {
			if ( Number.isFinite( v[ ( idx[ i ] * w ) + c ] ) ) {
				m = Math.max( m, Math.abs( v[ ( idx[ i ] * w ) + c ] ) );
			}
		}
	}
	return m;
}

function agree( x, y, exact, tol ) {
	if ( exact || !Number.isFinite( x ) || !Number.isFinite( y ) ) {
		return Object.is( x, y );
	}
	return Math.abs( x - y ) <= tol;
}

function sameValue( a, b ) {
	let k;
	if ( typeof a === 'number' || typeof b === 'number' ) {
		return Object.is( a, b );
	}
	if ( a === null || b === null || typeof a !== 'object' || typeof b !== 'object' ) {
		return a === b;
	}
	if ( isTyped( a ) || isTyped( b ) ) {
		return true; // returned arrays are compared through the arguments
	}
	for ( k of new Set( Object.keys( a ).concat( Object.keys( b ) ) ) ) {
		if ( !sameValue( a[ k ], b[ k ] ) ) {
			return false;
		}
	}
	return true;
}


// MAIN //

/**
* Asserts that `fn( ...args )` is layout-invariant.
*
* @param {string} routine - routine name (its spec is `spec/<routine>.json`)
* @param {Function} fn - the routine's `ndarray.js` export
* @param {Array} args - a canonical call: arrays column-major, positive stride
* @param {Object} [opts] - options
* @param {Array<string>} [opts.layouts] - layouts to check (default: all)
* @param {Array<string>} [opts.skip] - array names to leave in canonical layout
* @param {number} [opts.tol=1e-10] - relative tolerance for the reordering layouts
*/
function specLayoutInvariant( routine, fn, args, opts ) {
	const o = opts || {};
	const spec = specLib.load( routine );
	assert.ok( spec, 'no spec for ' + routine );
	assert.equal( fn.length, specLib.base( spec ).length, routine + ': fn does not take the spec\'s ndarray signature' );
	const arrays = arraysOf( spec, args ).filter( function f( a ) {
		return !( o.skip || [] ).includes( a.name );
	});
	const shapes = arrays.map( function m( a ) {
		return shapeOf( a, args, routine );
	});

	const ref = copyArgs( args );
	const refRet = fn.apply( null, ref );

	( o.layouts || LAYOUTS ).forEach( function each( layout ) {
		const call = copyArgs( args );
		const plans = [];
		arrays.forEach( function each2( a, k ) {
			if ( a.workspace ) {
				return;
			}
			const sh = shapes[ k ];
			const r = realize( a, sh, layout );
			const src = flat( args[ a.index ] );
			const dst = alloc( args[ a.index ], r.len );
			const d = flat( dst );
			const ci = canonicalIndices( a, sh );
			let i;
			let c;
			d.v.fill( poisonValue( d.v ) );
			for ( i = 0; i < ci.length; i++ ) {
				for ( c = 0; c < d.w; c++ ) {
					d.v[ ( r.idx[ i ] * d.w ) + c ] = src.v[ ( ci[ i ] * src.w ) + c ];
				}
			}
			call[ a.index ] = dst;
			r.addr.forEach( function set( x, i2 ) {
				call[ a.index + 1 + i2 ] = x;
			});
			plans.push( { 'a': a, 'r': r, 'ci': ci, 'dst': dst } );
		});

		const ret = fn.apply( null, call );
		assert.ok( sameValue( ret, refRet ), routine + ' [' + layout + ']: return value differs: ' + JSON.stringify( ret ) + ' vs ' + JSON.stringify( refRet ) );

		// Typed arguments left in canonical layout (length-1 outputs such as
		// `sdim`, skipped arrays) must also agree. Workspace is unobservable.
		call.forEach( function same( x, i ) {
			const inPlan = plans.some( function s( p ) {
				return p.a.index === i;
			}) || arrays.some( function w( a ) {
				return a.workspace && a.index === i;
			});
			let k;
			if ( inPlan || !isTyped( x ) ) {
				return;
			}
			const got = flat( x ).v;
			const want = flat( ref[ i ] ).v;
			for ( k = 0; k < got.length; k++ ) {
				if ( !Object.is( got[ k ], want[ k ] ) ) {
					assert.fail( routine + ' [' + layout + ']: argument ' + i + ' slot ' + k + ' is ' + got[ k ] + ', canonical layout gives ' + want[ k ] );
				}
			}
		});

		plans.forEach( function check( p ) {
			const got = flat( p.dst );
			const want = flat( ref[ p.a.index ] );
			const logical = new Set();
			const exact = !!EXACT[ layout ];
			const tol = ( ( o.tol === void 0 ) ? TOL : o.tol ) * ( maxAbs( want.v, p.ci, want.w ) || 1 );
			let i;
			let c;
			for ( i = 0; i < p.ci.length; i++ ) {
				for ( c = 0; c < got.w; c++ ) {
					logical.add( ( p.r.idx[ i ] * got.w ) + c );
					if ( !agree( got.v[ ( p.r.idx[ i ] * got.w ) + c ], want.v[ ( p.ci[ i ] * want.w ) + c ], exact, tol ) ) {
						assert.fail( routine + ' [' + layout + ']: `' + p.a.name + '` element ' + i + ( ( got.w === 2 ) ? ( c ? ' (imag)' : ' (real)' ) : '' ) + ' is ' + got.v[ ( p.r.idx[ i ] * got.w ) + c ] + ', canonical layout gives ' + want.v[ ( p.ci[ i ] * want.w ) + c ] );
					}
				}
			}
			for ( i = 0; i < got.v.length; i++ ) {
				if ( !logical.has( i ) && !isPoison( got.v, got.v[ i ] ) ) {
					assert.fail( routine + ' [' + layout + ']: wrote ' + got.v[ i ] + ' outside the logical elements of `' + p.a.name + '` (slot ' + i + ')' );
				}
			}
		});
	});
}


// EXPORTS //

export { specLayoutInvariant, LAYOUTS };
