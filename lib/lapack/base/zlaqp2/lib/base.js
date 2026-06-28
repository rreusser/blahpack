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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dznrm2 from '../../../../blas/base/dznrm2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import cmplx from '../../../../cmplx.js';


// MAIN //

/**
* Computes a QR factorization with column pivoting of the M-by-N matrix A.
* using an unblocked algorithm. The factored form is A_P = Q_R.
*
* A, TAU, WORK are Complex128Arrays. Strides and offsets are in complex elements.
* VN1, VN2 are real (Float64Array).
*
* @private
* @param {NonNegativeInteger} M - total number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} offset - number of rows already factored
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} JPVT - column permutation array (length >= N)
* @param {integer} strideJPVT - stride for JPVT
* @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
* @param {Complex128Array} TAU - output reflector scalars
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Float64Array} VN1 - partial column norms (real array)
* @param {integer} strideVN1 - stride for VN1
* @param {NonNegativeInteger} offsetVN1 - starting index for VN1
* @param {Float64Array} VN2 - original column norms (real array)
* @param {integer} strideVN2 - stride for VN2
* @param {NonNegativeInteger} offsetVN2 - starting index for VN2
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
*/
function zlaqp2( M, N, offset, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, WORK, strideWork, offsetWork ) {
	var conjTauv;
	var conjTau;
	var tol3z;
	var offpi;
	var itemp;
	var temp2;
	var temp;
	var TAUv;
	var aii;
	var pvt;
	var sa1;
	var sa2;
	var Av;
	var oA;
	var mn;
	var i;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;

	// Get Float64Array views for direct element access
	Av = reinterpret( A, 0 );
	TAUv = reinterpret( TAU, 0 );
	oA = offsetA * 2; // Float64 offset

	mn = Math.min( M - offset, N );
	tol3z = Math.sqrt( dlamch( 'Epsilon' ) );

	conjTau = new Complex128Array( 1 );
	conjTauv = reinterpret( conjTau, 0 );
	aii = new Float64Array( 2 );

	for ( i = 0; i < mn; i++ ) {
		offpi = offset + i;

		// Determine pivot: find column with largest norm in VN1(i:N-1)
		pvt = i + idamax( N - i, VN1, strideVN1, offsetVN1 + (i * strideVN1) );

		// Swap columns if needed
		if ( pvt !== i ) {
			// Swap columns pvt and i of A (all M rows)
			zswap( M, A, sa1, offsetA + (pvt * sa2), A, sa1, offsetA + (i * sa2) );

			// Swap JPVT entries
			itemp = JPVT[ offsetJPVT + (pvt * strideJPVT) ];
			JPVT[ offsetJPVT + (pvt * strideJPVT) ] = JPVT[ offsetJPVT + (i * strideJPVT) ];
			JPVT[ offsetJPVT + (i * strideJPVT) ] = itemp;

			// Swap norms
			VN1[ offsetVN1 + (pvt * strideVN1) ] = VN1[ offsetVN1 + (i * strideVN1) ];
			VN2[ offsetVN2 + (pvt * strideVN2) ] = VN2[ offsetVN2 + (i * strideVN2) ];
		}

		// Generate elementary reflector H(i) to annul A(offpi+1:M-1, i)
		if ( offpi < M - 1 ) {
			// Zlarfg expects Complex128Array with complex-element offsets
			zlarfg(
				M - offpi,
				A, offsetA + (offpi * sa1) + (i * sa2),
				A, sa1, offsetA + (( offpi + 1 ) * sa1) + (i * sa2),
				TAU, offsetTAU + (i * strideTAU)
			);
		} else {
			zlarfg(
				1,
				A, offsetA + (( M - 1 ) * sa1) + (i * sa2),
				A, sa1, offsetA + (( M - 1 ) * sa1) + (i * sa2),
				TAU, offsetTAU + (i * strideTAU)
			);
		}

		if ( i < N - 1 ) {
			// Apply H(i)^H to A(offpi:M-1, i+1:N-1) from the left
			// Save A(offpi, i) and set it to 1
			aii[ 0 ] = Av[ oA + (2 * ( (offpi * sa1) + (i * sa2) )) ];
			aii[ 1 ] = Av[ oA + (2 * ( (offpi * sa1) + (i * sa2) )) + 1 ];
			Av[ oA + (2 * ( (offpi * sa1) + (i * sa2) )) ] = 1.0;
			Av[ oA + (2 * ( (offpi * sa1) + (i * sa2) )) + 1 ] = 0.0;

			// conj(tau(i))
			conjTauv[ 0 ] = TAUv[ ( offsetTAU + (i * strideTAU) ) * 2 ];
			conjTauv[ 1 ] = -TAUv[ (( offsetTAU + (i * strideTAU) ) * 2) + 1 ];

			zlarf(
				'left', M - offpi, N - i - 1,
				A, sa1, offsetA + (offpi * sa1) + (i * sa2),
				conjTau, 0,
				A, sa1, sa2, offsetA + (offpi * sa1) + (( i + 1 ) * sa2),
				WORK, strideWork, offsetWork
			);

			// Restore A(offpi, i)
			Av[ oA + (2 * ( (offpi * sa1) + (i * sa2) )) ] = aii[ 0 ];
			Av[ oA + (2 * ( (offpi * sa1) + (i * sa2) )) + 1 ] = aii[ 1 ];
		}

		// Update partial column norms
		for ( j = i + 1; j < N; j++ ) {
			if ( VN1[ offsetVN1 + (j * strideVN1) ] !== 0.0 ) {
				// temp = |A(offpi, j)| / VN1(j)
				temp = cmplx.absAt( Av, oA + (2 * ( (offpi * sa1) + (j * sa2) )) ) / VN1[ offsetVN1 + (j * strideVN1) ];
				temp = Math.max( 0.0, ( 1.0 - (temp * temp) ) );
				temp2 = temp * Math.pow(
					VN1[ offsetVN1 + (j * strideVN1) ] /
					VN2[ offsetVN2 + (j * strideVN2) ], 2
				);

				if ( temp2 <= tol3z ) {
					if ( offpi < M - 1 ) {
						VN1[ offsetVN1 + (j * strideVN1) ] = dznrm2(
							M - offpi - 1,
							A, sa1, offsetA + (( offpi + 1 ) * sa1) + (j * sa2)
						);
						VN2[ offsetVN2 + (j * strideVN2) ] = VN1[ offsetVN1 + (j * strideVN1) ];
					} else {
						VN1[ offsetVN1 + (j * strideVN1) ] = 0.0;
						VN2[ offsetVN2 + (j * strideVN2) ] = 0.0;
					}
				} else {
					VN1[ offsetVN1 + (j * strideVN1) ] *= Math.sqrt( temp );
				}
			}
		}
	}
}


// EXPORTS //

export default zlaqp2;
