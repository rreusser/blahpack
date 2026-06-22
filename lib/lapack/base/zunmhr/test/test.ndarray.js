/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zunmhr from './../lib/ndarray.js';


// FIXTURES //

import hess_factors from './fixtures/hess_factors.json' with { type: 'json' };
import left_notrans from './fixtures/left_notrans.json' with { type: 'json' };
import left_conjtrans from './fixtures/left_conjtrans.json' with { type: 'json' };
import right_notrans from './fixtures/right_notrans.json' with { type: 'json' };
import right_conjtrans from './fixtures/right_conjtrans.json' with { type: 'json' };
import left_notrans_rect from './fixtures/left_notrans_rect.json' with { type: 'json' };
import right_conjtrans_rect from './fixtures/right_conjtrans_rect.json' with { type: 'json' };
import hess_factors_partial from './fixtures/hess_factors_partial.json' with { type: 'json' };
import left_notrans_partial from './fixtures/left_notrans_partial.json' with { type: 'json' };
import right_conjtrans_partial from './fixtures/right_conjtrans_partial.json' with { type: 'json' };


// FUNCTIONS //

/**
* Assert that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Assert that two arrays are element-wise approximately equal.
*
* @private
* @param {Object} actual - actual array
* @param {Array} expected - expected array
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
* Create a complex identity matrix of size n stored column-major in a Complex128Array
* with leading dimension lda.
*
* @private
* @param {integer} n - matrix size
* @param {integer} lda - leading dimension (>= n)
* @returns {Complex128Array} identity matrix
*/
function eye( n, lda ) {
	var out = new Complex128Array( lda * n );
	var v = reinterpret( out, 0 );
	var i;
	for ( i = 0; i < n; i++ ) {
		v[ 2 * ( i + ( i * lda ) ) ] = 1.0;
	}
	return out;
}

/**
* Extract M-by-N submatrix from column-major complex flat array (interleaved doubles).
* Returns array of 2*M*N interleaved doubles.
*
* @private
* @param {Float64Array} arr - flat interleaved re/im array
* @param {integer} lda - leading dimension (in complex elements)
* @param {integer} m - rows
* @param {integer} n - cols
* @returns {Array} extracted interleaved values
*/
function extractColMajor( arr, lda, m, n ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			out.push( arr[ 2 * ( i + ( j * lda ) ) ] );
			out.push( arr[ 2 * ( i + ( j * lda ) ) + 1 ] );
		}
	}
	return out;
}


// TESTS //

// Hessenberg factors from full reduction (ILO=1, IHI=5, 5x5 matrix, LDA=6).

test( 'zunmhr: left, no-transpose (Q * I)', function t() {
	var tc = left_notrans;
	var A = new Complex128Array( new Float64Array( hess_factors.a ) );
	var TAU = new Complex128Array( new Float64Array( hess_factors.tau ) );
	var C = eye( 5, 6 );
	var Cv = reinterpret( C, 0 );
	var WORK = new Complex128Array( 1000 );
	var info = zunmhr( 'left', 'no-transpose', 5, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( Cv, 6, 5, 5 ), extractColMajor( tc.c, 6, 5, 5 ), 1e-10, 'c' );
});

test( 'zunmhr: left, conjugate-transpose (Q^H * I)', function t() {
	var tc = left_conjtrans;
	var A = new Complex128Array( new Float64Array( hess_factors.a ) );
	var TAU = new Complex128Array( new Float64Array( hess_factors.tau ) );
	var C = eye( 5, 6 );
	var Cv = reinterpret( C, 0 );
	var WORK = new Complex128Array( 1000 );
	var info = zunmhr( 'left', 'conjugate-transpose', 5, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( Cv, 6, 5, 5 ), extractColMajor( tc.c, 6, 5, 5 ), 1e-10, 'c' );
});

test( 'zunmhr: right, no-transpose (I * Q)', function t() {
	var tc = right_notrans;
	var A = new Complex128Array( new Float64Array( hess_factors.a ) );
	var TAU = new Complex128Array( new Float64Array( hess_factors.tau ) );
	var C = eye( 5, 6 );
	var Cv = reinterpret( C, 0 );
	var WORK = new Complex128Array( 1000 );
	var info = zunmhr( 'right', 'no-transpose', 5, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( Cv, 6, 5, 5 ), extractColMajor( tc.c, 6, 5, 5 ), 1e-10, 'c' );
});

