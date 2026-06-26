/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyr2 from './../lib/ndarray.js';
var ndarray = dsyr2;

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import upper_alpha from './fixtures/upper_alpha.json' with { type: 'json' };
import lower_alpha from './fixtures/lower_alpha.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import upper_stride from './fixtures/upper_stride.json' with { type: 'json' };
import lower_stride from './fixtures/lower_stride.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_zeros from './fixtures/upper_zeros.json' with { type: 'json' };

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

test( 'dsyr2: upper_basic', function t() {
	var tc = upper_basic;

	// A = [1 2 3; 2 5 6; 3 6 9] (column-major), x = [1,2,3], y = [4,5,6]
	var A = new Float64Array( [ 1, 2, 3, 2, 5, 6, 3, 6, 9 ] );
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5, 6 ] );
	dsyr2( 'upper', 3, 1.0, x, 1, 0, y, 1, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dsyr2: lower_basic', function t() {
	var tc = lower_basic;
	var A = new Float64Array( [ 1, 2, 3, 2, 5, 6, 3, 6, 9 ] );
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5, 6 ] );
	dsyr2( 'lower', 3, 1.0, x, 1, 0, y, 1, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dsyr2: upper_alpha', function t() {
	var tc = upper_alpha;

	// Upper triangular only: A = [1 2 3; 0 5 6; 0 0 9]
	var A = new Float64Array( [ 1, 0, 0, 2, 5, 0, 3, 6, 9 ] );
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 0.5, 1.5, 2.5 ] );
	dsyr2( 'upper', 3, 2.5, x, 1, 0, y, 1, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dsyr2: lower_alpha', function t() {
	var tc = lower_alpha;

	// Lower triangular only: A = [1 0 0; 2 5 0; 3 6 9]
	var A = new Float64Array( [ 1, 2, 3, 0, 5, 6, 0, 0, 9 ] );
	var x = new Float64Array( [ 2, 3, 4 ] );
	var y = new Float64Array( [ 1, -1, 2 ] );
	dsyr2( 'lower', 3, 0.5, x, 1, 0, y, 1, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dsyr2: n_zero', function t() {
	var tc = n_zero;
	var A = new Float64Array( [ 99 ] );
	var x = new Float64Array( [ 1 ] );
	var y = new Float64Array( [ 1 ] );
	dsyr2( 'upper', 0, 1.0, x, 1, 0, y, 1, 0, A, 1, 1, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dsyr2: alpha_zero', function t() {
	var tc = alpha_zero;
	var A = new Float64Array( [ 99, 0, 0, 0, 0, 0, 0, 0, 0 ] );
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5, 6 ] );
	dsyr2( 'upper', 3, 0.0, x, 1, 0, y, 1, 0, A, 1, 3, 0 );
	assertClose( A[ 0 ], tc.A[ 0 ], 1e-14, 'A[0]' );
});

