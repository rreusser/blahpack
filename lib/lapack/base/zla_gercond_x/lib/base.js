/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, camelcase */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgetrs from '../../zgetrs/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

const cdivAt = cmplx.divAt;


// MAIN //

/**
* Estimates the infinity norm condition number of `op(A)*diag(X)` for a general complex matrix.
*
* Uses a dlacn2-style reverse communication loop (via zlacn2) to estimate the norm of the
* inverse of the scaled matrix, combined with the infinity norm of the scaled matrix itself.
*
* ## Notes
*
* -   `WORK` must have length at least `2*N` complex elements.
* -   `RWORK` must have length at least `N` double elements.
* -   `X` is a Complex128Array and is multiplied elementwise into the columns of `A`.
*
* @private
* @param {string} trans - specifies the operation type (`'no-transpose'` or `'conjugate-transpose'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - original N-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} AF - LU-factored N-by-N matrix (from zgetrf)
* @param {integer} strideAF1 - stride of the first dimension of `AF` (complex elements)
* @param {integer} strideAF2 - stride of the second dimension of `AF` (complex elements)
* @param {NonNegativeInteger} offsetAF - starting index for `AF` (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgetrf (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} x - scaling vector of length N
* @param {integer} strideX - stride length for `x` (complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (complex elements)
* @param {Complex128Array} WORK - workspace array of length at least `2*N`
* @param {integer} strideWork - stride length for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - real workspace array of length at least `N`
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {number} estimated reciprocal condition number
*/
function zla_gercond_x( trans, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, x, strideX, offsetX, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	let ainvnm, anorm, prodR, prodI, tmp, ajR, ajI, xjR, xjI, oa, ia, ix, iw;
	let ir, i, j;

	if ( N === 0 ) {
		return 1.0;
	}

	const notrans = ( trans === 'no-transpose' );

	const av = reinterpret( A, 0 );
	const xv = reinterpret( x, 0 );
	const wv = reinterpret( WORK, 0 );

	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const sx = strideX * 2;
	const sw = strideWork * 2;

	// Compute the row sums of |A * diag(X)| (or its transpose), placing them in RWORK

	// And tracking the infinity norm in `anorm`.
	anorm = 0.0;
	if ( notrans ) {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			oa = ( offsetA * 2 ) + ( i * sa1 );
			ix = offsetX * 2;
			for ( j = 0; j < N; j++ ) {
				ia = oa + ( j * sa2 );
				ajR = av[ ia ];
				ajI = av[ ia + 1 ];
				xjR = xv[ ix ];
				xjI = xv[ ix + 1 ];

				// |A(i,j) * X(j)| via CABS1 of the complex product
				prodR = ( ajR * xjR ) - ( ajI * xjI );
				prodI = ( ajR * xjI ) + ( ajI * xjR );
				tmp += Math.abs( prodR ) + Math.abs( prodI );
				ix += sx;
			}
			RWORK[ offsetRWork + ( i * strideRWork ) ] = tmp;
			if ( tmp > anorm ) {
				anorm = tmp;
			}
		}
	} else {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			oa = ( offsetA * 2 ) + ( i * sa2 );
			ix = offsetX * 2;
			for ( j = 0; j < N; j++ ) {
				ia = oa + ( j * sa1 );
				ajR = av[ ia ];
				ajI = av[ ia + 1 ];
				xjR = xv[ ix ];
				xjI = xv[ ix + 1 ];
				prodR = ( ajR * xjR ) - ( ajI * xjI );
				prodI = ( ajR * xjI ) + ( ajI * xjR );
				tmp += Math.abs( prodR ) + Math.abs( prodI );
				ix += sx;
			}
			RWORK[ offsetRWork + ( i * strideRWork ) ] = tmp;
			if ( tmp > anorm ) {
				anorm = tmp;
			}
		}
	}

	// Quick return if the scaled matrix is zero.
	if ( anorm === 0.0 ) {
		return 0.0;
	}

	// Estimate the norm of inv(op(A)*diag(X)) using zlacn2 reverse communication.
	ainvnm = 0.0;
	const KASE = new Int32Array( 1 );
	const EST = new Float64Array( 1 );
	const ISAVE = new Int32Array( 3 );

	while ( true ) { // eslint-disable-line no-constant-condition
		zlacn2( N, WORK, strideWork, offsetWork + ( N * strideWork ), WORK, strideWork, offsetWork, EST, KASE, ISAVE, 1, 0 );
		ainvnm = EST[ 0 ];

		if ( KASE[ 0 ] === 0 ) {
			break;
		}
		if ( KASE[ 0 ] === 2 ) {
			// Multiply by the row-sum vector RWORK (real).
			iw = offsetWork * 2;
			ir = offsetRWork;
			for ( i = 0; i < N; i++ ) {
				wv[ iw ] *= RWORK[ ir ];
				wv[ iw + 1 ] *= RWORK[ ir ];
				iw += sw;
				ir += strideRWork;
			}

			if ( notrans ) {
				zgetrs( 'no-transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				zgetrs( 'conjugate-transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			// Divide WORK by X (complex division).
			iw = offsetWork * 2;
			ix = offsetX * 2;
			for ( i = 0; i < N; i++ ) {
				cdivAt( wv, iw, wv, iw, xv, ix );
				iw += sw;
				ix += sx;
			}
		} else {
			// KASE === 1: divide WORK by X, solve (op^H), then multiply by RWORK.
			iw = offsetWork * 2;
			ix = offsetX * 2;
			for ( i = 0; i < N; i++ ) {
				cdivAt( wv, iw, wv, iw, xv, ix );
				iw += sw;
				ix += sx;
			}

			if ( notrans ) {
				zgetrs( 'conjugate-transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				zgetrs( 'no-transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			iw = offsetWork * 2;
			ir = offsetRWork;
			for ( i = 0; i < N; i++ ) {
				wv[ iw ] *= RWORK[ ir ];
				wv[ iw + 1 ] *= RWORK[ ir ];
				iw += sw;
				ir += strideRWork;
			}
		}
	}

	// Compute reciprocal condition number.
	if ( ainvnm !== 0.0 ) {
		return 1.0 / ainvnm;
	}
	return 0.0;
}


// EXPORTS //

export default zla_gercond_x;
