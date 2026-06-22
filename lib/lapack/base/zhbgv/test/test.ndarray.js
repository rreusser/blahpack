/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, camelcase, max-statements-per-line */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbgv from './../lib/ndarray.js';

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
* Creates the upper band storage for A (N=5, KA=2) as Complex128Array.
*
* @private
* @returns {Complex128Array} band storage (column-major, LDAB=3, N=5)
*/
function upperBandA_n5_ka2() {
	var AB = new Complex128Array( 3 * 5 );
	var v = reinterpret( AB, 0 );

	// Diagonal (row KA = row 2): real values
	v[ 4 ] = 10.0; v[ 5 ] = 0.0;  // AB(2,0)
	v[ 10 ] = 8.0; v[ 11 ] = 0.0; // AB(2,1)
	v[ 16 ] = 6.0; v[ 17 ] = 0.0; // AB(2,2)
	v[ 22 ] = 9.0; v[ 23 ] = 0.0; // AB(2,3)
	v[ 28 ] = 7.0; v[ 29 ] = 0.0; // AB(2,4)

	// Superdiagonal 1 (row 1):
	v[ 8 ] = 1.0; v[ 9 ] = 1.0;      // AB(1,1)
	v[ 14 ] = 2.0; v[ 15 ] = -1.0;   // AB(1,2)
	v[ 20 ] = 1.5; v[ 21 ] = 0.5;    // AB(1,3)
	v[ 26 ] = 1.0; v[ 27 ] = -1.0;   // AB(1,4)

	// Superdiagonal 2 (row 0):
	v[ 12 ] = 0.5; v[ 13 ] = -0.5;   // AB(0,2)
	v[ 18 ] = 0.3; v[ 19 ] = 0.2;    // AB(0,3)
	v[ 24 ] = 0.4; v[ 25 ] = -0.1;   // AB(0,4)
	return AB;
}

/**
* Creates the upper band storage for B (N=5, KB=1) as Complex128Array.
*
* @private
* @returns {Complex128Array} band storage (column-major, LDBB=2, N=5)
*/
function upperBandB_n5_kb1() {
	var BB = new Complex128Array( 2 * 5 );
	var v = reinterpret( BB, 0 );

	// Diagonal (row KB = row 1): real positive
	v[ 2 ] = 4.0; v[ 3 ] = 0.0;
	v[ 6 ] = 5.0; v[ 7 ] = 0.0;
	v[ 10 ] = 3.0; v[ 11 ] = 0.0;
	v[ 14 ] = 6.0; v[ 15 ] = 0.0;
	v[ 18 ] = 4.0; v[ 19 ] = 0.0;

	// Superdiagonal 1 (row 0):
	v[ 4 ] = 0.2; v[ 5 ] = 0.1;
	v[ 8 ] = 0.3; v[ 9 ] = -0.1;
	v[ 12 ] = 0.1; v[ 13 ] = 0.2;
	v[ 16 ] = 0.2; v[ 17 ] = -0.1;
	return BB;
}

/**
* Creates the lower band storage for A (N=5, KA=2) as Complex128Array.
*
* @private
* @returns {Complex128Array} band storage (column-major, LDAB=3, N=5)
*/
function lowerBandA_n5_ka2() {
	var AB = new Complex128Array( 3 * 5 );
	var v = reinterpret( AB, 0 );

	// Diagonal (row 0):
	v[ 0 ] = 10.0; v[ 1 ] = 0.0;
	v[ 6 ] = 8.0; v[ 7 ] = 0.0;
	v[ 12 ] = 6.0; v[ 13 ] = 0.0;
	v[ 18 ] = 9.0; v[ 19 ] = 0.0;
	v[ 24 ] = 7.0; v[ 25 ] = 0.0;

	// Subdiagonal 1 (row 1): conjugate of upper superdiag
	v[ 2 ] = 1.0; v[ 3 ] = -1.0;
	v[ 8 ] = 2.0; v[ 9 ] = 1.0;
	v[ 14 ] = 1.5; v[ 15 ] = -0.5;
	v[ 20 ] = 1.0; v[ 21 ] = 1.0;

	// Subdiagonal 2 (row 2):
	v[ 4 ] = 0.5; v[ 5 ] = 0.5;
	v[ 10 ] = 0.3; v[ 11 ] = -0.2;
	v[ 16 ] = 0.4; v[ 17 ] = 0.1;
	return AB;
}

