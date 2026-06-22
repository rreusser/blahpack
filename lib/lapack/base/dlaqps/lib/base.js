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

import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dlarfg from '../../dlarfg/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';
import dnrm2 from '../../../../blas/base/dnrm2/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var TOL3Z = Math.sqrt( dlamch( 'Epsilon' ) );


// MAIN //

/**
* Computes a step of QR factorization with column pivoting of a.
* real M-by-N matrix A by using Level 3 BLAS. It tries to factorize
* NB columns from A starting from the row OFFSET+1, and updates all
* of the matrix with Level 3 BLAS.
*
* In the description below, let K denote the actual number of columns
* factored, which is returned as kb.
*
* @private
* @param {NonNegativeInteger} M - total rows of A
* @param {NonNegativeInteger} N - columns of current submatrix
* @param {NonNegativeInteger} offset - rows already factored
* @param {NonNegativeInteger} nb - desired block size
* @param {Float64Array} A - matrix
* @param {integer} strideA1 - first dim stride of A
* @param {integer} strideA2 - second dim stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Int32Array} JPVT - column permutation
* @param {integer} strideJPVT - stride for JPVT
* @param {NonNegativeInteger} offsetJPVT - starting index for JPVT
* @param {Float64Array} TAU - reflector scalars
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} VN1 - partial column norms
* @param {integer} strideVN1 - stride for VN1
* @param {NonNegativeInteger} offsetVN1 - starting index for VN1
* @param {Float64Array} VN2 - original column norms
* @param {integer} strideVN2 - stride for VN2
* @param {NonNegativeInteger} offsetVN2 - starting index for VN2
* @param {Float64Array} AUXV - auxiliary vector (length >= NB)
* @param {integer} strideAUXV - stride for AUXV
* @param {NonNegativeInteger} offsetAUXV - starting index for AUXV
* @param {Float64Array} F - panel update matrix (N-by-NB)
* @param {integer} strideF1 - first dim stride of F
* @param {integer} strideF2 - second dim stride of F
* @param {NonNegativeInteger} offsetF - starting index for F
* @returns {integer} kb - actual number of columns factored
*/
function dlaqps( M, N, offset, nb, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, AUXV, strideAUXV, offsetAUXV, F, strideF1, strideF2, offsetF ) {
	var lastrk;
	var lsticc;
	var itemp;
	var temp2;
	var temp;
	var tauK;
	var pvt;
	var akk;
	var sa1;
	var sa2;
	var sf1;
	var sf2;
	var rk;
	var k;
	var j;

	sa1 = strideA1;
	sa2 = strideA2;
	sf1 = strideF1;
	sf2 = strideF2;

	lastrk = Math.min( M, N + offset );
	lsticc = 0;
	k = 0;

	// Main loop (Fortran label 10: while k < NB and lsticc == 0)
	while ( k < nb && lsticc === 0 ) {
		rk = offset + k;

		// Determine pivot column: find column with largest norm in VN1(k:N-1)
		pvt = k + idamax( N - k, VN1, strideVN1, offsetVN1 + ( k * strideVN1 ) );

		if ( pvt !== k ) {
			// Swap columns pvt and k of A (all M rows)
			dswap( M, A, sa1, offsetA + ( pvt * sa2 ), A, sa1, offsetA + ( k * sa2 ) );

			// Swap rows pvt and k of F (first k columns)

			// F(pvt, 0:k-1) <-> F(k, 0:k-1), row stride is sf1, column stride is sf2
			dswap( k, F, sf2, offsetF + ( pvt * sf1 ), F, sf2, offsetF + ( k * sf1 ) );

			// Swap JPVT entries
			itemp = JPVT[ offsetJPVT + ( pvt * strideJPVT ) ];
			JPVT[ offsetJPVT + ( pvt * strideJPVT ) ] = JPVT[ offsetJPVT + ( k * strideJPVT ) ];
			JPVT[ offsetJPVT + ( k * strideJPVT ) ] = itemp;

			// Swap norms
			VN1[ offsetVN1 + ( pvt * strideVN1 ) ] = VN1[ offsetVN1 + ( k * strideVN1 ) ];
			VN2[ offsetVN2 + ( pvt * strideVN2 ) ] = VN2[ offsetVN2 + ( k * strideVN2 ) ];
		}

		// Apply previous Householder reflectors to column k:
		// A(rk:M-1, k) -= A(rk:M-1, 0:k-1) * F(k, 0:k-1)^T
		if ( k > 0 ) {
			// dgemv('No transpose', M-rk, k, -1, A(rk,0), lda, F(k,0), ldf, 1, A(rk,k), 1)
			dgemv('no-transpose', M - rk, k, -1.0, A, sa1, sa2, offsetA + ( rk * sa1 ), F, sf2, offsetF + ( k * sf1 ), 1.0, A, sa1, offsetA + ( rk * sa1 ) + ( k * sa2 ));
		}

		// Generate elementary reflector H(k)
		if ( rk < M - 1 ) {
			dlarfg(M - rk, A, offsetA + ( rk * sa1 ) + ( k * sa2 ), A, sa1, offsetA + ( ( rk + 1 ) * sa1 ) + ( k * sa2 ), TAU, offsetTAU + ( k * strideTAU ));
		} else {
			dlarfg(1, A, offsetA + ( rk * sa1 ) + ( k * sa2 ), A, sa1, offsetA + ( rk * sa1 ) + ( k * sa2 ), TAU, offsetTAU + ( k * strideTAU ));
		}

		// Save A(rk, k) and set to 1 for reflector application
		akk = A[ offsetA + ( rk * sa1 ) + ( k * sa2 ) ];
		A[ offsetA + ( rk * sa1 ) + ( k * sa2 ) ] = 1.0;

		// Compute k-th column of F:

		// F(k+1:N-1, k) = tau(k) * A(rk:M-1, k+1:N-1)^T * A(rk:M-1, k)
		if ( k < N - 1 ) {
			tauK = TAU[ offsetTAU + ( k * strideTAU ) ];
			dgemv('transpose', M - rk, N - k - 1, tauK, A, sa1, sa2, offsetA + ( rk * sa1 ) + ( ( k + 1 ) * sa2 ), A, sa1, offsetA + ( rk * sa1 ) + ( k * sa2 ), 0.0, F, sf1, offsetF + ( ( k + 1 ) * sf1 ) + ( k * sf2 ));
		}

		// Zero out F(0:k, k)
		for ( j = 0; j <= k; j++ ) {
			F[ offsetF + ( j * sf1 ) + ( k * sf2 ) ] = 0.0;
		}

		// Update F with contribution from previous reflectors
		if ( k > 0 ) {
			tauK = TAU[ offsetTAU + ( k * strideTAU ) ];

			// AUXV(0:k-1) = -tau(k) * A(rk:M-1, 0:k-1)^T * A(rk:M-1, k)
			dgemv('transpose', M - rk, k, -tauK, A, sa1, sa2, offsetA + ( rk * sa1 ), A, sa1, offsetA + ( rk * sa1 ) + ( k * sa2 ), 0.0, AUXV, strideAUXV, offsetAUXV);

			// F(0:N-1, k) += F(0:N-1, 0:k-1) * AUXV(0:k-1)
			dgemv('no-transpose', N, k, 1.0, F, sf1, sf2, offsetF, AUXV, strideAUXV, offsetAUXV, 1.0, F, sf1, offsetF + ( k * sf2 ));
		}

		// Update the current row of A:
		// A(rk, k+1:N-1) -= A(rk, 0:k) * F(k+1:N-1, 0:k)^T
		// Fortran: DGEMV('No transpose', N-K, K, -1, F(K+1,1), LDF, A(RK,1), LDA, 1, A(RK,K+1), LDA)
		if ( k < N - 1 ) {
			dgemv('no-transpose', N - k - 1, k + 1, -1.0, F, sf1, sf2, offsetF + ( ( k + 1 ) * sf1 ), A, sa2, offsetA + ( rk * sa1 ), 1.0, A, sa2, offsetA + ( rk * sa1 ) + ( ( k + 1 ) * sa2 ));
		}

		// Update partial column norms
		if ( rk < lastrk ) {
			for ( j = k + 1; j < N; j++ ) {
				if ( VN1[ offsetVN1 + ( j * strideVN1 ) ] !== 0.0 ) {
					// Estimate updated norm
					temp = Math.abs( A[ offsetA + ( rk * sa1 ) + ( j * sa2 ) ] ) / VN1[ offsetVN1 + ( j * strideVN1 ) ];
					temp = Math.max( 0.0, ( 1.0 + temp ) * ( 1.0 - temp ) );
					temp2 = temp * Math.pow( VN1[ offsetVN1 + ( j * strideVN1 ) ] / VN2[ offsetVN2 + ( j * strideVN2 ) ], 2 );

					if ( temp2 <= TOL3Z ) {
						// Mark for recomputation using linked-list via VN2
						VN2[ offsetVN2 + ( j * strideVN2 ) ] = lsticc;
						lsticc = j;
					} else {
						VN1[ offsetVN1 + ( j * strideVN1 ) ] *= Math.sqrt( temp );
					}
				}
			}
		}

		// Restore A(rk, k)
		A[ offsetA + ( rk * sa1 ) + ( k * sa2 ) ] = akk;

		k += 1;
	}

	// Set KB = actual number of columns factored
	rk = offset + k;

	// Apply the block reflector to the rest of the matrix:

	// A(rk+1:M-1, k+1:N-1) -= A(rk+1:M-1, 0:k-1) * F(k+1:N-1, 0:k-1)^T
	if ( k < Math.min( N, M - offset ) ) {
		dgemm('no-transpose', 'transpose', M - rk, N - k, k, -1.0, A, sa1, sa2, offsetA + ( rk * sa1 ), F, sf1, sf2, offsetF + ( k * sf1 ), 1.0, A, sa1, sa2, offsetA + ( rk * sa1 ) + ( k * sa2 ));
	}

	// Recompute norms for columns flagged in lsticc linked list
	while ( lsticc > 0 ) {
		itemp = Math.round( VN2[ offsetVN2 + ( lsticc * strideVN2 ) ] );
		VN1[ offsetVN1 + ( lsticc * strideVN1 ) ] = dnrm2(M - rk, A, sa1, offsetA + ( rk * sa1 ) + ( lsticc * sa2 ));
		VN2[ offsetVN2 + ( lsticc * strideVN2 ) ] = VN1[ offsetVN1 + ( lsticc * strideVN1 ) ];
		lsticc = itemp;
	}

	return k;
}


// EXPORTS //

export default dlaqps;
