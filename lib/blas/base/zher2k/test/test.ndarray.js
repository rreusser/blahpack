/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zher2k from './../lib/ndarray.js';
const ndarray = zher2k;

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
import k_zero_beta_scale from './fixtures/k_zero_beta_scale.json' with { type: 'json' };
import k_zero_beta_one from './fixtures/k_zero_beta_one.json' with { type: 'json' };
import upper_c_beta_half from './fixtures/upper_c_beta_half.json' with { type: 'json' };
import lower_c_beta_half from './fixtures/lower_c_beta_half.json' with { type: 'json' };
import upper_n_real_alpha from './fixtures/upper_n_real_alpha.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// Common input data: A is 3x2 (trans = 'no-transpose') or 2x3 (trans = 'conjugate-transpose'), B likewise // eslint-disable-line max-len
// A col-major: A(1,1)=(1,2) A(2,1)=(3,4) A(3,1)=(5,6) A(1,2)=(7,8) A(2,2)=(9,10) A(3,2)=(11,12) // eslint-disable-line max-len
const A_N_data = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]; // interleaved re/im for 3x2 // eslint-disable-line max-len
const B_N_data = [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5 ];

// For trans = 'conjugate-transpose': A is 2x3, same values laid out as 2x3 col-major // eslint-disable-line max-len

// A(1,1)=(1,2) A(2,1)=(3,4) A(1,2)=(5,6) A(2,2)=(7,8) A(1,3)=(9,10) A(2,3)=(11,12) // eslint-disable-line max-len
const A_C_data = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]; // same raw data, different shape // eslint-disable-line max-len
const B_C_data = [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5 ];

/**
* MakeA_N.
*
* @private
* @returns {*} result
*/
function makeA_N( ) {
	return new Complex128Array( A_N_data );
}
/**
* MakeB_N.
*
* @private
* @returns {*} result
*/
function makeB_N( ) {
	return new Complex128Array( B_N_data );
}
/**
* MakeA_C.
*
* @private
* @returns {*} result
*/
function makeA_C( ) {
	return new Complex128Array( A_C_data );
}
/**
* MakeB_C.
*
* @private
* @returns {*} result
*/
function makeB_C( ) {
	return new Complex128Array( B_C_data );
}

/**
* MakeC_identity.
*
* @private
* @returns {*} result
*/
function makeC_identity() {
	// 3x3 col-major: C(1,1)=1, C(2,2)=1, C(3,3)=1, rest=0
	return new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] ); // eslint-disable-line max-len
}

