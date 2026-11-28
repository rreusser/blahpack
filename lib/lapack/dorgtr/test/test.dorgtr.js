/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorgtr from './../lib/dorgtr.js';
import ndarray from './../lib/ndarray.js';
import { computeOptimalWorkSize } from './../lib/base.js';


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

test( 'dorgtr is a function', function t() {
	assert.strictEqual( typeof dorgtr, 'function', 'is a function' );
});

test( 'dorgtr has expected arity', function t() {
	assert.strictEqual( dorgtr.length, 8, 'has expected arity' );
});

test( 'dorgtr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorgtr( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dorgtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dorgtr( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dorgtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorgtr( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorgtr allocates enough workspace when WORK is null (upper, blocked, N-1 > 32)', function t() {
	var tau;
	var A1;
	var A2;
	var i;
	A1 = fill( 1600, 7 );
	A2 = fill( 1600, 7 );
	tau = fill( 39, 11 );
	ndarray( 'upper', 40, A1, 1, 40, 0, tau, 1, 0, new Float64Array( 1248 ), 1, 0 );
	dorgtr( 'column-major', 'upper', 40, A2, 40, tau, 1, null );
	for ( i = 0; i < A1.length; i++ ) {
		assert.ok( !Number.isNaN( A2[ i ] ), 'finite at ' + i );
		assert.strictEqual( A2[ i ], A1[ i ], 'matches ndarray at ' + i );
	}
});

test( 'dorgtr allocates enough workspace when WORK is null (lower, blocked, N-1 > 32)', function t() {
	var tau;
	var A1;
	var A2;
	var i;
	A1 = fill( 1600, 7 );
	A2 = fill( 1600, 7 );
	tau = fill( 39, 11 );
	ndarray( 'lower', 40, A1, 1, 40, 0, tau, 1, 0, new Float64Array( 1248 ), 1, 0 );
	dorgtr( 'column-major', 'lower', 40, A2, 40, tau, 1, null );
	for ( i = 0; i < A1.length; i++ ) {
		assert.ok( !Number.isNaN( A2[ i ] ), 'finite at ' + i );
		assert.strictEqual( A2[ i ], A1[ i ], 'matches ndarray at ' + i );
	}
});

test( 'dorgtr: computeOptimalWorkSize returns the reference LWKOPT (NB = ILAENV( 1, DORGQL/DORGQR ) = 32)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'upper', 1 ), 32, 'upper, 1' );
	assert.strictEqual( computeOptimalWorkSize( 'upper', 6 ), 160, 'upper, 6' );
	assert.strictEqual( computeOptimalWorkSize( 'lower', 6 ), 160, 'lower, 6' );
});