/**
* Creates the lower band storage for B (N=5, KB=1) as Complex128Array.
*
* @private
* @returns {Complex128Array} band storage (column-major, LDBB=2, N=5)
*/
function lowerBandB_n5_kb1() {
	var BB = new Complex128Array( 2 * 5 );
	var v = reinterpret( BB, 0 );

	// Diagonal (row 0): real positive
	v[ 0 ] = 4.0; v[ 1 ] = 0.0;
	v[ 4 ] = 5.0; v[ 5 ] = 0.0;
	v[ 8 ] = 3.0; v[ 9 ] = 0.0;
	v[ 12 ] = 6.0; v[ 13 ] = 0.0;
	v[ 16 ] = 4.0; v[ 17 ] = 0.0;

	// Subdiagonal 1 (row 1): conjugate of upper
	v[ 2 ] = 0.2; v[ 3 ] = -0.1;
	v[ 6 ] = 0.3; v[ 7 ] = 0.1;
	v[ 10 ] = 0.1; v[ 11 ] = -0.2;
	v[ 14 ] = 0.2; v[ 15 ] = 0.1;
	return BB;
}

/**
* Creates the upper band storage for A (N=8, KA=3) as Complex128Array.
*
* @private
* @returns {Complex128Array} band storage (column-major, LDAB=4, N=8)
*/
function upperBandA_n8_ka3() {
	var LDAB = 4;
	var AB = new Complex128Array( LDAB * 8 );
	var v = reinterpret( AB, 0 );
	var k;
	var i;

	// Diagonal (row 3):
	for ( i = 0; i < 8; i++ ) {
		k = 2 * ( 3 + ( i * LDAB ) );
		v[ k ] = 11.0 + i;
		v[ k + 1 ] = 0.0;
	}
	// Superdiagonal 1 (row 2):
	for ( i = 0; i < 7; i++ ) {
		k = 2 * ( 2 + ( ( i + 1 ) * LDAB ) );
		v[ k ] = 0.5 * ( i + 1 );
		v[ k + 1 ] = 0.2 * ( i + 1 );
	}
	// Superdiagonal 2 (row 1):
	for ( i = 0; i < 6; i++ ) {
		k = 2 * ( 1 + ( ( i + 2 ) * LDAB ) );
		v[ k ] = 0.2 * ( i + 1 );
		v[ k + 1 ] = -0.1 * ( i + 1 );
	}
	// Superdiagonal 3 (row 0):
	for ( i = 0; i < 5; i++ ) {
		k = 2 * ( 0 + ( ( i + 3 ) * LDAB ) );
		v[ k ] = 0.1 * ( i + 1 );
		v[ k + 1 ] = 0.05 * ( i + 1 );
	}
	return AB;
}

/**
* Creates the upper band storage for B (N=8, KB=2) as Complex128Array.
*
* @private
* @returns {Complex128Array} band storage (column-major, LDBB=3, N=8)
*/
function upperBandB_n8_kb2() {
	var LDBB = 3;
	var BB = new Complex128Array( LDBB * 8 );
	var v = reinterpret( BB, 0 );
	var k;
	var i;

	// Diagonal (row 2):
	for ( i = 0; i < 8; i++ ) {
		k = 2 * ( 2 + ( i * LDBB ) );
		v[ k ] = 6.0 + i;
		v[ k + 1 ] = 0.0;
	}
	// Superdiagonal 1 (row 1):
	for ( i = 0; i < 7; i++ ) {
		k = 2 * ( 1 + ( ( i + 1 ) * LDBB ) );
		v[ k ] = 0.1 * ( i + 1 );
		v[ k + 1 ] = 0.05 * ( i + 1 );
	}
	// Superdiagonal 2 (row 0):
	for ( i = 0; i < 6; i++ ) {
		k = 2 * ( 0 + ( ( i + 2 ) * LDBB ) );
		v[ k ] = 0.05 * ( i + 1 );
		v[ k + 1 ] = -0.02 * ( i + 1 );
	}
	return BB;
}

