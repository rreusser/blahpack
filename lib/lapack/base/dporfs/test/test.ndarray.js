/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpotrf from '../../dpotrf/lib/base.js';
import dpotrs from '../../dpotrs/lib/base.js';
import dporfs from './../lib/ndarray.js';

// FIXTURES //

import basic_upper_3x3 from './fixtures/basic_upper_3x3.json' with { type: 'json' };
import basic_lower_3x3 from './fixtures/basic_lower_3x3.json' with { type: 'json' };
import multi_rhs_3x3 from './fixtures/multi_rhs_3x3.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import illcond_5x5 from './fixtures/illcond_5x5.json' with { type: 'json' };

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
	var relErr;
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': expected ~0, got ' + actual );
		return;
	}
	relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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
* Sets up a system: factorizes A with dpotrf, solves with dpotrs, returns all arrays.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {Array} aVals - column-major values for A (N*N)
* @param {Array} bVals - column-major values for B (N*NRHS)
* @param {number} N - matrix order
* @param {number} nrhs - number of right-hand sides
* @returns {Object} { A, AF, B, X, FERR, BERR }
*/
function setupSystem( uplo, aVals, bVals, N, nrhs ) {
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var info;
	var AF = new Float64Array( aVals );
	var A = new Float64Array( aVals );
	var B = new Float64Array( bVals );
	var X = new Float64Array( bVals );

	// Factorize AF = U^T*U or L*L^T
	info = dpotrf( uplo, N, AF, 1, N, 0 );
	assert.equal( info, 0, 'dpotrf should succeed' );

	// Initial solve: A * X = B
	info = dpotrs( uplo, N, nrhs, AF, 1, N, 0, X, 1, N, 0 );
	assert.equal( info, 0, 'dpotrs should succeed' );

	return {
		'A': A,
		'AF': AF,
		'B': B,
		'X': X,
		'FERR': FERR,
		'BERR': BERR
	};
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

test( 'dporfs: basic_upper_3x3', function t() {
	var info;
	var sys;
	var tc;

	tc = basic_upper_3x3;
	sys = setupSystem( 'upper', [
		4,
		2,
		1,
		2,
		5,
		3,
		1,
		3,
		6
	], [ 1, 1, 1 ], 3, 1 );
	info = dporfs( 'upper', 3, 1, sys.A, 1, 3, 0, sys.AF, 1, 3, 0, sys.B, 1, 3, 0, sys.X, 1, 3, 0, sys.FERR, 1, 0, sys.BERR, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( sys.X.subarray( 0, 3 ) ), tc.x, 1e-12, 'x' );
	assert.ok( sys.FERR[ 0 ] >= 0.0, 'FERR >= 0' );
	assert.ok( sys.BERR[ 0 ] >= 0.0, 'BERR >= 0' );
	assert.ok( sys.BERR[ 0 ] < 1e-10, 'BERR is small' );
});

test( 'dporfs: basic_lower_3x3', function t() {
	var info;
	var sys;
	var tc;

	tc = basic_lower_3x3;
	sys = setupSystem( 'lower', [
		4,
		2,
		1,
		2,
		5,
		3,
		1,
		3,
		6
	], [ 1, 1, 1 ], 3, 1 );
	info = dporfs( 'lower', 3, 1, sys.A, 1, 3, 0, sys.AF, 1, 3, 0, sys.B, 1, 3, 0, sys.X, 1, 3, 0, sys.FERR, 1, 0, sys.BERR, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( sys.X.subarray( 0, 3 ) ), tc.x, 1e-12, 'x' );
	assert.ok( sys.FERR[ 0 ] >= 0.0, 'FERR >= 0' );
	assert.ok( sys.BERR[ 0 ] >= 0.0, 'BERR >= 0' );
	assert.ok( sys.BERR[ 0 ] < 1e-10, 'BERR is small' );
});

test( 'dporfs: multi_rhs_3x3', function t() {
	var info;
	var sys;
	var tc;

	tc = multi_rhs_3x3;
	sys = setupSystem( 'upper', [
		4,
		2,
		1,
		2,
		5,
		3,
		1,
		3,
		6
	], [
		1,
		2,
		3,
		4,
		5,
		6
	], 3, 2 );
	info = dporfs( 'upper', 3, 2, sys.A, 1, 3, 0, sys.AF, 1, 3, 0, sys.B, 1, 3, 0, sys.X, 1, 3, 0, sys.FERR, 1, 0, sys.BERR, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( sys.X.subarray( 0, 6 ) ), tc.x, 1e-12, 'x' );
	assert.ok( sys.FERR[ 0 ] >= 0.0, 'FERR[0] >= 0' );
	assert.ok( sys.FERR[ 1 ] >= 0.0, 'FERR[1] >= 0' );
	assert.ok( sys.BERR[ 0 ] >= 0.0, 'BERR[0] >= 0' );
	assert.ok( sys.BERR[ 1 ] >= 0.0, 'BERR[1] >= 0' );
	assert.ok( sys.BERR[ 0 ] < 1e-10, 'BERR[0] is small' );
	assert.ok( sys.BERR[ 1 ] < 1e-10, 'BERR[1] is small' );
});

test( 'dporfs: n_zero', function t() {
	var FERR;
	var BERR;
	var info;
	var tc;
	var A;

	tc = n_zero;
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	A = new Float64Array( 1 );
	info = dporfs( 'upper', 0, 1, A, 1, 1, 0, A, 1, 1, 0, A, 1, 1, 0, A, 1, 1, 0, FERR, 1, 0, BERR, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assert.equal( FERR[ 0 ], 0.0, 'FERR = 0' );
	assert.equal( BERR[ 0 ], 0.0, 'BERR = 0' );
});

test( 'dporfs: nrhs_zero', function t() {
	var FERR;
	var BERR;
	var info;
	var tc;
	var A;

	tc = nrhs_zero;
	A = new Float64Array( 9 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	info = dporfs( 'upper', 3, 0, A, 1, 3, 0, A, 1, 3, 0, A, 1, 3, 0, A, 1, 3, 0, FERR, 1, 0, BERR, 1, 0);
	assert.equal( info, tc.info, 'info' );
});

test( 'dporfs: illcond_5x5', function t() {
	var info;
	var sys;
	var tc;

	tc = illcond_5x5;
	sys = setupSystem( 'upper', [
		100,
		10,
		1,
		0.1,
		0.01,
		10,
		100,
		10,
		1,
		0.1,
		1,
		10,
		100,
		10,
		1,
		0.1,
		1,
		10,
		100,
		10,
		0.01,
		0.1,
		1,
		10,
		100
	], [ 1, 2, 3, 4, 5 ], 5, 1 );
	info = dporfs( 'upper', 5, 1, sys.A, 1, 5, 0, sys.AF, 1, 5, 0, sys.B, 1, 5, 0, sys.X, 1, 5, 0, sys.FERR, 1, 0, sys.BERR, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( sys.X.subarray( 0, 5 ) ), tc.x, 1e-12, 'x' );
	assert.ok( sys.FERR[ 0 ] >= 0.0, 'FERR >= 0' );
	assert.ok( sys.BERR[ 0 ] >= 0.0, 'BERR >= 0' );
	assert.ok( sys.BERR[ 0 ] < 1e-10, 'BERR is small' );
});

test( 'dporfs: perturbed solution triggers iterative refinement', function t() {
	var FERR;
	var BERR;
	var info;
	var AF;
	var tc;
	var A;
	var B;
	var X;

	A = new Float64Array([
		4,
		2,
		1,
		2,
		5,
		3,
		1,
		3,
		6
	]);
	AF = new Float64Array( A );
	B = new Float64Array([ 1, 1, 1 ]);
	X = new Float64Array( 3 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	info = dpotrf( 'upper', 3, AF, 1, 3, 0 );
	assert.equal( info, 0, 'dpotrf should succeed' );
	X[ 0 ] = B[ 0 ];
	X[ 1 ] = B[ 1 ];
	X[ 2 ] = B[ 2 ];
	info = dpotrs( 'upper', 3, 1, AF, 1, 3, 0, X, 1, 3, 0 );
	assert.equal( info, 0, 'dpotrs should succeed' );
	X[ 0 ] += 1e-8;
	X[ 1 ] -= 1e-8;
	X[ 2 ] += 1e-8;
	info = dporfs( 'upper', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0);
	assert.equal( info, 0, 'info = 0' );
	tc = basic_upper_3x3;
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x after refinement' );
	assert.ok( BERR[ 0 ] < 1e-10, 'BERR is small after refinement' );
});
