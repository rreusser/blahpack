/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-depth, camelcase */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytrs from '../../zsytrs/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';


// MAIN //

/**
* Estimates the infinity norm condition number for a complex symmetric indefinite matrix with inverse-c scaling.
*
* Uses a `zlacn2` reverse communication loop with `zsytrs` solves to estimate
* `|| op(A) * inv(diag(C)) ||_inf * || (op(A) * inv(diag(C)))^{-1} ||_inf`.
*
* ## Notes
*
* -   `WORK` must have length at least `2*N` complex elements.
* -   `RWORK` must have length at least `N`.
* -   `A` and `AF` are `Complex128Array` views; `C` and `RWORK` are `Float64Array`.
* -   `A` is complex _symmetric_ (not Hermitian): mirror reads are NOT conjugated.
* -   When `capply` is `true`, `C` is applied as inverse scaling (`inv(diag(C))`); otherwise `C` is ignored.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, specifies which triangle of `A` is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - original N-by-N symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} AF - factored N-by-N matrix (from zsytrf)
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Int32Array} IPIV - pivot indices from zsytrf (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} c - real scaling vector of length `N`
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {boolean} capply - if `true`, apply inverse column scaling by `C`
* @param {Complex128Array} WORK - complex workspace of length at least `2*N`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Float64Array} RWORK - real workspace of length at least `N`
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {number} estimated reciprocal infinity-norm condition number
*/
function zla_syrcond_c( uplo, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, c, strideC, offsetC, capply, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len
	let ainvnm, anorm, tmp, ir, ic, i, j;

	if ( N === 0 ) {
		return 1.0;
	}

	const up = ( uplo === 'upper' );

	// Reinterpret complex arrays as Float64 views for element access
	const Av = reinterpret( A, 0 );
	const WORKv = reinterpret( WORK, 0 );

	// Double-based strides/offsets
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const sw = strideWork * 2;
	const oA = offsetA * 2;
	const oW = offsetWork * 2;

	// Compute the row-wise sum of CABS1 entries of the scaled matrix.

	// For symmetric A, the "mirror" half reads A(j,i) = A(i,j) with no conjugation.

	// RWORK[i] = sum_j CABS1( A_sym(i,j) ) [ / C(j) if capply ]
	anorm = 0.0;
	if ( up ) {
		for ( i = 0; i < N; i += 1 ) {
			tmp = 0.0;
			if ( capply ) {
				// j = 0..i: use A(j,i) (stored in upper triangle)
				for ( j = 0; j <= i; j += 1 ) {
					// CABS1( A(j,i) ) / C(j)
					tmp += ( Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) ] ) + Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) + 1 ] ) ) / c[ offsetC + ( j * strideC ) ];
				}
				// j = i+1..N-1: use A(i,j) (stored in upper triangle)
				for ( j = i + 1; j < N; j += 1 ) {
					// CABS1( A(i,j) ) / C(j)
					tmp += ( Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) ] ) + Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) + 1 ] ) ) / c[ offsetC + ( j * strideC ) ];
				}
			} else {
				for ( j = 0; j <= i; j += 1 ) {
					// CABS1( A(j,i) )
					tmp += Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) ] ) + Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) + 1 ] );
				}
				for ( j = i + 1; j < N; j += 1 ) {
					// CABS1( A(i,j) )
					tmp += Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) ] ) + Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) + 1 ] );
				}
			}
			RWORK[ offsetRWork + ( i * strideRWork ) ] = tmp;
			if ( tmp > anorm ) {
				anorm = tmp;
			}
		}
	} else {
		for ( i = 0; i < N; i += 1 ) {
			tmp = 0.0;
			if ( capply ) {
				// j = 0..i: use A(i,j) (stored in lower triangle)
				for ( j = 0; j <= i; j += 1 ) {
					// CABS1( A(i,j) ) / C(j)
					tmp += ( Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) ] ) + Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) + 1 ] ) ) / c[ offsetC + ( j * strideC ) ];
				}
				// j = i+1..N-1: use A(j,i) (stored in lower triangle)
				for ( j = i + 1; j < N; j += 1 ) {
					// CABS1( A(j,i) ) / C(j)
					tmp += ( Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) ] ) + Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) + 1 ] ) ) / c[ offsetC + ( j * strideC ) ];
				}
			} else {
				for ( j = 0; j <= i; j += 1 ) {
					// CABS1( A(i,j) )
					tmp += Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) ] ) + Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) + 1 ] );
				}
				for ( j = i + 1; j < N; j += 1 ) {
					// CABS1( A(j,i) )
					tmp += Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) ] ) + Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) + 1 ] );
				}
			}
			RWORK[ offsetRWork + ( i * strideRWork ) ] = tmp;
			if ( tmp > anorm ) {
				anorm = tmp;
			}
		}
	}

	// Quick return if zero
	if ( anorm === 0.0 ) {
		return 0.0;
	}

	// Estimate the norm of inv(op(A)) via zlacn2 reverse communication
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
			// Multiply by R: WORK(i) = WORK(i) * RWORK(i)
			ir = oW;
			for ( i = 0; i < N; i += 1 ) {
				WORKv[ ir ] *= RWORK[ offsetRWork + ( i * strideRWork ) ];
				WORKv[ ir + 1 ] *= RWORK[ offsetRWork + ( i * strideRWork ) ];
				ir += sw;
			}

			if ( up ) {
				zsytrs( 'upper', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				zsytrs( 'lower', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			// Multiply by inv(C) if requested: WORK(i) *= C(i)
			if ( capply ) {
				ir = oW;
				ic = offsetC;
				for ( i = 0; i < N; i += 1 ) {
					WORKv[ ir ] *= c[ ic ];
					WORKv[ ir + 1 ] *= c[ ic ];
					ir += sw;
					ic += strideC;
				}
			}
		} else {
			// KASE === 1: Multiply by inv(C), solve, multiply by R
			if ( capply ) {
				ir = oW;
				ic = offsetC;
				for ( i = 0; i < N; i += 1 ) {
					WORKv[ ir ] *= c[ ic ];
					WORKv[ ir + 1 ] *= c[ ic ];
					ir += sw;
					ic += strideC;
				}
			}

			if ( up ) {
				zsytrs( 'upper', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				zsytrs( 'lower', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			// Multiply by row norms: WORK(i) *= RWORK(i)
			ir = oW;
			for ( i = 0; i < N; i += 1 ) {
				WORKv[ ir ] *= RWORK[ offsetRWork + ( i * strideRWork ) ];
				WORKv[ ir + 1 ] *= RWORK[ offsetRWork + ( i * strideRWork ) ];
				ir += sw;
			}
		}
	}

	// Compute the reciprocal condition number
	if ( ainvnm !== 0.0 ) {
		return 1.0 / ainvnm;
	}
	return 0.0;
}


// EXPORTS //

export default zla_syrcond_c;
