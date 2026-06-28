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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dznrm2 from '../../../../blas/base/dznrm2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );
var NEGCONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes a step of QR factorization with column pivoting using a.
* blocked algorithm. It factors at most NB columns of the M-by-N
* submatrix A(OFFSET+1:M, 1:N). The actual number of columns
* factored is returned as kb.
*
* A, TAU, AUXV, F are Complex128Arrays. Strides and offsets are in complex elements.
* VN1, VN2 are real (Float64Array).
*
* @private
* @param {NonNegativeInteger} M - total rows of A
* @param {NonNegativeInteger} N - columns of current submatrix
* @param {NonNegativeInteger} offset - rows already factored
* @param {NonNegativeInteger} nb - desired block size
* @param {Complex128Array} A - matrix
* @param {integer} strideA1 - first dim stride of A (complex elements)
* @param {integer} strideA2 - second dim stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} JPVT - column permutation
* @param {integer} strideJPVT - stride for JPVT
* @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
* @param {Complex128Array} TAU - reflector scalars
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Float64Array} VN1 - partial column norms (real)
* @param {integer} strideVN1 - stride for VN1
* @param {NonNegativeInteger} offsetVN1 - starting index for VN1
* @param {Float64Array} VN2 - original column norms (real)
* @param {integer} strideVN2 - stride for VN2
* @param {NonNegativeInteger} offsetVN2 - starting index for VN2
* @param {Complex128Array} AUXV - auxiliary vector (length >= NB)
* @param {integer} strideAUXV - stride for AUXV (complex elements)
* @param {NonNegativeInteger} offsetAUXV - starting index for AUXV (complex elements)
* @param {Complex128Array} F - panel update matrix (N-by-NB)
* @param {integer} strideF1 - first dim stride of F (complex elements)
* @param {integer} strideF2 - second dim stride of F (complex elements)
* @param {NonNegativeInteger} offsetF - starting index for F (complex elements)
* @returns {integer} kb - actual number of columns factored
*/
function zlaqps( M, N, offset, nb, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, AUXV, strideAUXV, offsetAUXV, F, strideF1, strideF2, offsetF ) {
	var negTauK;
	var lastrk;
	var lsticc;
	var tol3z;
	var itemp;
	var temp2;
	var temp;
	var TAUv;
	var tauK;
	var pvt;
	var akk;
	var sa1;
	var sa2;
	var sf1;
	var sf2;
	var Av;
	var Fv;
	var oA;
	var oF;
	var rk;
	var k;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;
	sf1 = strideF1;
	sf2 = strideF2;

	// Get Float64Array views for direct element access
	Av = reinterpret( A, 0 );
	Fv = reinterpret( F, 0 );
	TAUv = reinterpret( TAU, 0 );
	oA = offsetA * 2; // Float64 offset
	oF = offsetF * 2; // Float64 offset

	lastrk = Math.min( M, N + offset );
	lsticc = 0;
	k = 0;
	tol3z = Math.sqrt( dlamch( 'Epsilon' ) );
	akk = new Float64Array( 2 );

	// Main loop (Fortran label 10: while k < NB and lsticc == 0)
	while ( k < nb && lsticc === 0 ) {
		rk = offset + k;

		// Determine pivot column
		pvt = k + idamax( N - k, VN1, strideVN1, offsetVN1 + (k * strideVN1) );

		if ( pvt !== k ) {
			// Swap columns pvt and k of A (all M rows)
			zswap( M, A, sa1, offsetA + (pvt * sa2), A, sa1, offsetA + (k * sa2) );

			// Swap rows pvt and k of F (first k columns, using column stride as row traversal)
			zswap( k, F, sf2, offsetF + (pvt * sf1), F, sf2, offsetF + (k * sf1) );

			// Swap JPVT entries
			itemp = JPVT[ offsetJPVT + (pvt * strideJPVT) ];
			JPVT[ offsetJPVT + (pvt * strideJPVT) ] = JPVT[ offsetJPVT + (k * strideJPVT) ];
			JPVT[ offsetJPVT + (k * strideJPVT) ] = itemp;

			// Swap norms
			VN1[ offsetVN1 + (pvt * strideVN1) ] = VN1[ offsetVN1 + (k * strideVN1) ];
			VN2[ offsetVN2 + (pvt * strideVN2) ] = VN2[ offsetVN2 + (k * strideVN2) ];
		}

		// Apply previous Householder reflectors to column k:
		// A(rk:M-1, k) -= A(rk:M-1, 0:k-1) * conj(F(k, 0:k-1))^T
		if ( k > 0 ) {
			// Conjugate F(k, 0:k-1) in place
			for ( j = 0; j < k; j++ ) {
				// F(k, j): conjugate imaginary part
				Fv[ oF + (2 * ( (k * sf1) + (j * sf2) )) + 1 ] = -Fv[ oF + (2 * ( (k * sf1) + (j * sf2) )) + 1 ];
			}

			// A(rk:M-1, k) += -1 * A(rk:M-1, 0:k-1) * F(k, 0:k-1)^T
			zgemv(
				'no-transpose', M - rk, k,
				NEGCONE,
				A, sa1, sa2, offsetA + (rk * sa1),
				F, sf2, offsetF + (k * sf1),
				CONE,
				A, sa1, offsetA + (rk * sa1) + (k * sa2)
			);

			// Un-conjugate F(k, 0:k-1)
			for ( j = 0; j < k; j++ ) {
				Fv[ oF + (2 * ( (k * sf1) + (j * sf2) )) + 1 ] = -Fv[ oF + (2 * ( (k * sf1) + (j * sf2) )) + 1 ];
			}
		}

		// Generate elementary reflector H(k)
		if ( rk < M - 1 ) {
			zlarfg(
				M - rk,
				A, offsetA + (rk * sa1) + (k * sa2),
				A, sa1, offsetA + (( rk + 1 ) * sa1) + (k * sa2),
				TAU, offsetTAU + (k * strideTAU)
			);
		} else {
			zlarfg(
				1,
				A, offsetA + (rk * sa1) + (k * sa2),
				A, sa1, offsetA + (rk * sa1) + (k * sa2),
				TAU, offsetTAU + (k * strideTAU)
			);
		}

		// Save A(rk, k) and set to 1 for reflector application
		akk[ 0 ] = Av[ oA + (2 * ( (rk * sa1) + (k * sa2) )) ];
		akk[ 1 ] = Av[ oA + (2 * ( (rk * sa1) + (k * sa2) )) + 1 ];
		Av[ oA + (2 * ( (rk * sa1) + (k * sa2) )) ] = 1.0;
		Av[ oA + (2 * ( (rk * sa1) + (k * sa2) )) + 1 ] = 0.0;

		// Compute k-th column of F:

		// F(k+1:N-1, k) = tau(k) * A(rk:M-1, k+1:N-1)^H * A(rk:M-1, k)
		if ( k < N - 1 ) {
			// tau(k) as Complex128
			tauK = new Complex128(
				TAUv[ ( offsetTAU + (k * strideTAU) ) * 2 ],
				TAUv[ (( offsetTAU + (k * strideTAU) ) * 2) + 1 ]
			);
			zgemv(
				'conjugate-transpose', M - rk, N - k - 1,
				tauK,
				A, sa1, sa2, offsetA + (rk * sa1) + (( k + 1 ) * sa2),
				A, sa1, offsetA + (rk * sa1) + (k * sa2),
				CZERO,
				F, sf1, offsetF + (( k + 1 ) * sf1) + (k * sf2)
			);
		}

		// Zero out F(0:k, k)
		for ( j = 0; j <= k; j++ ) {
			Fv[ oF + (2 * ( (j * sf1) + (k * sf2) )) ] = 0.0;
			Fv[ oF + (2 * ( (j * sf1) + (k * sf2) )) + 1 ] = 0.0;
		}

		// Update F with contribution from previous reflectors
		if ( k > 0 ) {
			// AUXV(0:k-1) = -tau(k) * A(rk:M-1, 0:k-1)^H * A(rk:M-1, k)
			negTauK = new Complex128(
				-TAUv[ ( offsetTAU + (k * strideTAU) ) * 2 ],
				-TAUv[ (( offsetTAU + (k * strideTAU) ) * 2) + 1 ]
			);
			zgemv(
				'conjugate-transpose', M - rk, k,
				negTauK,
				A, sa1, sa2, offsetA + (rk * sa1),
				A, sa1, offsetA + (rk * sa1) + (k * sa2),
				CZERO,
				AUXV, strideAUXV, offsetAUXV
			);

			// F(0:N-1, k) += F(0:N-1, 0:k-1) * AUXV(0:k-1)
			zgemv(
				'no-transpose', N, k,
				CONE,
				F, sf1, sf2, offsetF,
				AUXV, strideAUXV, offsetAUXV,
				CONE,
				F, sf1, offsetF + (k * sf2)
			);
		}

		// Update the current row of A
		if ( k < N - 1 ) {
			zgemm(
				'no-transpose', 'conjugate-transpose', 1, N - k - 1, k + 1,
				NEGCONE,
				A, sa1, sa2, offsetA + (rk * sa1),
				F, sf1, sf2, offsetF + (( k + 1 ) * sf1),
				CONE,
				A, sa1, sa2, offsetA + (rk * sa1) + (( k + 1 ) * sa2)
			);
		}

		// Update partial column norms
		if ( rk < lastrk ) {
			for ( j = k + 1; j < N; j++ ) {
				if ( VN1[ offsetVN1 + (j * strideVN1) ] !== 0.0 ) {
					temp = cmplx.absAt( Av, oA + (2 * ( (rk * sa1) + (j * sa2) )) ) / VN1[ offsetVN1 + (j * strideVN1) ];
					temp = Math.max( 0.0, ( 1.0 + temp ) * ( 1.0 - temp ) );
					temp2 = temp * Math.pow(
						VN1[ offsetVN1 + (j * strideVN1) ] /
						VN2[ offsetVN2 + (j * strideVN2) ], 2
					);

					if ( temp2 <= tol3z ) {
						// Mark for recomputation using linked-list via VN2
						VN2[ offsetVN2 + (j * strideVN2) ] = lsticc;
						lsticc = j;
					} else {
						VN1[ offsetVN1 + (j * strideVN1) ] *= Math.sqrt( temp );
					}
				}
			}
		}

		// Restore A(rk, k)
		Av[ oA + (2 * ( (rk * sa1) + (k * sa2) )) ] = akk[ 0 ];
		Av[ oA + (2 * ( (rk * sa1) + (k * sa2) )) + 1 ] = akk[ 1 ];

		k += 1;
	}

	// Set KB = actual number of columns factored
	rk = offset + k;

	// Apply the block reflector to the rest of the matrix
	if ( k < Math.min( N, M - offset ) ) {
		zgemm(
			'no-transpose', 'conjugate-transpose', M - rk, N - k, k,
			NEGCONE,
			A, sa1, sa2, offsetA + (rk * sa1),
			F, sf1, sf2, offsetF + (k * sf1),
			CONE,
			A, sa1, sa2, offsetA + (rk * sa1) + (k * sa2)
		);
	}

	// Recompute norms for columns flagged in lsticc linked list
	while ( lsticc > 0 ) {
		itemp = Math.round( VN2[ offsetVN2 + (lsticc * strideVN2) ] );
		VN1[ offsetVN1 + (lsticc * strideVN1) ] = dznrm2(
			M - rk,
			A, sa1, offsetA + (rk * sa1) + (lsticc * sa2)
		);
		VN2[ offsetVN2 + (lsticc * strideVN2) ] = VN1[ offsetVN1 + (lsticc * strideVN1) ];
		lsticc = itemp;
	}

	return k;
}


// EXPORTS //

export default zlaqps;
