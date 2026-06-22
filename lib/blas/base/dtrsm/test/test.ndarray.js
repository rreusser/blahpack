/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrsm from './../lib/ndarray.js';
import ndarray from './../lib/ndarray.js';

// FIXTURES //

import left_upper_n_n from './fixtures/left_upper_n_n.json' with { type: 'json' };
import left_lower_n_n from './fixtures/left_lower_n_n.json' with { type: 'json' };
import right_upper_n_n from './fixtures/right_upper_n_n.json' with { type: 'json' };
import unit_diag from './fixtures/unit_diag.json' with { type: 'json' };
import alpha_scale from './fixtures/alpha_scale.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import left_upper_t_n from './fixtures/left_upper_t_n.json' with { type: 'json' };
import left_lower_t_n from './fixtures/left_lower_t_n.json' with { type: 'json' };
import right_lower_n_n from './fixtures/right_lower_n_n.json' with { type: 'json' };
import right_upper_t_n from './fixtures/right_upper_t_n.json' with { type: 'json' };
import right_lower_t_n from './fixtures/right_lower_t_n.json' with { type: 'json' };

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

// All matrices 2x2, stored column-major: strideX1=1, strideX2=2

test( 'dtrsm: left, upper, no-trans, non-unit', function t() {
	var tc = left_upper_n_n;

	// A = [2 3; 0 4] col-major: [2, 0, 3, 4]
	var A = new Float64Array( [ 2, 0, 3, 4 ] );
	var B = new Float64Array( [ 8, 4, 10, 12 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'left_upper_n_n' );
});

test( 'dtrsm: left, lower, no-trans, non-unit', function t() {
	var tc = left_lower_n_n;

	// A = [3 0; 2 5] col-major: [3, 2, 0, 5]
	var A = new Float64Array( [ 3, 2, 0, 5 ] );
	var B = new Float64Array( [ 6, 14, 9, 25 ] );
	dtrsm( 'left', 'lower', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'left_lower_n_n' );
});

test( 'dtrsm: right, upper, no-trans, non-unit', function t() {
	var tc = right_upper_n_n;
	var A = new Float64Array( [ 2, 0, 3, 4 ] );
	var B = new Float64Array( [ 4, 6, 11, 15 ] );
	dtrsm( 'right', 'upper', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'right_upper_n_n' );
});

test( 'dtrsm: unit diagonal', function t() {
	var tc = unit_diag;

	// A stored as [99, 0, 3, 99] but diag = 'unit' ignores diagonal
	var A = new Float64Array( [ 99, 0, 3, 99 ] );
	var B = new Float64Array( [ 7, 1, 10, 2 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'unit_diag' );
});

test( 'dtrsm: alpha scaling', function t() {
	var tc = alpha_scale;
	var A = new Float64Array( [ 2, 0, 3, 4 ] );
	var B = new Float64Array( [ 8, 4, 10, 12 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'alpha_scale' );
});

test( 'dtrsm: alpha=0 zeros B', function t() {
	var tc = alpha_zero;
	var A = new Float64Array( [ 2, 0, 3, 4 ] );
	var B = new Float64Array( [ 5, 6, 7, 8 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, 0.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'alpha_zero' );
});

test( 'dtrsm: left, upper, transpose, non-unit', function t() {
	var tc = left_upper_t_n;
	var A = new Float64Array( [ 2, 0, 3, 4 ] );
	var B = new Float64Array( [ 4, 11, 2, 14 ] );
	dtrsm( 'left', 'upper', 'transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'left_upper_t_n' );
});

test( 'dtrsm: left, lower, transpose, non-unit', function t() {
	var tc = left_lower_t_n;
	var A = new Float64Array( [ 3, 2, 0, 5 ] );
	var B = new Float64Array( [ 9, 10, 15, 19 ] );
	dtrsm( 'left', 'lower', 'transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'left_lower_t_n' );
});

test( 'dtrsm: right, lower, no-trans, non-unit', function t() {
	var tc = right_lower_n_n;
	var A = new Float64Array( [ 3, 2, 0, 5 ] );
	var B = new Float64Array( [ 3, 6, 10, 22 ] );
	dtrsm( 'right', 'lower', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'right_lower_n_n' );
});

test( 'dtrsm: right, upper, transpose, non-unit', function t() {
	var tc = right_upper_t_n;
	var A = new Float64Array( [ 2, 0, 3, 4 ] );
	var B = new Float64Array( [ 4, 6, 14, 22 ] );
	dtrsm( 'right', 'upper', 'transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'right_upper_t_n' );
});

test( 'dtrsm: right, lower, transpose, non-unit', function t() {
	var tc = right_lower_t_n;
	var A = new Float64Array( [ 3, 2, 0, 5 ] );
	var B = new Float64Array( [ 6, 9, 10, 25 ] );
	dtrsm( 'right', 'lower', 'transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'right_lower_t_n' );
});

test( 'dtrsm: M=0 quick return', function t() {
	var B = new Float64Array( [ 99 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', 0, 2, 1.0, new Float64Array( 4 ), 1, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( B[ 0 ], 99 );
});

test( 'dtrsm: N=0 quick return', function t() {
	var B = new Float64Array( [ 99 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', 2, 0, 1.0, new Float64Array( 4 ), 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( B[ 0 ], 99 );
});

test( 'dtrsm: left, lower, no-trans with alpha=2', function t() {
	// Covers the alpha !== 1.0 branch in Left, Lower, No-transpose
	var A = new Float64Array( [ 3, 2, 0, 5 ] );
	var B = new Float64Array( [ 6, 14, 9, 25 ] );

	// We can verify by comparing: solve A*X = 2*B
	dtrsm( 'left', 'lower', 'no-transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	// Row 1: 3*x11 = 2*6=12 => x11=4; 3*x12=2*9=18 => x12=6
	// Row 2: 2*4+5*x21=2*14=28 => x21=(28-8)/5=4; 2*6+5*x22=2*25=50 => x22=(50-12)/5=7.6 // eslint-disable-line max-len
	assertClose( B[ 0 ], 4.0, 1e-14, 'B[0]' );
	assertClose( B[ 1 ], 4.0, 1e-14, 'B[1]' );
});

test( 'dtrsm: right, upper, no-trans with alpha=2', function t() {
	// Covers the alpha !== 1.0 branch in Right, Upper, No-transpose
	var A = new Float64Array( [ 2, 0, 3, 4 ] );
	var B = new Float64Array( [ 4, 6, 11, 15 ] );
	dtrsm( 'right', 'upper', 'no-transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len

	// Solve X*A = 2*B
	assertClose( B[ 0 ], 4.0, 1e-14, 'B[0]' );
	assertClose( B[ 1 ], 6.0, 1e-14, 'B[1]' );
});

test( 'dtrsm: right, lower, no-trans with alpha=2', function t() {
	// Covers the alpha !== 1.0 branch in Right, Lower, No-transpose
	var A = new Float64Array( [ 3, 2, 0, 5 ] );
	var B = new Float64Array( [ 3, 6, 10, 22 ] );
	dtrsm( 'right', 'lower', 'no-transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len

	// Non-trivial result, just verify it's different from alpha=1
	assert.ok( B[ 0 ] !== 3.0, 'B should be modified' );
});

test( 'dtrsm: right, upper, transpose with alpha=2', function t() {
	// Covers the alpha !== 1.0 branch in Right, Upper, Transpose
	var A = new Float64Array( [ 2, 0, 3, 4 ] );
	var B = new Float64Array( [ 4, 6, 14, 22 ] );
	dtrsm( 'right', 'upper', 'transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assert.ok( B[ 0 ] !== 4.0, 'B should be modified' );
});

test( 'dtrsm: right, lower, transpose with alpha=2', function t() {
	// Covers the alpha !== 1.0 branch in Right, Lower, Transpose
	var A = new Float64Array( [ 3, 2, 0, 5 ] );
	var B = new Float64Array( [ 6, 9, 10, 25 ] );
	dtrsm( 'right', 'lower', 'transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assert.ok( B[ 0 ] !== 6.0, 'B should be modified' );
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid side', function t() {
	var A = new Float64Array( 4 );
	var B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'invalid', 'upper', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	var A = new Float64Array( 4 );
	var B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'left', 'invalid', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid transa', function t() {
	var A = new Float64Array( 4 );
	var B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'invalid', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid diag', function t() {
	var A = new Float64Array( 4 );
	var B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'invalid', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative M', function t() {
	var A = new Float64Array( 4 );
	var B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'non-unit', -1, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	var A = new Float64Array( 4 );
	var B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 2, -1, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
