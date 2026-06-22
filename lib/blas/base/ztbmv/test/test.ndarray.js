/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztbmv from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans_nonunit from './fixtures/upper_no_trans_nonunit.json' with { type: 'json' };
import upper_trans_nonunit from './fixtures/upper_trans_nonunit.json' with { type: 'json' };
import upper_conj_trans_nonunit from './fixtures/upper_conj_trans_nonunit.json' with { type: 'json' };
import upper_no_trans_unit from './fixtures/upper_no_trans_unit.json' with { type: 'json' };
import lower_no_trans_nonunit from './fixtures/lower_no_trans_nonunit.json' with { type: 'json' };
import lower_trans_nonunit from './fixtures/lower_trans_nonunit.json' with { type: 'json' };
import lower_conj_trans_nonunit from './fixtures/lower_conj_trans_nonunit.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import upper_stride_2 from './fixtures/upper_stride_2.json' with { type: 'json' };
import scalar from './fixtures/scalar.json' with { type: 'json' };
import lower_no_trans_unit from './fixtures/lower_no_trans_unit.json' with { type: 'json' };

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
* Creates the upper triangular band matrix A used in tests 1-4 and 9.
*
* 4x4 upper triangular band matrix with K=2, LDA=3
* Upper band storage:
*   Row 0 (2nd superdiag): *      *      a13    a24
*   Row 1 (1st superdiag): *      a12    a23    a34
*   Row 2 (diagonal):      a11    a22    a33    a44
*
* @private
* @returns {Complex128Array} band matrix
*/
function upperBandA() {
	var A = new Complex128Array( 12 );
	var av = reinterpret( A, 0 );
	// Column 0: a11 at row 2 => index 2
	av[ 4 ] = 2.0; av[ 5 ] = 1.0;     // a(3) = (2, 1) => a11
	// Column 1: a12 at row 1 => index 4, a22 at row 2 => index 5
	av[ 8 ] = 1.0; av[ 9 ] = 0.5;     // a(5) = (1, 0.5) => a12
	av[ 10 ] = 3.0; av[ 11 ] = -1.0;  // a(6) = (3, -1) => a22
	// Column 2: a13 at row 0 => index 6, a23 at row 1 => index 7, a33 at row 2 => index 8 // eslint-disable-line max-len
	av[ 12 ] = 4.0; av[ 13 ] = 2.0;   // a(7) = (4, 2) => a13
	av[ 14 ] = 5.0; av[ 15 ] = 0.0;   // a(8) = (5, 0) => a23
	av[ 16 ] = 6.0; av[ 17 ] = -0.5;  // a(9) = (6, -0.5) => a33
	// Column 3: a34 at row 1 => index 10, a44 at row 2 => index 11
	av[ 20 ] = 7.0; av[ 21 ] = 1.0;   // a(11) = (7, 1) => a34
	av[ 22 ] = 8.0; av[ 23 ] = -2.0;  // a(12) = (8, -2) => a44
	return A;
}

/**
* Creates the lower triangular band matrix A used in tests 5-7 and 11.
*
* 4x4 lower triangular band matrix with K=2, LDA=3
* Lower band storage:
*   Row 0 (diagonal):      a11    a22    a33    a44
*   Row 1 (1st subdiag):   a21    a32    a43    *
*   Row 2 (2nd subdiag):   a31    a42    *      *
*
* @private
* @returns {Complex128Array} band matrix
*/
function lowerBandA() {
	var A = new Complex128Array( 12 );
	var av = reinterpret( A, 0 );
	// Column 0: a11 at row 0, a21 at row 1, a31 at row 2
	av[ 0 ] = 2.0; av[ 1 ] = 1.0;     // a(1) = (2, 1) => a11
	av[ 2 ] = 1.0; av[ 3 ] = 0.5;     // a(2) = (1, 0.5) => a21
	av[ 4 ] = 4.0; av[ 5 ] = 2.0;     // a(3) = (4, 2) => a31
	// Column 1: a22 at row 0, a32 at row 1, a42 at row 2
	av[ 6 ] = 3.0; av[ 7 ] = -1.0;    // a(4) = (3, -1) => a22
	av[ 8 ] = 5.0; av[ 9 ] = 0.0;     // a(5) = (5, 0) => a32
	av[ 10 ] = 7.0; av[ 11 ] = 1.0;   // a(6) = (7, 1) => a42
	// Column 2: a33 at row 0, a43 at row 1
	av[ 12 ] = 6.0; av[ 13 ] = -0.5;  // a(7) = (6, -0.5) => a33
	av[ 14 ] = 8.0; av[ 15 ] = -2.0;  // a(8) = (8, -2) => a43
	// Column 3: a44 at row 0
	av[ 18 ] = 9.0; av[ 19 ] = 0.5;   // a(10) = (9, 0.5) => a44
	return A;
}

