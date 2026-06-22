/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dopgtr from './../lib/ndarray.js';
import dsptrd from '../../dsptrd/lib/base.js';

// FIXTURES //

import uplo_u_4x4 from './fixtures/uplo_u_4x4.json' with { type: 'json' };
import uplo_l_4x4 from './fixtures/uplo_l_4x4.json' with { type: 'json' };
import uplo_u_3x3 from './fixtures/uplo_u_3x3.json' with { type: 'json' };
import uplo_l_3x3 from './fixtures/uplo_l_3x3.json' with { type: 'json' };
import n1_uplo_u from './fixtures/n1_uplo_u.json' with { type: 'json' };
import n1_uplo_l from './fixtures/n1_uplo_l.json' with { type: 'json' };

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
* Helper: calls DSPTRD on packed storage, then DOPGTR.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - matrix order
* @param {Float64Array} APsrc - packed symmetric matrix (N*(N+1)/2)
* @returns {Object} { Q, TAU, info }
*/
function dsptrdThenDopgtr( uplo, N, APsrc ) {
	var WORK = new Float64Array( 256 );
	var info;
	var TAU = new Float64Array( Math.max( N - 1, 1 ) );
	var AP = new Float64Array( APsrc );
	var D = new Float64Array( N );
	var E = new Float64Array( Math.max( N - 1, 1 ) );
	var Q = new Float64Array( N * N );

	// Call dsptrd to reduce to tridiagonal form (packed storage)
	dsptrd( uplo, N, AP, 1, 0, D, 1, 0, E, 1, 0, TAU, 1, 0 );

	// Call dopgtr to generate Q from packed reflectors
	info = dopgtr( uplo, N, AP, 1, 0, TAU, 1, 0, Q, 1, N, 0, WORK, 1, 0 );

	return {
		'Q': Q,
		'D': D,
		'E': E,
		'TAU': TAU,
		'info': info
	};
}

/**
* Extract a flat column-major subarray as a regular Array.
*
* @private
* @param {Float64Array} arr - source array
* @param {NonNegativeInteger} offset - starting offset
* @param {NonNegativeInteger} len - number of elements
* @returns {Array} extracted values
*/
function toArray( arr, offset, len ) {
	var result = [];
	var i;
	for ( i = 0; i < len; i++ ) {
		result.push( arr[ offset + i ] );
	}
	return result;
}

// TESTS //

test( 'dopgtr: uplo_U_4x4', function t() {
	var result;
	var tc;
	var AP;
	var N;

	tc = uplo_u_4x4;
	N = 4;
	AP = new Float64Array([
		4,
		1,
		2,
		-2,
		0,
		3,
		2,
		1,
		-2,
		-1
	]);
	result = dsptrdThenDopgtr( 'upper', N, AP );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, N * N ), tc.Q, 1e-13, 'Q' );
});

test( 'dopgtr: uplo_L_4x4', function t() {
	var result;
	var tc;
	var AP;
	var N;

	tc = uplo_l_4x4;
	N = 4;
	AP = new Float64Array([
		4,
		1,
		-2,
		2,
		2,
		0,
		1,
		3,
		-2,
		-1
	]);
	result = dsptrdThenDopgtr( 'lower', N, AP );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, N * N ), tc.Q, 1e-13, 'Q' );
});

test( 'dopgtr: uplo_U_3x3', function t() {
	var result;
	var tc;
	var AP;
	var N;

	tc = uplo_u_3x3;
	N = 3;
	AP = new Float64Array([
		2,
		1,
		5,
		3,
		-1,
		4
	]);
	result = dsptrdThenDopgtr( 'upper', N, AP );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, N * N ), tc.Q, 1e-13, 'Q' );
});

test( 'dopgtr: uplo_L_3x3', function t() {
	var result;
	var tc;
	var AP;
	var N;

	tc = uplo_l_3x3;
	N = 3;
	AP = new Float64Array([
		2,
		1,
		3,
		5,
		-1,
		4
	]);
	result = dsptrdThenDopgtr( 'lower', N, AP );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, N * N ), tc.Q, 1e-13, 'Q' );
});

test( 'dopgtr: N1_uplo_U', function t() {
	var result;
	var tc;
	var AP;

	tc = n1_uplo_u;
	AP = new Float64Array([ 5.0 ]);
	result = dsptrdThenDopgtr( 'upper', 1, AP );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, 1 ), tc.Q, 1e-14, 'Q' );
});

test( 'dopgtr: N1_uplo_L', function t() {
	var result;
	var tc;
	var AP;

	tc = n1_uplo_l;
	AP = new Float64Array([ 5.0 ]);
	result = dsptrdThenDopgtr( 'lower', 1, AP );
	assert.equal( result.info, 0, 'info' );
	assertArrayClose( toArray( result.Q, 0, 1 ), tc.Q, 1e-14, 'Q' );
});