/**
* MakeC_junk.
*
* @private
* @returns {*} result
*/
function makeC_junk() {
	// 3x3 with diagonal = 99
	return new Complex128Array( [ 99, 0, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 0, 0, 0, 0, 99, 0 ] ); // eslint-disable-line max-len
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zher2k: upper_N', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = upper_n;
	const A = makeA_N();
	const B = makeB_N();
	const C = makeC_identity();
	zher2k( 'upper', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: lower_N', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = lower_n;
	const A = makeA_N();
	const B = makeB_N();
	const C = makeC_identity();
	zher2k( 'lower', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: upper_C', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = upper_c;
	const A = makeA_C();
	const B = makeB_C();
	const C = makeC_identity();
	zher2k( 'upper', 'conjugate-transpose', 3, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: lower_C', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = lower_c;
	const A = makeA_C();
	const B = makeB_C();
	const C = makeC_identity();
	zher2k( 'lower', 'conjugate-transpose', 3, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: alpha_zero', function t() {
	const alpha = new Complex128( 0.0, 0.0 );
	const tc = alpha_zero;
	const A = makeA_N();
	const B = makeB_N();
	const C = new Complex128Array( [ 2, 0, 0, 0, 0, 0, 3, 1, 4, 0, 0, 0, 5, 2, 6, 3, 7, 0 ] );
	zher2k( 'upper', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 2.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: alpha_zero_beta_zero', function t() {
	const alpha = new Complex128( 0.0, 0.0 );
	const tc = alpha_zero_beta_zero;
	const A = makeA_N();
	const B = makeB_N();
	const C = new Complex128Array( [ 5, 0, 0, 0, 0, 0, 6, 1, 7, 0, 0, 0, 8, 2, 9, 3, 10, 0 ] );
	zher2k( 'upper', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: alpha_zero_beta_zero_lower', function t() {
	const alpha = new Complex128( 0.0, 0.0 );
	const tc = alpha_zero_beta_zero_lower;
	const A = makeA_N();
	const B = makeB_N();
	const C = new Complex128Array( [ 5, 0, 6, 1, 7, 2, 0, 0, 8, 0, 9, 3, 0, 0, 0, 0, 10, 0 ] );
	zher2k( 'lower', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: alpha_zero_beta_scale_lower', function t() {
	const alpha = new Complex128( 0.0, 0.0 );
	const tc = alpha_zero_beta_scale_lower;
	const A = makeA_N();
	const B = makeB_N();
	const C = new Complex128Array( [ 2, 0, 3, 1, 5, 2, 0, 0, 4, 0, 6, 3, 0, 0, 0, 0, 7, 0 ] );
	zher2k( 'lower', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 3.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: beta_zero', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = beta_zero;
	const A = makeA_N();
	const B = makeB_N();
	const C = makeC_junk();
	zher2k( 'upper', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: upper_N_beta_half', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = upper_n_beta_half;
	const A = makeA_N();
	const B = makeB_N();
	const C = makeC_identity();
	zher2k( 'upper', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 0.5, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: lower_N_beta_zero', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = lower_n_beta_zero;
	const A = makeA_N();
	const B = makeB_N();
	const C = makeC_junk();
	zher2k( 'lower', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: lower_N_beta_half', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = lower_n_beta_half;
	const A = makeA_N();
	const B = makeB_N();
	const C = makeC_identity();
	zher2k( 'lower', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 0.5, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: upper_C_beta_zero', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = upper_c_beta_zero;
	const A = makeA_C();
	const B = makeB_C();
	const C = makeC_junk();
	zher2k( 'upper', 'conjugate-transpose', 3, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: lower_C_beta_zero', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = lower_c_beta_zero;
	const A = makeA_C();
	const B = makeB_C();
	const C = makeC_junk();
	zher2k( 'lower', 'conjugate-transpose', 3, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: n_zero', function t() {

	const C = makeC_identity();
	const A = makeA_N();
	const B = makeB_N();
	const alpha = new Complex128( 1.0, 0.0 );
	const result = zher2k( 'upper', 'no-transpose', 0, 2, alpha, A, 1, 1, 0, B, 1, 1, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assert.ok( result === C );
});

test( 'zher2k: k_zero_beta_scale', function t() {
	const alpha = new Complex128( 1.0, 0.0 );
	const tc = k_zero_beta_scale;
	const A = makeA_N();
	const B = makeB_N();
	const C = new Complex128Array( [ 2, 0, 0, 0, 0, 0, 3, 1, 4, 0, 0, 0, 5, 2, 6, 3, 7, 0 ] );
	zher2k( 'upper', 'no-transpose', 3, 0, alpha, A, 1, 3, 0, B, 1, 3, 0, 2.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: k_zero_beta_one', function t() {

	const tc = k_zero_beta_one;
	const A = makeA_N();
	const B = makeB_N();
	const C = new Complex128Array( [ 2, 0, 0, 0, 0, 0, 3, 1, 4, 0, 0, 0, 5, 2, 6, 3, 7, 0 ] ); // eslint-disable-line max-len
	const alpha = new Complex128( 1.0, 0.0 );
	const result = zher2k( 'upper', 'no-transpose', 3, 0, alpha, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( result, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: upper_C_beta_half', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = upper_c_beta_half;
	const A = makeA_C();
	const B = makeB_C();
	const C = makeC_identity();
	zher2k( 'upper', 'conjugate-transpose', 3, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, 0.5, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: lower_C_beta_half', function t() {
	const alpha = new Complex128( 2.0, 1.0 );
	const tc = lower_c_beta_half;
	const A = makeA_C();
	const B = makeB_C();
	const C = makeC_identity();
	zher2k( 'lower', 'conjugate-transpose', 3, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, 0.5, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zher2k: upper_N_real_alpha', function t() {
	const alpha = new Complex128( 1.0, 0.0 );
	const tc = upper_n_real_alpha;
	const A = makeA_N();
	const B = makeB_N();
	const C = makeC_identity();
	zher2k( 'upper', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-14, 'c' );
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	const alpha = new Complex128( 1.0, 0.0 );
	const A = new Complex128Array( 6 );
	const B = new Complex128Array( 6 );
	const C = new Complex128Array( 9 );
	assert.throws( function f() {
		ndarray( 'invalid', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid trans', function t() {
	const alpha = new Complex128( 1.0, 0.0 );
	const A = new Complex128Array( 6 );
	const B = new Complex128Array( 6 );
	const C = new Complex128Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'invalid', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	const alpha = new Complex128( 1.0, 0.0 );
	const A = new Complex128Array( 6 );
	const B = new Complex128Array( 6 );
	const C = new Complex128Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', -1, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative K', function t() {
	const alpha = new Complex128( 1.0, 0.0 );
	const A = new Complex128Array( 6 );
	const B = new Complex128Array( 6 );
	const C = new Complex128Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 3, -1, alpha, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
