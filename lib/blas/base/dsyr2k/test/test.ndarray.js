/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyr2k from './../lib/ndarray.js';
const ndarray = dsyr2k;

// FIXTURES //

import upper_n from './fixtures/upper_n.json' with { type: 'json' };
import lower_n from './fixtures/lower_n.json' with { type: 'json' };
import upper_t from './fixtures/upper_t.json' with { type: 'json' };
import lower_t from './fixtures/lower_t.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import beta_zero from './fixtures/beta_zero.json' with { type: 'json' };
import alpha_zero_beta_zero from './fixtures/alpha_zero_beta_zero.json' with { type: 'json' };
import alpha_zero_beta_zero_lower from './fixtures/alpha_zero_beta_zero_lower.json' with { type: 'json' };
import alpha_zero_beta_scale_upper from './fixtures/alpha_zero_beta_scale_upper.json' with { type: 'json' };
import alpha_zero_beta_scale_lower from './fixtures/alpha_zero_beta_scale_lower.json' with { type: 'json' };
import upper_n_beta_half from './fixtures/upper_n_beta_half.json' with { type: 'json' };
import lower_n_beta_zero from './fixtures/lower_n_beta_zero.json' with { type: 'json' };
import lower_n_beta_half from './fixtures/lower_n_beta_half.json' with { type: 'json' };
import k_zero_beta_scale from './fixtures/k_zero_beta_scale.json' with { type: 'json' };
import upper_t_beta_zero from './fixtures/upper_t_beta_zero.json' with { type: 'json' };
import lower_t_beta_zero from './fixtures/lower_t_beta_zero.json' with { type: 'json' };

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

