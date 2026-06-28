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

import sqrt from '@stdlib/math/base/special/sqrt/lib/index.js';
import max from '@stdlib/math/base/special/max/lib/index.js';
import min from '@stdlib/math/base/special/min/lib/index.js';
import floor from '@stdlib/math/base/special/floor/lib/index.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dsyr from '../../../../blas/base/dsyr/lib/base.js';


// MAIN //

/**
* Computes a split Cholesky factorization of a real symmetric positive.
* definite band matrix A.
*
* The factorization has the form `A = S**T * S` where S is a band matrix
* of the same bandwidth as A with structure `S = [U; M L]`, where U is
* upper triangular of order `m = floor((n+kd)/2)` and L is lower triangular
* of order `n-m`. This routine is designed to be used in conjunction with
* DSBGST.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super/sub-diagonals
* @param {Float64Array} AB - input/output band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB
* @param {integer} strideAB2 - stride of the second dimension of AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @returns {integer} info - 0 if successful, j>0 if the factorization could not be completed because element a(j,j) was negative
*/
function dpbstf( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB ) {
	var sa1;
	var sa2;
	var kld;
	var ajj;
	var km;
	var m;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideAB1;
	sa2 = strideAB2;

	// KLD = MAX(1, LDAB-1) in Fortran.

	// In the general stride case, the flat stride is sa2 - sa1 (for column-major sa1=1, this is LDAB-1).
	kld = max( 1, sa2 - sa1 );

	// Set the splitting point m.
	m = floor( ( N + kd ) / 2 );

	if ( uplo === 'upper' ) {
		// Factorize A(m+1:n,m+1:n) as L**T*L, and update A(1:m,1:m).
		// Loop backwards from N to m+1 (Fortran 1-based), i.e. j from N-1 down to m (0-based).
		for ( j = N - 1; j >= m; j-- ) {
			// Compute s(j,j) and test for non-positive-definiteness.
			// Diagonal: AB(KD+1, J+1) in Fortran => offset + kd*sa1 + j*sa2 in 0-based.
			ajj = AB[ offsetAB + ( kd * sa1 ) + ( j * sa2 ) ];
			if ( ajj <= 0.0 ) {
				AB[ offsetAB + ( kd * sa1 ) + ( j * sa2 ) ] = ajj;
				return j + 1;
			}
			ajj = sqrt( ajj );
			AB[ offsetAB + ( kd * sa1 ) + ( j * sa2 ) ] = ajj;
			km = min( j, kd );

			// DSCAL( KM, 1/AJJ, AB(KD+1-KM, J), 1 )

			// AB(KD+1-KM, J) in 0-based: (kd-km)*sa1 + j*sa2

			// Stride = sa1 (stepping along rows within same column)
			dscal( km, 1.0 / ajj, AB, sa1, offsetAB + ( ( kd - km ) * sa1 ) + ( j * sa2 ) );

			// DSYR('Upper', KM, -1, AB(KD+1-KM, J), 1, AB(KD+1, J-KM), KLD)

			// AB(KD+1, J-KM) in 0-based: kd*sa1 + (j-km)*sa2

			// X stride = sa1, A strides = (sa1, kld)
			dsyr( 'upper', km, -1.0, AB, sa1, offsetAB + ( ( kd - km ) * sa1 ) + ( j * sa2 ), AB, sa1, kld, offsetAB + ( kd * sa1 ) + ( ( j - km ) * sa2 ) );
		}

		// Factorize the updated submatrix A(1:m,1:m) as U**T*U.
		// Loop j from 1 to m (Fortran 1-based), i.e. 0 to m-1 (0-based).
		for ( j = 0; j < m; j++ ) {
			// Diagonal: AB(KD+1, J+1) in Fortran => offset + kd*sa1 + j*sa2
			ajj = AB[ offsetAB + ( kd * sa1 ) + ( j * sa2 ) ];
			if ( ajj <= 0.0 ) {
				AB[ offsetAB + ( kd * sa1 ) + ( j * sa2 ) ] = ajj;
				return j + 1;
			}
			ajj = sqrt( ajj );
			AB[ offsetAB + ( kd * sa1 ) + ( j * sa2 ) ] = ajj;
			km = min( kd, m - j - 1 );

			if ( km > 0 ) {
				// DSCAL( KM, 1/AJJ, AB(KD, J+2), KLD )
				// AB(KD, J+2) in 0-based: (kd-1)*sa1 + (j+1)*sa2
				// Stride = kld
				dscal( km, 1.0 / ajj, AB, kld, offsetAB + ( ( kd - 1 ) * sa1 ) + ( ( j + 1 ) * sa2 ) );

				// DSYR('Upper', KM, -1, AB(KD, J+2), KLD, AB(KD+1, J+2), KLD)

				// AB(KD+1, J+2) in 0-based: kd*sa1 + (j+1)*sa2
				dsyr( 'upper', km, -1.0, AB, kld, offsetAB + ( ( kd - 1 ) * sa1 ) + ( ( j + 1 ) * sa2 ), AB, sa1, kld, offsetAB + ( kd * sa1 ) + ( ( j + 1 ) * sa2 ) );
			}
		}
	} else {
		// Factorize A(m+1:n,m+1:n) as L**T*L, and update A(1:m,1:m).
		// Loop backwards from N to m+1 (Fortran 1-based).
		for ( j = N - 1; j >= m; j-- ) {
			// Diagonal: AB(1, J+1) in Fortran => offset + j*sa2 in 0-based
			ajj = AB[ offsetAB + ( j * sa2 ) ];
			if ( ajj <= 0.0 ) {
				AB[ offsetAB + ( j * sa2 ) ] = ajj;
				return j + 1;
			}
			ajj = sqrt( ajj );
			AB[ offsetAB + ( j * sa2 ) ] = ajj;
			km = min( j, kd );

			// DSCAL( KM, 1/AJJ, AB(KM+1, J-KM+1), KLD )

			// AB(KM+1, J-KM+1) in 0-based: km*sa1 + (j-km)*sa2

			// Stride = kld
			dscal( km, 1.0 / ajj, AB, kld, offsetAB + ( km * sa1 ) + ( ( j - km ) * sa2 ) );

			// DSYR('Lower', KM, -1, AB(KM+1, J-KM+1), KLD, AB(1, J-KM+1), KLD)

			// AB(1, J-KM+1) in 0-based: (j-km)*sa2
			dsyr( 'lower', km, -1.0, AB, kld, offsetAB + ( km * sa1 ) + ( ( j - km ) * sa2 ), AB, sa1, kld, offsetAB + ( ( j - km ) * sa2 ) );
		}

		// Factorize the updated submatrix A(1:m,1:m) as U**T*U.
		// Loop j from 1 to m (Fortran 1-based).
		for ( j = 0; j < m; j++ ) {
			// Diagonal: AB(1, J+1) in Fortran => offset + j*sa2
			ajj = AB[ offsetAB + ( j * sa2 ) ];
			if ( ajj <= 0.0 ) {
				AB[ offsetAB + ( j * sa2 ) ] = ajj;
				return j + 1;
			}
			ajj = sqrt( ajj );
			AB[ offsetAB + ( j * sa2 ) ] = ajj;
			km = min( kd, m - j - 1 );

			if ( km > 0 ) {
				// DSCAL( KM, 1/AJJ, AB(2, J+1), 1 )
				// AB(2, J+1) in 0-based: sa1 + j*sa2
				// Stride = sa1
				dscal( km, 1.0 / ajj, AB, sa1, offsetAB + sa1 + ( j * sa2 ) );

				// DSYR('Lower', KM, -1, AB(2, J+1), 1, AB(1, J+2), KLD)

				// AB(1, J+2) in 0-based: (j+1)*sa2
				dsyr( 'lower', km, -1.0, AB, sa1, offsetAB + sa1 + ( j * sa2 ), AB, sa1, kld, offsetAB + ( ( j + 1 ) * sa2 ) );
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dpbstf;
