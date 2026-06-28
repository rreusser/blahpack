/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsyconv from '../../zsyconv/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var ONE = new Complex128( 1.0, 0.0 );

// Scratch buffer for complex arithmetic: [0..1] = tmp1, [2..3] = tmp2, [4..5] = result
var scratch = new Float64Array( 6 );


// MAIN //

/**
* Solves a system of linear equations A_X = B with a complex symmetric matrix A.
_ using the factorization A = U_D_U^T or A = L_D*L^T computed by zsytrf,
* employing BLAS-3 triangular solves (ztrsm) after converting the factorization
* via zsyconv.
*
* ## Algorithm
*
* 1. Convert factorization: zsyconv extracts off-diagonal of D into WORK,
*    zeros them in A, and permutes the triangular factor.
* 2. Apply row permutations to B.
* 3. Triangular solve: L\B or U\B via ztrsm.
* 4. Back-substitute with block diagonal D.
* 5. Second triangular solve: L^T\B or U^T\B via ztrsm.
* 6. Undo row permutations on B.
* 7. Revert factorization: zsyconv restores A to its original form.
*
* ## Notes
*
* -   IPIV uses 0-based convention: `IPIV[k] >= 0` means 1x1 pivot with
*     0-based interchange index; `IPIV[k] < 0` means 2x2 pivot with
*     `~IPIV[k]` giving the 0-based interchange index.
* -   WORK must have length >= N (Complex128Array). It is used to communicate
*     off-diagonal elements of D between zsyconv and the back-substitution step.
* -   A, B, and WORK are Complex128Array. Strides and offsets are in complex elements.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'` (single char)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side vectors
* @param {Complex128Array} A - factored matrix from zsytrf (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} IPIV - pivot indices from zsytrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Complex128Array} B - input/output right-hand side / solution matrix
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} WORK - workspace array of length >= N
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @returns {integer} info - 0 on success
*/
function zsytrs2( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ) {
	var denomRe;
	var denomIm;
	var upper;
	var akm1k;
	var akm1Re;
	var akm1Im;
	var bkm1Re;
	var bkm1Im;
	var akRe;
	var akIm;
	var bkRe;
	var bkIm;
	var Av;
	var Bv;
	var Wv;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sw;
	var oA;
	var oB;
	var oW;
	var kp;
	var ia;
	var ib;
	var iw;
	var k;
	var i;
	var j;

	upper = ( uplo === 'upper' );

	// Quick return
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Get Float64 views for element access
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Wv = reinterpret( WORK, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sw = strideWork * 2;
	oA = offsetA * 2;
	oB = offsetB * 2;
	oW = offsetWork * 2;

	// Step 1: Convert factorization. zsyconv extracts off-diagonal elements

	// Of D into WORK and permutes the triangular factor rows/columns.
	zsyconv( uplo, 'convert', N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );

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
					zswap( nrhs, B, strideB2, offsetB + ( k * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
				}
				k -= 1;
			} else {
				// 2x2 pivot: swap rows k-1 and kp
				kp = ~IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( kp === ( ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] ) ) {
					zswap( nrhs, B, strideB2, offsetB + ( ( k - 1 ) * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
				}
				k -= 2;
			}
		}

		// Step 3: Solve U*X = B (unit diagonal, since D is factored out)
		ztrsm( 'left', 'upper', 'no-transpose', 'unit', N, nrhs, ONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Step 4: Back-substitution with block diagonal D
		i = N - 1;
		while ( i >= 0 ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot: scale row i by 1/D(i,i)
				// Compute 1/A(i,i) via complex division
				ia = oA + ( i * sa1 ) + ( i * sa2 );
				scratch[ 0 ] = 1.0;
				scratch[ 1 ] = 0.0;
				cmplx.divAt( scratch, 2, scratch, 0, Av, ia );
				zscal( nrhs, new Complex128( scratch[ 2 ], scratch[ 3 ] ), B, strideB2, offsetB + ( i * strideB1 ) );
			} else if ( i > 0 ) {
				// 2x2 pivot block: check that IPIV[i-1] == IPIV[i] (same block)
				if ( IPIV[ offsetIPIV + ( ( i - 1 ) * strideIPIV ) ] === IPIV[ offsetIPIV + ( i * strideIPIV ) ] ) {
					// Off-diagonal element of D stored in WORK by zsyconv
					iw = oW + ( i * sw );

					// akm1k = WORK[i] (complex)
					akm1k = iw;

					// akm1 = A(i-1, i-1) / akm1k (complex division)
					ia = oA + ( ( i - 1 ) * sa1 ) + ( ( i - 1 ) * sa2 );
					cmplx.divAt( scratch, 0, Av, ia, Wv, akm1k );
					akm1Re = scratch[ 0 ];
					akm1Im = scratch[ 1 ];

					// Ak = A(i, i) / akm1k (complex division)
					ia = oA + ( i * sa1 ) + ( i * sa2 );
					cmplx.divAt( scratch, 0, Av, ia, Wv, akm1k );
					akRe = scratch[ 0 ];
					akIm = scratch[ 1 ];

					// Denom = akm1 * ak - ONE (complex)
					denomRe = ( akm1Re * akRe - akm1Im * akIm ) - 1.0;
					denomIm = ( akm1Re * akIm + akm1Im * akRe );

					for ( j = 0; j < nrhs; j++ ) {
						// bkm1 = B(i-1, j) / akm1k
						ib = oB + ( ( i - 1 ) * sb1 ) + ( j * sb2 );
						cmplx.divAt( scratch, 0, Bv, ib, Wv, akm1k );
						bkm1Re = scratch[ 0 ];
						bkm1Im = scratch[ 1 ];

						// Bk = B(i, j) / akm1k
						ib = oB + ( i * sb1 ) + ( j * sb2 );
						cmplx.divAt( scratch, 0, Bv, ib, Wv, akm1k );
						bkRe = scratch[ 0 ];
						bkIm = scratch[ 1 ];

						// B(i-1, j) = (ak * bkm1 - bk) / denom
						scratch[ 0 ] = ( akRe * bkm1Re - akIm * bkm1Im ) - bkRe;
						scratch[ 1 ] = ( akRe * bkm1Im + akIm * bkm1Re ) - bkIm;
						scratch[ 2 ] = denomRe;
						scratch[ 3 ] = denomIm;
						ib = oB + ( ( i - 1 ) * sb1 ) + ( j * sb2 );
						cmplx.divAt( Bv, ib, scratch, 0, scratch, 2 );

						// B(i, j) = (akm1 * bk - bkm1) / denom
						scratch[ 0 ] = ( akm1Re * bkRe - akm1Im * bkIm ) - bkm1Re;
						scratch[ 1 ] = ( akm1Re * bkIm + akm1Im * bkRe ) - bkm1Im;
						ib = oB + ( i * sb1 ) + ( j * sb2 );
						cmplx.divAt( Bv, ib, scratch, 0, scratch, 2 );
					}
					i -= 1;
				}
			}
			i -= 1;
		}

		// Step 5: Solve U^T * X = B
		ztrsm( 'left', 'upper', 'transpose', 'unit', N, nrhs, ONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Step 6: Undo row permutations (forward: K = 0 up to N-1)
		k = 0;
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + ( k * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot
				kp = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + ( k * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
				}
				k += 1;
			} else {
				// 2x2 pivot
				kp = ~IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( k < N - 1 && kp === ( ~IPIV[ offsetIPIV + ( ( k + 1 ) * strideIPIV ) ] ) ) {
					zswap( nrhs, B, strideB2, offsetB + ( k * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
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
					zswap( nrhs, B, strideB2, offsetB + ( k * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
				}
				k += 1;
			} else {
				// 2x2 pivot: swap rows k+1 and kp
				kp = ~IPIV[ offsetIPIV + ( ( k + 1 ) * strideIPIV ) ];
				if ( kp === ( ~IPIV[ offsetIPIV + ( k * strideIPIV ) ] ) ) {
					zswap( nrhs, B, strideB2, offsetB + ( ( k + 1 ) * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
				}
				k += 2;
			}
		}

		// Step 3: Solve L*X = B (unit diagonal)
		ztrsm( 'left', 'lower', 'no-transpose', 'unit', N, nrhs, ONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Step 4: Back-substitution with block diagonal D
		i = 0;
		while ( i < N ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot: scale row i by 1/D(i,i)
				ia = oA + ( i * sa1 ) + ( i * sa2 );
				scratch[ 0 ] = 1.0;
				scratch[ 1 ] = 0.0;
				cmplx.divAt( scratch, 2, scratch, 0, Av, ia );
				zscal( nrhs, new Complex128( scratch[ 2 ], scratch[ 3 ] ), B, strideB2, offsetB + ( i * strideB1 ) );
			} else {
				// 2x2 pivot block
				iw = oW + ( i * sw );
				akm1k = iw;

				// akm1 = A(i, i) / akm1k (complex division)
				ia = oA + ( i * sa1 ) + ( i * sa2 );
				cmplx.divAt( scratch, 0, Av, ia, Wv, akm1k );
				akm1Re = scratch[ 0 ];
				akm1Im = scratch[ 1 ];

				// Ak = A(i+1, i+1) / akm1k (complex division)
				ia = oA + ( ( i + 1 ) * sa1 ) + ( ( i + 1 ) * sa2 );
				cmplx.divAt( scratch, 0, Av, ia, Wv, akm1k );
				akRe = scratch[ 0 ];
				akIm = scratch[ 1 ];

				// Denom = akm1 * ak - ONE (complex)
				denomRe = ( akm1Re * akRe - akm1Im * akIm ) - 1.0;
				denomIm = ( akm1Re * akIm + akm1Im * akRe );

				for ( j = 0; j < nrhs; j++ ) {
					// bkm1 = B(i, j) / akm1k
					ib = oB + ( i * sb1 ) + ( j * sb2 );
					cmplx.divAt( scratch, 0, Bv, ib, Wv, akm1k );
					bkm1Re = scratch[ 0 ];
					bkm1Im = scratch[ 1 ];

					// Bk = B(i+1, j) / akm1k
					ib = oB + ( ( i + 1 ) * sb1 ) + ( j * sb2 );
					cmplx.divAt( scratch, 0, Bv, ib, Wv, akm1k );
					bkRe = scratch[ 0 ];
					bkIm = scratch[ 1 ];

					// B(i, j) = (ak * bkm1 - bk) / denom
					scratch[ 0 ] = ( akRe * bkm1Re - akIm * bkm1Im ) - bkRe;
					scratch[ 1 ] = ( akRe * bkm1Im + akIm * bkm1Re ) - bkIm;
					scratch[ 2 ] = denomRe;
					scratch[ 3 ] = denomIm;
					ib = oB + ( i * sb1 ) + ( j * sb2 );
					cmplx.divAt( Bv, ib, scratch, 0, scratch, 2 );

					// B(i+1, j) = (akm1 * bk - bkm1) / denom
					scratch[ 0 ] = ( akm1Re * bkRe - akm1Im * bkIm ) - bkm1Re;
					scratch[ 1 ] = ( akm1Re * bkIm + akm1Im * bkRe ) - bkm1Im;
					ib = oB + ( ( i + 1 ) * sb1 ) + ( j * sb2 );
					cmplx.divAt( Bv, ib, scratch, 0, scratch, 2 );
				}
				i += 1;
			}
			i += 1;
		}

		// Step 5: Solve L^T * X = B
		ztrsm( 'left', 'lower', 'transpose', 'unit', N, nrhs, ONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Step 6: Undo row permutations (backward: K = N-1 down to 0)
		k = N - 1;
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + ( k * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot
				kp = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + ( k * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
				}
				k -= 1;
			} else {
				// 2x2 pivot
				kp = ~IPIV[ offsetIPIV + ( k * strideIPIV ) ];
				if ( k > 0 && kp === ( ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] ) ) {
					zswap( nrhs, B, strideB2, offsetB + ( k * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
				}
				k -= 2;
			}
		}
	}

	// Step 7: Revert factorization (restore A to original form)
	zsyconv( uplo, 'revert', N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );

	return 0;
}


// EXPORTS //

export default zsytrs2;
