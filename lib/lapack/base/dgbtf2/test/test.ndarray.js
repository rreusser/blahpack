/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbtf2 from './../lib/ndarray.js';

// FIXTURES //

import tridiag_4x4 from './fixtures/tridiag_4x4.json' with { type: 'json' };
import pentadiag_5x5 from './fixtures/pentadiag_5x5.json' with { type: 'json' };
import kl1_ku2_3x3 from './fixtures/kl1_ku2_3x3.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import tall_5x3 from './fixtures/tall_5x3.json' with { type: 'json' };
import pivot_2x2 from './fixtures/pivot_2x2.json' with { type: 'json' };

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

test( 'dgbtf2: N=0 quick return', function t() {
	var IPIV;
	var info;
	var AB;

	AB = new Float64Array( 16 );
	IPIV = new Int32Array( 4 );
	info = dgbtf2( 3, 0, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dgbtf2: M=0 quick return', function t() {
	var IPIV;
	var info;
	var AB;

	AB = new Float64Array( 16 );
	IPIV = new Int32Array( 4 );
	info = dgbtf2( 0, 3, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dgbtf2: tridiag_4x4', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var i;

	tc = tridiag_4x4;
	AB = new Float64Array([
		0.0,
		0.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		-1.0,
		0.0,
		-1.0,
		4.0,
		0.0
	]);
	IPIV = new Int32Array( 4 );
	info = dgbtf2( 4, 4, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( AB ), tc.AB, 1e-14, 'AB' );
	for ( i = 0; i < 4; i++ ) {
		assert.equal( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'dgbtf2: pentadiag_5x5', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var i;

	tc = pentadiag_5x5;
	AB = new Float64Array( 7 * 5 );
	AB[ 4 ] = 6.0;
	AB[ 5 ] = -2.0;
	AB[ 6 ] = 1.0;
	AB[ 7 + 3 ] = -2.0;
	AB[ 7 + 4 ] = 6.0;
	AB[ 7 + 5 ] = -2.0;
	AB[ 7 + 6 ] = 1.0;
	AB[ 14 + 2 ] = 1.0;
	AB[ 14 + 3 ] = -2.0;
	AB[ 14 + 4 ] = 6.0;
	AB[ 14 + 5 ] = -2.0;
	AB[ 14 + 6 ] = 1.0;
	AB[ 21 + 2 ] = 1.0;
	AB[ 21 + 3 ] = -2.0;
	AB[ 21 + 4 ] = 6.0;
	AB[ 21 + 5 ] = -2.0;
	AB[ 28 + 2 ] = 1.0;
	AB[ 28 + 3 ] = -2.0;
	AB[ 28 + 4 ] = 6.0;
	IPIV = new Int32Array( 5 );
	info = dgbtf2( 5, 5, 2, 2, AB, 1, 7, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( AB ), tc.AB, 1e-14, 'AB' );
	for ( i = 0; i < 5; i++ ) {
		assert.equal( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'dgbtf2: kl1_ku2_3x3', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var i;

	tc = kl1_ku2_3x3;
	AB = new Float64Array( 5 * 3 );
	AB[ 3 ] = 5.0;
	AB[ 4 ] = 2.0;
	AB[ 5 + 2 ] = 3.0;
	AB[ 5 + 3 ] = 6.0;
	AB[ 5 + 4 ] = 1.0;
	AB[ 10 + 1 ] = 1.0;
	AB[ 10 + 2 ] = 4.0;
	AB[ 10 + 3 ] = 7.0;
	IPIV = new Int32Array( 3 );
	info = dgbtf2( 3, 3, 1, 2, AB, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( AB ), tc.AB, 1e-14, 'AB' );
	for ( i = 0; i < 3; i++ ) {
		assert.equal( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'dgbtf2: one_by_one', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;

	tc = one_by_one;
	AB = new Float64Array( [ 7.0 ] );
	IPIV = new Int32Array( 1 );
	info = dgbtf2( 1, 1, 0, 0, AB, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( AB ), tc.AB, 1e-14, 'AB' );
	assert.equal( IPIV[ 0 ], tc.ipiv[ 0 ] - 1, 'ipiv[0]' );
});

test( 'dgbtf2: singular', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;

	tc = singular;
	AB = new Float64Array([
		0.0,
		0.0,
		1.0,
		0.0
	]);
	IPIV = new Int32Array( 2 );
	info = dgbtf2( 2, 2, 0, 1, AB, 1, 2, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dgbtf2: tall_5x3', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var i;

	tc = tall_5x3;
	AB = new Float64Array( 4 * 3 );
	AB[ 2 ] = 4.0;
	AB[ 3 ] = -1.0;
	AB[ 4 + 1 ] = -1.0;
	AB[ 4 + 2 ] = 4.0;
	AB[ 4 + 3 ] = -1.0;
	AB[ 8 + 1 ] = -1.0;
	AB[ 8 + 2 ] = 4.0;
	AB[ 8 + 3 ] = -1.0;
	IPIV = new Int32Array( 3 );
	info = dgbtf2( 5, 3, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( AB ), tc.AB, 1e-14, 'AB' );
	for ( i = 0; i < 3; i++ ) {
		assert.equal( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'dgbtf2: pivot_2x2', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var i;

	tc = pivot_2x2;
	AB = new Float64Array( 4 * 2 );
	AB[ 2 ] = 1.0;
	AB[ 3 ] = 3.0;
	AB[ 4 + 1 ] = 2.0;
	AB[ 4 + 2 ] = 4.0;
	IPIV = new Int32Array( 2 );
	info = dgbtf2( 2, 2, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( AB ), tc.AB, 1e-14, 'AB' );
	for ( i = 0; i < 2; i++ ) {
		assert.equal( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});
