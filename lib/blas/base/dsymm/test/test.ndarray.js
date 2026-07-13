/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsymm from './../lib/ndarray.js';

// FIXTURES //

import left_upper_basic from './fixtures/left_upper_basic.json' with { type: 'json' };
import left_lower_basic from './fixtures/left_lower_basic.json' with { type: 'json' };
import right_upper_basic from './fixtures/right_upper_basic.json' with { type: 'json' };
import right_lower_basic from './fixtures/right_lower_basic.json' with { type: 'json' };
import alpha_beta_scaling from './fixtures/alpha_beta_scaling.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import scalar from './fixtures/scalar.json' with { type: 'json' };
import beta_zero from './fixtures/beta_zero.json' with { type: 'json' };
import alpha_zero_beta_zero from './fixtures/alpha_zero_beta_zero.json' with { type: 'json' };
import left_lower_nonzero_beta from './fixtures/left_lower_nonzero_beta.json' with { type: 'json' };
import right_upper_nonzero_beta from './fixtures/right_upper_nonzero_beta.json' with { type: 'json' };

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

test( 'dsymm: left_upper_basic', function t() {
	var tc = left_upper_basic;

	// A is 3x3 symmetric (upper stored), col-major
	var A = new Float64Array([
		2.0,
		0.0,
		0.0, // col 1 (only A(1,1)=2 matters for upper)
		1.0,
		4.0,
		0.0, // col 2 (A(1,2)=1, A(2,2)=4)
		3.0,
		2.0,
		5.0  // col 3 (A(1,3)=3, A(2,3)=2, A(3,3)=5)
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0, // col 1
		4.0,
		5.0,
		6.0  // col 2
	]);
	var C = new Float64Array( 6 );

	dsymm( 'left', 'upper', 3, 2, 1.0, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: left_lower_basic', function t() {
	var tc = left_lower_basic;

	// Same symmetric matrix, lower stored
	var A = new Float64Array([
		2.0,
		1.0,
		3.0, // col 1 (A(1,1)=2, A(2,1)=1, A(3,1)=3)
		0.0,
		4.0,
		2.0, // col 2 (A(2,2)=4, A(3,2)=2)
		0.0,
		0.0,
		5.0  // col 3 (A(3,3)=5)
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	var C = new Float64Array( 6 );

	dsymm( 'left', 'lower', 3, 2, 1.0, A, 1, 3, 0, B, 1, 3, 0, 0.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: right_upper_basic', function t() {
	var tc = right_upper_basic;

	// A is 3x3 symmetric (upper), B is 2x3, C is 2x3
	var A = new Float64Array([
		2.0,
		0.0,
		0.0,
		1.0,
		4.0,
		0.0,
		3.0,
		2.0,
		5.0
	]);
	var B = new Float64Array([
		1.0,
		2.0, // col 1
		3.0,
		4.0, // col 2
		5.0,
		6.0  // col 3
	]);
	var C = new Float64Array( 6 );

	dsymm( 'right', 'upper', 2, 3, 1.0, A, 1, 3, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: right_lower_basic', function t() {
	var tc = right_lower_basic;
	var A = new Float64Array([
		2.0,
		1.0,
		3.0,
		0.0,
		4.0,
		2.0,
		0.0,
		0.0,
		5.0
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	var C = new Float64Array( 6 );

	dsymm( 'right', 'lower', 2, 3, 1.0, A, 1, 3, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: alpha_beta_scaling', function t() {
	var tc = alpha_beta_scaling;
	var A = new Float64Array([
		2.0,
		0.0,
		0.0,
		1.0,
		4.0,
		0.0,
		3.0,
		2.0,
		5.0
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	var C = new Float64Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0
	]);

	dsymm( 'left', 'upper', 3, 2, 2.0, A, 1, 3, 0, B, 1, 3, 0, 3.0, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: alpha_zero', function t() {
	var tc = alpha_zero;
	var A = new Float64Array( 9 );
	var B = new Float64Array( 4 );
	var C = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);

	dsymm( 'left', 'upper', 2, 2, 0.0, A, 1, 2, 0, B, 1, 2, 0, 2.0, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: m_zero', function t() {
	var tc = m_zero;
	var A = new Float64Array( 1 );
	var B = new Float64Array( 1 );
	var C = new Float64Array([ 99.0 ]);

	dsymm( 'left', 'upper', 0, 2, 1.0, A, 1, 1, 0, B, 1, 1, 0, 0.0, C, 1, 1, 0 );
	assertClose( C[ 0 ], tc.C1, 1e-14, 'C1' );
});

test( 'dsymm: n_zero', function t() {
	var tc = n_zero;
	var A = new Float64Array( 4 );
	var B = new Float64Array( 4 );
	var C = new Float64Array([ 99.0 ]);

	dsymm( 'left', 'upper', 2, 0, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 );
	assertClose( C[ 0 ], tc.C1, 1e-14, 'C1' );
});

test( 'dsymm: scalar', function t() {
	var tc = scalar;
	var A = new Float64Array([ 3.0 ]);
	var B = new Float64Array([ 5.0 ]);
	var C = new Float64Array( 1 );

	dsymm( 'left', 'upper', 1, 1, 2.0, A, 1, 1, 0, B, 1, 1, 0, 0.0, C, 1, 1, 0 );
	assertClose( C[ 0 ], tc.C1, 1e-14, 'C1' );
});

test( 'dsymm: beta_zero', function t() {
	var tc = beta_zero;

	// A = I (2x2), B = [2 4; 3 5]
	var A = new Float64Array([ 1.0, 0.0, 0.0, 1.0 ]);
	var B = new Float64Array([ 2.0, 3.0, 4.0, 5.0 ]);
	var C = new Float64Array([ 999.0, 999.0, 999.0, 999.0 ]);

	dsymm( 'left', 'lower', 2, 2, 1.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: alpha_zero_beta_zero (zeros C)', function t() {
	var tc = alpha_zero_beta_zero;
	var A = new Float64Array( 4 );
	var B = new Float64Array( 4 );
	var C = new Float64Array([ 99.0, 88.0, 77.0, 66.0 ]);

	dsymm( 'left', 'upper', 2, 2, 0.0, A, 1, 2, 0, B, 1, 2, 0, 0.0, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: left_lower_nonzero_beta', function t() {
	var tc = left_lower_nonzero_beta;
	var A = new Float64Array([
		2.0,
		1.0,
		3.0,
		0.0,
		4.0,
		2.0,
		0.0,
		0.0,
		5.0
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	var C = new Float64Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0
	]);

	dsymm( 'left', 'lower', 3, 2, 2.0, A, 1, 3, 0, B, 1, 3, 0, 0.5, C, 1, 3, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dsymm: right_upper_nonzero_beta', function t() {
	var tc = right_upper_nonzero_beta;
	var A = new Float64Array([
		2.0,
		0.0,
		0.0,
		1.0,
		4.0,
		0.0,
		3.0,
		2.0,
		5.0
	]);
	var B = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	var C = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);

	dsymm( 'right', 'upper', 2, 3, 1.0, A, 1, 3, 0, B, 1, 2, 0, 0.5, C, 1, 2, 0 );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

// The tiled kernel packs four rows of the symmetric operand at a time and
// runs 4x4 register tiles, so it is only reached at sizes above the tile and
// with a nonzero rectangular region. These cases exercise the packing helper,
// the full tiles, and the row/column remainders in every side x uplo x layout
// combination.

/**
* Computes a reference symmetric matrix-matrix product with plain loops.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} M - rows of C
* @param {NonNegativeInteger} N - columns of C
* @param {number} alpha - scalar
* @param {Float64Array} A - symmetric matrix (only `uplo` triangle stored)
* @param {integer} sa1 - stride of the first dimension of A
* @param {integer} sa2 - stride of the second dimension of A
* @param {Float64Array} B - input matrix
* @param {integer} sb1 - stride of the first dimension of B
* @param {integer} sb2 - stride of the second dimension of B
* @param {number} beta - scalar
* @param {Float64Array} C - input matrix
* @param {integer} sc1 - stride of the first dimension of C
* @param {integer} sc2 - stride of the second dimension of C
* @returns {Float64Array} result, in the same storage as C
*/
function naiveSymm( side, uplo, M, N, alpha, A, sa1, sa2, B, sb1, sb2, beta, C, sc1, sc2 ) { // eslint-disable-line max-params, max-len
	var out;
	var sum;
	var ka;
	var au;
	var i;
	var j;
	var l;

	/**
	* Returns the (r,c) entry of the symmetric operand, reflecting through the
	* stored triangle as needed.
	*
	* @private
	* @param {NonNegativeInteger} r - row index
	* @param {NonNegativeInteger} c - column index
	* @returns {number} entry
	*/
	function symA( r, c ) {
		au = ( uplo === 'upper' ) ? ( r <= c ) : ( r >= c );
		if ( au ) {
			return A[ ( r * sa1 ) + ( c * sa2 ) ];
		}
		return A[ ( c * sa1 ) + ( r * sa2 ) ];
	}

	out = new Float64Array( C );
	ka = ( side === 'left' ) ? M : N;
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( l = 0; l < ka; l++ ) {
				if ( side === 'left' ) {
					// C = alpha*A*B + beta*C
					sum += symA( i, l ) * B[ ( l * sb1 ) + ( j * sb2 ) ];
				} else {
					// C = alpha*B*A + beta*C
					sum += B[ ( i * sb1 ) + ( l * sb2 ) ] * symA( l, j );
				}
			}
			out[ ( i * sc1 ) + ( j * sc2 ) ] = ( alpha * sum ) + ( beta * C[ ( i * sc1 ) + ( j * sc2 ) ] );
		}
	}
	return out;
}

test( 'ndarray: tiled paths, all side x uplo x layout, tiles + remainders', function t() {
	var expected;
	var layout;
	var shape;
	var side;
	var uplo;
	var msg;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var ka;
	var M;
	var N;
	var A;
	var B;
	var C;
	var beta;
	var i;
	var s;
	var u;
	var w;
	var q;
	var z;
	var sides = [ 'left', 'right' ];
	var uplos = [ 'upper', 'lower' ];
	var layouts = [ 'col', 'row' ];

	// 12x12 gives whole tiles; 9x7 forces row and column remainders:
	var shapes = [ [ 12, 12 ], [ 9, 7 ] ];

	// beta = 0 and beta != 0 take different store paths in the tiled kernel:
	var betas = [ 0.0, 0.3 ];

	for ( s = 0; s < sides.length; s++ ) {
		for ( u = 0; u < uplos.length; u++ ) {
			for ( w = 0; w < layouts.length; w++ ) {
				for ( q = 0; q < shapes.length; q++ ) {
				  for ( z = 0; z < betas.length; z++ ) {
					beta = betas[ z ];
					side = sides[ s ];
					uplo = uplos[ u ];
					layout = layouts[ w ];
					shape = shapes[ q ];
					M = shape[ 0 ];
					N = shape[ 1 ];
					ka = ( side === 'left' ) ? M : N;

					sa1 = ( layout === 'col' ) ? 1 : ka;
					sa2 = ( layout === 'col' ) ? ka : 1;
					sb1 = ( layout === 'col' ) ? 1 : N;
					sb2 = ( layout === 'col' ) ? M : 1;
					sc1 = sb1;
					sc2 = sb2;

					A = new Float64Array( ka * ka );
					for ( i = 0; i < ka * ka; i++ ) {
						A[ i ] = Math.sin( i + 1.0 );
					}
					B = new Float64Array( M * N );
					for ( i = 0; i < M * N; i++ ) {
						B[ i ] = Math.cos( i + 0.5 );
					}
					C = new Float64Array( M * N );
					for ( i = 0; i < M * N; i++ ) {
						C[ i ] = 0.25 * Math.sin( ( 2.0 * i ) + 1.0 );
					}
					expected = naiveSymm( side, uplo, M, N, 0.7, A, sa1, sa2, B, sb1, sb2, beta, C, sc1, sc2 ); // eslint-disable-line max-len
					dsymm( side, uplo, M, N, 0.7, A, sa1, sa2, 0, B, sb1, sb2, 0, beta, C, sc1, sc2, 0 ); // eslint-disable-line max-len
					msg = side + '/' + uplo + '/' + layout + ' ' + M + 'x' + N + ' beta=' + beta; // eslint-disable-line max-len
					assertArrayClose( C, expected, 1.0e-12, msg );
				  }
				}
			}
		}
	}
});

test( 'ndarray: K-panel cache blocking (K > KC) and diagonal clamps', function t() {
	var expected;
	var uplo;
	var side;
	var msg;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var ka;
	var A;
	var B;
	var C;
	var M;
	var N;
	var i;
	var s;
	var u;
	var sides = [ 'left', 'right' ];
	var uplos = [ 'upper', 'lower' ];

	// The kernel blocks the K loop at KC = 256, so the symmetric operand must
	// exceed 256 for a second panel to exist; only then do the diagonal
	// clamps in the packing helper engage. Keep the other dimension small so
	// the naive reference stays cheap.
	for ( s = 0; s < sides.length; s++ ) {
		for ( u = 0; u < uplos.length; u++ ) {
			side = sides[ s ];
			uplo = uplos[ u ];
			M = ( side === 'left' ) ? 300 : 5;
			N = ( side === 'left' ) ? 5 : 300;
			ka = ( side === 'left' ) ? M : N;

			sa1 = 1;
			sa2 = ka;
			sb1 = 1;
			sb2 = M;

			A = new Float64Array( ka * ka );
			for ( i = 0; i < ka * ka; i++ ) {
				A[ i ] = Math.sin( i + 1.0 );
			}
			B = new Float64Array( M * N );
			for ( i = 0; i < M * N; i++ ) {
				B[ i ] = Math.cos( i + 0.5 );
			}
			C = new Float64Array( M * N );
			for ( i = 0; i < M * N; i++ ) {
				C[ i ] = 0.5;
			}
			expected = naiveSymm( side, uplo, M, N, 0.7, A, sa1, sa2, B, sb1, sb2, 0.3, C, sb1, sb2 ); // eslint-disable-line max-len
			dsymm( side, uplo, M, N, 0.7, A, sa1, sa2, 0, B, sb1, sb2, 0, 0.3, C, sb1, sb2, 0 ); // eslint-disable-line max-len
			msg = side + '/' + uplo + ' K=' + ka;
			assertArrayClose( C, expected, 1.0e-11, msg );
		}
	}
});