test( 'zunmhr: right, conjugate-transpose (I * Q^H)', function t() {
	var tc = right_conjtrans;
	var A = new Complex128Array( new Float64Array( hess_factors.a ) );
	var TAU = new Complex128Array( new Float64Array( hess_factors.tau ) );
	var C = eye( 5, 6 );
	var Cv = reinterpret( C, 0 );
	var WORK = new Complex128Array( 1000 );
	var info = zunmhr( 'right', 'conjugate-transpose', 5, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( Cv, 6, 5, 5 ), extractColMajor( tc.c, 6, 5, 5 ), 1e-10, 'c' );
});

test( 'zunmhr: left, no-transpose, rectangular C (5x3)', function t() {
	var tc = left_notrans_rect;
	var A = new Complex128Array( new Float64Array( hess_factors.a ) );
	var TAU = new Complex128Array( new Float64Array( hess_factors.tau ) );
	// C is 5x3 stored in LDC=6 container.
	var C = new Complex128Array( 6 * 3 );
	var Cv = reinterpret( C, 0 );
	// col 1
	Cv[ 0 ] = 1.0; Cv[ 1 ] = 0.5; Cv[ 2 ] = 3.0; Cv[ 3 ] = -1.0; Cv[ 4 ] = -1.0; Cv[ 5 ] = 2.0;
	Cv[ 6 ] = 2.0; Cv[ 7 ] = 0.0; Cv[ 8 ] = 0.5; Cv[ 9 ] = -0.5;
	// col 2
	Cv[ 12 ] = 2.0; Cv[ 13 ] = 1.0; Cv[ 14 ] = 0.0; Cv[ 15 ] = 3.0; Cv[ 16 ] = 4.0; Cv[ 17 ] = -2.0;
	Cv[ 18 ] = -1.0; Cv[ 19 ] = 1.0; Cv[ 20 ] = 1.5; Cv[ 21 ] = 0.0;
	// col 3
	Cv[ 24 ] = -0.5; Cv[ 25 ] = 0.0; Cv[ 26 ] = 1.0; Cv[ 27 ] = 1.0; Cv[ 28 ] = 2.0; Cv[ 29 ] = -1.0;
	Cv[ 30 ] = 3.0; Cv[ 31 ] = 2.0; Cv[ 32 ] = -2.0; Cv[ 33 ] = 0.5;
	var WORK = new Complex128Array( 1000 );
	var info = zunmhr( 'left', 'no-transpose', 5, 3, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( Cv, 6, 5, 3 ), extractColMajor( tc.c, 6, 5, 3 ), 1e-10, 'c' );
});

test( 'zunmhr: right, conjugate-transpose, rectangular C (3x5)', function t() {
	var tc = right_conjtrans_rect;
	var A = new Complex128Array( new Float64Array( hess_factors.a ) );
	var TAU = new Complex128Array( new Float64Array( hess_factors.tau ) );
	// C is 3x5 stored in LDC=6 container.
	var C = new Complex128Array( 6 * 5 );
	var Cv = reinterpret( C, 0 );
	Cv[ 0 ] = 1.0; Cv[ 1 ] = 0.0; Cv[ 2 ] = 0.0; Cv[ 3 ] = 1.0; Cv[ 4 ] = 2.0; Cv[ 5 ] = -1.0;
	Cv[ 12 ] = 2.0; Cv[ 13 ] = 0.5; Cv[ 14 ] = 1.0; Cv[ 15 ] = 0.0; Cv[ 16 ] = -1.0; Cv[ 17 ] = 2.0;
	Cv[ 24 ] = -1.0; Cv[ 25 ] = 1.0; Cv[ 26 ] = 3.0; Cv[ 27 ] = -0.5; Cv[ 28 ] = 0.0; Cv[ 29 ] = 0.0;
	Cv[ 36 ] = 4.0; Cv[ 37 ] = -1.0; Cv[ 38 ] = -2.0; Cv[ 39 ] = 0.0; Cv[ 40 ] = 1.0; Cv[ 41 ] = 1.0;
	Cv[ 48 ] = 0.5; Cv[ 49 ] = 0.5; Cv[ 50 ] = 1.5; Cv[ 51 ] = -1.0; Cv[ 52 ] = -0.5; Cv[ 53 ] = 0.0;
	var WORK = new Complex128Array( 1000 );
	var info = zunmhr( 'right', 'conjugate-transpose', 3, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( Cv, 6, 3, 5 ), extractColMajor( tc.c, 6, 3, 5 ), 1e-10, 'c' );
});