test( 'dsyr2: n_one', function t() {
	var tc = n_one;
	var A = new Float64Array( [ 5 ] );
	var x = new Float64Array( [ 3 ] );
	var y = new Float64Array( [ 2 ] );
	dsyr2( 'upper', 1, 1.0, x, 1, 0, y, 1, 0, A, 1, 1, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dsyr2: upper_stride', function t() {
	var tc = upper_stride;

	// A upper tri: [1 2 3; 0 5 6; 0 0 9], incx=2, incy=2
	var A = new Float64Array( [ 1, 0, 0, 2, 5, 0, 3, 6, 9 ] );
	var x = new Float64Array( [ 1, 0, 2, 0, 3 ] );
	var y = new Float64Array( [ 4, 0, 5, 0, 6 ] );
	dsyr2( 'upper', 3, 1.0, x, 2, 0, y, 2, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dsyr2: lower_stride', function t() {
	var tc = lower_stride;

	// A lower tri: [1 0 0; 2 5 0; 3 6 9], incx=2, incy=3
	var A = new Float64Array( [ 1, 2, 3, 0, 5, 6, 0, 0, 9 ] );
	var x = new Float64Array( [ 1, 0, 2, 0, 3 ] );
	var y = new Float64Array( [ 4, 0, 0, 5, 0, 0, 6 ] );
	dsyr2( 'lower', 3, 1.0, x, 2, 0, y, 3, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dsyr2: upper_4x4', function t() {
	var tc = upper_4x4;

	// 4x4 upper: column-major
	var A = new Float64Array([
		1,
		0,
		0,
		0,
		2,
		5,
		0,
		0,
		3,
		6,
		8,
		0,
		4,
		7,
		9,
		10
	]);
	var x = new Float64Array( [ 1, -1, 2, -2 ] );
	var y = new Float64Array( [ 3, 0.5, -1, 1.5 ] );
	dsyr2( 'upper', 4, 1.0, x, 1, 0, y, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dsyr2: lower_4x4', function t() {
	var tc = lower_4x4;

	// 4x4 lower: column-major
	var A = new Float64Array([
		1,
		2,
		3,
		4,
		0,
		5,
		6,
		7,
		0,
		0,
		8,
		9,
		0,
		0,
		0,
		10
	]);
	var x = new Float64Array( [ 1, -1, 2, -2 ] );
	var y = new Float64Array( [ 3, 0.5, -1, 1.5 ] );
	dsyr2( 'lower', 4, 1.0, x, 1, 0, y, 1, 0, A, 1, 4, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dsyr2: upper_zeros (skip when x[j]==0 && y[j]==0)', function t() {
	var tc = upper_zeros;

	// x = [0, 2, 0], y = [0, 5, 0] — columns 0 and 2 should be skipped
	var A = new Float64Array( [ 1, 0, 0, 2, 5, 0, 3, 6, 9 ] );
	var x = new Float64Array( [ 0, 2, 0 ] );
	var y = new Float64Array( [ 0, 5, 0 ] );
	dsyr2( 'upper', 3, 1.0, x, 1, 0, y, 1, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dsyr2: returns A', function t() {
	var result;
	var A;
	var x;
	var y;

	A = new Float64Array( [ 1, 0, 0, 1 ] );
	x = new Float64Array( [ 1, 2 ] );
	y = new Float64Array( [ 3, 4 ] );
	result = dsyr2( 'upper', 2, 1.0, x, 1, 0, y, 1, 0, A, 1, 2, 0 );
	assert.equal( result, A );
});

test( 'dsyr2: offset support', function t() {
	// Use offsetX=1, offsetY=2 to skip leading elements
	var A = new Float64Array( [ 5 ] );
	var x = new Float64Array( [ 999, 3 ] );
	var y = new Float64Array( [ 999, 999, 2 ] );
	dsyr2( 'upper', 1, 1.0, x, 1, 1, y, 1, 2, A, 1, 1, 0 );

	// A[0] = 5 + 1*(3*2 + 2*3) = 5 + 12 = 17
	assertClose( A[ 0 ], 17.0, 1e-14, 'A[0]' );
});

test( 'dsyr2: offsetA support', function t() {
	// Matrix stored with offset into a larger buffer
	var A = new Float64Array( [ 999, 999, 1, 0, 0, 1 ] );
	var x = new Float64Array( [ 1, 2 ] );
	var y = new Float64Array( [ 3, 4 ] );
	dsyr2( 'lower', 2, 1.0, x, 1, 0, y, 1, 0, A, 1, 2, 2 );

	// A(0,0) += 1*3 + 3*1 = 6 → 1+6 = 7

	// A(1,0) += 2*3 + 4*1 = 10 → 0+10 = 10

	// A(1,1) += 2*4 + 4*2 = 16 → 1+16 = 17
	assertClose( A[ 2 ], 7.0, 1e-14, 'A(0,0)' );
	assertClose( A[ 3 ], 10.0, 1e-14, 'A(1,0)' );
	assertClose( A[ 5 ], 17.0, 1e-14, 'A(1,1)' );
});

// ndarray validation tests

test( 'dsyr2: ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ndarray( 'invalid', 2, 1.0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dsyr2: ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', -1, 1.0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dsyr2: ndarray throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', 2, 1.0, new Float64Array( 2 ), 0, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dsyr2: ndarray throws RangeError for zero strideY', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', 2, 1.0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 0, 0, new Float64Array( 4 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
