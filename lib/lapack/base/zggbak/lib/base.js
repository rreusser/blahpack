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

import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// MAIN //

/**
* Back-transform eigenvectors of a balanced pair of general real matrices.
*
* Forms the right or left eigenvectors of a generalized eigenvalue
* problem by backward transformation on the computed eigenvectors of
* the balanced pair of matrices output by ZGGBAL.
*
* V is a Complex128Array. Strides and offsets are in complex elements.
*
* @private
* @param {string} job - specifies the type of backward transformation:
* 'N': do nothing; 'P': permute only; 'S': scale only; 'B': both
* @param {string} side - `'right'` for right eigenvectors, `'left'` for left eigenvectors
* @param {NonNegativeInteger} N - number of rows of V
* @param {integer} ilo - ilo from balancing (1-based)
* @param {integer} ihi - ihi from balancing (1-based)
* @param {Float64Array} LSCALE - left scaling/permutation factors from ZGGBAL
* @param {integer} strideLSCALE - stride for LSCALE
* @param {NonNegativeInteger} offsetLSCALE - starting index for LSCALE
* @param {Float64Array} RSCALE - right scaling/permutation factors from ZGGBAL
* @param {integer} strideRSCALE - stride for RSCALE
* @param {NonNegativeInteger} offsetRSCALE - starting index for RSCALE
* @param {NonNegativeInteger} M - number of columns of V
* @param {Complex128Array} V - eigenvector matrix (modified in-place)
* @param {integer} strideV1 - stride of the first dimension of V (complex elements)
* @param {integer} strideV2 - stride of the second dimension of V (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (complex elements)
* @returns {integer} status code (0 = success)
*/
function zggbak( job, side, N, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, M, V, strideV1, strideV2, offsetV ) {
	var rightv;
	var leftv;
	var sv1;
	var sv2;
	var sL;
	var sR;
	var oL;
	var oR;
	var oV;
	var i;
	var k;

	rightv = ( side === 'right' );
	leftv = ( side === 'left' );

	sv1 = strideV1;
	sv2 = strideV2;
	oV = offsetV;
	sL = strideLSCALE;
	sR = strideRSCALE;
	oL = offsetLSCALE;
	oR = offsetRSCALE;

	// Quick returns
	if ( N === 0 ) {
		return 0;
	}
	if ( M === 0 ) {
		return 0;
	}
	if ( job === 'none' ) {
		return 0;
	}

	// Scaling section: apply if JOB='S' or JOB='B', and ILO != IHI
	if ( ilo !== ihi ) {
		if ( job === 'scale' || job === 'both' ) {
			// Scale right eigenvectors by RSCALE
			if ( rightv ) {
				// Fortran: DO I = ILO, IHI; CALL ZDSCAL(M, RSCALE(I), V(I,1), LDV)
				// V(I,1) with stride LDV iterates over columns of row I
				for ( i = ilo - 1; i <= ihi - 1; i++ ) {
					zdscal( M, RSCALE[ oR + (i * sR) ], V, sv2, oV + (i * sv1) );
				}
			}

			// Scale left eigenvectors by LSCALE
			if ( leftv ) {
				for ( i = ilo - 1; i <= ihi - 1; i++ ) {
					zdscal( M, LSCALE[ oL + (i * sL) ], V, sv2, oV + (i * sv1) );
				}
			}
		}
	}

	// Permutation section: apply if JOB='P' or JOB='B'
	if ( job === 'permute' || job === 'both' ) {
		// Right eigenvectors
		if ( rightv ) {
			// Backward permutation: rows below ILO
			// Fortran: DO I = ILO-1, 1, -1; K = INT(RSCALE(I)); IF (K==I) CYCLE; CALL ZSWAP(M, V(I,1), LDV, V(K,1), LDV)
			if ( ilo !== 1 ) {
				for ( i = ilo - 2; i >= 0; i-- ) {
					k = Math.trunc( RSCALE[ oR + (i * sR) ] ) - 1; // convert to 0-based
					if ( k === i ) {
						continue;
					}
					zswap( M, V, sv2, oV + (i * sv1), V, sv2, oV + (k * sv1) );
				}
			}

			// Forward permutation: rows above IHI
			// Fortran: DO I = IHI+1, N; K = INT(RSCALE(I)); IF (K==I) CYCLE; CALL ZSWAP(M, V(I,1), LDV, V(K,1), LDV)
			if ( ihi !== N ) {
				for ( i = ihi; i < N; i++ ) {
					k = Math.trunc( RSCALE[ oR + (i * sR) ] ) - 1; // convert to 0-based
					if ( k === i ) {
						continue;
					}
					zswap( M, V, sv2, oV + (i * sv1), V, sv2, oV + (k * sv1) );
				}
			}
		}

		// Left eigenvectors
		if ( leftv ) {
			// Backward permutation: rows below ILO
			if ( ilo !== 1 ) {
				for ( i = ilo - 2; i >= 0; i-- ) {
					k = Math.trunc( LSCALE[ oL + (i * sL) ] ) - 1; // convert to 0-based
					if ( k === i ) {
						continue;
					}
					zswap( M, V, sv2, oV + (i * sv1), V, sv2, oV + (k * sv1) );
				}
			}

			// Forward permutation: rows above IHI
			if ( ihi !== N ) {
				for ( i = ihi; i < N; i++ ) {
					k = Math.trunc( LSCALE[ oL + (i * sL) ] ) - 1; // convert to 0-based
					if ( k === i ) {
						continue;
					}
					zswap( M, V, sv2, oV + (i * sv1), V, sv2, oV + (k * sv1) );
				}
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zggbak;