test( 'zunmhr: M=0 quick return', function t() {
	var A = new Complex128Array( new Float64Array( hess_factors.a ) );
	var TAU = new Complex128Array( new Float64Array( hess_factors.tau ) );
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 10 );
	var info = zunmhr( 'left', 'no-transpose', 0, 5, 1, 0, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 10 );
	assert.equal( info, 0, 'info' );
});

test( 'zunmhr: N=0 quick return', function t() {
	var A = new Complex128Array( new Float64Array( hess_factors.a ) );
	var TAU = new Complex128Array( new Float64Array( hess_factors.tau ) );
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 10 );
	var info = zunmhr( 'left', 'no-transpose', 5, 0, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 10 );
	assert.equal( info, 0, 'info' );
});

test( 'zunmhr: NH=0 quick return (ILO=IHI)', function t() {
	var A = new Complex128Array( new Float64Array( hess_factors.a ) );
	var TAU = new Complex128Array( new Float64Array( hess_factors.tau ) );
	var C = eye( 5, 6 );
	var Cv = reinterpret( C, 0 );
	var expected = reinterpret( eye( 5, 6 ), 0 );
	var WORK = new Complex128Array( 10 );
	var info = zunmhr( 'left', 'no-transpose', 5, 5, 3, 3, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 10 );
	assert.equal( info, 0, 'info' );
	// C should be unchanged (identity).
	assertArrayClose( extractColMajor( Cv, 6, 5, 5 ), extractColMajor( expected, 6, 5, 5 ), 1e-14, 'c unchanged' );
});

test( 'zunmhr: left, no-transpose, partial (ILO=2, IHI=4)', function t() {
	var tc = left_notrans_partial;
	var A = new Complex128Array( new Float64Array( hess_factors_partial.a2 ) );
	var TAU = new Complex128Array( new Float64Array( hess_factors_partial.tau2 ) );
	var C = eye( 5, 6 );
	var Cv = reinterpret( C, 0 );
	var WORK = new Complex128Array( 1000 );
	var info = zunmhr( 'left', 'no-transpose', 5, 5, 2, 4, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( Cv, 6, 5, 5 ), extractColMajor( tc.c, 6, 5, 5 ), 1e-10, 'c' );
});

test( 'zunmhr: right, conjugate-transpose, partial (ILO=2, IHI=4)', function t() {
	var tc = right_conjtrans_partial;
	var A = new Complex128Array( new Float64Array( hess_factors_partial.a2 ) );
	var TAU = new Complex128Array( new Float64Array( hess_factors_partial.tau2 ) );
	var C = eye( 5, 6 );
	var Cv = reinterpret( C, 0 );
	var WORK = new Complex128Array( 1000 );
	var info = zunmhr( 'right', 'conjugate-transpose', 5, 5, 2, 4, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 1000 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( extractColMajor( Cv, 6, 5, 5 ), extractColMajor( tc.c, 6, 5, 5 ), 1e-10, 'c' );
});

test( 'zunmhr: throws TypeError for invalid side', function t() {
	var A = new Complex128Array( 36 );
	var TAU = new Complex128Array( 4 );
	var C = new Complex128Array( 36 );
	var WORK = new Complex128Array( 100 );
	assert.throws( function f() {
		zunmhr( 'invalid', 'no-transpose', 5, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 100 );
	}, TypeError );
});

test( 'zunmhr: throws TypeError for invalid trans', function t() {
	var A = new Complex128Array( 36 );
	var TAU = new Complex128Array( 4 );
	var C = new Complex128Array( 36 );
	var WORK = new Complex128Array( 100 );
	assert.throws( function f() {
		zunmhr( 'left', 'invalid', 5, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 100 );
	}, TypeError );
});

test( 'zunmhr: throws RangeError for negative M', function t() {
	var A = new Complex128Array( 36 );
	var TAU = new Complex128Array( 4 );
	var C = new Complex128Array( 36 );
	var WORK = new Complex128Array( 100 );
	assert.throws( function f() {
		zunmhr( 'left', 'no-transpose', -1, 5, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 100 );
	}, RangeError );
});

test( 'zunmhr: throws RangeError for negative N', function t() {
	var A = new Complex128Array( 36 );
	var TAU = new Complex128Array( 4 );
	var C = new Complex128Array( 36 );
	var WORK = new Complex128Array( 100 );
	assert.throws( function f() {
		zunmhr( 'left', 'no-transpose', 5, -1, 1, 5, A, 1, 6, 0, TAU, 1, 0, C, 1, 6, 0, WORK, 1, 0, 100 );
	}, RangeError );
});