test( 'dopgtr: N0_uplo_U', function t() {
	var WORK;
	var info;
	var TAU;
	var AP;
	var Q;

	WORK = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	AP = new Float64Array( 1 );
	Q = new Float64Array( 1 );
	info = dopgtr( 'upper', 0, AP, 1, 0, TAU, 1, 0, Q, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dopgtr: N0_uplo_L', function t() {
	var WORK;
	var info;
	var TAU;
	var AP;
	var Q;

	WORK = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	AP = new Float64Array( 1 );
	Q = new Float64Array( 1 );
	info = dopgtr( 'lower', 0, AP, 1, 0, TAU, 1, 0, Q, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dopgtr: Q is orthogonal (uplo_U_4x4)', function t() {
	var result;
	var sum;
	var AP;
	var N;
	var Q;
	var i;
	var j;
	var k;

	N = 4;
	AP = new Float64Array([
		4,
		1,
		2,
		-2,
		0,
		3,
		2,
		1,
		-2,
		-1
	]);
	result = dsptrdThenDopgtr( 'upper', N, AP );
	Q = result.Q;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Q[ k + (i * N) ] * Q[ k + (j * N) ]; // Q^T * Q, column-major
			}
			if ( i === j ) {
				assertClose( sum, 1.0, 1e-13, 'QTQ[' + i + ',' + j + ']' );
			} else {
				assertClose( sum, 0.0, 1e-13, 'QTQ[' + i + ',' + j + ']' );
			}
		}
	}
});

test( 'dopgtr: Q is orthogonal (uplo_L_4x4)', function t() {
	var result;
	var sum;
	var AP;
	var N;
	var Q;
	var i;
	var j;
	var k;

	N = 4;
	AP = new Float64Array([
		4,
		1,
		-2,
		2,
		2,
		0,
		1,
		3,
		-2,
		-1
	]);
	result = dsptrdThenDopgtr( 'lower', N, AP );
	Q = result.Q;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Q[ k + (i * N) ] * Q[ k + (j * N) ];
			}
			if ( i === j ) {
				assertClose( sum, 1.0, 1e-13, 'QTQ[' + i + ',' + j + ']' );
			} else {
				assertClose( sum, 0.0, 1e-13, 'QTQ[' + i + ',' + j + ']' );
			}
		}
	}
});

test( 'dopgtr: direct call with pre-computed AP and TAU (uplo_U_4x4)', function t() { // eslint-disable-line max-len
	var WORK;
	var info;
	var tc;
	var AP;
	var Q;
	var N;

	tc = uplo_u_4x4;
	N = tc.N;
	AP = new Float64Array( tc.AP );
	WORK = new Float64Array( N );
	Q = new Float64Array( N * N );
	info = dopgtr( 'upper', N, AP, 1, 0, new Float64Array( tc.TAU ), 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( Q, 0, N * N ), tc.Q, 1e-13, 'Q' );
});

test( 'dopgtr: direct call with pre-computed AP and TAU (uplo_L_4x4)', function t() { // eslint-disable-line max-len
	var WORK;
	var info;
	var tc;
	var AP;
	var Q;
	var N;

	tc = uplo_l_4x4;
	N = tc.N;
	AP = new Float64Array( tc.AP );
	WORK = new Float64Array( N );
	Q = new Float64Array( N * N );
	info = dopgtr( 'lower', N, AP, 1, 0, new Float64Array( tc.TAU ), 1, 0, Q, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( Q, 0, N * N ), tc.Q, 1e-13, 'Q' );
});

test( 'dopgtr: N=2 edge case (uplo_U)', function t() {
	var result;
	var sum;
	var AP;
	var N;
	var Q;
	var i;
	var j;
	var k;

	N = 2;
	AP = new Float64Array([ 3, 1, 5 ]);
	result = dsptrdThenDopgtr( 'upper', N, AP );
	assert.equal( result.info, 0, 'info' );
	Q = result.Q;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Q[ k + (i * N) ] * Q[ k + (j * N) ];
			}
			if ( i === j ) {
				assertClose( sum, 1.0, 1e-14, 'QTQ[' + i + ',' + j + ']' );
			} else {
				assertClose( sum, 0.0, 1e-14, 'QTQ[' + i + ',' + j + ']' );
			}
		}
	}
});

test( 'dopgtr: N=2 edge case (uplo_L)', function t() {
	var result;
	var sum;
	var AP;
	var N;
	var Q;
	var i;
	var j;
	var k;

	N = 2;
	AP = new Float64Array([ 3, 1, 5 ]);
	result = dsptrdThenDopgtr( 'lower', N, AP );
	assert.equal( result.info, 0, 'info' );
	Q = result.Q;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Q[ k + (i * N) ] * Q[ k + (j * N) ];
			}
			if ( i === j ) {
				assertClose( sum, 1.0, 1e-14, 'QTQ[' + i + ',' + j + ']' );
			} else {
				assertClose( sum, 0.0, 1e-14, 'QTQ[' + i + ',' + j + ']' );
			}
		}
	}
});
