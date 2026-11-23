/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr3 from './../lib/zlaqr3.js';


// FUNCTIONS //

/**
* Calls the zlaqr3 wrapper (column-major, full active block, Z = I) on a pseudo-random complex upper Hessenberg matrix.
*
* @private
* @param {PositiveInteger} N - order
* @param {PositiveInteger} nw - deflation window size
* @param {(Complex128Array|null)} WORK - workspace
* @returns {Object} outputs
*/
function run( N, nw, WORK ) {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );
	const H = new Complex128Array( N * N );
	const Z = new Complex128Array( N * N );
	const SH = new Complex128Array( N );
	const hv = reinterpret( H, 0 );
	const zv = reinterpret( Z, 0 );
	let seed = 1;
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		zv[ 2 * ( j + ( j * N ) ) ] = 1.0;
		for ( i = 0; i <= Math.min( j + 1, N - 1 ); i++ ) {
			for ( k = 0; k < 2; k++ ) {
				seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
				hv[ ( 2 * ( i + ( j * N ) ) ) + k ] = ( seed / 2147483648 ) - 0.5;
			}
		}
	}
	zlaqr3( 'column-major', true, true, N, 1, N, nw, H, N, 1, N, Z, N, ns, nd, SH, 1, new Complex128Array( N * N ), N, N, new Complex128Array( N * N ), N, N, new Complex128Array( N * N ), N, WORK ); // eslint-disable-line max-len
	return {
		'ns': ns[ 0 ],
		'nd': nd[ 0 ],
		'H': hv,
		'Z': zv,
		'SH': reinterpret( SH, 0 )
	};
}


// TESTS //

test( 'zlaqr3 is a function', function t() {
	assert.strictEqual( typeof zlaqr3, 'function', 'is a function' );
});

test( 'zlaqr3 has expected arity', function t() {
	assert.strictEqual( zlaqr3.length, 26, 'has expected arity' );
});

test( 'zlaqr3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const ns = new Int32Array( 1 );
		const nd = new Int32Array( 1 );
		ns[ 0 ] = 0;
		nd[ 0 ] = 0;
		zlaqr3( 'column-major', true, true, -1, 1, 0, 0, new Complex128Array( 4 ), 2, 1, 0, new Complex128Array( 4 ), 2, ns, nd, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlaqr3 throws RangeError for invalid LDH', function t() {
	assert.throws( function throws() {
		const ns = new Int32Array( 1 );
		const nd = new Int32Array( 1 );
		ns[ 0 ] = 0;
		nd[ 0 ] = 0;
		zlaqr3( 'column-major', true, true, 2, 1, 0, 0, new Complex128Array( 4 ), 1, 1, 0, new Complex128Array( 4 ), 2, ns, nd, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlaqr3 returns `{ns, nd}` for trivial empty deflation window (nw=0)', function t() {
	const ns = new Int32Array( 1 );
	const nd = new Int32Array( 1 );

	const N = 2;
	const H = new Complex128Array( N * N );
	const Z = new Complex128Array( N * N );
	const SH = new Complex128Array( N );
	const V = new Complex128Array( N * N );
	const T = new Complex128Array( N * N );
	const WV = new Complex128Array( N * N );
	const WORK = new Float64Array( N );

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;
	zlaqr3( 'column-major', true, true, N, 1, N, 0, H, N, 1, N, Z, N, ns, nd, SH, 1, V, N, N, T, N, N, WV, N, WORK );
	const out = {
		'ns': ns[ 0 ],
		'nd': nd[ 0 ]
	};
	assert.strictEqual( typeof out, 'object', 'returns an object' );
	assert.strictEqual( out.ns, 0, 'ns is 0' );
	assert.strictEqual( out.nd, 0, 'nd is 0' );
});

test( 'zlaqr3 allocates enough workspace when WORK is null (blocked zgehrd/zunmhr for a large window)', function t() {
	const N = 50;
	const nw = 40;
	const expected = run( N, nw, new Complex128Array( 10 * N * N ) );
	const actual = run( N, nw, null );
	let i;

	// The window must be wide enough (NS > 33) for ZGEHRD/ZUNMQR to use their blocked code:
	assert.ok( expected.ns > 33, 'ns > 33 (got ' + expected.ns + ')' );
	assert.strictEqual( actual.ns, expected.ns, 'ns' );
	assert.strictEqual( actual.nd, expected.nd, 'nd' );
	for ( i = 0; i < 2 * N * N; i++ ) {
		assert.strictEqual( actual.H[ i ], expected.H[ i ], 'H[' + i + ']' );
		assert.strictEqual( actual.Z[ i ], expected.Z[ i ], 'Z[' + i + ']' );
	}
	for ( i = 0; i < 2 * N; i++ ) {
		assert.strictEqual( actual.SH[ i ], expected.SH[ i ], 'SH[' + i + ']' );
	}
});
