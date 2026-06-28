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

import dlarfg from '../../dlarfg/lib/base.js';
import dlarf from '../../dlarf/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';
import dnrm2 from '../../../../blas/base/dnrm2/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var tol3z = Math.sqrt( dlamch( 'Epsilon' ) );


// MAIN //

/**
* Computes a QR factorization with column pivoting of the block.
* A(offset:M-1, 0:N-1) using Level 2 BLAS.
*
* The block A(0:offset-1, 0:N-1) is accordingly pivoted, but not factorized.
*
* @private
* @param {NonNegativeInteger} M - total number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} offset - number of rows already factored (0-based)
* @param {Float64Array} A - input/output matrix (M-by-N)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Int32Array} JPVT - column permutation array (length >= N), 0-based
* @param {integer} strideJPVT - stride for JPVT
* @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
* @param {Float64Array} TAU - output reflector scalars (length >= min(M-offset, N))
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} VN1 - partial column norms (length >= N)
* @param {integer} strideVN1 - stride for VN1
* @param {NonNegativeInteger} offsetVN1 - starting index for VN1
* @param {Float64Array} VN2 - original column norms (length >= N)
* @param {integer} strideVN2 - stride for VN2
* @param {NonNegativeInteger} offsetVN2 - starting index for VN2
* @param {Float64Array} WORK - workspace (length >= N)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
*/
function dlaqp2( M, N, offset, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, WORK, strideWork, offsetWork ) {
	var itemp;
	var offpi;
	var temp2;
	var temp;
	var aii;
	var pvt;
	var mn;
	var pA;
	var i;
	var j;

	mn = Math.min( M - offset, N );

	// Compute factorization
	for ( i = 0; i < mn; i++ ) {
		offpi = offset + i;

		// Determine ith pivot column: find column with largest norm in VN1(i:N-1)
		pvt = i + idamax( N - i, VN1, strideVN1, offsetVN1 + ( i * strideVN1 ) );

		// Swap columns if needed
		if ( pvt !== i ) {
			// Swap columns pvt and i of A (all M rows)
			dswap( M, A, strideA1, offsetA + ( pvt * strideA2 ), A, strideA1, offsetA + ( i * strideA2 ) );

			// Swap JPVT entries
			itemp = JPVT[ offsetJPVT + ( pvt * strideJPVT ) ];
			JPVT[ offsetJPVT + ( pvt * strideJPVT ) ] = JPVT[ offsetJPVT + ( i * strideJPVT ) ];
			JPVT[ offsetJPVT + ( i * strideJPVT ) ] = itemp;

			// Swap norms
			VN1[ offsetVN1 + ( pvt * strideVN1 ) ] = VN1[ offsetVN1 + ( i * strideVN1 ) ];
			VN2[ offsetVN2 + ( pvt * strideVN2 ) ] = VN2[ offsetVN2 + ( i * strideVN2 ) ];
		}

		// Generate elementary reflector H(i) to annul A(offpi+1:M-1, i)
		if ( offpi < M - 1 ) {
			// dlarfg( N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau )
			dlarfg(M - offpi, A, offsetA + ( offpi * strideA1 ) + ( i * strideA2 ), A, strideA1, offsetA + ( ( offpi + 1 ) * strideA1 ) + ( i * strideA2 ), TAU, offsetTAU + ( i * strideTAU ));
		} else {
			dlarfg(1, A, offsetA + ( ( M - 1 ) * strideA1 ) + ( i * strideA2 ), A, strideA1, offsetA + ( ( M - 1 ) * strideA1 ) + ( i * strideA2 ), TAU, offsetTAU + ( i * strideTAU ));
		}

		if ( i < N - 1 ) {
			// Apply H(i)^T to A(offpi:M-1, i+1:N-1) from the left

			// Save A(offpi, i) and set it to 1
			pA = offsetA + ( offpi * strideA1 ) + ( i * strideA2 );
			aii = A[ pA ];
			A[ pA ] = 1.0;

			// dlarf( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork )
			dlarf('left', M - offpi, N - i - 1, A, strideA1, offsetA + ( offpi * strideA1 ) + ( i * strideA2 ), TAU[ offsetTAU + ( i * strideTAU ) ], A, strideA1, strideA2, offsetA + ( offpi * strideA1 ) + ( ( i + 1 ) * strideA2 ), WORK, strideWork, offsetWork);

			// Restore A(offpi, i)
			A[ pA ] = aii;
		}

		// Update partial column norms
		for ( j = i + 1; j < N; j++ ) {
			if ( VN1[ offsetVN1 + ( j * strideVN1 ) ] !== 0.0 ) {
				// NOTE: The following 4 lines follow from the analysis in
				// LAPACK Working Note 176.
				temp = Math.abs( A[ offsetA + ( offpi * strideA1 ) + ( j * strideA2 ) ] ) / VN1[ offsetVN1 + ( j * strideVN1 ) ];
				temp = Math.max( 0.0, 1.0 - ( temp * temp ) );
				temp2 = temp * Math.pow( VN1[ offsetVN1 + ( j * strideVN1 ) ] / VN2[ offsetVN2 + ( j * strideVN2 ) ], 2 );

				if ( temp2 <= tol3z ) {
					if ( offpi < M - 1 ) {
						VN1[ offsetVN1 + ( j * strideVN1 ) ] = dnrm2(M - offpi - 1, A, strideA1, offsetA + ( ( offpi + 1 ) * strideA1 ) + ( j * strideA2 ));
						VN2[ offsetVN2 + ( j * strideVN2 ) ] = VN1[ offsetVN1 + ( j * strideVN1 ) ];
					} else {
						VN1[ offsetVN1 + ( j * strideVN1 ) ] = 0.0;
						VN2[ offsetVN2 + ( j * strideVN2 ) ] = 0.0;
					}
				} else {
					VN1[ offsetVN1 + ( j * strideVN1 ) ] *= Math.sqrt( temp );
				}
			}
		}
	}
}


// EXPORTS //

export default dlaqp2;
