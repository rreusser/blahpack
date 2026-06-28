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
import ztbsv from '../../../../blas/base/ztbsv/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zgeru from '../../../../blas/base/zgeru/lib/base.js';
import zlacgv from '../../../base/zlacgv/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CNONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Solves a system of linear equations `A*X = B`, `A^T*X = B`, or `A^H*X = B`.
*
* Uses a general band matrix A and the LU factorization computed by zgbtrf.
*
* IPIV is 0-based (matching zgbtf2/zgbtrf output).
*
* Band storage: AB is stored with LDAB = 2*KL+KU+1 rows. The factored form
* has U as an upper triangular band matrix with KL+KU superdiagonals, and
* L multipliers below the diagonal.
*
* @private
* @param {string} trans - 'no-transpose' for A*X=B, 'transpose' for A^T*X=B, 'conjugate-transpose' for A^H*X=B
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} AB - factored band matrix from zgbtrf
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Int32Array} IPIV - pivot indices from zgbtrf (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Complex128Array} B - right-hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @returns {integer} info - 0 if successful
*/
function zgbtrs( trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var lnoti;
	var sb1;
	var sb2;
	var sa1;
	var sa2;
	var kd;
	var lm;
	var l;
	var i;
	var j;

	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	sa1 = strideAB1;
	sa2 = strideAB2;
	sb1 = strideB1;
	sb2 = strideB2;

	kd = ku + kl; // Row index of diagonal in band storage (0-based = KU+KL)
	lnoti = kl > 0;

	if ( trans === 'no-transpose' ) {
		// Solve A * X = B

		// Apply row interchanges and perform forward elimination (L * y = P * b)
		if ( lnoti ) {
			for ( j = 0; j < N - 1; j++ ) {
				lm = Math.min( kl, N - j - 1 );
				l = IPIV[ offsetIPIV + (j * strideIPIV) ];
				if ( l !== j ) {
					zswap( nrhs, B, sb2, offsetB + (l * sb1), B, sb2, offsetB + (j * sb1) );
				}
				// B(j+1:j+lm, :) -= L(j+1:j+lm, j) * B(j, :)
				zgeru( lm, nrhs, CNONE, AB, sa1, offsetAB + (( kd + 1 ) * sa1) + (j * sa2), B, sb2, offsetB + (j * sb1), B, sb1, sb2, offsetB + (( j + 1 ) * sb1) );
			}
		}

		// Solve U * X = y using back-substitution
		for ( i = 0; i < nrhs; i++ ) {
			ztbsv( 'upper', 'no-transpose', 'non-unit', N, kl + ku, AB, sa1, sa2, offsetAB, B, sb1, offsetB + (i * sb2) );
		}
	} else if ( trans === 'transpose' ) {
		// Solve A^T * X = B

		// Solve U^T * y = B using forward substitution
		for ( i = 0; i < nrhs; i++ ) {
			ztbsv( 'upper', 'transpose', 'non-unit', N, kl + ku, AB, sa1, sa2, offsetAB, B, sb1, offsetB + (i * sb2) );
		}

		// Apply L^T and row interchanges in reverse (backward elimination)
		if ( lnoti ) {
			for ( j = N - 2; j >= 0; j-- ) {
				lm = Math.min( kl, N - j - 1 );

				// B(j, :) -= L(j+1:j+lm, j)^T * B(j+1:j+lm, :)
				zgemv( 'transpose', lm, nrhs, CNONE, B, sb1, sb2, offsetB + (( j + 1 ) * sb1), AB, sa1, offsetAB + (( kd + 1 ) * sa1) + (j * sa2), CONE, B, sb2, offsetB + (j * sb1) );
				l = IPIV[ offsetIPIV + (j * strideIPIV) ];
				if ( l !== j ) {
					zswap( nrhs, B, sb2, offsetB + (l * sb1), B, sb2, offsetB + (j * sb1) );
				}
			}
		}
	} else {
		// Solve A^H * X = B (conjugate-transpose)

		// Solve U^H * y = B using forward substitution
		for ( i = 0; i < nrhs; i++ ) {
			ztbsv( 'upper', 'conjugate-transpose', 'non-unit', N, kl + ku, AB, sa1, sa2, offsetAB, B, sb1, offsetB + (i * sb2) );
		}

		// Apply L^H and row interchanges in reverse (backward elimination)
		if ( lnoti ) {
			for ( j = N - 2; j >= 0; j-- ) {
				lm = Math.min( kl, N - j - 1 );

				// Conjugate row j of B across all right-hand sides
				zlacgv( nrhs, B, sb2, offsetB + (j * sb1) );

				// B(j, :) -= conj(L(j+1:j+lm, j))^T * B(j+1:j+lm, :)
				zgemv( 'conjugate-transpose', lm, nrhs, CNONE, B, sb1, sb2, offsetB + (( j + 1 ) * sb1), AB, sa1, offsetAB + (( kd + 1 ) * sa1) + (j * sa2), CONE, B, sb2, offsetB + (j * sb1) );

				// Unconjugate row j of B
				zlacgv( nrhs, B, sb2, offsetB + (j * sb1) );

				l = IPIV[ offsetIPIV + (j * strideIPIV) ];
				if ( l !== j ) {
					zswap( nrhs, B, sb2, offsetB + (l * sb1), B, sb2, offsetB + (j * sb1) );
				}
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zgbtrs;
