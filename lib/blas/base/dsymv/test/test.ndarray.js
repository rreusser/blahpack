/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsymv from './../lib/ndarray.js';
import ndarray from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import alpha_beta from './fixtures/alpha_beta.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };
import lower_stride_alpha_beta from './fixtures/lower_stride_alpha_beta.json' with { type: 'json' };
import negative_stride from './fixtures/negative_stride.json' with { type: 'json' };

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

test( 'dsymv: upper_basic (uplo=U, N=4, alpha=1, beta=0, unit strides)', function t() { // eslint-disable-line max-len
	var tc = upper_basic;

	// Symmetric matrix upper triangle stored in column-major:

	// Full: [[1,2,3,4],[2,5,6,7],[3,6,8,9],[4,7,9,10]]
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
	var x = new Float64Array([ 1, 2, 3, 4 ]);
	var y = new Float64Array([ 0, 0, 0, 0 ]);

	dsymv( 'upper', 4, 1.0, A, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: lower_basic (uplo=L, N=4, alpha=1, beta=0, unit strides)', function t() { // eslint-disable-line max-len
	var tc = lower_basic;

	// Lower triangle stored in column-major:
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
	var x = new Float64Array([ 1, 2, 3, 4 ]);
	var y = new Float64Array([ 0, 0, 0, 0 ]);

	dsymv( 'lower', 4, 1.0, A, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: alpha_beta (uplo=U, alpha=2, beta=0.5)', function t() {
	var tc = alpha_beta;
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
	var x = new Float64Array([ 1, 2, 3, 4 ]);
	var y = new Float64Array([ 10, 20, 30, 40 ]);

	dsymv( 'upper', 4, 2.0, A, 1, 4, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: n_zero (quick return)', function t() {
	var tc = n_zero;
	var A = new Float64Array([ 1 ]);
	var x = new Float64Array([ 1 ]);
	var y = new Float64Array([ 99 ]);

	dsymv( 'upper', 0, 1.0, A, 1, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: n_one (N=1, alpha=2, beta=3)', function t() {
	var tc = n_one;
	var A = new Float64Array([ 3 ]);
	var x = new Float64Array([ 5 ]);
	var y = new Float64Array([ 7 ]);

	// y = 2*3*5 + 3*7 = 30 + 21 = 51
	dsymv( 'upper', 1, 2.0, A, 1, 1, 0, x, 1, 0, 3.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: alpha_zero (alpha=0, just scales y by beta)', function t() {
	var tc = alpha_zero;
	var A = new Float64Array([ 1, 0, 0, 0, 2, 5, 0, 0, 3, 6, 8, 0, 4, 7, 9, 10 ]);
	var x = new Float64Array([ 1, 2, 3, 4 ]);
	var y = new Float64Array([ 10, 20, 30, 40 ]);

	dsymv( 'upper', 4, 0.0, A, 1, 4, 0, x, 1, 0, 2.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: stride (uplo=U, N=3, incx=2, incy=2)', function t() {
	var tc = stride;

	// Fortran upper triangle, LDA=3, N=3:

	// diagonal: A(1,1)=1, A(2,2)=2, A(3,3)=3, off-diags all 0

	// Column-major storage: [1,0,0, 0,2,0, 0,0,3]
	var A = new Float64Array([
		1,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		3
	]);
	var x = new Float64Array([ 1, 0, 2, 0, 3, 0 ]);
	var y = new Float64Array([ 1, 0, 2, 0, 3, 0 ]);

	dsymv( 'upper', 3, 1.0, A, 1, 3, 0, x, 2, 0, 1.0, y, 2, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: lower_stride_alpha_beta (uplo=L, N=3, incx=2, incy=2, alpha=2, beta=0.5)', function t() { // eslint-disable-line max-len
	var tc = lower_stride_alpha_beta;

	// Fortran lower triangle, LDA=3, N=3:

	// A(1,1)=1, A(2,1)=2, A(3,1)=3, A(2,2)=0, A(3,2)=4, A(3,3)=0

	// Symmetric: [[1,2,3],[2,0,4],[3,4,0]]

	// Column-major storage: [1,2,3, 0,0,4, 0,0,0]
	var A = new Float64Array([
		1,
		2,
		3,
		0,
		0,
		4,
		0,
		0,
		0
	]);
	var x = new Float64Array([ 1, 0, 2, 0, 3, 0 ]);
	var y = new Float64Array([ 10, 0, 20, 0, 30, 0 ]);

	dsymv( 'lower', 3, 2.0, A, 1, 3, 0, x, 2, 0, 0.5, y, 2, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: negative_stride (uplo=U, N=3, incx=-1, incy=-1)', function t() {
	var tc = negative_stride;

	// Upper triangle: [[1,2,3],[2,4,5],[3,5,6]]
	var A = new Float64Array([
		1,
		0,
		0,
		2,
		4,
		0,
		3,
		5,
		6
	]);
	var x = new Float64Array([ 1, 2, 3 ]);
	var y = new Float64Array([ 0, 0, 0 ]);

	// With incx=-1, Fortran KX = 1-(N-1)*(-1) = 3 → 0-based: offsetX = 2, strideX = -1 // eslint-disable-line max-len
	dsymv( 'upper', 3, 1.0, A, 1, 3, 0, x, -1, 2, 0.0, y, -1, 2 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: returns y', function t() {
	var result;
	var A;
	var x;
	var y;

	A = new Float64Array([ 1 ]);
	x = new Float64Array([ 1 ]);
	y = new Float64Array([ 0 ]);
	result = dsymv( 'upper', 1, 1.0, A, 1, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
	assert.equal( result, y );
});

test( 'dsymv: alpha=0 and beta=1 quick return does not modify y', function t() {
	var A = new Float64Array([ 1, 2, 2, 3 ]);
	var x = new Float64Array([ 1, 2 ]);
	var y = new Float64Array([ 99, 88 ]);

	dsymv( 'upper', 2, 0.0, A, 1, 2, 0, x, 1, 0, 1.0, y, 1, 0 );
	assert.equal( y[ 0 ], 99 );
	assert.equal( y[ 1 ], 88 );
});

// ndarray validation tests

test( 'dsymv: ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ndarray( 'invalid', 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dsymv: ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', -1, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dsymv: ndarray throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 0, 0, 0.0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dsymv: ndarray throws RangeError for zero strideY', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 0, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
