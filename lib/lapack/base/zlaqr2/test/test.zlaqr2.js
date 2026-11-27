/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr2 from './../lib/zlaqr2.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zlaqr2 is a function', function t() {
	assert.strictEqual( typeof zlaqr2, 'function', 'is a function' );
});

test( 'zlaqr2 has expected arity', function t() {
	assert.strictEqual( zlaqr2.length, 26, 'has expected arity' );
});

test( 'zlaqr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const ns = new Int32Array( 1 );
		const nd = new Int32Array( 1 );
		ns[ 0 ] = 0;
		nd[ 0 ] = 0;
		zlaqr2( 'column-major', true, true, -1, 1, 0, 0, new Complex128Array( 4 ), 2, 1, 0, new Complex128Array( 4 ), 2, ns, nd, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, 0, new Complex128Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlaqr2 returns `{ns, nd}` for trivial empty deflation window (nw=0)', function t() {
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
	zlaqr2( 'column-major', true, true, N, 1, N, 0, H, N, 1, N, Z, N, ns, nd, SH, 1, V, N, N, T, N, N, WV, N, WORK );
	const out = {
		'ns': ns[ 0 ],
		'nd': nd[ 0 ]
	};
	assert.strictEqual( typeof out, 'object', 'returns an object' );
	assert.strictEqual( out.ns, 0, 'ns is 0' );
	assert.strictEqual( out.nd, 0, 'nd is 0' );
});

test( 'zlaqr2: WORK = null allocates enough for a deflation window wider than 32 (ticket 0096)', function t() {
	const N = 40;
	const nw = 35;
	const ns1 = new Int32Array( 1 );
	const nd1 = new Int32Array( 1 );
	const ns2 = new Int32Array( 1 );
	const nd2 = new Int32Array( 1 );
	const H1 = new Complex128Array( N * N );
	const hv = reinterpret( H1, 0 );
	let seed = 7;
	let H2;
	let Z1;
	let Z2;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= Math.min( j + 1, N - 1 ); i++ ) {
			seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
			hv[ 2 * ( i + ( j * N ) ) ] = ( seed / 2147483648 ) - 0.5;
			seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
			hv[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = ( seed / 2147483648 ) - 0.5;
		}
	}
	H2 = new Complex128Array( reinterpret( H1, 0 ) );
	Z1 = new Complex128Array( N * N );
	Z2 = new Complex128Array( N * N );
	zlaqr2( 'column-major', true, true, N, 1, N, nw, H1, N, 1, N, Z1, N, ns1, nd1, new Complex128Array( N ), 1, new Complex128Array( N * N ), N, N, new Complex128Array( N * N ), N, N, new Complex128Array( N * N ), N, null );
	ndarray( true, true, N, 1, N, nw, H2, 1, N, 0, 1, N, Z2, 1, N, 0, ns2, nd2, new Complex128Array( N ), 1, 0, new Complex128Array( N * N ), 1, N, 0, N, new Complex128Array( N * N ), 1, N, 0, N, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( 10 * N * N ), 1, 0 );
	assert.ok( ns2[ 0 ] > 32, 'ns > 32 (blocked ZGEHRD path)' );
	assert.strictEqual( ns1[ 0 ], ns2[ 0 ], 'ns' );
	assert.strictEqual( nd1[ 0 ], nd2[ 0 ], 'nd' );
	assert.deepStrictEqual( Array.from( reinterpret( H1, 0 ) ), Array.from( reinterpret( H2, 0 ) ), 'H' );
	assert.deepStrictEqual( Array.from( reinterpret( Z1, 0 ) ), Array.from( reinterpret( Z2, 0 ) ), 'Z' );
});
