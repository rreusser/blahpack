/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zungqr from './../lib/zungqr.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import strided from './../lib/strided.js';


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

test( 'zungqr is a function', function t() {
	assert.strictEqual( typeof zungqr, 'function', 'is a function' );
});

test( 'zungqr has expected arity', function t() {
	assert.strictEqual( zungqr.length, 9, 'has expected arity' );
});

test( 'zungqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zungqr( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zungqr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zungqr( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zungqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zungqr( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zungqr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zungqr( 'row-major', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zungqr allocates enough workspace when WORK is null (blocked, K = 140 > NX = 128)', function t() {
	var expected;
	var actual;
	var tau;
	var A1;
	var A2;
	var i;
	A1 = new Complex128Array( fill( 2 * 20300, 7 ) );
	A2 = new Complex128Array( fill( 2 * 20300, 7 ) );
	tau = new Complex128Array( fill( 2 * 140, 11 ) );
	strided( 145, 140, 140, A1, 1, 145, 0, tau, 1, 0, new Complex128Array( 4480 ), 1, 0 );
	zungqr( 'column-major', 145, 140, 140, A2, 145, tau, 1, null );
	expected = reinterpret( A1, 0 );
	actual = reinterpret( A2, 0 );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( !Number.isNaN( actual[ i ] ), 'finite at ' + i );
		assert.strictEqual( actual[ i ], expected[ i ], 'matches strided at ' + i );
	}
});
