/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

import dscal from '../../../../blas/base/dscal/lib/base.js';
import dsyr from '../../../../blas/base/dsyr/lib/base.js';


// MAIN //

/**
* Computes the Cholesky factorization of a real symmetric positive definite.
* band matrix A.
*
* The factorization has the form:
* `A = U^T*U`,  if uplo = 'upper', or
* A = L*L^T,  if uplo = 'lower',
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
* @param {Float64Array} AB - input/output band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @returns {integer} info - 0 if successful, k>0 if the leading minor of order k is not positive definite
*/
function dpbtf2( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB ) {
	var sa1;
	var sa2;
	var kld;
	var ajj;
	var kn;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideAB1;
	sa2 = strideAB2;

	// KLD = MAX(1, LDAB-1).

	// In Fortran, LDAB is the leading dimension. Steps along the band

	// (one row up, one column right for upper; one row down, one column right

	// For lower) have flat stride = LDAB-1 = sa2-sa1 (column-major with sa1=1).

	// In the general stride case, the flat stride corresponding to KLD

	// Is sa2 - sa1 (going from AB(r,c) to AB(r-1,c+1)).

	// KLD is used as the vector stride in DSCAL and as the leading dimension

	// (i.e. column stride) in DSYR.
	kld = Math.max( 1, sa2 - sa1 );

	if ( uplo === 'upper' ) {
		// Compute the Cholesky factorization A = U^T * U.
		for ( j = 0; j < N; j++ ) {
			// Diagonal: AB(KD+1, J+1) in Fortran 1-based
			// 0-based: AB[offset + kd*sa1 + j*sa2]
			ajj = AB[ offsetAB + (kd * sa1) + (j * sa2) ];
			if ( ajj <= 0.0 ) {
				AB[ offsetAB + (kd * sa1) + (j * sa2) ] = ajj;
				return j + 1;
			}
			ajj = Math.sqrt( ajj );
			AB[ offsetAB + (kd * sa1) + (j * sa2) ] = ajj;

			kn = Math.min( kd, N - j - 1 );
			if ( kn > 0 ) {
				// DSCAL(KN, 1/AJJ, AB(KD, J+2), KLD)
				// AB(KD, J+2) in 0-based: (kd-1)*sa1 + (j+1)*sa2
				// Stride = KLD (stepping diagonally along the band)
				dscal( kn, 1.0 / ajj, AB, kld, offsetAB + (( kd - 1 ) * sa1) + (( j + 1 ) * sa2));

				// DSYR('Upper', KN, -1, AB(KD, J+2), KLD, AB(KD+1, J+2), KLD)

				// The matrix argument to dsyr uses LDA = KLD.

				// dsyr(uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA)

				// Here dsyr treats the submatrix with:

				//   strideA1 = sa1 (step within a column = 1 for col-major)

				//   strideA2 = kld (step between columns = LDAB-1)
				dsyr( 'upper', kn, -1.0, AB, kld, offsetAB + (( kd - 1 ) * sa1) + (( j + 1 ) * sa2), AB, sa1, kld, offsetAB + (kd * sa1) + (( j + 1 ) * sa2));
			}
		}
	} else {
		// Compute the Cholesky factorization A = L * L^T.
		for ( j = 0; j < N; j++ ) {
			// Diagonal: AB(1, J+1) in Fortran 1-based
			// 0-based: AB[offset + j*sa2]
			ajj = AB[ offsetAB + (j * sa2) ];
			if ( ajj <= 0.0 ) {
				AB[ offsetAB + (j * sa2) ] = ajj;
				return j + 1;
			}
			ajj = Math.sqrt( ajj );
			AB[ offsetAB + (j * sa2) ] = ajj;

			kn = Math.min( kd, N - j - 1 );
			if ( kn > 0 ) {
				// DSCAL(KN, 1/AJJ, AB(2, J+1), 1)
				// AB(2, J+1) in 0-based: sa1 + j*sa2
				// Stride = sa1 (= 1 for col-major, stepping down rows)
				dscal( kn, 1.0 / ajj, AB, sa1, offsetAB + sa1 + (j * sa2));

				// DSYR('Lower', KN, -1, AB(2, J+1), 1, AB(1, J+2), KLD)

				// Dsyr matrix: strideA1 = sa1, strideA2 = kld
				dsyr( 'lower', kn, -1.0, AB, sa1, offsetAB + sa1 + (j * sa2), AB, sa1, kld, offsetAB + (( j + 1 ) * sa2));
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dpbtf2;
