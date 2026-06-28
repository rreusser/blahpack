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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zher from '../../../../blas/base/zher/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';


// MAIN //

/**
* Computes the Cholesky factorization of a complex Hermitian positive definite.
* band matrix AB.
*
* The factorization has the form:
* `AB = U^H*U`,  if uplo = 'upper', or
* AB = L*L^H,  if uplo = 'lower',
* where U is upper triangular and L is lower triangular.
*
* This is the unblocked version of the algorithm, calling Level 2 BLAS.
*
* Uses band storage format: if UPLO = 'U', AB(kd+1+i-j, j) = A(i,j) for
* max(1,j-kd)<=i<=j; if UPLO = 'L', AB(1+i-j, j) = A(i,j) for
* j<=i<=min(n,j+kd).
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super/sub-diagonals
* @param {Complex128Array} AB - input/output band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of AB (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for AB (in complex elements)
* @returns {integer} info - 0 if successful, k>0 if the leading minor of order k is not positive definite
*/
function zpbtf2( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB ) {
	var sa1;
	var sa2;
	var kld;
	var ajj;
	var Av;
	var oA;
	var kn;
	var da;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	Av = reinterpret( AB, 0 );
	oA = offsetAB * 2;
	sa1 = strideAB1 * 2;
	sa2 = strideAB2 * 2;

	// KLD = MAX(1, LDAB-1) = MAX(1, sa2/2 - sa1/2)

	// In complex-element strides, this is the stride for stepping diagonally

	// Through the band (one row up/down, one column right).
	kld = Math.max( 1, strideAB2 - strideAB1 );

	if ( uplo === 'upper' ) {
		// Compute the Cholesky factorization A = U^H * U.
		for ( j = 0; j < N; j++ ) {
			// Diagonal element: AB(KD+1, J+1) in Fortran 1-based
			// 0-based: AB[offsetAB + kd*strideAB1 + j*strideAB2]
			da = oA + (kd * sa1) + (j * sa2);
			ajj = Av[ da ];
			if ( ajj <= 0.0 ) {
				Av[ da ] = ajj;
				Av[ da + 1 ] = 0.0;
				return j + 1;
			}
			ajj = Math.sqrt( ajj );
			Av[ da ] = ajj;
			Av[ da + 1 ] = 0.0;

			kn = Math.min( kd, N - j - 1 );
			if ( kn > 0 ) {
				// ZDSCAL(KN, 1/AJJ, AB(KD, J+2), KLD)
				zdscal( kn, 1.0 / ajj,
					AB, kld, offsetAB + (( kd - 1 ) * strideAB1) + (( j + 1 ) * strideAB2)
				);

				// ZLACGV(KN, AB(KD, J+2), KLD)
				zlacgv( kn, AB, kld, offsetAB + (( kd - 1 ) * strideAB1) + (( j + 1 ) * strideAB2) );

				// ZHER('Upper', KN, -1, AB(KD, J+2), KLD, AB(KD+1, J+2), KLD)

				// zher: strideA1 = strideAB1, strideA2 = kld
				zher( 'upper', kn, -1.0,
					AB, kld, offsetAB + (( kd - 1 ) * strideAB1) + (( j + 1 ) * strideAB2),
					AB, strideAB1, kld, offsetAB + (kd * strideAB1) + (( j + 1 ) * strideAB2)
				);

				// ZLACGV(KN, AB(KD, J+2), KLD) -- undo
				zlacgv( kn, AB, kld, offsetAB + (( kd - 1 ) * strideAB1) + (( j + 1 ) * strideAB2) );
			}
		}
	} else {
		// Compute the Cholesky factorization A = L * L^H.
		for ( j = 0; j < N; j++ ) {
			// Diagonal element: AB(1, J+1) in Fortran 1-based
			// 0-based: AB[offsetAB + j*strideAB2]
			da = oA + (j * sa2);
			ajj = Av[ da ];
			if ( ajj <= 0.0 ) {
				Av[ da ] = ajj;
				Av[ da + 1 ] = 0.0;
				return j + 1;
			}
			ajj = Math.sqrt( ajj );
			Av[ da ] = ajj;
			Av[ da + 1 ] = 0.0;

			kn = Math.min( kd, N - j - 1 );
			if ( kn > 0 ) {
				// ZDSCAL(KN, 1/AJJ, AB(2, J), 1)
				zdscal( kn, 1.0 / ajj,
					AB, strideAB1, offsetAB + strideAB1 + (j * strideAB2)
				);

				// ZHER('Lower', KN, -1, AB(2, J), 1, AB(1, J+1), KLD)

				// zher: strideA1 = strideAB1, strideA2 = kld
				zher( 'lower', kn, -1.0,
					AB, strideAB1, offsetAB + strideAB1 + (j * strideAB2),
					AB, strideAB1, kld, offsetAB + (( j + 1 ) * strideAB2)
				);
			}
		}
	}
	return 0;
}


// EXPORTS //

export default zpbtf2;
