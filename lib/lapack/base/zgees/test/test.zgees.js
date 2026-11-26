/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgees from './../lib/zgees.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zgees is a function', function t() {
	assert.strictEqual( typeof zgees, 'function', 'is a function' );
});

test( 'zgees has expected arity', function t() {
	assert.strictEqual( zgees.length, 15, 'has expected arity' );
});

test( 'zgees throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgees( 'column-major', 'no-vectors', 'none', 2, -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgees allocates a sufficient workspace when WORK, RWORK and BWORK are null (ticket 0096)', function t() { // eslint-disable-line max-len
	const sizes = [ 3, 40 ];
	let seed = 11;
	let Av0, A1, A2, w1, w2, V1, V2, N, i, s;
	for ( s = 0; s < sizes.length; s++ ) {
		N = sizes[ s ];
		Av0 = new Float64Array( 2 * N * N );
		for ( i = 0; i < Av0.length; i++ ) {
			seed = ( seed * 16807 ) % 2147483647;
			Av0[ i ] = ( seed / 2147483647 ) - 0.5;
		}
		A1 = new Complex128Array( Av0 );
		A2 = new Complex128Array( Av0 );
		w1 = new Complex128Array( N );
		w2 = new Complex128Array( N );
		V1 = new Complex128Array( N * N );
		V2 = new Complex128Array( N * N );
		assert.equal( zgees( 'column-major', 'compute-vectors', 'none', null, N, A1, N, new Int32Array( 1 ), w1, 1, V1, N, null, null, null ), 0 ); // eslint-disable-line max-len
		ndarray( 'compute-vectors', 'none', null, N, A2, 1, N, 0, new Int32Array( 1 ), w2, 1, 0, V2, 1, N, 0, new Complex128Array( 100 * N ), 1, 0, new Float64Array( N ), 1, 0, new Uint8Array( N ), 1, 0 ); // eslint-disable-line max-len
		assert.deepEqual( reinterpret( w1, 0 ), reinterpret( w2, 0 ), 'w' );
		assert.deepEqual( reinterpret( V1, 0 ), reinterpret( V2, 0 ), 'VS' );
		assert.deepEqual( reinterpret( A1, 0 ), reinterpret( A2, 0 ), 'T' );
	}
});
