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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbtf2 from '../../dpbtf2/lib/base.js';
import dpotf2 from '../../dpotf2/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';
import dsyrk from '../../../../blas/base/dsyrk/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';


// VARIABLES //

var NBMAX = 32;
var LDWORK = NBMAX + 1;


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
* This is the blocked version of the algorithm, calling Level 3 BLAS.
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
function dpbtrf( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB ) {
	var iinfo;
	var WORK;
	var sa1;
	var sa2;
	var nb;
	var ib;
	var i2;
	var i3;
	var jj;
	var ii;
	var i;

	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideAB1;
	sa2 = strideAB2;

	// Determine block size. In Fortran this comes from ILAENV.

	// We hardcode NB = 32 (matching NBMAX).
	nb = NBMAX;
	if ( nb < 1 ) {
		nb = 1;
	}
	nb = Math.min( nb, NBMAX );

	if ( nb <= 1 || nb > kd ) {
		// Use unblocked code
		return dpbtf2( uplo, N, kd, AB, sa1, sa2, offsetAB );
	}

	// Use blocked code
	// Allocate workspace: WORK(LDWORK, NBMAX) stored column-major
	WORK = new Float64Array( LDWORK * NBMAX );

	if ( uplo === 'upper' ) {
		// Factorize A = U^T * U

		// Zero out the upper triangle above the band
		// Initialize WORK upper triangle to zero
		for ( jj = 0; jj < nb; jj++ ) {
			for ( ii = 0; ii < jj; ii++ ) {
				WORK[ ii + (jj * LDWORK) ] = 0.0;
			}
		}

		// Process the band matrix one block at a time
		for ( i = 0; i < N; i += nb ) {
			ib = Math.min( nb, N - i );

			// Factorize the diagonal block

			// dpotf2('upper', IB, AB(KD+1, I+1), LDAB-1, II)

			// The stride between columns in band storage when treating the

			// Diagonal block as a dense matrix is LDAB-1 = sa2 - sa1 (col-major).
			iinfo = dpotf2( 'upper', ib, AB, sa1, sa2 - sa1, offsetAB + (kd * sa1) + (i * sa2) );
			if ( iinfo !== 0 ) {
				return i + iinfo;
			}

			if ( i + ib < N ) {
				// Number of elements in the band to the right of the diagonal block
				i2 = Math.min( kd - ib, N - i - ib );

				// Number of elements that wrap around (beyond the band)
				i3 = Math.min( ib, N - i - kd );

				if ( i2 > 0 ) {
					// Update A12:
					// DTRSM('Left','Upper','Transpose','Non-unit', IB, I2, ONE,
					//        AB(KD+1,I), LDAB-1, AB(KD+1-IB,I+IB), LDAB-1)
					dtrsm( 'left', 'upper', 'transpose', 'non-unit', ib, i2, 1.0, AB, sa1, sa2 - sa1, offsetAB + (kd * sa1) + (i * sa2), AB, sa1, sa2 - sa1, offsetAB + (( kd - ib ) * sa1) + (( i + ib ) * sa2));

					// Update A22:

					// DSYRK('Upper','Transpose', I2, IB, -ONE,

					//        AB(KD+1-IB,I+IB), LDAB-1, ONE, AB(KD+1,I+IB), LDAB-1)
					dsyrk( 'upper', 'transpose', i2, ib, -1.0, AB, sa1, sa2 - sa1, offsetAB + (( kd - ib ) * sa1) + (( i + ib ) * sa2), 1.0, AB, sa1, sa2 - sa1, offsetAB + (kd * sa1) + (( i + ib ) * sa2));
				}

				if ( i3 > 0 ) {
					// Copy the upper triangle of the IB-by-I3 block from AB to WORK
					// Fortran: DO JJ=1,I3; DO II=JJ,IB;
					//   WORK(II,JJ) = AB(II-JJ+1, JJ+I+KD-1)
					for ( jj = 0; jj < i3; jj++ ) {
						for ( ii = jj; ii < ib; ii++ ) {
							WORK[ ii + (jj * LDWORK) ] = AB[ offsetAB + (( ii - jj ) * sa1) + (( jj + i + kd ) * sa2) ];
						}
					}

					// DTRSM('Left','Upper','Transpose','Non-unit', IB, I3, ONE,
					//        AB(KD+1,I), LDAB-1, WORK, LDWORK)
					dtrsm( 'left', 'upper', 'transpose', 'non-unit', ib, i3, 1.0, AB, sa1, sa2 - sa1, offsetAB + (kd * sa1) + (i * sa2), WORK, 1, LDWORK, 0);

					if ( i2 > 0 ) {
						// DGEMM('Transpose','No Transpose', I2, I3, IB, -ONE,
						//        AB(KD+1-IB,I+IB), LDAB-1, WORK, LDWORK, ONE,
						//        AB(1+IB,I+KD), LDAB-1)
						dgemm( 'transpose', 'no-transpose', i2, i3, ib, -1.0, AB, sa1, sa2 - sa1, offsetAB + (( kd - ib ) * sa1) + (( i + ib ) * sa2), WORK, 1, LDWORK, 0, 1.0, AB, sa1, sa2 - sa1, offsetAB + (ib * sa1) + (( i + kd ) * sa2));
					}

					// DSYRK('Upper','Transpose', I3, IB, -ONE,
					//        WORK, LDWORK, ONE, AB(KD+1,I+KD), LDAB-1)
					dsyrk( 'upper', 'transpose', i3, ib, -1.0, WORK, 1, LDWORK, 0, 1.0, AB, sa1, sa2 - sa1, offsetAB + (kd * sa1) + (( i + kd ) * sa2));

					// Copy the result back from WORK to AB
					for ( jj = 0; jj < i3; jj++ ) {
						for ( ii = jj; ii < ib; ii++ ) {
							AB[ offsetAB + (( ii - jj ) * sa1) + (( jj + i + kd ) * sa2) ] = WORK[ ii + (jj * LDWORK) ];
						}
					}
				}
			}
		}
	} else {
		// Factorize A = L * L^T

		// Zero out the lower triangle below the band in WORK
		for ( jj = 0; jj < nb; jj++ ) {
			for ( ii = jj + 1; ii < nb; ii++ ) {
				WORK[ ii + (jj * LDWORK) ] = 0.0;
			}
		}

		// Process the band matrix one block at a time
		for ( i = 0; i < N; i += nb ) {
			ib = Math.min( nb, N - i );

			// Factorize the diagonal block

			// dpotf2('lower', IB, AB(1, I+1), LDAB-1, II)
			iinfo = dpotf2( 'lower', ib, AB, sa1, sa2 - sa1, offsetAB + (i * sa2) );
			if ( iinfo !== 0 ) {
				return i + iinfo;
			}

			if ( i + ib < N ) {
				i2 = Math.min( kd - ib, N - i - ib );
				i3 = Math.min( ib, N - i - kd );

				if ( i2 > 0 ) {
					// DTRSM('Right','Lower','Transpose','Non-unit', I2, IB, ONE,
					//        AB(1,I), LDAB-1, AB(1+IB,I), LDAB-1)
					dtrsm( 'right', 'lower', 'transpose', 'non-unit', i2, ib, 1.0, AB, sa1, sa2 - sa1, offsetAB + (i * sa2), AB, sa1, sa2 - sa1, offsetAB + (ib * sa1) + (i * sa2));

					// DSYRK('Lower','No Transpose', I2, IB, -ONE,

					//        AB(1+IB,I), LDAB-1, ONE, AB(1,I+IB), LDAB-1)
					dsyrk( 'lower', 'no-transpose', i2, ib, -1.0, AB, sa1, sa2 - sa1, offsetAB + (ib * sa1) + (i * sa2), 1.0, AB, sa1, sa2 - sa1, offsetAB + (( i + ib ) * sa2));
				}

				if ( i3 > 0 ) {
					// Copy the lower triangle of the IB-by-I3 block from AB to WORK
					// Fortran: DO JJ=1,IB; DO II=1,MIN(JJ,I3);
					//   WORK(II,JJ) = AB(KD+1-JJ+II, JJ+I-1)
					// 0-based: DO jj=0..ib-1; DO ii=0..min(jj,i3-1);
					//   WORK[ii + jj*LDWORK] = AB[offset + (kd-jj+ii)*sa1 + (jj+i)*sa2]
					for ( jj = 0; jj < ib; jj++ ) {
						for ( ii = 0; ii < Math.min( jj + 1, i3 ); ii++ ) {
							WORK[ ii + (jj * LDWORK) ] = AB[ offsetAB + (( kd - jj + ii ) * sa1) + (( jj + i ) * sa2) ];
						}
					}

					// DTRSM('Right','Lower','Transpose','Non-unit', I3, IB, ONE,
					//        AB(1,I), LDAB-1, WORK, LDWORK)
					dtrsm( 'right', 'lower', 'transpose', 'non-unit', i3, ib, 1.0, AB, sa1, sa2 - sa1, offsetAB + (i * sa2), WORK, 1, LDWORK, 0);

					if ( i2 > 0 ) {
						// DGEMM('No transpose','Transpose', I3, I2, IB, -ONE,
						//        WORK, LDWORK, AB(1+IB,I), LDAB-1, ONE,
						//        AB(1+KD-IB,I+IB), LDAB-1)
						dgemm( 'no-transpose', 'transpose', i3, i2, ib, -1.0, WORK, 1, LDWORK, 0, AB, sa1, sa2 - sa1, offsetAB + (ib * sa1) + (i * sa2), 1.0, AB, sa1, sa2 - sa1, offsetAB + (( kd - ib ) * sa1) + (( i + ib ) * sa2));
					}

					// DSYRK('Lower','No Transpose', I3, IB, -ONE,
					//        WORK, LDWORK, ONE, AB(1,I+KD), LDAB-1)
					dsyrk( 'lower', 'no-transpose', i3, ib, -1.0, WORK, 1, LDWORK, 0, 1.0, AB, sa1, sa2 - sa1, offsetAB + (( i + kd ) * sa2));

					// Copy the result back from WORK to AB
					for ( jj = 0; jj < ib; jj++ ) {
						for ( ii = 0; ii < Math.min( jj + 1, i3 ); ii++ ) {
							AB[ offsetAB + (( kd - jj + ii ) * sa1) + (( jj + i ) * sa2) ] = WORK[ ii + (jj * LDWORK) ];
						}
					}
				}
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dpbtrf;