test( 'dsyr2k: upper_N', function t() {
	const tc = upper_n;

	// A is 3x2 col-major, B is 3x2 col-major, C is 3x3
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const B = new Float64Array( [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyr2k( 'upper', 'no-transpose', 3, 2, 2.0, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: lower_N', function t() {
	const tc = lower_n;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const B = new Float64Array( [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyr2k( 'lower', 'no-transpose', 3, 2, 2.0, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: upper_T', function t() {
	const tc = upper_t;

	// A is 2x3 col-major (K=2, N=3), B is 2x3 col-major
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const B = new Float64Array( [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyr2k( 'upper', 'transpose', 3, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: lower_T', function t() {
	const tc = lower_t;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const B = new Float64Array( [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyr2k( 'lower', 'transpose', 3, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: alpha_zero', function t() {
	const tc = alpha_zero;
	const A = new Float64Array( 6 );
	const B = new Float64Array( 6 );
	const C = new Float64Array( [ 2, 0, 0, 3, 4, 0, 5, 6, 7 ] );
	dsyr2k( 'upper', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, B, 1, 3, 0, 2.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: beta_zero', function t() {
	const tc = beta_zero;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const B = new Float64Array( [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 ] );
	const C = new Float64Array( [ 99, 0, 0, 0, 99, 0, 0, 0, 99 ] );
	dsyr2k( 'upper', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: n_zero', function t() {

	const A = new Float64Array( 1 );
	const B = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const result = dsyr2k( 'upper', 'no-transpose', 0, 2, 1.0, A, 1, 1, 0, B, 1, 1, 0, 1.0, C, 1, 1, 0 ); // eslint-disable-line max-len
	assert.ok( result === C );
});

test( 'dsyr2k: alpha_zero_beta_zero', function t() {
	const tc = alpha_zero_beta_zero;
	const A = new Float64Array( 6 );
	const B = new Float64Array( 6 );
	const C = new Float64Array( [ 5, 0, 0, 6, 7, 0, 8, 9, 10 ] );
	dsyr2k( 'upper', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: alpha_zero_beta_zero_lower', function t() {
	const tc = alpha_zero_beta_zero_lower;
	const A = new Float64Array( 6 );
	const B = new Float64Array( 6 );
	const C = new Float64Array( [ 5, 6, 7, 0, 8, 9, 0, 0, 10 ] );
	dsyr2k( 'lower', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: alpha_zero_beta_scale_upper', function t() {
	const tc = alpha_zero_beta_scale_upper;
	const A = new Float64Array( 6 );
	const B = new Float64Array( 6 );
	const C = new Float64Array( [ 2, 0, 0, 3, 4, 0, 5, 6, 7 ] );
	dsyr2k( 'upper', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, B, 1, 3, 0, 3.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: alpha_zero_beta_scale_lower', function t() {
	const tc = alpha_zero_beta_scale_lower;
	const A = new Float64Array( 6 );
	const B = new Float64Array( 6 );
	const C = new Float64Array( [ 2, 3, 5, 0, 4, 6, 0, 0, 7 ] );
	dsyr2k( 'lower', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, B, 1, 3, 0, 3.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: upper_N_beta_half', function t() {
	const tc = upper_n_beta_half;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const B = new Float64Array( [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyr2k( 'upper', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, B, 1, 3, 0, 0.5, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: lower_N_beta_zero', function t() {
	const tc = lower_n_beta_zero;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const B = new Float64Array( [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 ] );
	const C = new Float64Array( [ 99, 0, 0, 0, 99, 0, 0, 0, 99 ] );
	dsyr2k( 'lower', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: lower_N_beta_half', function t() {
	const tc = lower_n_beta_half;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const B = new Float64Array( [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyr2k( 'lower', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, B, 1, 3, 0, 0.5, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: k_zero_beta_scale', function t() {
	const tc = k_zero_beta_scale;
	const A = new Float64Array( 6 );
	const B = new Float64Array( 6 );
	const C = new Float64Array( [ 2, 0, 0, 3, 4, 0, 5, 6, 7 ] );
	dsyr2k( 'upper', 'no-transpose', 3, 0, 1.0, A, 1, 3, 0, B, 1, 3, 0, 2.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: upper_T_beta_zero', function t() {
	const tc = upper_t_beta_zero;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const B = new Float64Array( [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 ] );
	const C = new Float64Array( [ 99, 0, 0, 0, 99, 0, 0, 0, 99 ] );
	dsyr2k( 'upper', 'transpose', 3, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyr2k: lower_T_beta_zero', function t() {
	const tc = lower_t_beta_zero;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const B = new Float64Array( [ 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 ] );
	const C = new Float64Array( [ 99, 0, 0, 0, 99, 0, 0, 0, 99 ] );
	dsyr2k( 'lower', 'transpose', 3, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	const A = new Float64Array( 6 );
	const B = new Float64Array( 6 );
	const C = new Float64Array( 9 );
	assert.throws( function f() {
		ndarray( 'invalid', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid trans', function t() {
	const A = new Float64Array( 6 );
	const B = new Float64Array( 6 );
	const C = new Float64Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'invalid', 3, 2, 1.0, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	const A = new Float64Array( 6 );
	const B = new Float64Array( 6 );
	const C = new Float64Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', -1, 2, 1.0, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative K', function t() {
	const A = new Float64Array( 6 );
	const B = new Float64Array( 6 );
	const C = new Float64Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 3, -1, 1.0, A, 1, 3, 0, B, 1, 3, 0, 1.0, C, 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

// The tiled kernel has full 4x4 register tiles, a diagonal-straddling scalar
// fringe, and row/column remainder loops; N=9..12 with K=7 exercises all of
// them in both triangles, both transpose modes, both storage orders, and both
// the beta=0 and beta!=0 store paths.

/**
* Computes reference syr2k with plain loops (triangle only).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - transpose mode
* @param {NonNegativeInteger} N - order of C
* @param {NonNegativeInteger} K - reduction dimension
* @param {number} alpha - scalar
* @param {Float64Array} A - first input matrix
* @param {integer} sa1 - stride of first dimension of `A`
* @param {integer} sa2 - stride of second dimension of `A`
* @param {Float64Array} B - second input matrix
* @param {integer} sb1 - stride of first dimension of `B`
* @param {integer} sb2 - stride of second dimension of `B`
* @param {number} beta - scalar
* @param {Float64Array} C - output matrix (mutated)
* @param {integer} sc1 - stride of first dimension of `C`
* @param {integer} sc2 - stride of second dimension of `C`
* @returns {Float64Array} `C`
*/
function naiveSyr2k( uplo, trans, N, K, alpha, A, sa1, sa2, B, sb1, sb2, beta, C, sc1, sc2 ) { // eslint-disable-line max-params
	let sum, i0, i1, i, j, l;
	const ar = ( trans === 'no-transpose' ) ? sa1 : sa2;
	const ak = ( trans === 'no-transpose' ) ? sa2 : sa1;
	const br = ( trans === 'no-transpose' ) ? sb1 : sb2;
	const bk = ( trans === 'no-transpose' ) ? sb2 : sb1;
	for ( j = 0; j < N; j++ ) {
		i0 = ( uplo === 'upper' ) ? 0 : j;
		i1 = ( uplo === 'upper' ) ? j : N - 1;
		for ( i = i0; i <= i1; i++ ) {
			sum = 0.0;
			for ( l = 0; l < K; l++ ) {
				sum += A[ ( i * ar ) + ( l * ak ) ] * B[ ( j * br ) + ( l * bk ) ]; // eslint-disable-line max-len
				sum += B[ ( i * br ) + ( l * bk ) ] * A[ ( j * ar ) + ( l * ak ) ]; // eslint-disable-line max-len
			}
			C[ ( i * sc1 ) + ( j * sc2 ) ] = ( alpha * sum ) + ( beta * C[ ( i * sc1 ) + ( j * sc2 ) ] ); // eslint-disable-line max-len
		}
	}
	return C;
}

test( 'ndarray: tiled main loops + fringe + remainders (N=9..12, K=7, all uplo/trans, both layouts, beta=0 and beta!=0)', function t() {
	let expected, trans, beta, uplo, act, sa1, sa2, sc1, sc2, An, Bn, Cn, bt;
	let lt, tr, up, RA, SA, i, N;
	const K = 7;
	const betas = [ 0.0, 0.3 ];
	const uplos = [ 'upper', 'lower' ];
	const layouts = [ 'col', 'row' ];
	for ( N = 9; N <= 12; N++ ) {
		for ( up = 0; up < 2; up++ ) {
			for ( tr = 0; tr < 2; tr++ ) {
				for ( lt = 0; lt < 2; lt++ ) {
					for ( bt = 0; bt < 2; bt++ ) {
						uplo = uplos[ up ];
						beta = betas[ bt ];
						trans = ( tr === 0 ) ? 'no-transpose' : 'transpose';
						RA = ( tr === 0 ) ? N : K;
						SA = ( tr === 0 ) ? K : N;
						sa1 = ( lt === 0 ) ? 1 : SA;
						sa2 = ( lt === 0 ) ? RA : 1;
						sc1 = ( lt === 0 ) ? 1 : N;
						sc2 = ( lt === 0 ) ? N : 1;
						An = new Float64Array( N * K );
						Bn = new Float64Array( N * K );
						for ( i = 0; i < An.length; i++ ) {
							An[ i ] = Math.sin( i + 1.0 );
							Bn[ i ] = Math.cos( ( 2.0 * i ) + 1.0 );
						}
						Cn = new Float64Array( N * N );
						for ( i = 0; i < Cn.length; i++ ) {
							Cn[ i ] = Math.cos( i + 0.5 );
						}
						act = new Float64Array( Cn );
						expected = naiveSyr2k( uplo, trans, N, K, 0.7, An, sa1, sa2, Bn, sa1, sa2, beta, Cn, sc1, sc2 ); // eslint-disable-line max-len
						ndarray( uplo, trans, N, K, 0.7, An, sa1, sa2, 0, Bn, sa1, sa2, 0, beta, act, sc1, sc2, 0 ); // eslint-disable-line max-len
						assertArrayClose( toArray( act ), toArray( expected ), 1.0e-12, N + ' ' + uplo + ' ' + trans + ' ' + layouts[ lt ] + ' beta=' + beta ); // eslint-disable-line max-len
					}
				}
			}
		}
	}
});

test( 'ndarray: leaves `C` unchanged when `K` is zero and `beta` is one', function t() {
	let i;

	const A = new Float64Array( 6 );
	const B = new Float64Array( 6 );
	const act = new Float64Array( 9 );
	for ( i = 0; i < act.length; i++ ) {
		act[ i ] = i + 1.0;
	}
	const expected = new Float64Array( act );

	ndarray( 'upper', 'no-transpose', 3, 0, 1.0, A, 1, 3, 0, B, 1, 3, 0, 1.0, act, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( act ), toArray( expected ), 1.0e-15, 'K=0 beta=1' );
});
