/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatrz from './../lib/index.js';


// FUNCTIONS //

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlatrz, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlatrz.ndarray, 'function', 'has ndarray method' );
});

test( 'main export has expected arity', function t() {
	assert.strictEqual( dlatrz.length, 10, 'has expected arity' );
});

test( 'M === N: zeroes TAU and leaves A unchanged', function t() {
	var WORK = new Float64Array( 3 );
	var TAU = new Float64Array([ 7.0, 7.0, 7.0 ]);
	var A = new Float64Array([
		3.0,
		0.0,
		0.0,
		1.0,
		4.0,
		0.0,
		2.0,
		1.0,
		5.0
	]);
	dlatrz( 'column-major', 3, 3, 0, A, 3, TAU, 1, WORK, 1 );
	assert.deepEqual( toArray( TAU ), [ 0.0, 0.0, 0.0 ], 'TAU zeroed' );
	assert.equal( A[ 0 ], 3.0, 'A unchanged' );
	assert.equal( A[ 4 ], 4.0, 'A unchanged' );
});

test( 'M === 0: quick return, TAU untouched', function t() {
	var WORK = new Float64Array( 1 );
	var TAU = new Float64Array([ 9.0, 9.0 ]);
	var A = new Float64Array( 4 );
	dlatrz( 'column-major', 0, 4, 4, A, 1, TAU, 1, WORK, 1 );
	assert.equal( TAU[ 0 ], 9.0, 'TAU untouched' );
});

test( '3x5 with l=2 produces upper triangular R', function t() {
	var WORK = new Float64Array( 3 );
	var TAU = new Float64Array( 3 );
	var A = new Float64Array([
		4.0,
		0.0,
		0.0,
		1.0,
		5.0,
		0.0,
		2.0,
		1.0,
		6.0,
		3.0,
		2.0,
		1.0,
		1.0,
		4.0,
		2.0
	]);
	dlatrz( 'column-major', 3, 5, 2, A, 3, TAU, 1, WORK, 1 );

	// R is in A(0:2, 0:2); sub-diagonal entries of R must be exactly zero.
	assert.equal( A[ 1 ], 0.0, 'R(1,0) = 0' );
	assert.equal( A[ 2 ], 0.0, 'R(2,0) = 0' );
	assert.equal( A[ 5 ], 0.0, 'R(2,1) = 0' );
	assert.ok( TAU[ 0 ] !== 0.0, 'TAU[0] nonzero' );
});

test( 'row-major layout: LDA < N throws RangeError', function t() {
	var WORK = new Float64Array( 3 );
	var TAU = new Float64Array( 3 );
	var A = new Float64Array( 16 );
	assert.throws( function err() {
		dlatrz( 'row-major', 3, 5, 2, A, 2, TAU, 1, WORK, 1 );
	}, RangeError );
});

test( 'invalid order throws TypeError', function t() {
	var WORK = new Float64Array( 3 );
	var TAU = new Float64Array( 3 );
	var A = new Float64Array( 16 );
	assert.throws( function err() {
		dlatrz( 'bogus', 3, 5, 2, A, 3, TAU, 1, WORK, 1 );
	}, TypeError );
});

test( 'negative M throws RangeError', function t() {
	var WORK = new Float64Array( 3 );
	var TAU = new Float64Array( 3 );
	var A = new Float64Array( 16 );
	assert.throws( function err() {
		dlatrz( 'column-major', -1, 5, 2, A, 3, TAU, 1, WORK, 1 );
	}, RangeError );
});