/**
* Creates the lower band storage for A (N=8, KA=3) as Complex128Array.
*
* @private
* @returns {Complex128Array} band storage (column-major, LDAB=4, N=8)
*/
function lowerBandA_n8_ka3() {
	var LDAB = 4;
	var AB = new Complex128Array( LDAB * 8 );
	var v = reinterpret( AB, 0 );
	var k;
	var i;

	// Diagonal (row 0):
	for ( i = 0; i < 8; i++ ) {
		k = 2 * ( 0 + ( i * LDAB ) );
		v[ k ] = 11.0 + i;
		v[ k + 1 ] = 0.0;
	}
	// Subdiagonal 1 (row 1): conjugate of upper
	for ( i = 0; i < 7; i++ ) {
		k = 2 * ( 1 + ( i * LDAB ) );
		v[ k ] = 0.5 * ( i + 1 );
		v[ k + 1 ] = -0.2 * ( i + 1 );
	}
	// Subdiagonal 2 (row 2):
	for ( i = 0; i < 6; i++ ) {
		k = 2 * ( 2 + ( i * LDAB ) );
		v[ k ] = 0.2 * ( i + 1 );
		v[ k + 1 ] = 0.1 * ( i + 1 );
	}
	// Subdiagonal 3 (row 3):
	for ( i = 0; i < 5; i++ ) {
		k = 2 * ( 3 + ( i * LDAB ) );
		v[ k ] = 0.1 * ( i + 1 );
		v[ k + 1 ] = -0.05 * ( i + 1 );
	}
	return AB;
}

/**
* Creates the lower band storage for B (N=8, KB=2) as Complex128Array.
*
* @private
* @returns {Complex128Array} band storage (column-major, LDBB=3, N=8)
*/
function lowerBandB_n8_kb2() {
	var LDBB = 3;
	var BB = new Complex128Array( LDBB * 8 );
	var v = reinterpret( BB, 0 );
	var k;
	var i;

	// Diagonal (row 0):
	for ( i = 0; i < 8; i++ ) {
		k = 2 * ( 0 + ( i * LDBB ) );
		v[ k ] = 6.0 + i;
		v[ k + 1 ] = 0.0;
	}
	// Subdiagonal 1 (row 1): conjugate of upper
	for ( i = 0; i < 7; i++ ) {
		k = 2 * ( 1 + ( i * LDBB ) );
		v[ k ] = 0.1 * ( i + 1 );
		v[ k + 1 ] = -0.05 * ( i + 1 );
	}
	// Subdiagonal 2 (row 2):
	for ( i = 0; i < 6; i++ ) {
		k = 2 * ( 2 + ( i * LDBB ) );
		v[ k ] = 0.05 * ( i + 1 );
		v[ k + 1 ] = 0.02 * ( i + 1 );
	}
	return BB;
}

// TESTS //

test( 'zhbgv: upper_n5_ka2_kb1_noev (eigenvalues only, upper)', function t() {
	var RWORK;
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
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 5 );
	RWORK = new Float64Array( 15 );
	info = zhbgv( 'no-vectors', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
});

test( 'zhbgv: upper_n5_ka2_kb1_ev (eigenvectors, upper)', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var Zv;
	var W;
	var Z;

	tc = upper_n5_ka2_kb1_ev;
	AB = upperBandA_n5_ka2();
	BB = upperBandB_n5_kb1();
	W = new Float64Array( 5 );
	Z = new Complex128Array( 25 );
	WORK = new Complex128Array( 5 );
	RWORK = new Float64Array( 15 );
	info = zhbgv( 'compute-vectors', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, new Float64Array( tc.Z ), 1e-12, 'Z' );
});

test( 'zhbgv: lower_n5_ka2_kb1_noev (eigenvalues only, lower)', function t() {
	var RWORK;
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
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 5 );
	RWORK = new Float64Array( 15 );
	info = zhbgv( 'no-vectors', 'lower', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
});

