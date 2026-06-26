/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtbsv from './../lib/ndarray.js';
var ndarray = dtbsv;


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


// TESTS //

test( 'dtbsv: N=0 returns immediately', function t() {
	var A = new Float64Array( 1 );
	var x = new Float64Array( [ 42.0 ] );
	dtbsv( 'upper', 'no-transpose', 'non-unit', 0, 0, A, 1, 1, 0, x, 1, 0 );
	assert.equal( x[ 0 ], 42.0 );
});

test( 'dtbsv: upper_N_nonunit_k1', function t() {
	// Full A = [2 3 0 0; 0 5 6 0; 0 0 8 9; 0 0 0 11]
	// Band storage (K=1, col-major, LDAB=2):
	//   Row 0: superdiag [0, 3, 6, 9]
	//   Row 1: diagonal  [2, 5, 8, 11]
	var AB = new Float64Array([
		0.0,
		2.0,   // col 0
		3.0,
		5.0,   // col 1
		6.0,
		8.0,   // col 2
		9.0,
		11.0   // col 3
	]);

	// B = A*[1,1,1,1] = [5, 11, 17, 11]
	var x = new Float64Array( [ 5.0, 11.0, 17.0, 11.0 ] );
	dtbsv( 'upper', 'no-transpose', 'non-unit', 4, 1, AB, 1, 2, 0, x, 1, 0 );
	assertArrayClose( x, [ 1.0, 1.0, 1.0, 1.0 ], 1e-14, 'x' );
});

test( 'dtbsv: lower_N_nonunit_k1', function t() {
	// Full A = [2 0 0 0; 1 5 0 0; 0 4 8 0; 0 0 7 11]
	// Band storage (K=1, col-major, LDAB=2):
	//   Row 0: diagonal  [2, 5, 8, 11]
	//   Row 1: subdiag   [1, 4, 7, 0]
	var AB = new Float64Array([
		2.0,
		1.0,   // col 0
		5.0,
		4.0,   // col 1
		8.0,
		7.0,   // col 2
		11.0,
		0.0   // col 3
	]);
	var x = new Float64Array( [ 2.0, 6.0, 12.0, 18.0 ] );
	dtbsv( 'lower', 'no-transpose', 'non-unit', 4, 1, AB, 1, 2, 0, x, 1, 0 );
	assertArrayClose( x, [ 1.0, 1.0, 1.0, 1.0 ], 1e-14, 'x' );
});

test( 'dtbsv: upper_T_nonunit_k1', function t() {
	// Same A as upper_N_nonunit_k1
	// A^T = [2 0 0 0; 3 5 0 0; 0 6 8 0; 0 0 9 11]
	// B = A^T*[1,1,1,1] = [2, 8, 14, 20]
	var AB = new Float64Array([
		0.0, 2.0, 3.0, 5.0, 6.0, 8.0, 9.0, 11.0
	]);
	var x = new Float64Array( [ 2.0, 8.0, 14.0, 20.0 ] );
	dtbsv( 'upper', 'transpose', 'non-unit', 4, 1, AB, 1, 2, 0, x, 1, 0 );
	assertArrayClose( x, [ 1.0, 1.0, 1.0, 1.0 ], 1e-14, 'x' );
});

test( 'dtbsv: lower_T_nonunit_k1', function t() {
	// Same A as lower_N_nonunit_k1
	// A^T = [2 1 0 0; 0 5 4 0; 0 0 8 7; 0 0 0 11]
	// B = A^T*[1,1,1,1] = [3, 9, 15, 11]
	var AB = new Float64Array([
		2.0, 1.0, 5.0, 4.0, 8.0, 7.0, 11.0, 0.0
	]);
	var x = new Float64Array( [ 3.0, 9.0, 15.0, 11.0 ] );
	dtbsv( 'lower', 'transpose', 'non-unit', 4, 1, AB, 1, 2, 0, x, 1, 0 );
	assertArrayClose( x, [ 1.0, 1.0, 1.0, 1.0 ], 1e-14, 'x' );
});

