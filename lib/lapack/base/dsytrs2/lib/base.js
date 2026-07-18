/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import dsyconv from '../../dsyconv/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';


// MAIN //

/**
* Solves a system of linear equations A_X = B with a real symmetric matrix A.
_ using the factorization A = U_D_U^T or A = L_D*L^T computed by dsytrf,
* employing BLAS-3 triangular solves (dtrsm) after converting the factorization
* via dsyconv.
*
* ## Algorithm
*
* 1. Convert factorization: dsyconv extracts off-diagonal of D into WORK,
*    zeros them in A, and permutes the triangular factor.
* 2. Apply row permutations to B.
* 3. Triangular solve: L\B or U\B via dtrsm.
* 4. Back-substitute with block diagonal D.
* 5. Second triangular solve: L^T\B or U^T\B via dtrsm.
* 6. Undo row permutations on B.
* 7. Revert factorization: dsyconv restores A to its original form.
*
* ## Notes
*
* -   IPIV uses 0-based convention: `IPIV[k] >= 0` means 1x1 pivot with
*     0-based interchange index; `IPIV[k] < 0` means 2x2 pivot with
*     `~IPIV[k]` giving the 0-based interchange index.
* -   WORK must have length >= N. It is used to communicate off-diagonal
*     elements of D between dsyconv and the back-substitution step.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'` (single char)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side vectors
* @param {Float64Array} A - factored matrix from dsytrf (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Int32Array} IPIV - pivot indices from dsytrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Float64Array} B - input/output right-hand side / solution matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} WORK - workspace array of length >= N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 on success
*/
function dsytrs2( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ) {
	let denom, akm1k, akm1, bkm1, ak, bk, kp, k, i, j;

	const upper = ( uplo === 'upper' );

	// Quick return
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	const sa1 = strideA1;
	const sa2 = strideA2;
	const sb1 = strideB1;
	const sb2 = strideB2;
	const sw = strideWork;

	// Step 1: Convert factorization. dsyconv extracts off-diagonal elements

	// Of D into WORK and permutes the triangular factor rows/columns.
	dsyconv( uplo, 'convert', N, A, sa1, sa2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, sw, offsetWork );

	if ( upper ) {
		// ============================================================
		// UPPER: A = U * D * U^T
		// ============================================================

		// Step 2: Apply row permutations to B (backward: K = N-1 down to 0)
		k = N - 1;
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + ( k * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot: swap rows k and kp
				kp = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + ( k * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				k -= 1;
			} else {
				// 2x2 pivot: swap rows k-1 and kp
				kp = ~IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( kp === ( ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] ) ) {
					dswap( nrhs, B, sb2, offsetB + ( ( k - 1 ) * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				k -= 2;
			}
		}

		// Step 3: Solve U*X = B (unit diagonal, since D is factored out)
		dtrsm( 'left', 'upper', 'no-transpose', 'unit', N, nrhs, 1.0, A, sa1, sa2, offsetA, B, sb1, sb2, offsetB );

		// Step 4: Back-substitution with block diagonal D
		i = N - 1;
		while ( i >= 0 ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot: scale row i by 1/D(i,i)
				dscal( nrhs, 1.0 / A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ], B, sb2, offsetB + ( i * sb1 ) );
			} else if ( i > 0 ) {
				// 2x2 pivot block: check that IPIV[i-1] == IPIV[i] (same block)
				if ( IPIV[ offsetIPIV + ( ( i - 1 ) * strideIPIV ) ] === IPIV[ offsetIPIV + ( i * strideIPIV ) ] ) {
					// Off-diagonal element of D stored in WORK by dsyconv
					akm1k = WORK[ offsetWork + ( i * sw ) ];
					akm1 = A[ offsetA + ( ( i - 1 ) * sa1 ) + ( ( i - 1 ) * sa2 ) ] / akm1k;
					ak = A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ] / akm1k;
					denom = ( akm1 * ak ) - 1.0;
					for ( j = 0; j < nrhs; j++ ) {
						bkm1 = B[ offsetB + ( ( i - 1 ) * sb1 ) + ( j * sb2 ) ] / akm1k;
						bk = B[ offsetB + ( i * sb1 ) + ( j * sb2 ) ] / akm1k;
						B[ offsetB + ( ( i - 1 ) * sb1 ) + ( j * sb2 ) ] = ( ( ak * bkm1 ) - bk ) / denom;
						B[ offsetB + ( i * sb1 ) + ( j * sb2 ) ] = ( ( akm1 * bk ) - bkm1 ) / denom;
					}
					i -= 1;
				}
			}
			i -= 1;
		}

		// Step 5: Solve U^T * X = B
		dtrsm( 'left', 'upper', 'transpose', 'unit', N, nrhs, 1.0, A, sa1, sa2, offsetA, B, sb1, sb2, offsetB );

		// Step 6: Undo row permutations (forward: K = 0 up to N-1)
		k = 0;
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + ( k * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot
				kp = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + ( k * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				k += 1;
			} else {
				// 2x2 pivot
				kp = ~IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( k < N - 1 && kp === ( ~IPIV[ offsetIPIV + ( ( k + 1 ) * strideIPIV ) ] ) ) {
					dswap( nrhs, B, sb2, offsetB + ( k * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				k += 2;
			}
		}
	} else {
		// ============================================================
		// LOWER: A = L * D * L^T
		// ============================================================

		// Step 2: Apply row permutations to B (forward: K = 0 up to N-1)
		k = 0;
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + ( k * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot: swap rows k and kp
				kp = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + ( k * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				k += 1;
			} else {
				// 2x2 pivot: swap rows k+1 and kp
				kp = ~IPIV[ offsetIPIV + ( ( k + 1 ) * strideIPIV ) ];
				if ( kp === ( ~IPIV[ offsetIPIV + ( k * strideIPIV ) ] ) ) {
					dswap( nrhs, B, sb2, offsetB + ( ( k + 1 ) * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				k += 2;
			}
		}

		// Step 3: Solve L*X = B (unit diagonal)
		dtrsm( 'left', 'lower', 'no-transpose', 'unit', N, nrhs, 1.0, A, sa1, sa2, offsetA, B, sb1, sb2, offsetB );

		// Step 4: Back-substitution with block diagonal D
		i = 0;
		while ( i < N ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot: scale row i by 1/D(i,i)
				dscal( nrhs, 1.0 / A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ], B, sb2, offsetB + ( i * sb1 ) );
			} else {
				// 2x2 pivot block
				akm1k = WORK[ offsetWork + ( i * sw ) ];
				akm1 = A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ] / akm1k;
				ak = A[ offsetA + ( ( i + 1 ) * sa1 ) + ( ( i + 1 ) * sa2 ) ] / akm1k;
				denom = ( akm1 * ak ) - 1.0;
				for ( j = 0; j < nrhs; j++ ) {
					bkm1 = B[ offsetB + ( i * sb1 ) + ( j * sb2 ) ] / akm1k;
					bk = B[ offsetB + ( ( i + 1 ) * sb1 ) + ( j * sb2 ) ] / akm1k;
					B[ offsetB + ( i * sb1 ) + ( j * sb2 ) ] = ( ( ak * bkm1 ) - bk ) / denom;
					B[ offsetB + ( ( i + 1 ) * sb1 ) + ( j * sb2 ) ] = ( ( akm1 * bk ) - bkm1 ) / denom;
				}
				i += 1;
			}
			i += 1;
		}

		// Step 5: Solve L^T * X = B
		dtrsm( 'left', 'lower', 'transpose', 'unit', N, nrhs, 1.0, A, sa1, sa2, offsetA, B, sb1, sb2, offsetB );

		// Step 6: Undo row permutations (backward: K = N-1 down to 0)
		k = N - 1;
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + ( k * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot
				kp = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + ( k * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				k -= 1;
			} else {
				// 2x2 pivot
				kp = ~IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( k > 0 && kp === ( ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] ) ) {
					dswap( nrhs, B, sb2, offsetB + ( k * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				k -= 2;
			}
		}
	}

	// Step 7: Revert factorization (restore A to original form)
	dsyconv( uplo, 'revert', N, A, sa1, sa2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, sw, offsetWork );

	return 0;
}


// EXPORTS //

export default dsytrs2;
