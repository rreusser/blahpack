/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zherk from './../lib/ndarray.js';
var ndarray = zherk;

// FIXTURES //

import upper_n from './fixtures/upper_n.json' with { type: 'json' };
import lower_n from './fixtures/lower_n.json' with { type: 'json' };
import upper_c from './fixtures/upper_c.json' with { type: 'json' };
import lower_c from './fixtures/lower_c.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import alpha_zero_beta_zero from './fixtures/alpha_zero_beta_zero.json' with { type: 'json' };
import alpha_zero_beta_zero_lower from './fixtures/alpha_zero_beta_zero_lower.json' with { type: 'json' };
import alpha_zero_beta_scale_lower from './fixtures/alpha_zero_beta_scale_lower.json' with { type: 'json' };
import beta_zero from './fixtures/beta_zero.json' with { type: 'json' };
import upper_n_beta_half from './fixtures/upper_n_beta_half.json' with { type: 'json' };
import lower_n_beta_zero from './fixtures/lower_n_beta_zero.json' with { type: 'json' };
import lower_n_beta_half from './fixtures/lower_n_beta_half.json' with { type: 'json' };
import upper_c_beta_zero from './fixtures/upper_c_beta_zero.json' with { type: 'json' };
import lower_c_beta_zero from './fixtures/lower_c_beta_zero.json' with { type: 'json' };

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

test( 'zherk: upper_N', function t() {
	var tc = upper_n;

	// A is 3x2 complex, C is 3x3 complex
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var C = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] ); // eslint-disable-line max-len
	zherk( 'upper', 'no-transpose', 3, 2, 2.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: lower_N', function t() {
	var tc = lower_n;
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var C = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] ); // eslint-disable-line max-len
	zherk( 'lower', 'no-transpose', 3, 2, 2.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: upper_C', function t() {
	var tc = upper_c;

	// A is 2x3 complex
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var C = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] ); // eslint-disable-line max-len
	zherk( 'upper', 'conjugate-transpose', 3, 2, 2.0, A, 1, 2, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: lower_C', function t() {
	var tc = lower_c;
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var C = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] ); // eslint-disable-line max-len
	zherk( 'lower', 'conjugate-transpose', 3, 2, 2.0, A, 1, 2, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: alpha_zero', function t() {
	var tc = alpha_zero;
	var A = new Complex128Array( 6 );
	var C = new Complex128Array( [ 2, 0, 0, 0, 0, 0, 3, 1, 4, 0, 0, 0, 5, 2, 6, 3, 7, 0 ] ); // eslint-disable-line max-len
	zherk( 'upper', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, 2.0, C, 1, 3, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: alpha_zero_beta_zero', function t() {
	var tc = alpha_zero_beta_zero;
	var A = new Complex128Array( 6 );
	var C = new Complex128Array( [ 5, 0, 0, 0, 0, 0, 6, 1, 7, 0, 0, 0, 8, 2, 9, 3, 10, 0 ] ); // eslint-disable-line max-len
	zherk( 'upper', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: alpha_zero_beta_zero_lower', function t() {
	var tc = alpha_zero_beta_zero_lower;
	var A = new Complex128Array( 6 );
	var C = new Complex128Array( [ 5, 0, 6, 1, 7, 2, 0, 0, 8, 0, 9, 3, 0, 0, 0, 0, 10, 0 ] ); // eslint-disable-line max-len
	zherk( 'lower', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: alpha_zero_beta_scale_lower', function t() {
	var tc = alpha_zero_beta_scale_lower;
	var A = new Complex128Array( 6 );
	var C = new Complex128Array( [ 2, 0, 3, 1, 5, 2, 0, 0, 4, 0, 6, 3, 0, 0, 0, 0, 7, 0 ] ); // eslint-disable-line max-len
	zherk( 'lower', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, 3.0, C, 1, 3, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: beta_zero', function t() {
	var tc = beta_zero;
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var C = new Complex128Array( [ 99, 0, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 99, 0 ] ); // eslint-disable-line max-len
	zherk( 'upper', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: upper_N_beta_half', function t() {
	var tc = upper_n_beta_half;
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var C = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] ); // eslint-disable-line max-len
	zherk( 'upper', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 0.5, C, 1, 3, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: lower_N_beta_zero', function t() {
	var tc = lower_n_beta_zero;
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var C = new Complex128Array( [ 99, 0, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 99, 0 ] ); // eslint-disable-line max-len
	zherk( 'lower', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: lower_N_beta_half', function t() {
	var tc = lower_n_beta_half;
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var C = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] ); // eslint-disable-line max-len
	zherk( 'lower', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 0.5, C, 1, 3, 0 );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: upper_C_beta_zero', function t() {
	var tc = upper_c_beta_zero;
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var C = new Complex128Array( [ 99, 0, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 99, 0 ] ); // eslint-disable-line max-len
	zherk( 'upper', 'conjugate-transpose', 3, 2, 1.0, A, 1, 2, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: lower_C_beta_zero', function t() {
	var tc = lower_c_beta_zero;
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var C = new Complex128Array( [ 99, 0, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 99, 0 ] ); // eslint-disable-line max-len
	zherk( 'lower', 'conjugate-transpose', 3, 2, 1.0, A, 1, 2, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zherk: n_zero quick return', function t() {
	var result;
	var A;
	var C;

	A = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	result = zherk( 'upper', 'no-transpose', 0, 2, 1.0, A, 1, 1, 0, 1.0, C, 1, 1, 0 ); // eslint-disable-line max-len
	assert.ok( result === C );
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	var A = new Complex128Array( 6 );
	var C = new Complex128Array( 9 );
	assert.throws( function f() {
		ndarray( 'invalid', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid trans', function t() {
	var A = new Complex128Array( 6 );
	var C = new Complex128Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'invalid', 3, 2, 1.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	var A = new Complex128Array( 6 );
	var C = new Complex128Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', -1, 2, 1.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative K', function t() {
	var A = new Complex128Array( 6 );
	var C = new Complex128Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 3, -1, 1.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	}, RangeError );
});
