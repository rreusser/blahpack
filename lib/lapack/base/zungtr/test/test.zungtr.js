/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zungtr from './../lib/zungtr.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Returns a deterministic pseudo-random array in [-1,1].
*
* @private
* @param {NonNegativeInteger} n - length
* @param {number} seed - seed
* @returns {Float64Array} array
*/
function fill( n, seed ) {
	var out = new Float64Array( n );
	var s = seed;
	var i;
	for ( i = 0; i < n; i++ ) {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		out[ i ] = ( 2.0 * ( s / 2147483648 ) ) - 1.0;
	}
	return out;
}


// TESTS //

test( 'zungtr is a function', function t() {
	assert.strictEqual( typeof zungtr, 'function', 'is a function' );
});

test( 'zungtr has expected arity', function t() {
	assert.strictEqual( zungtr.length, 8, 'has expected arity' );
});

test( 'zungtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zungtr( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zungtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zungtr( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zungtr allocates enough workspace when WORK is null (upper, blocked, N-1 > 32)', function t() {
	var expected;
	var actual;
	var tau;
	var A1;
	var A2;
	var i;
	A1 = new Complex128Array( fill( 2 * 1600, 7 ) );
	A2 = new Complex128Array( fill( 2 * 1600, 7 ) );
	tau = new Complex128Array( fill( 2 * 39, 11 ) );
	ndarray( 'upper', 40, A1, 1, 40, 0, tau, 1, 0, new Complex128Array( 1248 ), 1, 0 );
	zungtr( 'column-major', 'upper', 40, A2, 40, tau, 1, null );
	expected = reinterpret( A1, 0 );
	actual = reinterpret( A2, 0 );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( actual[ i ] === actual[ i ], 'finite at ' + i );
		assert.strictEqual( actual[ i ], expected[ i ], 'matches ndarray at ' + i );
	}
});

test( 'zungtr allocates enough workspace when WORK is null (lower, blocked, N-1 > 32)', function t() {
	var expected;
	var actual;
	var tau;
	var A1;
	var A2;
	var i;
	A1 = new Complex128Array( fill( 2 * 1600, 7 ) );
	A2 = new Complex128Array( fill( 2 * 1600, 7 ) );
	tau = new Complex128Array( fill( 2 * 39, 11 ) );
	ndarray( 'lower', 40, A1, 1, 40, 0, tau, 1, 0, new Complex128Array( 1248 ), 1, 0 );
	zungtr( 'column-major', 'lower', 40, A2, 40, tau, 1, null );
	expected = reinterpret( A1, 0 );
	actual = reinterpret( A2, 0 );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( actual[ i ] === actual[ i ], 'finite at ' + i );
		assert.strictEqual( actual[ i ], expected[ i ], 'matches ndarray at ' + i );
	}
});

test( 'zungtr allocates a valid workspace when WORK is null and N = 0', function t() {
	var info = zungtr( 'column-major', 'upper', 0, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, null );
	assert.strictEqual( info, 0, 'returns expected value' );
});
