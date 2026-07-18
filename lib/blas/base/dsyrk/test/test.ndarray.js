/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyrk from './../lib/ndarray.js';
const ndarray = dsyrk;

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

test( 'dsyrk: upper_N', function t() {
	const tc = upper_n;

	// A is 3x2 col-major, C is 3x3
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyrk( 'upper', 'no-transpose', 3, 2, 2.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: lower_N', function t() {
	const tc = lower_n;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyrk( 'lower', 'no-transpose', 3, 2, 2.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: upper_T', function t() {
	const tc = upper_t;

	// A is 2x3 col-major, C is 3x3
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyrk( 'upper', 'transpose', 3, 2, 2.0, A, 1, 2, 0, 1.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: lower_T', function t() {
	const tc = lower_t;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyrk( 'lower', 'transpose', 3, 2, 2.0, A, 1, 2, 0, 1.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: alpha_zero', function t() {
	const tc = alpha_zero;
	const A = new Float64Array( 6 );
	const C = new Float64Array( [ 2, 0, 0, 3, 4, 0, 5, 6, 7 ] );
	dsyrk( 'upper', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, 2.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: beta_zero', function t() {
	const tc = beta_zero;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const C = new Float64Array( [ 99, 0, 0, 0, 99, 0, 0, 0, 99 ] );
	dsyrk( 'upper', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: n_zero', function t() {

	const A = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const result = dsyrk( 'upper', 'no-transpose', 0, 2, 1.0, A, 1, 1, 0, 1.0, C, 1, 1, 0 ); // eslint-disable-line max-len
	assert.ok( result === C );
});

test( 'dsyrk: alpha_zero_beta_zero', function t() {
	const tc = alpha_zero_beta_zero;
	const A = new Float64Array( 6 );
	const C = new Float64Array( [ 5, 0, 0, 6, 7, 0, 8, 9, 10 ] );
	dsyrk( 'upper', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: alpha_zero_beta_zero_lower', function t() {
	const tc = alpha_zero_beta_zero_lower;
	const A = new Float64Array( 6 );
	const C = new Float64Array( [ 5, 6, 7, 0, 8, 9, 0, 0, 10 ] );
	dsyrk( 'lower', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: alpha_zero_beta_scale_upper', function t() {
	const tc = alpha_zero_beta_scale_upper;
	const A = new Float64Array( 6 );
	const C = new Float64Array( [ 2, 0, 0, 3, 4, 0, 5, 6, 7 ] );
	dsyrk( 'upper', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, 3.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: alpha_zero_beta_scale_lower', function t() {
	const tc = alpha_zero_beta_scale_lower;
	const A = new Float64Array( 6 );
	const C = new Float64Array( [ 2, 3, 5, 0, 4, 6, 0, 0, 7 ] );
	dsyrk( 'lower', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, 3.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: upper_N_beta_half', function t() {
	const tc = upper_n_beta_half;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyrk( 'upper', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 0.5, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: lower_N_beta_zero', function t() {
	const tc = lower_n_beta_zero;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const C = new Float64Array( [ 99, 0, 0, 0, 99, 0, 0, 0, 99 ] );
	dsyrk( 'lower', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: lower_N_beta_half', function t() {
	const tc = lower_n_beta_half;
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const C = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	dsyrk( 'lower', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 0.5, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dsyrk: upper_T_beta_zero', function t() {
	// Trans = 'transpose', uplo = 'upper', beta=0 to exercise line 167
	// A is 2x3 col-major (K=2, N=3), C is 3x3
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const C = new Float64Array( [ 99, 0, 0, 0, 99, 0, 0, 0, 99 ] );
	dsyrk( 'upper', 'transpose', 3, 2, 1.0, A, 1, 2, 0, 0.0, C, 1, 3, 0 );

	// C = alpha * A^T * A, upper only

	// A^T = [1 2; 3 4; 5 6], A = [1 3 5; 2 4 6] (col-major with stride 2)

	// C[0,0]=1*1+2*2=5, C[0,1]=1*3+2*4=11, C[0,2]=1*5+2*6=17

	// C[1,1]=3*3+4*4=25, C[1,2]=3*5+4*6=39, C[2,2]=5*5+6*6=61
	assertArrayClose( toArray( C ), [ 5, 0, 0, 11, 25, 0, 17, 39, 61 ], 1e-14, 'c' ); // eslint-disable-line max-len
});

test( 'dsyrk: lower_T_beta_zero', function t() {
	// Trans = 'transpose', uplo = 'lower', beta=0 to exercise line 181
	const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const C = new Float64Array( [ 99, 0, 0, 0, 99, 0, 0, 0, 99 ] );
	dsyrk( 'lower', 'transpose', 3, 2, 1.0, A, 1, 2, 0, 0.0, C, 1, 3, 0 );

	// Same result as upper but in lower triangle
	assertArrayClose( toArray( C ), [ 5, 11, 17, 0, 25, 39, 0, 0, 61 ], 1e-14, 'c' ); // eslint-disable-line max-len
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	const A = new Float64Array( 6 );
	const C = new Float64Array( 9 );
	assert.throws( function f() {
		ndarray( 'invalid', 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid trans', function t() {
	const A = new Float64Array( 6 );
	const C = new Float64Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'invalid', 3, 2, 1.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	const A = new Float64Array( 6 );
	const C = new Float64Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', -1, 2, 1.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative K', function t() {
	const A = new Float64Array( 6 );
	const C = new Float64Array( 9 );
	assert.throws( function f() {
		ndarray( 'upper', 'no-transpose', 3, -1, 1.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	}, RangeError );
});

test( 'dsyrk: alpha_zero_beta_one is a no-op', function t() {
	const A = new Float64Array( 6 );
	const C = new Float64Array( [ 2, 3, 5, 7, 11, 13, 17, 19, 23 ] );
	dsyrk( 'upper', 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, 1.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), [ 2, 3, 5, 7, 11, 13, 17, 19, 23 ], 1e-14, 'c' ); // eslint-disable-line max-len
});

test( 'dsyrk: k_zero_beta_scale scales the triangle only', function t() {
	const A = new Float64Array( 1 );
	const C = new Float64Array( [ 2, 3, 5, 7, 11, 13, 17, 19, 23 ] );
	dsyrk( 'upper', 'no-transpose', 3, 0, 1.0, A, 1, 3, 0, 2.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), [ 4, 3, 5, 14, 22, 13, 34, 38, 46 ], 1e-14, 'c' ); // eslint-disable-line max-len
});

// The tiled kernel has full 4x4 register tiles, a diagonal-straddling scalar
// fringe, and row/column remainder loops; N=9..12 with K=7 exercises all of
// them in both triangles, both transpose modes, and both storage orders.

/**
* Computes reference syrk with plain loops (triangle only).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - transpose mode
* @param {NonNegativeInteger} N - order of C
* @param {NonNegativeInteger} K - reduction dimension
* @param {number} alpha - scalar
* @param {Float64Array} A - input matrix
* @param {integer} sa1 - stride of first dimension
* @param {integer} sa2 - stride of second dimension
* @param {number} beta - scalar
* @param {Float64Array} C - output matrix (mutated)
* @param {integer} sc1 - stride of first dimension
* @param {integer} sc2 - stride of second dimension
* @returns {Float64Array} `C`
*/
function naiveSyrk( uplo, trans, N, K, alpha, A, sa1, sa2, beta, C, sc1, sc2 ) { // eslint-disable-line max-params
	let sum, i0, i1, i, j, l;
	const ar = ( trans === 'no-transpose' ) ? sa1 : sa2;
	const ak = ( trans === 'no-transpose' ) ? sa2 : sa1;
	for ( j = 0; j < N; j++ ) {
		i0 = ( uplo === 'upper' ) ? 0 : j;
		i1 = ( uplo === 'upper' ) ? j : N - 1;
		for ( i = i0; i <= i1; i++ ) {
			sum = 0.0;
			for ( l = 0; l < K; l++ ) {
				sum += A[ ( i * ar ) + ( l * ak ) ] * A[ ( j * ar ) + ( l * ak ) ];
			}
			C[ ( i * sc1 ) + ( j * sc2 ) ] = ( alpha * sum ) + ( beta * C[ ( i * sc1 ) + ( j * sc2 ) ] );
		}
	}
	return C;
}

test( 'dsyrk: tiled main loops + fringe + remainders (N=9..12, K=7, all uplo/trans, both layouts)', function t() {
	let expected, trans, uplo, act, sa1, sa2, sc1, sc2, An, Cn, lt, tr, up, RA;
	let SA, i, N;
	const K = 7;
	const uplos = [ 'upper', 'lower' ];
	const layouts = [ 'col', 'row' ];
	for ( N = 9; N <= 12; N++ ) {
		for ( up = 0; up < 2; up++ ) {
			for ( tr = 0; tr < 2; tr++ ) {
				for ( lt = 0; lt < 2; lt++ ) {
					uplo = uplos[ up ];
					trans = ( tr === 0 ) ? 'no-transpose' : 'transpose';
					RA = ( tr === 0 ) ? N : K;
					SA = ( tr === 0 ) ? K : N;
					sa1 = ( lt === 0 ) ? 1 : SA;
					sa2 = ( lt === 0 ) ? RA : 1;
					sc1 = ( lt === 0 ) ? 1 : N;
					sc2 = ( lt === 0 ) ? N : 1;
					An = new Float64Array( N * K );
					for ( i = 0; i < An.length; i++ ) {
						An[ i ] = Math.sin( i + 1.0 );
					}
					Cn = new Float64Array( N * N );
					for ( i = 0; i < Cn.length; i++ ) {
						Cn[ i ] = Math.cos( i + 0.5 );
					}
					act = new Float64Array( Cn );
					expected = naiveSyrk( uplo, trans, N, K, 0.7, An, sa1, sa2, 0.3, Cn, sc1, sc2 );
					ndarray( uplo, trans, N, K, 0.7, An, sa1, sa2, 0, 0.3, act, sc1, sc2, 0 );
					assertArrayClose( toArray( act ), toArray( expected ), 1.0e-12, 'N=' + N + ' ' + uplo + ' ' + trans + ' ' + layouts[ lt ] );
				}
			}
		}
	}
});