/**
* Creates the standard x vector: [(1,0), (2,1), (3,-1), (4,0.5)].
*
* @private
* @returns {Complex128Array} x vector
*/
function stdX(  ) {
		return new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ] );
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

test( 'ztbmv is a function', function t() {
	assert.equal( typeof ztbmv, 'function' );
});

test( 'ztbmv: upper_no_trans_nonunit', function t() {
	var tc;
	var xv;
	var A;
	var x;

	tc = upper_no_trans_nonunit;
	A = upperBandA();
	x = stdX();
	ztbmv( 'upper', 'no-transpose', 'non-unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
});

test( 'ztbmv: upper_trans_nonunit', function t() {
	var tc;
	var xv;
	var A;
	var x;

	tc = upper_trans_nonunit;
	A = upperBandA();
	x = stdX();
	ztbmv( 'upper', 'transpose', 'non-unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
});

test( 'ztbmv: upper_conj_trans_nonunit', function t() {
	var tc;
	var xv;
	var A;
	var x;

	tc = upper_conj_trans_nonunit;
	A = upperBandA();
	x = stdX();
	ztbmv( 'upper', 'conjugate-transpose', 'non-unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
});

test( 'ztbmv: upper_no_trans_unit', function t() {
	var tc;
	var xv;
	var A;
	var x;

	tc = upper_no_trans_unit;
	A = upperBandA();
	x = stdX();
	ztbmv( 'upper', 'no-transpose', 'unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
});

test( 'ztbmv: lower_no_trans_nonunit', function t() {
	var tc;
	var xv;
	var A;
	var x;

	tc = lower_no_trans_nonunit;
	A = lowerBandA();
	x = stdX();
	ztbmv( 'lower', 'no-transpose', 'non-unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
});

test( 'ztbmv: lower_trans_nonunit', function t() {
	var tc;
	var xv;
	var A;
	var x;

	tc = lower_trans_nonunit;
	A = lowerBandA();
	x = stdX();
	ztbmv( 'lower', 'transpose', 'non-unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
});

test( 'ztbmv: lower_conj_trans_nonunit', function t() {
	var tc;
	var xv;
	var A;
	var x;

	tc = lower_conj_trans_nonunit;
	A = lowerBandA();
	x = stdX();
	ztbmv( 'lower', 'conjugate-transpose', 'non-unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
});

test( 'ztbmv: n_zero', function t() {
	var tc;
	var xv;
	var A;
	var x;

	tc = n_zero;
	A = lowerBandA();
	x = new Complex128Array( [ 99.0, 0.0 ] );
	ztbmv( 'upper', 'no-transpose', 'non-unit', 0, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
});

test( 'ztbmv: upper_stride_2', function t() {
	var tc;
	var xv;
	var A;
	var x;

	tc = upper_stride_2;
	A = upperBandA();
	x = new Complex128Array( 8 );
	xv = reinterpret( x, 0 );
	xv[ 0 ] = 1.0;
	xv[ 1 ] = 0.0;
	xv[ 4 ] = 2.0;
	xv[ 5 ] = 1.0;
	xv[ 8 ] = 3.0;
	xv[ 9 ] = -1.0;
	xv[ 12 ] = 4.0;
	xv[ 13 ] = 0.5;
	ztbmv( 'upper', 'no-transpose', 'non-unit', 4, 2, A, 1, 3, 0, x, 2, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
});

test( 'ztbmv: scalar', function t() {
	var tc;
	var av;
	var xv;
	var A;
	var x;

	tc = scalar;
	A = new Complex128Array( 1 );
	x = new Complex128Array( 1 );
	av = reinterpret( A, 0 );
	av[ 0 ] = 5.0;
	av[ 1 ] = 2.0;
	xv = reinterpret( x, 0 );
	xv[ 0 ] = 3.0;
	xv[ 1 ] = -1.0;
	ztbmv( 'upper', 'no-transpose', 'non-unit', 1, 0, A, 1, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
});

test( 'ztbmv: lower_no_trans_unit', function t() {
	var tc;
	var xv;
	var A;
	var x;

	tc = lower_no_trans_unit;
	A = lowerBandA();
	x = stdX();
	ztbmv( 'lower', 'no-transpose', 'unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-14, 'x' );
});

test( 'ztbmv returns the x array', function t() {
	var result;
	var A;
	var x;

	A = upperBandA();
	x = stdX();
	result = ztbmv( 'upper', 'no-transpose', 'non-unit', 4, 2, A, 1, 3, 0, x, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result, x );
});

test( 'ztbmv: N=0 returns x untouched', function t() {
	var xv;
	var A;
	var x;

	A = upperBandA();
	x = stdX();
	ztbmv( 'upper', 'no-transpose', 'non-unit', 0, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5 ], 1e-14, 'x' ); // eslint-disable-line max-len
});

test( 'ztbmv: upper_trans_unit', function t() {
	var xv;
	var A;
	var x;

	A = upperBandA();
	x = stdX();
	ztbmv( 'upper', 'transpose', 'unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assert.ok( !Number.isNaN( xv[ 0 ] ), 'no NaN' );
	assert.ok( !Number.isNaN( xv[ 1 ] ), 'no NaN' );
});

test( 'ztbmv: upper_conj_trans_unit', function t() {
	var xv;
	var A;
	var x;

	A = upperBandA();
	x = stdX();
	ztbmv( 'upper', 'conjugate-transpose', 'unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assert.ok( !Number.isNaN( xv[ 0 ] ), 'no NaN' );
	assert.ok( !Number.isNaN( xv[ 1 ] ), 'no NaN' );
});

test( 'ztbmv: lower_trans_unit', function t() {
	var xv;
	var A;
	var x;

	A = lowerBandA();
	x = stdX();
	ztbmv( 'lower', 'transpose', 'unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assert.ok( !Number.isNaN( xv[ 0 ] ), 'no NaN' );
	assert.ok( !Number.isNaN( xv[ 1 ] ), 'no NaN' );
});

test( 'ztbmv: lower_conj_trans_unit', function t() {
	var xv;
	var A;
	var x;

	A = lowerBandA();
	x = stdX();
	ztbmv( 'lower', 'conjugate-transpose', 'unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assert.ok( !Number.isNaN( xv[ 0 ] ), 'no NaN' );
	assert.ok( !Number.isNaN( xv[ 1 ] ), 'no NaN' );
});

test( 'ztbmv: upper no-transpose with x all zeros', function t() {
	var xv;
	var A;
	var x;

	A = upperBandA();
	x = new Complex128Array( 4 );
	ztbmv( 'upper', 'no-transpose', 'non-unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), [ 0, 0, 0, 0, 0, 0, 0, 0 ], 1e-14, 'x' );
});

test( 'ztbmv: lower no-transpose with x all zeros', function t() {
	var xv;
	var A;
	var x;

	A = lowerBandA();
	x = new Complex128Array( 4 );
	ztbmv( 'lower', 'no-transpose', 'non-unit', 4, 2, A, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), [ 0, 0, 0, 0, 0, 0, 0, 0 ], 1e-14, 'x' );
});

test( 'ztbmv: with offsetX', function t() {
	var tc;
	var xv;
	var A;
	var x;

	tc = upper_no_trans_nonunit;
	A = upperBandA();
	x = new Complex128Array( 6 );
	xv = reinterpret( x, 0 );
	xv[ 4 ] = 1.0;
	xv[ 5 ] = 0.0;
	xv[ 6 ] = 2.0;
	xv[ 7 ] = 1.0;
	xv[ 8 ] = 3.0;
	xv[ 9 ] = -1.0;
	xv[ 10 ] = 4.0;
	xv[ 11 ] = 0.5;
	ztbmv( 'upper', 'no-transpose', 'non-unit', 4, 2, A, 1, 3, 0, x, 1, 2 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ).slice( 4, 12 ), tc.x, 1e-14, 'x' );
});
