/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbgv from './../lib/ndarray.js';

// FIXTURES //

import upper_n5_ka2_kb1_noev from './fixtures/upper_n5_ka2_kb1_noev.json' with { type: 'json' };
import upper_n5_ka2_kb1_ev from './fixtures/upper_n5_ka2_kb1_ev.json' with { type: 'json' };
import lower_n5_ka2_kb1_noev from './fixtures/lower_n5_ka2_kb1_noev.json' with { type: 'json' };
import lower_n5_ka2_kb1_ev from './fixtures/lower_n5_ka2_kb1_ev.json' with { type: 'json' };
import diag_n3 from './fixtures/diag_n3.json' with { type: 'json' };
import upper_n8_ka3_kb2_ev from './fixtures/upper_n8_ka3_kb2_ev.json' with { type: 'json' };
import lower_n8_ka3_kb2_ev from './fixtures/lower_n8_ka3_kb2_ev.json' with { type: 'json' };
import n1_trivial from './fixtures/n1_trivial.json' with { type: 'json' };

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
* Creates the upper band storage for A (N=5, KA=2).
*
* @private
* @returns {Float64Array} band storage (column-major, LDAB=3, N=5)
*/
function upperBandA_n5_ka2() { // eslint-disable-line camelcase
	var AB = new Float64Array( 3 * 5 );

	// Diagonal (row KA = row 2):
	AB[ 2 ] = 10.0;
	AB[ 5 ] = 8.0;
	AB[ 8 ] = 6.0;
	AB[ 11 ] = 9.0;
	AB[ 14 ] = 7.0;

	// Superdiagonal 1 (row 1):
	AB[ 4 ] = 1.0;
	AB[ 7 ] = 2.0;
	AB[ 10 ] = 1.5;
	AB[ 13 ] = 1.0;

	// Superdiagonal 2 (row 0):
	AB[ 6 ] = 0.5;
	AB[ 9 ] = 0.3;
	AB[ 12 ] = 0.4;
	return AB;
}

/**
* Creates the upper band storage for B (N=5, KB=1).
*
* @private
* @returns {Float64Array} band storage (column-major, LDBB=2, N=5)
*/
function upperBandB_n5_kb1() { // eslint-disable-line camelcase
	var BB = new Float64Array( 2 * 5 );

	// Diagonal (row KB = row 1):
	BB[ 1 ] = 4.0;
	BB[ 3 ] = 5.0;
	BB[ 5 ] = 3.0;
	BB[ 7 ] = 6.0;
	BB[ 9 ] = 4.0;

	// Superdiagonal 1 (row 0):
	BB[ 2 ] = 0.2;
	BB[ 4 ] = 0.3;
	BB[ 6 ] = 0.1;
	BB[ 8 ] = 0.2;
	return BB;
}

/**
* Creates the lower band storage for A (N=5, KA=2).
*
* @private
* @returns {Float64Array} band storage (column-major, LDAB=3, N=5)
*/
function lowerBandA_n5_ka2() { // eslint-disable-line camelcase
	var AB = new Float64Array( 3 * 5 );

	// Diagonal (row 0):
	AB[ 0 ] = 10.0;
	AB[ 3 ] = 8.0;
	AB[ 6 ] = 6.0;
	AB[ 9 ] = 9.0;
	AB[ 12 ] = 7.0;

	// Subdiagonal 1 (row 1):
	AB[ 1 ] = 1.0;
	AB[ 4 ] = 2.0;
	AB[ 7 ] = 1.5;
	AB[ 10 ] = 1.0;

	// Subdiagonal 2 (row 2):
	AB[ 2 ] = 0.5;
	AB[ 5 ] = 0.3;
	AB[ 8 ] = 0.4;
	return AB;
}

/**
* Creates the lower band storage for B (N=5, KB=1).
*
* @private
* @returns {Float64Array} band storage (column-major, LDBB=2, N=5)
*/
function lowerBandB_n5_kb1() { // eslint-disable-line camelcase
	var BB = new Float64Array( 2 * 5 );

	// Diagonal (row 0):
	BB[ 0 ] = 4.0;
	BB[ 2 ] = 5.0;
	BB[ 4 ] = 3.0;
	BB[ 6 ] = 6.0;
	BB[ 8 ] = 4.0;

	// Subdiagonal 1 (row 1):
	BB[ 1 ] = 0.2;
	BB[ 3 ] = 0.3;
	BB[ 5 ] = 0.1;
	BB[ 7 ] = 0.2;
	return BB;
}