test( 'zhbgv: lower_n5_ka2_kb1_ev (eigenvectors, lower)', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var Zv;
	var W;
	var Z;

	tc = lower_n5_ka2_kb1_ev;
	AB = lowerBandA_n5_ka2();
	BB = lowerBandB_n5_kb1();
	W = new Float64Array( 5 );
	Z = new Complex128Array( 25 );
	WORK = new Complex128Array( 5 );
	RWORK = new Float64Array( 15 );
	info = zhbgv( 'compute-vectors', 'lower', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, new Float64Array( tc.Z ), 1e-12, 'Z' );
});

test( 'zhbgv: n_zero (quick return for N=0)', function t() {
	var RWORK;
	var WORK;
	var info;
	var AB;
	var BB;
	var W;
	var Z;

	AB = new Complex128Array( 4 );
	BB = new Complex128Array( 4 );
	W = new Float64Array( 1 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 3 );
	RWORK = new Float64Array( 3 );
	info = zhbgv( 'no-vectors', 'upper', 0, 1, 0, AB, 1, 2, 0, BB, 1, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'zhbgv: diag_n3 (diagonal matrices, KA=KB=0)', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var W;
	var Z;
	var v;

	tc = diag_n3;
	AB = new Complex128Array( 3 );
	BB = new Complex128Array( 3 );
	W = new Float64Array( 3 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 3 );
	RWORK = new Float64Array( 9 );
	v = reinterpret( AB, 0 );
	v[ 0 ] = 5.0;
	v[ 1 ] = 0.0;
	v[ 2 ] = 6.0;
	v[ 3 ] = 0.0;
	v[ 4 ] = 7.0;
	v[ 5 ] = 0.0;
	v = reinterpret( BB, 0 );
	v[ 0 ] = 2.0;
	v[ 1 ] = 0.0;
	v[ 2 ] = 3.0;
	v[ 3 ] = 0.0;
	v[ 4 ] = 4.0;
	v[ 5 ] = 0.0;
	info = zhbgv( 'no-vectors', 'upper', 3, 0, 0, AB, 1, 1, 0, BB, 1, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
});

test( 'zhbgv: upper_n8_ka3_kb2_ev (larger, eigenvectors, upper)', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var Zv;
	var W;
	var Z;

	tc = upper_n8_ka3_kb2_ev;
	AB = upperBandA_n8_ka3();
	BB = upperBandB_n8_kb2();
	W = new Float64Array( 8 );
	Z = new Complex128Array( 64 );
	WORK = new Complex128Array( 8 );
	RWORK = new Float64Array( 24 );
	info = zhbgv( 'compute-vectors', 'upper', 8, 3, 2, AB, 1, 4, 0, BB, 1, 3, 0, W, 1, 0, Z, 1, 8, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-12, 'W' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, new Float64Array( tc.Z ), 1e-10, 'Z' );
});

test( 'zhbgv: lower_n8_ka3_kb2_ev (larger, eigenvectors, lower)', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var Zv;
	var W;
	var Z;

	tc = lower_n8_ka3_kb2_ev;
	AB = lowerBandA_n8_ka3();
	BB = lowerBandB_n8_kb2();
	W = new Float64Array( 8 );
	Z = new Complex128Array( 64 );
	WORK = new Complex128Array( 8 );
	RWORK = new Float64Array( 24 );
	info = zhbgv( 'compute-vectors', 'lower', 8, 3, 2, AB, 1, 4, 0, BB, 1, 3, 0, W, 1, 0, Z, 1, 8, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-12, 'W' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, new Float64Array( tc.Z ), 1e-10, 'Z' );
});

test( 'zhbgv: n1_trivial (N=1, eigenvectors)', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var Zv;
	var W;
	var Z;
	var v;

	tc = n1_trivial;
	AB = new Complex128Array( 1 );
	BB = new Complex128Array( 1 );
	W = new Float64Array( 1 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	RWORK = new Float64Array( 3 );
	v = reinterpret( AB, 0 );
	v[ 0 ] = 3.0;
	v[ 1 ] = 0.0;
	v = reinterpret( BB, 0 );
	v[ 0 ] = 2.0;
	v[ 1 ] = 0.0;
	info = zhbgv( 'compute-vectors', 'upper', 1, 0, 0, AB, 1, 1, 0, BB, 1, 1, 0, W, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( W, new Float64Array( tc.W ), 1e-13, 'W' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, new Float64Array( tc.Z ), 1e-12, 'Z' );
});
