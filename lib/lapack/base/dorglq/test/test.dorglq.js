/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorglq from './../lib/dorglq.js';
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

test( 'dorglq is a function', function t() {
	assert.strictEqual( typeof dorglq, 'function', 'is a function' );
});

test( 'dorglq has expected arity', function t() {
	assert.strictEqual( dorglq.length, 9, 'has expected arity' );
});

test( 'dorglq throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorglq( 'invalid', 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dorglq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorglq( 'row-major', -1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorglq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorglq( 'row-major', 2, -1, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorglq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dorglq( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorglq allocates enough workspace when WORK is null (blocked, K > 32)', function t() {
	var tau;
	var A1;
	var A2;
	var i;
	A1 = fill( 1800, 7 );
	A2 = fill( 1800, 7 );
	tau = fill( 40, 11 );
	ndarray( 40, 45, 40, A1, 1, 40, 0, tau, 1, 0, new Float64Array( 1280 ), 1, 0 );
	dorglq( 'column-major', 40, 45, 40, A2, 40, tau, 1, null );
	for ( i = 0; i < A1.length; i++ ) {
		assert.ok( A2[ i ] === A2[ i ], 'finite at ' + i );
		assert.strictEqual( A2[ i ], A1[ i ], 'matches ndarray at ' + i );
	}
});