/**
* Creates the upper band storage for A (N=8, KA=3).
*
* @private
* @returns {Float64Array} band storage (column-major, LDAB=4, N=8)
*/
function upperBandA_n8_ka3() { // eslint-disable-line camelcase
	var LDAB = 4;
	var AB = new Float64Array( LDAB * 8 );
	var i;

	for ( i = 0; i < 8; i++ ) {
		AB[ 3 + ( i * LDAB ) ] = 11.0 + i;
	}
	for ( i = 0; i < 7; i++ ) {
		AB[ 2 + ( ( i + 1 ) * LDAB ) ] = 0.5 * ( i + 1 );
	}
	for ( i = 0; i < 6; i++ ) {
		AB[ 1 + ( ( i + 2 ) * LDAB ) ] = 0.2 * ( i + 1 );
	}
	for ( i = 0; i < 5; i++ ) {
		AB[ 0 + ( ( i + 3 ) * LDAB ) ] = 0.1 * ( i + 1 );
	}
	return AB;
}

/**
* Creates the upper band storage for B (N=8, KB=2).
*
* @private
* @returns {Float64Array} band storage (column-major, LDBB=3, N=8)
*/
function upperBandB_n8_kb2() { // eslint-disable-line camelcase
	var LDBB = 3;
	var BB = new Float64Array( LDBB * 8 );
	var i;

	for ( i = 0; i < 8; i++ ) {
		BB[ 2 + ( i * LDBB ) ] = 6.0 + i;
	}
	for ( i = 0; i < 7; i++ ) {
		BB[ 1 + ( ( i + 1 ) * LDBB ) ] = 0.1 * ( i + 1 );
	}
	for ( i = 0; i < 6; i++ ) {
		BB[ 0 + ( ( i + 2 ) * LDBB ) ] = 0.05 * ( i + 1 );
	}
	return BB;
}

/**
* Creates the lower band storage for A (N=8, KA=3).
*
* @private
* @returns {Float64Array} band storage (column-major, LDAB=4, N=8)
*/
function lowerBandA_n8_ka3() { // eslint-disable-line camelcase
	var LDAB = 4;
	var AB = new Float64Array( LDAB * 8 );
	var i;

	for ( i = 0; i < 8; i++ ) {
		AB[ 0 + ( i * LDAB ) ] = 11.0 + i;
	}
	for ( i = 0; i < 7; i++ ) {
		AB[ 1 + ( i * LDAB ) ] = 0.5 * ( i + 1 );
	}
	for ( i = 0; i < 6; i++ ) {
		AB[ 2 + ( i * LDAB ) ] = 0.2 * ( i + 1 );
	}
	for ( i = 0; i < 5; i++ ) {
		AB[ 3 + ( i * LDAB ) ] = 0.1 * ( i + 1 );
	}
	return AB;
}

/**
* Creates the lower band storage for B (N=8, KB=2).
*
* @private
* @returns {Float64Array} band storage (column-major, LDBB=3, N=8)
*/
function lowerBandB_n8_kb2() { // eslint-disable-line camelcase
	var LDBB = 3;
	var BB = new Float64Array( LDBB * 8 );
	var i;

	for ( i = 0; i < 8; i++ ) {
		BB[ 0 + ( i * LDBB ) ] = 6.0 + i;
	}
	for ( i = 0; i < 7; i++ ) {
		BB[ 1 + ( i * LDBB ) ] = 0.1 * ( i + 1 );
	}
	for ( i = 0; i < 6; i++ ) {
		BB[ 2 + ( i * LDBB ) ] = 0.05 * ( i + 1 );
	}
	return BB;
}

// TESTS //

test( 'dsbgv: upper_n5_ka2_kb1_noev (eigenvalues only, upper)', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var W;
	var Z;

	tc = upper_n5_ka2_kb1_noev;
	AB = upperBandA_n5_ka2();
	BB = upperBandB_n5_kb1();
	W = new Float64Array( 5 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 15 );
	info = dsbgv( 'no-vectors', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
});