test( 'dtbsv: upper_N_unit_k1', function t() {
	// Full (unit diag): [1 3 0 0; 0 1 6 0; 0 0 1 9; 0 0 0 1]
	// B = [4, 7, 10, 1]
	var AB = new Float64Array([
		0.0, 99.0, 3.0, 99.0, 6.0, 99.0, 9.0, 99.0
	]);
	var x = new Float64Array( [ 4.0, 7.0, 10.0, 1.0 ] );
	dtbsv( 'upper', 'no-transpose', 'unit', 4, 1, AB, 1, 2, 0, x, 1, 0 );
	assertArrayClose( x, [ 1.0, 1.0, 1.0, 1.0 ], 1e-14, 'x' );
});

test( 'dtbsv: lower_N_unit_k1', function t() {
	// Full (unit diag): [1 0 0 0; 1 1 0 0; 0 4 1 0; 0 0 7 1]
	// B = [1, 2, 5, 8]
	var AB = new Float64Array([
		99.0, 1.0, 99.0, 4.0, 99.0, 7.0, 99.0, 0.0
	]);
	var x = new Float64Array( [ 1.0, 2.0, 5.0, 8.0 ] );
	dtbsv( 'lower', 'no-transpose', 'unit', 4, 1, AB, 1, 2, 0, x, 1, 0 );
	assertArrayClose( x, [ 1.0, 1.0, 1.0, 1.0 ], 1e-14, 'x' );
});

test( 'dtbsv: upper_N_nonunit_k2', function t() {
	// Full:
	//   [1  2  3  0  0]
	//   [0  4  5  6  0]
	//   [0  0  7  8  9]
	//   [0  0  0 10 11]
	//   [0  0  0  0 12]
	// Band storage (K=2, LDAB=3, col-major):
	//   Row 0: 2nd superdiag [0, 0, 3, 6, 9]
	//   Row 1: 1st superdiag [0, 2, 5, 8, 11]
	//   Row 2: diagonal      [1, 4, 7, 10, 12]
	var AB = new Float64Array([
		0.0,
		0.0,
		1.0,  // col 0
		0.0,
		2.0,
		4.0,  // col 1
		3.0,
		5.0,
		7.0,  // col 2
		6.0,
		8.0,
		10.0, // col 3
		9.0,
		11.0,
		12.0 // col 4
	]);

	// B = A*[1,1,1,1,1] = [6, 15, 24, 21, 12]
	var x = new Float64Array( [ 6.0, 15.0, 24.0, 21.0, 12.0 ] );
	dtbsv( 'upper', 'no-transpose', 'non-unit', 5, 2, AB, 1, 3, 0, x, 1, 0 );
	assertArrayClose( x, [ 1.0, 1.0, 1.0, 1.0, 1.0 ], 1e-14, 'x' );
});

test( 'dtbsv: n_one', function t() {
	var AB = new Float64Array( [ 3.0 ] );
	var x = new Float64Array( [ 9.0 ] );
	dtbsv( 'upper', 'no-transpose', 'non-unit', 1, 0, AB, 1, 1, 0, x, 1, 0 );
	assertArrayClose( x, [ 3.0 ], 1e-14, 'x' );
});

test( 'dtbsv: upper_stride2', function t() {
	// Full: [2 1 0; 0 3 1; 0 0 4], K=1
	// B = [3, 4, 4], stride 2
	var AB = new Float64Array([
		0.0, 2.0, 1.0, 3.0, 1.0, 4.0
	]);
	var x = new Float64Array( [ 3.0, 0.0, 4.0, 0.0, 4.0 ] );
	dtbsv( 'upper', 'no-transpose', 'non-unit', 3, 1, AB, 1, 2, 0, x, 2, 0 );
	assertArrayClose( x, [ 1.0, 0.0, 1.0, 0.0, 1.0 ], 1e-14, 'x' );
});

test( 'dtbsv: lower_neg_stride', function t() {
	// Full: [2 0 0; 3 4 0; 0 5 6], K=1
	// B = [2, 7, 11], incx=-1
	// Fortran stores x(3)=b(1), x(2)=b(2), x(1)=b(3)
	var AB = new Float64Array([
		2.0, 3.0, 4.0, 5.0, 6.0, 0.0
	]);

	// In JS with strideX=-1 and offsetX=2: x[2]=b[0], x[1]=b[1], x[0]=b[2]
	var x = new Float64Array( [ 11.0, 7.0, 2.0 ] );
	dtbsv( 'lower', 'no-transpose', 'non-unit', 3, 1, AB, 1, 2, 0, x, -1, 2 );
	assertArrayClose( x, [ 1.0, 1.0, 1.0 ], 1e-14, 'x' );
});

