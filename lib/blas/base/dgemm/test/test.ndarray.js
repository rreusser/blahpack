/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgemm from './../lib/ndarray.js';
import ndarrayFn from './../lib/ndarray.js';

// FIXTURES //

import basic_nn from './fixtures/basic_nn.json' with { type: 'json' };
import tn from './fixtures/tn.json' with { type: 'json' };
import nt from './fixtures/nt.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import beta_zero from './fixtures/beta_zero.json' with { type: 'json' };
import alpha_beta from './fixtures/alpha_beta.json' with { type: 'json' };
import nonsquare from './fixtures/nonsquare.json' with { type: 'json' };
import tt from './fixtures/tt.json' with { type: 'json' };

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

// All matrices stored column-major: strideA1=1, strideA2=LDA (number of rows)

test( 'dgemm: basic N,N 2x2', function t() {
	var tc = basic_nn;

	// A = [1 3; 2 4] col-major, B = [5 7; 6 8] col-major
	var A = new Float64Array( [ 1, 2, 3, 4 ] );
	var B = new Float64Array( [ 5, 6, 7, 8 ] );
	var C = new Float64Array( 4 );
	dgemm( 'no-transpose', 'no-transpose', 2, 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( C, tc.C, 1e-14, 'basic_nn' );
});

test( 'dgemm: T,N transpose A', function t() {
	var tc = tn;
	var A = new Float64Array( [ 1, 2, 3, 4 ] );
	var B = new Float64Array( [ 5, 6, 7, 8 ] );
	var C = new Float64Array( 4 );
	dgemm( 'transpose', 'no-transpose', 2, 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( C, tc.C, 1e-14, 'tn' );
});

test( 'dgemm: N,T transpose B', function t() {
	var tc = nt;
	var A = new Float64Array( [ 1, 2, 3, 4 ] );
	var B = new Float64Array( [ 5, 7, 6, 8 ] );
	var C = new Float64Array( 4 );
	dgemm( 'no-transpose', 'transpose', 2, 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( C, tc.C, 1e-14, 'nt' );
});

test( 'dgemm: alpha=0 just scales C by beta', function t() {
	var tc = alpha_zero;
	var A = new Float64Array( [ 1, 2, 3, 4 ] );
	var B = new Float64Array( [ 5, 7, 6, 8 ] );
	var C = new Float64Array( [ 1, 2, 3, 4 ] );
	dgemm( 'no-transpose', 'no-transpose', 2, 2, 2, 0.0, A, 1, 2, 0, B, 1, 2, 0, 2.0, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( C, tc.C, 1e-14, 'alpha_zero' );
});

test( 'dgemm: beta=0 overwrites C', function t() {
	var tc = beta_zero;
	var A = new Float64Array( [ 1, 2, 3, 4 ] );
	var B = new Float64Array( [ 5, 6, 7, 8 ] );
	var C = new Float64Array( [ 999, 999, 999, 999 ] );
	dgemm( 'no-transpose', 'no-transpose', 2, 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( C, tc.C, 1e-14, 'beta_zero' );
});

test( 'dgemm: M=0 quick return', function t() {
	var C = new Float64Array( [ 99 ] );
	dgemm( 'no-transpose', 'no-transpose', 0, 2, 2, 1.0, new Float64Array( 4 ), 1, 1, 0, new Float64Array( 4 ), 1, 2, 0, 0.0, C, 1, 1, 0 ); // eslint-disable-line max-len

	// C should be unchanged
	assert.strictEqual( C[ 0 ], 99 );
});

test( 'dgemm: alpha and beta scaling', function t() {
	var tc = alpha_beta;
	var A = new Float64Array( [ 1, 2, 3, 4 ] );
	var B = new Float64Array( [ 5, 6, 7, 8 ] );
	var C = new Float64Array( [ 1, 1, 1, 1 ] );
	dgemm( 'no-transpose', 'no-transpose', 2, 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0, 3.0, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( C, tc.C, 1e-14, 'alpha_beta' );
});

test( 'dgemm: non-square M=3, N=2, K=2', function t() {
	var tc = nonsquare;

	// A is 3x2: [1,2,3,4,5,6], B is 2x2: identity [1,0,0,1]
	var A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	var B = new Float64Array( [ 1, 0, 0, 1 ] );
	var C = new Float64Array( 6 );
	dgemm( 'no-transpose', 'no-transpose', 3, 2, 2, 1.0, A, 1, 3, 0, B, 1, 2, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( C, tc.C, 1e-14, 'nonsquare' );
});

test( 'dgemm: T,T both transposed', function t() {
	var tc = tt;
	var A = new Float64Array( [ 1, 2, 3, 4 ] );
	var B = new Float64Array( [ 5, 6, 7, 8 ] );
	var C = new Float64Array( 4 );
	dgemm( 'transpose', 'transpose', 2, 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( C, tc.C, 1e-14, 'tt' );
});

test( 'dgemm: N=0 quick return', function t() {
	var C = new Float64Array( [ 99 ] );
	dgemm( 'no-transpose', 'no-transpose', 2, 0, 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, 0.0, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( C[ 0 ], 99 );
});

test( 'dgemm: alpha=0 beta=0 zeros C', function t() {
	var C = new Float64Array( [ 10, 20, 30, 40 ] );
	dgemm( 'no-transpose', 'no-transpose', 2, 2, 2, 0.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, 0.0, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( C, [ 0, 0, 0, 0 ], 1e-14, 'alpha0_beta0' );
});

test( 'dgemm: K=0 and beta=1 quick return', function t() {
	var C = new Float64Array( [ 10, 20, 30, 40 ] );
	dgemm( 'no-transpose', 'no-transpose', 2, 2, 0, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, 1.0, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( C[ 0 ], 10 );
	assert.strictEqual( C[ 1 ], 20 );
});

test( 'dgemm: beta=1 does not scale C', function t() {
	// Test the beta===1.0 branch (no scaling loop)
	var A = new Float64Array( [ 1, 0, 0, 1 ] ); // identity
	var B = new Float64Array( [ 2, 0, 0, 2 ] );
	var C = new Float64Array( [ 1, 1, 1, 1 ] );

	// C = 1.0 * I * B + 1.0 * C = B + C
	dgemm( 'no-transpose', 'no-transpose', 2, 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 1.0, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( C, [ 3, 1, 1, 3 ], 1e-14, 'beta_one' );
});

test( 'dgemm: T,N with beta!=0 (lines 130-131)', function t() {
	// Transa = 'transpose', transb = 'no-transpose', beta=2.0 -> exercises the else (beta!=0) branch in T,N path // eslint-disable-line max-len
	var A = new Float64Array( [ 1, 2, 3, 4 ] ); // 2x2 col-major
	var B = new Float64Array( [ 5, 6, 7, 8 ] );
	var C = new Float64Array( [ 1, 1, 1, 1 ] );
	dgemm( 'transpose', 'no-transpose', 2, 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 2.0, C, 1, 2, 0 ); // eslint-disable-line max-len

	// C = alpha * A^T * B + beta * C_old

	// A^T*B: [17 23; 39 53]

	// C = 1*[17 23; 39 53] + 2*[1 1; 1 1] = [19 25; 41 55]
	assertArrayClose( C, [ 19, 41, 25, 55 ], 1e-14, 'tn_beta_nonzero' );
});

test( 'dgemm: N,T with beta!=0,!=1 (lines 146-151)', function t() {
	// Transa = 'no-transpose', transb = 'transpose', beta=0.5 -> exercises the else if (beta!==1.0) scaling in N,T path // eslint-disable-line max-len
	var A = new Float64Array( [ 1, 2, 3, 4 ] );
	var B = new Float64Array( [ 5, 6, 7, 8 ] );
	var C = new Float64Array( [ 10, 10, 10, 10 ] );
	dgemm( 'no-transpose', 'transpose', 2, 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.5, C, 1, 2, 0 ); // eslint-disable-line max-len

	// A*B^T: [1*5+3*6, 2*5+4*6; 1*7+3*8, 2*7+4*8] = [23 34; 31 46]

	// Wait, B in col-major is [5 7; 6 8], B^T = [5 6; 7 8]

	// C = A*B^T + 0.5*C_old: A=[1 3;2 4], B^T=[5 6;7 8]

	// AB^T: [1*5+3*7, 1*6+3*8; 2*5+4*7, 2*6+4*8] = [26 30; 38 44]

	// C = [26+5, 38+5, 30+5, 44+5] = [31, 43, 35, 49]
	assertArrayClose( C, [ 31, 43, 35, 49 ], 1e-14, 'nt_beta_half' );
});

test( 'dgemm: T,T with beta!=0 (lines 179-180)', function t() {
	// Transa = 'transpose', transb = 'transpose', beta=3.0 -> exercises the else (beta!=0) branch in T,T path // eslint-disable-line max-len
	var A = new Float64Array( [ 1, 2, 3, 4 ] );
	var B = new Float64Array( [ 5, 6, 7, 8 ] );
	var C = new Float64Array( [ 1, 1, 1, 1 ] );
	dgemm( 'transpose', 'transpose', 2, 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 3.0, C, 1, 2, 0 ); // eslint-disable-line max-len

	// A^T = [1 2; 3 4], B^T = [5 6; 7 8]

	// A^T*B^T: [1*5+2*7, 1*6+2*8; 3*5+4*7, 3*6+4*8] = [19 22; 43 50]

	// C = [19+3, 43+3, 22+3, 50+3] = [22, 46, 25, 53]
	assertArrayClose( C, [ 22, 46, 25, 53 ], 1e-14, 'tt_beta_nonzero' );
});

// ndarray validation tests

test( 'dgemm: ndarray throws TypeError for invalid transa', function t() {
	assert.throws( function throws() {
		ndarrayFn( 'invalid', 'no-transpose', 2, 2, 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, 0.0, new Float64Array( 4 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dgemm: ndarray throws TypeError for invalid transb', function t() {
	assert.throws( function throws() {
		ndarrayFn( 'no-transpose', 'invalid', 2, 2, 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, 0.0, new Float64Array( 4 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dgemm: ndarray throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ndarrayFn( 'no-transpose', 'no-transpose', -1, 2, 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, 0.0, new Float64Array( 4 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgemm: ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarrayFn( 'no-transpose', 'no-transpose', 2, -1, 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, 0.0, new Float64Array( 4 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgemm: ndarray throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		ndarrayFn( 'no-transpose', 'no-transpose', 2, 2, -1, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, 0.0, new Float64Array( 4 ), 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
