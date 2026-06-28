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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zpbtf2 from '../../zpbtf2/lib/base.js';
import zpotf2 from '../../zpotf2/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import zherk from '../../../../blas/base/zherk/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';


// VARIABLES //

var NBMAX = 32;
var LDWORK = NBMAX + 1;
var CONE = new Complex128( 1.0, 0.0 );
var CMONE = new Complex128( -1.0, 0.0 );


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
* This is the blocked version of the algorithm, calling Level 3 BLAS.
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
function zpbtrf( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB ) {
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

	// Determine block size. Hardcode NB = 32 (matching NBMAX).
	nb = NBMAX;
	nb = Math.min( nb, NBMAX );

	if ( nb <= 1 || nb > kd ) {
		// Use unblocked code
		return zpbtf2( uplo, N, kd, AB, sa1, sa2, offsetAB );
	}

	// Use blocked code
	// Allocate workspace: WORK(LDWORK, NBMAX) stored column-major
	WORK = new Complex128Array( LDWORK * NBMAX );

	if ( uplo === 'upper' ) {
		// Factorize A = U^H * U

		// Zero out the upper triangle of WORK
		for ( jj = 0; jj < nb; jj++ ) {
			for ( ii = 0; ii < jj; ii++ ) {
				WORK.set( new Complex128( 0.0, 0.0 ), ii + (jj * LDWORK) );
			}
		}

		// Process the band matrix one block at a time
		for ( i = 0; i < N; i += nb ) {
			ib = Math.min( nb, N - i );

			// Factorize the diagonal block

			// zpotf2('upper', IB, AB(KD+1, I+1), LDAB-1, II)
			iinfo = zpotf2( 'upper', ib, AB, sa1, sa2 - sa1, offsetAB + (kd * sa1) + (i * sa2) );
			if ( iinfo !== 0 ) {
				return i + iinfo;
			}

			if ( i + ib < N ) {
				i2 = Math.min( kd - ib, N - i - ib );
				i3 = Math.min( ib, N - i - kd );

				if ( i2 > 0 ) {
					// Update A12:
					// ZTRSM('Left','Upper','Conjugate transpose','Non-unit', IB, I2, CONE,
					//        AB(KD+1,I), LDAB-1, AB(KD+1-IB,I+IB), LDAB-1)
					ztrsm( 'left', 'upper', 'conjugate-transpose', 'non-unit', ib, i2, CONE,
						AB, sa1, sa2 - sa1, offsetAB + (kd * sa1) + (i * sa2),
						AB, sa1, sa2 - sa1, offsetAB + (( kd - ib ) * sa1) + (( i + ib ) * sa2)
					);

					// Update A22:

					// ZHERK('Upper','Conjugate transpose', I2, IB, -ONE,

					//        AB(KD+1-IB,I+IB), LDAB-1, ONE, AB(KD+1,I+IB), LDAB-1)
					zherk( 'upper', 'conjugate-transpose', i2, ib, -1.0,
						AB, sa1, sa2 - sa1, offsetAB + (( kd - ib ) * sa1) + (( i + ib ) * sa2),
						1.0,
						AB, sa1, sa2 - sa1, offsetAB + (kd * sa1) + (( i + ib ) * sa2)
					);
				}

				if ( i3 > 0 ) {
					// Copy the upper triangle of the IB-by-I3 block from AB to WORK
					for ( jj = 0; jj < i3; jj++ ) {
						for ( ii = jj; ii < ib; ii++ ) {
							WORK.set( AB.get( offsetAB + (( ii - jj ) * sa1) + (( jj + i + kd ) * sa2) ), ii + (jj * LDWORK) );
						}
					}

					// ZTRSM('Left','Upper','Conjugate transpose','Non-unit', IB, I3, CONE,
					//        AB(KD+1,I), LDAB-1, WORK, LDWORK)
					ztrsm( 'left', 'upper', 'conjugate-transpose', 'non-unit', ib, i3, CONE,
						AB, sa1, sa2 - sa1, offsetAB + (kd * sa1) + (i * sa2),
						WORK, 1, LDWORK, 0
					);

					if ( i2 > 0 ) {
						// ZGEMM('Conjugate transpose','No transpose', I2, I3, IB, -CONE,
						//        AB(KD+1-IB,I+IB), LDAB-1, WORK, LDWORK, CONE,
						//        AB(1+IB,I+KD), LDAB-1)
						zgemm( 'conjugate-transpose', 'no-transpose', i2, i3, ib, CMONE,
							AB, sa1, sa2 - sa1, offsetAB + (( kd - ib ) * sa1) + (( i + ib ) * sa2),
							WORK, 1, LDWORK, 0,
							CONE,
							AB, sa1, sa2 - sa1, offsetAB + (ib * sa1) + (( i + kd ) * sa2)
						);
					}

					// ZHERK('Upper','Conjugate transpose', I3, IB, -ONE,
					//        WORK, LDWORK, ONE, AB(KD+1,I+KD), LDAB-1)
					zherk( 'upper', 'conjugate-transpose', i3, ib, -1.0,
						WORK, 1, LDWORK, 0,
						1.0,
						AB, sa1, sa2 - sa1, offsetAB + (kd * sa1) + (( i + kd ) * sa2)
					);

					// Copy the result back from WORK to AB
					for ( jj = 0; jj < i3; jj++ ) {
						for ( ii = jj; ii < ib; ii++ ) {
							AB.set( WORK.get( ii + (jj * LDWORK) ), offsetAB + (( ii - jj ) * sa1) + (( jj + i + kd ) * sa2) );
						}
					}
				}
			}
		}
	} else {
		// Factorize A = L * L^H

		// Zero out the lower triangle of WORK
		for ( jj = 0; jj < nb; jj++ ) {
			for ( ii = jj + 1; ii < nb; ii++ ) {
				WORK.set( new Complex128( 0.0, 0.0 ), ii + (jj * LDWORK) );
			}
		}

		// Process the band matrix one block at a time
		for ( i = 0; i < N; i += nb ) {
			ib = Math.min( nb, N - i );

			// Factorize the diagonal block

			// zpotf2('lower', IB, AB(1, I+1), LDAB-1, II)
			iinfo = zpotf2( 'lower', ib, AB, sa1, sa2 - sa1, offsetAB + (i * sa2) );
			if ( iinfo !== 0 ) {
				return i + iinfo;
			}

			if ( i + ib < N ) {
				i2 = Math.min( kd - ib, N - i - ib );
				i3 = Math.min( ib, N - i - kd );

				if ( i2 > 0 ) {
					// ZTRSM('Right','Lower','Conjugate transpose','Non-unit', I2, IB, CONE,
					//        AB(1,I), LDAB-1, AB(1+IB,I), LDAB-1)
					ztrsm( 'right', 'lower', 'conjugate-transpose', 'non-unit', i2, ib, CONE,
						AB, sa1, sa2 - sa1, offsetAB + (i * sa2),
						AB, sa1, sa2 - sa1, offsetAB + (ib * sa1) + (i * sa2)
					);

					// ZHERK('Lower','No transpose', I2, IB, -ONE,

					//        AB(1+IB,I), LDAB-1, ONE, AB(1,I+IB), LDAB-1)
					zherk( 'lower', 'no-transpose', i2, ib, -1.0,
						AB, sa1, sa2 - sa1, offsetAB + (ib * sa1) + (i * sa2),
						1.0,
						AB, sa1, sa2 - sa1, offsetAB + (( i + ib ) * sa2)
					);
				}

				if ( i3 > 0 ) {
					// Copy the lower triangle of the IB-by-I3 block from AB to WORK
					for ( jj = 0; jj < ib; jj++ ) {
						for ( ii = 0; ii < Math.min( jj + 1, i3 ); ii++ ) {
							WORK.set( AB.get( offsetAB + (( kd - jj + ii ) * sa1) + (( jj + i ) * sa2) ), ii + (jj * LDWORK) );
						}
					}

					// ZTRSM('Right','Lower','Conjugate transpose','Non-unit', I3, IB, CONE,
					//        AB(1,I), LDAB-1, WORK, LDWORK)
					ztrsm( 'right', 'lower', 'conjugate-transpose', 'non-unit', i3, ib, CONE,
						AB, sa1, sa2 - sa1, offsetAB + (i * sa2),
						WORK, 1, LDWORK, 0
					);

					if ( i2 > 0 ) {
						// ZGEMM('No transpose','Conjugate transpose', I3, I2, IB, -CONE,
						//        WORK, LDWORK, AB(1+IB,I), LDAB-1, CONE,
						//        AB(1+KD-IB,I+IB), LDAB-1)
						zgemm( 'no-transpose', 'conjugate-transpose', i3, i2, ib, CMONE,
							WORK, 1, LDWORK, 0,
							AB, sa1, sa2 - sa1, offsetAB + (ib * sa1) + (i * sa2),
							CONE,
							AB, sa1, sa2 - sa1, offsetAB + (( kd - ib ) * sa1) + (( i + ib ) * sa2)
						);
					}

					// ZHERK('Lower','No transpose', I3, IB, -ONE,
					//        WORK, LDWORK, ONE, AB(1,I+KD), LDAB-1)
					zherk( 'lower', 'no-transpose', i3, ib, -1.0,
						WORK, 1, LDWORK, 0,
						1.0,
						AB, sa1, sa2 - sa1, offsetAB + (( i + kd ) * sa2)
					);

					// Copy the result back from WORK to AB
					for ( jj = 0; jj < ib; jj++ ) {
						for ( ii = 0; ii < Math.min( jj + 1, i3 ); ii++ ) {
							AB.set( WORK.get( ii + (jj * LDWORK) ), offsetAB + (( kd - jj + ii ) * sa1) + (( jj + i ) * sa2) );
						}
					}
				}
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zpbtrf;
