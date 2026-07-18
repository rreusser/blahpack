/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrsm from './../lib/ndarray.js';
const ndarray = dtrsm;

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

// TESTS //

// All matrices 2x2, stored column-major: strideX1=1, strideX2=2

test( 'dtrsm: left, upper, no-trans, non-unit', function t() {
	const tc = left_upper_n_n;

	// A = [2 3; 0 4] col-major: [2, 0, 3, 4]
	const A = new Float64Array( [ 2, 0, 3, 4 ] );
	const B = new Float64Array( [ 8, 4, 10, 12 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'left_upper_n_n' );
});

test( 'dtrsm: left, lower, no-trans, non-unit', function t() {
	const tc = left_lower_n_n;

	// A = [3 0; 2 5] col-major: [3, 2, 0, 5]
	const A = new Float64Array( [ 3, 2, 0, 5 ] );
	const B = new Float64Array( [ 6, 14, 9, 25 ] );
	dtrsm( 'left', 'lower', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'left_lower_n_n' );
});

test( 'dtrsm: right, upper, no-trans, non-unit', function t() {
	const tc = right_upper_n_n;
	const A = new Float64Array( [ 2, 0, 3, 4 ] );
	const B = new Float64Array( [ 4, 6, 11, 15 ] );
	dtrsm( 'right', 'upper', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'right_upper_n_n' );
});

test( 'dtrsm: unit diagonal', function t() {
	const tc = unit_diag;

	// A stored as [99, 0, 3, 99] but diag = 'unit' ignores diagonal
	const A = new Float64Array( [ 99, 0, 3, 99 ] );
	const B = new Float64Array( [ 7, 1, 10, 2 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'unit_diag' );
});

test( 'dtrsm: alpha scaling', function t() {
	const tc = alpha_scale;
	const A = new Float64Array( [ 2, 0, 3, 4 ] );
	const B = new Float64Array( [ 8, 4, 10, 12 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'alpha_scale' );
});

test( 'dtrsm: alpha=0 zeros B', function t() {
	const tc = alpha_zero;
	const A = new Float64Array( [ 2, 0, 3, 4 ] );
	const B = new Float64Array( [ 5, 6, 7, 8 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, 0.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'alpha_zero' );
});

test( 'dtrsm: left, upper, transpose, non-unit', function t() {
	const tc = left_upper_t_n;
	const A = new Float64Array( [ 2, 0, 3, 4 ] );
	const B = new Float64Array( [ 4, 11, 2, 14 ] );
	dtrsm( 'left', 'upper', 'transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'left_upper_t_n' );
});

test( 'dtrsm: left, lower, transpose, non-unit', function t() {
	const tc = left_lower_t_n;
	const A = new Float64Array( [ 3, 2, 0, 5 ] );
	const B = new Float64Array( [ 9, 10, 15, 19 ] );
	dtrsm( 'left', 'lower', 'transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'left_lower_t_n' );
});

test( 'dtrsm: right, lower, no-trans, non-unit', function t() {
	const tc = right_lower_n_n;
	const A = new Float64Array( [ 3, 2, 0, 5 ] );
	const B = new Float64Array( [ 3, 6, 10, 22 ] );
	dtrsm( 'right', 'lower', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'right_lower_n_n' );
});

test( 'dtrsm: right, upper, transpose, non-unit', function t() {
	const tc = right_upper_t_n;
	const A = new Float64Array( [ 2, 0, 3, 4 ] );
	const B = new Float64Array( [ 4, 6, 14, 22 ] );
	dtrsm( 'right', 'upper', 'transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'right_upper_t_n' );
});

test( 'dtrsm: right, lower, transpose, non-unit', function t() {
	const tc = right_lower_t_n;
	const A = new Float64Array( [ 3, 2, 0, 5 ] );
	const B = new Float64Array( [ 6, 9, 10, 25 ] );
	dtrsm( 'right', 'lower', 'transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( B, tc.B, 1e-14, 'right_lower_t_n' );
});

test( 'dtrsm: M=0 quick return', function t() {
	const B = new Float64Array( [ 99 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', 0, 2, 1.0, new Float64Array( 4 ), 1, 1, 0, B, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( B[ 0 ], 99 );
});

test( 'dtrsm: N=0 quick return', function t() {
	const B = new Float64Array( [ 99 ] );
	dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', 2, 0, 1.0, new Float64Array( 4 ), 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assert.strictEqual( B[ 0 ], 99 );
});

test( 'dtrsm: left, lower, no-trans with alpha=2', function t() {
	// Covers the alpha !== 1.0 branch in Left, Lower, No-transpose
	const A = new Float64Array( [ 3, 2, 0, 5 ] );
	const B = new Float64Array( [ 6, 14, 9, 25 ] );

	// We can verify by comparing: solve A*X = 2*B
	dtrsm( 'left', 'lower', 'no-transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	// Row 1: 3*x11 = 2*6=12 => x11=4; 3*x12=2*9=18 => x12=6
	// Row 2: 2*4+5*x21=2*14=28 => x21=(28-8)/5=4; 2*6+5*x22=2*25=50 => x22=(50-12)/5=7.6 // eslint-disable-line max-len
	assertClose( B[ 0 ], 4.0, 1e-14, 'B[0]' );
	assertClose( B[ 1 ], 4.0, 1e-14, 'B[1]' );
});

test( 'dtrsm: right, upper, no-trans with alpha=2', function t() {
	// Covers the alpha !== 1.0 branch in Right, Upper, No-transpose
	const A = new Float64Array( [ 2, 0, 3, 4 ] );
	const B = new Float64Array( [ 4, 6, 11, 15 ] );
	dtrsm( 'right', 'upper', 'no-transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len

	// Solve X*A = 2*B
	assertClose( B[ 0 ], 4.0, 1e-14, 'B[0]' );
	assertClose( B[ 1 ], 6.0, 1e-14, 'B[1]' );
});

test( 'dtrsm: right, lower, no-trans with alpha=2', function t() {
	// Covers the alpha !== 1.0 branch in Right, Lower, No-transpose
	const A = new Float64Array( [ 3, 2, 0, 5 ] );
	const B = new Float64Array( [ 3, 6, 10, 22 ] );
	dtrsm( 'right', 'lower', 'no-transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len

	// Non-trivial result, just verify it's different from alpha=1
	assert.ok( B[ 0 ] !== 3.0, 'B should be modified' );
});

test( 'dtrsm: right, upper, transpose with alpha=2', function t() {
	// Covers the alpha !== 1.0 branch in Right, Upper, Transpose
	const A = new Float64Array( [ 2, 0, 3, 4 ] );
	const B = new Float64Array( [ 4, 6, 14, 22 ] );
	dtrsm( 'right', 'upper', 'transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assert.ok( B[ 0 ] !== 4.0, 'B should be modified' );
});

test( 'dtrsm: right, lower, transpose with alpha=2', function t() {
	// Covers the alpha !== 1.0 branch in Right, Lower, Transpose
	const A = new Float64Array( [ 3, 2, 0, 5 ] );
	const B = new Float64Array( [ 6, 9, 10, 25 ] );
	dtrsm( 'right', 'lower', 'transpose', 'non-unit', 2, 2, 2.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	assert.ok( B[ 0 ] !== 6.0, 'B should be modified' );
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid side', function t() {
	const A = new Float64Array( 4 );
	const B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'invalid', 'upper', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	const A = new Float64Array( 4 );
	const B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'left', 'invalid', 'no-transpose', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid transa', function t() {
	const A = new Float64Array( 4 );
	const B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'invalid', 'non-unit', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid diag', function t() {
	const A = new Float64Array( 4 );
	const B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'invalid', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative M', function t() {
	const A = new Float64Array( 4 );
	const B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'non-unit', -1, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	const A = new Float64Array( 4 );
	const B = new Float64Array( 4 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 2, -1, 1.0, A, 1, 2, 0, B, 1, 2, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

/**
* Naive triangular solve by direct substitution (reference for the blocked kernel).
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} transa - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {number} alpha - scalar multiplier
* @param {Float64Array} A - triangular matrix
* @param {integer} sa1 - stride of first dimension of A
* @param {integer} sa2 - stride of second dimension of A
* @param {Float64Array} B - input/output matrix (mutated)
* @param {integer} sb1 - stride of first dimension of B
* @param {integer} sb2 - stride of second dimension of B
* @returns {Float64Array} `B`
*/
function naiveTrsm( side, uplo, transa, diag, M, N, alpha, A, sa1, sa2, B, sb1, sb2 ) {
	let temp, ii, jj, k0, k1, i, j, k;

	const nounit = ( diag === 'non-unit' );

	// Effective strides so that op(A)[r][c] = A[ (r*ra1) + (c*ra2) ]:
	const ra1 = ( transa === 'no-transpose' ) ? sa1 : sa2;
	const ra2 = ( transa === 'no-transpose' ) ? sa2 : sa1;

	// Whether op(A) is effectively upper triangular:
	const eupper = ( transa === 'no-transpose' ) ? ( uplo === 'upper' ) : ( uplo !== 'upper' );

	if ( side === 'left' ) {
		// Solve op(A)*X = alpha*B (backward if upper, forward if lower):
		for ( ii = 0; ii < M; ii++ ) {
			i = ( eupper ) ? M - 1 - ii : ii;
			k0 = ( eupper ) ? i + 1 : 0;
			k1 = ( eupper ) ? M : i;
			for ( j = 0; j < N; j++ ) {
				temp = alpha * B[ ( i * sb1 ) + ( j * sb2 ) ];
				for ( k = k0; k < k1; k++ ) {
					temp -= A[ ( i * ra1 ) + ( k * ra2 ) ] * B[ ( k * sb1 ) + ( j * sb2 ) ]; // eslint-disable-line max-len
				}
				if ( nounit ) {
					temp /= A[ ( i * ra1 ) + ( i * ra2 ) ];
				}
				B[ ( i * sb1 ) + ( j * sb2 ) ] = temp;
			}
		}
		return B;
	}
	// Solve X*op(A) = alpha*B (columns forward if upper, backward if lower):
	for ( jj = 0; jj < N; jj++ ) {
		j = ( eupper ) ? jj : N - 1 - jj;
		k0 = ( eupper ) ? 0 : j + 1;
		k1 = ( eupper ) ? j : N;
		for ( i = 0; i < M; i++ ) {
			temp = alpha * B[ ( i * sb1 ) + ( j * sb2 ) ];
			for ( k = k0; k < k1; k++ ) {
				temp -= B[ ( i * sb1 ) + ( k * sb2 ) ] * A[ ( k * ra1 ) + ( j * ra2 ) ]; // eslint-disable-line max-len
			}
			if ( nounit ) {
				temp /= A[ ( j * ra1 ) + ( j * ra2 ) ];
			}
			B[ ( i * sb1 ) + ( j * sb2 ) ] = temp;
		}
	}
	return B;
}

test( 'ndarray: blocked kernel (4x4 tiles + remainder rows/cols) matches naive substitution', function t() {
	let expected, stored, transa, actual, diag, side, uplo, sa1, sa2, sb1, sb2;
	let tc, kk, M, N, A, B, i, j;

	const cases = [
		// [ side, uplo, transa, diag, M, N, layout ]
		[ 'left', 'upper', 'no-transpose', 'non-unit', 12, 12, 'col' ],
		[ 'left', 'lower', 'no-transpose', 'unit', 12, 12, 'row' ],
		[ 'left', 'upper', 'transpose', 'unit', 9, 7, 'col' ],
		[ 'left', 'lower', 'transpose', 'non-unit', 9, 7, 'row' ],
		[ 'right', 'upper', 'no-transpose', 'non-unit', 9, 7, 'col' ],
		[ 'right', 'lower', 'transpose', 'unit', 12, 12, 'row' ],
		[ 'right', 'upper', 'transpose', 'non-unit', 7, 9, 'col' ],
		[ 'right', 'lower', 'no-transpose', 'unit', 9, 7, 'col' ]
	];
	for ( tc = 0; tc < cases.length; tc++ ) {
		side = cases[ tc ][ 0 ];
		uplo = cases[ tc ][ 1 ];
		transa = cases[ tc ][ 2 ];
		diag = cases[ tc ][ 3 ];
		M = cases[ tc ][ 4 ];
		N = cases[ tc ][ 5 ];
		kk = ( side === 'left' ) ? M : N;
		sa1 = ( cases[ tc ][ 6 ] === 'col' ) ? 1 : kk;
		sa2 = ( cases[ tc ][ 6 ] === 'col' ) ? kk : 1;
		sb1 = ( cases[ tc ][ 6 ] === 'col' ) ? 1 : N;
		sb2 = ( cases[ tc ][ 6 ] === 'col' ) ? M : 1;

		// Well-conditioned triangular A; the unstored triangle (and the
		// diagonal when diag='unit') is poisoned so any forbidden read is
		// caught by the tolerance check:
		A = new Float64Array( kk * kk );
		for ( i = 0; i < kk; i++ ) {
			for ( j = 0; j < kk; j++ ) {
				stored = ( uplo === 'upper' ) ? ( j >= i ) : ( j <= i );
				if ( !stored ) {
					A[ ( i * sa1 ) + ( j * sa2 ) ] = 1.0e60;
				} else if ( i === j ) {
					A[ ( i * sa1 ) + ( j * sa2 ) ] = ( diag === 'unit' ) ? -3.0e60 : 1.5 + ( 0.05 * Math.cos( i ) ); // eslint-disable-line max-len
				} else {
					A[ ( i * sa1 ) + ( j * sa2 ) ] = 0.05 * Math.sin( ( i * 7.0 ) + ( j * 3.0 ) + 1.0 ); // eslint-disable-line max-len
				}
			}
		}
		B = new Float64Array( M * N );
		for ( i = 0; i < M * N; i++ ) {
			B[ i ] = Math.cos( ( 3.0 * i ) + 0.5 );
		}
		expected = naiveTrsm( side, uplo, transa, diag, M, N, 0.7, A, sa1, sa2, new Float64Array( B ), sb1, sb2 ); // eslint-disable-line max-len
		actual = ndarray( side, uplo, transa, diag, M, N, 0.7, A, sa1, sa2, 0, B, sb1, sb2, 0 ); // eslint-disable-line max-len
		assertArrayClose( actual, expected, 1.0e-10, 'case ' + tc + ' (' + side + ', ' + uplo + ', ' + transa + ', ' + diag + ', ' + cases[ tc ][ 6 ] + ')' ); // eslint-disable-line max-len
	}
});
