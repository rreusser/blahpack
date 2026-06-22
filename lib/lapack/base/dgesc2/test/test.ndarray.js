/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgetc2 from '../../dgetc2/lib/base.js';
import dgesc2 from './../lib/ndarray.js';

// FIXTURES //

import basic_2x2 from './fixtures/basic_2x2.json' with { type: 'json' };
import basic_3x3 from './fixtures/basic_3x3.json' with { type: 'json' };
import basic_4x4 from './fixtures/basic_4x4.json' with { type: 'json' };
import n_equals_1 from './fixtures/n_equals_1.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

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

test( 'dgesc2: basic_2x2', function t() {
	var scale;
	var IPIV;
	var JPIV;
	var LDA;
	var RHS;
	var tc;
	var N;
	var A;

	tc = basic_2x2;
	N = 2;
	LDA = 4;
	A = new Float64Array( LDA * N );
	IPIV = new Int32Array( N );
	JPIV = new Int32Array( N );
	RHS = new Float64Array( N );
	scale = new Float64Array( 1 );
	A[ 0*LDA + 0 ] = 4.0;
	A[ 1*LDA + 0 ] = 3.0;
	A[ 0*LDA + 1 ] = 2.0;
	A[ 1*LDA + 1 ] = 1.0;
	dgetc2( N, A, 1, LDA, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS[ 0 ] = 10.0;
	RHS[ 1 ] = 4.0;
	dgesc2( N, A, 1, LDA, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, scale );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( RHS ), tc.rhs, 1e-14, 'rhs' );
});

test( 'dgesc2: basic_3x3', function t() {
	var scale;
	var IPIV;
	var JPIV;
	var LDA;
	var RHS;
	var tc;
	var N;
	var A;

	tc = basic_3x3;
	N = 3;
	LDA = 4;
	A = new Float64Array( LDA * N );
	IPIV = new Int32Array( N );
	JPIV = new Int32Array( N );
	RHS = new Float64Array( N );
	scale = new Float64Array( 1 );
	A[ 0*LDA + 0 ] = 2.0;
	A[ 1*LDA + 0 ] = 1.0;
	A[ 2*LDA + 0 ] = 1.0;
	A[ 0*LDA + 1 ] = 4.0;
	A[ 1*LDA + 1 ] = 3.0;
	A[ 2*LDA + 1 ] = 3.0;
	A[ 0*LDA + 2 ] = 8.0;
	A[ 1*LDA + 2 ] = 7.0;
	A[ 2*LDA + 2 ] = 9.0;
	dgetc2( N, A, 1, LDA, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS[ 0 ] = 4.0;
	RHS[ 1 ] = 10.0;
	RHS[ 2 ] = 24.0;
	dgesc2( N, A, 1, LDA, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, scale );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( RHS ), tc.rhs, 1e-14, 'rhs' );
});

test( 'dgesc2: basic_4x4', function t() {
	var scale;
	var IPIV;
	var JPIV;
	var LDA;
	var RHS;
	var tc;
	var N;
	var A;

	tc = basic_4x4;
	N = 4;
	LDA = 4;
	A = new Float64Array( LDA * N );
	IPIV = new Int32Array( N );
	JPIV = new Int32Array( N );
	RHS = new Float64Array( N );
	scale = new Float64Array( 1 );
	A[ 0*LDA + 0 ] = 5.0;
	A[ 1*LDA + 0 ] = 7.0;
	A[ 2*LDA + 0 ] = 6.0;
	A[ 3*LDA + 0 ] = 5.0;
	A[ 0*LDA + 1 ] = 7.0;
	A[ 1*LDA + 1 ] = 10.0;
	A[ 2*LDA + 1 ] = 8.0;
	A[ 3*LDA + 1 ] = 7.0;
	A[ 0*LDA + 2 ] = 6.0;
	A[ 1*LDA + 2 ] = 8.0;
	A[ 2*LDA + 2 ] = 10.0;
	A[ 3*LDA + 2 ] = 9.0;
	A[ 0*LDA + 3 ] = 5.0;
	A[ 1*LDA + 3 ] = 7.0;
	A[ 2*LDA + 3 ] = 9.0;
	A[ 3*LDA + 3 ] = 10.0;
	dgetc2( N, A, 1, LDA, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS[ 0 ] = 23.0;
	RHS[ 1 ] = 32.0;
	RHS[ 2 ] = 33.0;
	RHS[ 3 ] = 31.0;
	dgesc2( N, A, 1, LDA, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, scale );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( RHS ), tc.rhs, 1e-14, 'rhs' );
});

test( 'dgesc2: n_equals_1', function t() {
	var scale;
	var IPIV;
	var JPIV;
	var LDA;
	var RHS;
	var tc;
	var N;
	var A;

	tc = n_equals_1;
	N = 1;
	LDA = 4;
	A = new Float64Array( LDA * 1 );
	IPIV = new Int32Array( 1 );
	JPIV = new Int32Array( 1 );
	RHS = new Float64Array( 1 );
	scale = new Float64Array( 1 );
	A[ 0 ] = 3.0;
	dgetc2( N, A, 1, LDA, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS[ 0 ] = 9.0;
	dgesc2( N, A, 1, LDA, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, scale );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( RHS ), tc.rhs, 1e-14, 'rhs' );
});