test( 'dtbsv: lower_T_nonunit_k2', function t() {
	// Full L: [2 0 0 0 0; 1 4 0 0 0; 3 5 6 0 0; 0 2 7 8 0; 0 0 1 3 10]
	// Band storage (K=2, LDAB=3, col-major):
	//   Row 0: diagonal   [2, 4, 6, 8, 10]
	//   Row 1: 1st subdiag [1, 5, 7, 3, 0]
	//   Row 2: 2nd subdiag [3, 2, 1, 0, 0]
	// L^T*[1,1,1,1,1] = [6, 11, 14, 11, 10]
	var AB = new Float64Array([
		2.0,
		1.0,
		3.0,  // col 0
		4.0,
		5.0,
		2.0,  // col 1
		6.0,
		7.0,
		1.0,  // col 2
		8.0,
		3.0,
		0.0,  // col 3
		10.0,
		0.0,
		0.0  // col 4
	]);
	var x = new Float64Array( [ 6.0, 11.0, 14.0, 11.0, 10.0 ] );
	dtbsv( 'lower', 'transpose', 'non-unit', 5, 2, AB, 1, 3, 0, x, 1, 0 );
	assertArrayClose( x, [ 1.0, 1.0, 1.0, 1.0, 1.0 ], 1e-14, 'x' );
});

test( 'dtbsv: upper_T_nonunit_k2_stride2', function t() {
	// Same A as upper_N_nonunit_k2
	// A^T*[1,1,1,1,1] = [1, 6, 15, 24, 32]
	var AB = new Float64Array([
		0.0,
		0.0,
		1.0,
		0.0,
		2.0,
		4.0,
		3.0,
		5.0,
		7.0,
		6.0,
		8.0,
		10.0,
		9.0,
		11.0,
		12.0
	]);
	var x = new Float64Array( [ 1.0, 0.0, 6.0, 0.0, 15.0, 0.0, 24.0, 0.0, 32.0 ] );
	dtbsv( 'upper', 'transpose', 'non-unit', 5, 2, AB, 1, 3, 0, x, 2, 0 );
	assertArrayClose( x, [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0 ], 1e-14, 'x' ); // eslint-disable-line max-len
});


// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	var AB = new Float64Array( [ 0.0, 2.0, 3.0, 5.0 ] );
	var x = new Float64Array( [ 1, 2 ] );
	assert.throws( function f() {
		ndarray( 'foo', 'no-transpose', 'non-unit', 2, 1, AB, 1, 2, 0, x, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid trans', function t() {
	var AB = new Float64Array( [ 0.0, 2.0, 3.0, 5.0 ] );
	var x = new Float64Array( [ 1, 2 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'foo', 'non-unit', 2, 1, AB, 1, 2, 0, x, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid diag', function t() {
	var AB = new Float64Array( [ 0.0, 2.0, 3.0, 5.0 ] );
	var x = new Float64Array( [ 1, 2 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'foo', 2, 1, AB, 1, 2, 0, x, 1, 0 );
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	var AB = new Float64Array( [ 0.0, 2.0, 3.0, 5.0 ] );
	var x = new Float64Array( [ 1, 2 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'non-unit', -1, 1, AB, 1, 2, 0, x, 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative K', function t() {
	var AB = new Float64Array( [ 0.0, 2.0, 3.0, 5.0 ] );
	var x = new Float64Array( [ 1, 2 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'non-unit', 2, -1, AB, 1, 2, 0, x, 1, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for strideX=0', function t() {
	var AB = new Float64Array( [ 0.0, 2.0, 3.0, 5.0 ] );
	var x = new Float64Array( [ 1, 2 ] );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 'non-unit', 2, 1, AB, 1, 2, 0, x, 0, 0 );
	}, RangeError );
});

test( 'ndarray: N=0 early return', function t() {
	var out;
	var AB;
	var x;

	AB = new Float64Array( 1 );
	x = new Float64Array( [ 99 ] );
	out = ndarray( 'upper', 'no-transpose', 'non-unit', 0, 0, AB, 1, 1, 0, x, 1, 0 ); // eslint-disable-line max-len
	assert.equal( out, x );
	assert.equal( x[ 0 ], 99 );
});