test( 'dsbgv: upper_n5_ka2_kb1_ev (eigenvectors, upper)', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var W;
	var Z;

	tc = upper_n5_ka2_kb1_ev;
	AB = upperBandA_n5_ka2();
	BB = upperBandB_n5_kb1();
	W = new Float64Array( 5 );
	Z = new Float64Array( 25 );
	WORK = new Float64Array( 15 );
	info = dsbgv( 'compute-vectors', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
	assertArrayClose( Z, new Float64Array( tc.Z ), 1e-12, 'Z' );
});

test( 'dsbgv: lower_n5_ka2_kb1_noev (eigenvalues only, lower)', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var W;
	var Z;

	tc = lower_n5_ka2_kb1_noev;
	AB = lowerBandA_n5_ka2();
	BB = lowerBandB_n5_kb1();
	W = new Float64Array( 5 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 15 );
	info = dsbgv( 'no-vectors', 'lower', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
});

test( 'dsbgv: lower_n5_ka2_kb1_ev (eigenvectors, lower)', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var W;
	var Z;

	tc = lower_n5_ka2_kb1_ev;
	AB = lowerBandA_n5_ka2();
	BB = lowerBandB_n5_kb1();
	W = new Float64Array( 5 );
	Z = new Float64Array( 25 );
	WORK = new Float64Array( 15 );
	info = dsbgv( 'compute-vectors', 'lower', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
	assertArrayClose( Z, new Float64Array( tc.Z ), 1e-12, 'Z' );
});

test( 'dsbgv: n_zero (quick return for N=0)', function t() {
	var WORK;
	var info;
	var AB;
	var BB;
	var W;
	var Z;

	AB = new Float64Array( 4 );
	BB = new Float64Array( 4 );
	W = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 3 );
	info = dsbgv( 'no-vectors', 'upper', 0, 1, 0, AB, 1, 2, 0, BB, 1, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dsbgv: diag_n3 (diagonal matrices, KA=KB=0)', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var W;
	var Z;

	tc = diag_n3;
	AB = new Float64Array( 3 );
	BB = new Float64Array( 3 );
	W = new Float64Array( 3 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 9 );
	AB[ 0 ] = 5.0;
	AB[ 1 ] = 6.0;
	AB[ 2 ] = 7.0;
	BB[ 0 ] = 2.0;
	BB[ 1 ] = 3.0;
	BB[ 2 ] = 4.0;
	info = dsbgv( 'no-vectors', 'upper', 3, 0, 0, AB, 1, 1, 0, BB, 1, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
});

test( 'dsbgv: upper_n8_ka3_kb2_ev (larger, eigenvectors, upper)', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var W;
	var Z;

	tc = upper_n8_ka3_kb2_ev;
	AB = upperBandA_n8_ka3();
	BB = upperBandB_n8_kb2();
	W = new Float64Array( 8 );
	Z = new Float64Array( 64 );
	WORK = new Float64Array( 24 );
	info = dsbgv( 'compute-vectors', 'upper', 8, 3, 2, AB, 1, 4, 0, BB, 1, 3, 0, W, 1, 0, Z, 1, 8, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-12, 'W' );
	assertArrayClose( Z, new Float64Array( tc.Z ), 1e-10, 'Z' );
});

test( 'dsbgv: lower_n8_ka3_kb2_ev (larger, eigenvectors, lower)', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var W;
	var Z;

	tc = lower_n8_ka3_kb2_ev;
	AB = lowerBandA_n8_ka3();
	BB = lowerBandB_n8_kb2();
	W = new Float64Array( 8 );
	Z = new Float64Array( 64 );
	WORK = new Float64Array( 24 );
	info = dsbgv( 'compute-vectors', 'lower', 8, 3, 2, AB, 1, 4, 0, BB, 1, 3, 0, W, 1, 0, Z, 1, 8, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-12, 'W' );
	assertArrayClose( Z, new Float64Array( tc.Z ), 1e-10, 'Z' );
});

test( 'dsbgv: n1_trivial (N=1, eigenvectors)', function t() {
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var W;
	var Z;

	tc = n1_trivial;
	AB = new Float64Array( 1 );
	BB = new Float64Array( 1 );
	W = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 3 );
	AB[ 0 ] = 3.0;
	BB[ 0 ] = 2.0;
	info = dsbgv( 'compute-vectors', 'upper', 1, 0, 0, AB, 1, 1, 0, BB, 1, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
	assertArrayClose( Z, new Float64Array( tc.Z ), 1e-12, 'Z' );
});
