/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlarfg from '../../dlarfg/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';
import dtrmv from '../../../../blas/base/dtrmv/lib/base.js';


// MAIN //

/**
* Reduces NB columns of a real general n-by-(n-k+1) matrix A.
*
* Elements below the k-th subdiagonal are zeroed out.
*
* Returns matrices V, T, and Y needed to apply the transformation to the
* unreduced part of A.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} K - offset for the reduction
* @param {NonNegativeInteger} nb - number of columns to reduce
* @param {Float64Array} A - input matrix A
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} tau - output array for scalar factors
* @param {integer} strideTAU - stride for tau
* @param {NonNegativeInteger} offsetTAU - starting index for tau
* @param {Float64Array} T - output upper triangular matrix T
* @param {integer} strideT1 - first dimension stride of T
* @param {integer} strideT2 - second dimension stride of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} Y - output matrix Y
* @param {integer} strideY1 - first dimension stride of Y
* @param {integer} strideY2 - second dimension stride of Y
* @param {NonNegativeInteger} offsetY - starting index for Y
*/
function dlahr2( N, K, nb, A, strideA1, strideA2, offsetA, tau, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT, Y, strideY1, strideY2, offsetY ) {
	let ei, i;

	if ( N <= 1 ) {
		return;
	}

	ei = 0.0;

	for ( i = 0; i < nb; i++ ) {
		if ( i > 0 ) {
			// Update A(K+1:N, I) — subtract Y * V^T contribution
			// Fortran: DGEMV('NO TRANSPOSE', N-K, I-1, -1, Y(K+1,1), LDY, A(K+I-1,1), LDA, 1, A(K+1,I), 1)
			dgemv( 'no-transpose', N - K, i, -1.0, Y, strideY1, strideY2, offsetY + (K * strideY1), A, strideA2, offsetA + (( K + i - 1 ) * strideA1), 1.0, A, strideA1, offsetA + (K * strideA1) + (i * strideA2) );

			// Compute w := V1^T * b1 — copy first i elements of column i of A(K+1:,:) into T(:,NB)

			// Fortran: DCOPY(I-1, A(K+1,I), 1, T(1,NB), 1)
			dcopy( i, A, strideA1, offsetA + (K * strideA1) + (i * strideA2), T, strideT1, offsetT + (( nb - 1 ) * strideT2) );

			// Fortran: DTRMV('Lower', 'Transpose', 'UNIT', I-1, A(K+1,1), LDA, T(1,NB), 1)
			dtrmv( 'lower', 'transpose', 'unit', i, A, strideA1, strideA2, offsetA + (K * strideA1), T, strideT1, offsetT + (( nb - 1 ) * strideT2) );

			// Update w := w + V2^T * b2

			// Fortran: DGEMV('Transpose', N-K-I+1, I-1, 1, A(K+I,1), LDA, A(K+I,I), 1, 1, T(1,NB), 1)
			dgemv( 'transpose', N - K - i, i, 1.0, A, strideA1, strideA2, offsetA + (( K + i ) * strideA1), A, strideA1, offsetA + (( K + i ) * strideA1) + (i * strideA2), 1.0, T, strideT1, offsetT + (( nb - 1 ) * strideT2) );

			// Apply w := T^T * w

			// Fortran: DTRMV('Upper', 'Transpose', 'NON-UNIT', I-1, T, LDT, T(1,NB), 1)
			dtrmv( 'upper', 'transpose', 'non-unit', i, T, strideT1, strideT2, offsetT, T, strideT1, offsetT + (( nb - 1 ) * strideT2) );

			// b2 := b2 - V2*w

			// Fortran: DGEMV('NO TRANSPOSE', N-K-I+1, I-1, -1, A(K+I,1), LDA, T(1,NB), 1, 1, A(K+I,I), 1)
			dgemv( 'no-transpose', N - K - i, i, -1.0, A, strideA1, strideA2, offsetA + (( K + i ) * strideA1), T, strideT1, offsetT + (( nb - 1 ) * strideT2), 1.0, A, strideA1, offsetA + (( K + i ) * strideA1) + (i * strideA2) );

			// b1 := b1 - V1*w

			// Fortran: DTRMV('Lower', 'NO TRANSPOSE', 'UNIT', I-1, A(K+1,1), LDA, T(1,NB), 1)
			dtrmv( 'lower', 'no-transpose', 'unit', i, A, strideA1, strideA2, offsetA + (K * strideA1), T, strideT1, offsetT + (( nb - 1 ) * strideT2) );

			// Fortran: DAXPY(I-1, -1, T(1,NB), 1, A(K+1,I), 1)
			daxpy( i, -1.0, T, strideT1, offsetT + (( nb - 1 ) * strideT2), A, strideA1, offsetA + (K * strideA1) + (i * strideA2) );

			// A(K+I-1, I-1) = EI — restore saved subdiagonal element
			A[ offsetA + (( K + i - 1 ) * strideA1) + (( i - 1 ) * strideA2) ] = ei;
		}

		// Generate elementary reflector H(i) to annihilate A(K+I+1:N, I)
		// Fortran: DLARFG(N-K-I+1, A(K+I,I), A(MIN(K+I+1,N),I), 1, TAU(I))
		dlarfg( N - K - i, A, offsetA + (( K + i ) * strideA1) + (i * strideA2), A, strideA1, offsetA + (Math.min( K + i + 1, N - 1 ) * strideA1) + (i * strideA2), tau, offsetTAU + (i * strideTAU) );

		// Save subdiagonal element and set to 1 for reflector computation
		ei = A[ offsetA + (( K + i ) * strideA1) + (i * strideA2) ];
		A[ offsetA + (( K + i ) * strideA1) + (i * strideA2) ] = 1.0;

		// Compute Y(K+1:N, I)

		// Fortran: DGEMV('NO TRANSPOSE', N-K, N-K-I+1, 1, A(K+1,I+1), LDA, A(K+I,I), 1, 0, Y(K+1,I), 1)
		dgemv( 'no-transpose', N - K, N - K - i, 1.0, A, strideA1, strideA2, offsetA + (K * strideA1) + (( i + 1 ) * strideA2), A, strideA1, offsetA + (( K + i ) * strideA1) + (i * strideA2), 0.0, Y, strideY1, offsetY + (K * strideY1) + (i * strideY2) );

		// Fortran: DGEMV('Transpose', N-K-I+1, I-1, 1, A(K+I,1), LDA, A(K+I,I), 1, 0, T(1,I), 1)
		dgemv( 'transpose', N - K - i, i, 1.0, A, strideA1, strideA2, offsetA + (( K + i ) * strideA1), A, strideA1, offsetA + (( K + i ) * strideA1) + (i * strideA2), 0.0, T, strideT1, offsetT + (i * strideT2) );

		// Fortran: DGEMV('NO TRANSPOSE', N-K, I-1, -1, Y(K+1,1), LDY, T(1,I), 1, 1, Y(K+1,I), 1)
		dgemv( 'no-transpose', N - K, i, -1.0, Y, strideY1, strideY2, offsetY + (K * strideY1), T, strideT1, offsetT + (i * strideT2), 1.0, Y, strideY1, offsetY + (K * strideY1) + (i * strideY2) );

		// Fortran: DSCAL(N-K, TAU(I), Y(K+1,I), 1)
		dscal( N - K, tau[ offsetTAU + (i * strideTAU) ], Y, strideY1, offsetY + (K * strideY1) + (i * strideY2) );

		// Compute T(1:I, I)

		// Fortran: DSCAL(I-1, -TAU(I), T(1,I), 1)
		dscal( i, -tau[ offsetTAU + (i * strideTAU) ], T, strideT1, offsetT + (i * strideT2) );

		// Fortran: DTRMV('Upper', 'No Transpose', 'NON-UNIT', I-1, T, LDT, T(1,I), 1)
		dtrmv( 'upper', 'no-transpose', 'non-unit', i, T, strideT1, strideT2, offsetT, T, strideT1, offsetT + (i * strideT2) );

		// T(I, I) = TAU(I)
		T[ offsetT + (i * strideT1) + (i * strideT2) ] = tau[ offsetTAU + (i * strideTAU) ];
	}

	// Restore last saved subdiagonal element
	// Fortran: A(K+NB, NB) = EI
	A[ offsetA + (( K + nb - 1 ) * strideA1) + (( nb - 1 ) * strideA2) ] = ei;

	// Compute Y(1:K, 1:NB)

	// Fortran: DLACPY('ALL', K, NB, A(1,2), LDA, Y, LDY)
	dlacpy( 'all', K, nb, A, strideA1, strideA2, offsetA + (1 * strideA2), Y, strideY1, strideY2, offsetY );

	// Fortran: DTRMM('RIGHT', 'Lower', 'NO TRANSPOSE', 'UNIT', K, NB, 1, A(K+1,1), LDA, Y, LDY)
	dtrmm( 'right', 'lower', 'no-transpose', 'unit', K, nb, 1.0, A, strideA1, strideA2, offsetA + (K * strideA1), Y, strideY1, strideY2, offsetY );

	if ( N > K + nb ) {
		// Fortran: DGEMM('NO TRANSPOSE', 'NO TRANSPOSE', K, NB, N-K-NB, 1, A(1,2+NB), LDA, A(K+1+NB,1), LDA, 1, Y, LDY)
		dgemm( 'no-transpose', 'no-transpose', K, nb, N - K - nb, 1.0, A, strideA1, strideA2, offsetA + (( 1 + nb ) * strideA2), A, strideA1, strideA2, offsetA + (( K + nb ) * strideA1), 1.0, Y, strideY1, strideY2, offsetY );
	}

	// Fortran: DTRMM('RIGHT', 'Upper', 'NO TRANSPOSE', 'NON-UNIT', K, NB, 1, T, LDT, Y, LDY)
	dtrmm( 'right', 'upper', 'no-transpose', 'non-unit', K, nb, 1.0, T, strideT1, strideT2, offsetT, Y, strideY1, strideY2, offsetY );
}


// EXPORTS //

export default dlahr2;
