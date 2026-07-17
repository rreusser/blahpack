/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztptri from '../../ztptri/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zhpr from '../../../../blas/base/zhpr/lib/base.js';
import ztpmv from '../../../../blas/base/ztpmv/lib/base.js';


// MAIN //

/**
* Computes the inverse of a complex Hermitian positive definite matrix in.
* packed storage using the Cholesky factorization computed by zpptrf.
*
* ## Notes
*
* -   On entry, `AP` must contain the triangular factor U or L from the
*     Cholesky factorization `A = U^H * U` or `A = L * L^H`, as computed
*     by zpptrf, in packed format.
*
* -   On exit, `AP` is overwritten by the upper or lower triangle of
*     the inverse of `A`, in packed format.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed Hermitian matrix (complex-element strides)
* @param {integer} stride - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offset - starting index for `AP` (in complex elements)
* @returns {integer} status code - `0` indicates success; `k > 0` indicates the `k`-th diagonal element of the Cholesky factor is zero
*/
function zpptri( uplo, N, AP, stride, offset ) {
	var upper;
	var info;
	var APv;
	var ajj;
	var jjn;
	var jj;
	var jc;
	var kk;
	var j;
	var k;

	// Quick return if possible...
	if ( N === 0 ) {
		return 0;
	}

	// Invert the triangular Cholesky factor...
	info = ztptri( uplo, 'non-unit', N, AP, stride, offset );
	if ( info > 0 ) {
		return info;
	}

	APv = reinterpret( AP, 0 );
	upper = ( uplo === 'upper' );

	if ( upper ) {
		// Form inv(U) * inv(U)^H...

		// Fortran (1-based):
		//   JJ = 0
		//   DO J = 1, N
		//     JC = JJ + 1
		//     JJ = JJ + J
		//     IF (J > 1) CALL ZHPR('U', J-1, ONE, AP(JC), 1, AP)
		//     AJJ = DBLE(AP(JJ))
		//     CALL ZDSCAL(J, AJJ, AP(JC), 1)

		// `jc`/`jj` are pure 0-based packed linear indices; every physical
		// access is `offset + idx*stride` (NOT `offset + idx` — see the zpptri
		// packed-stride LEARNINGS entry).
		jj = -1; // will become 0 (diagonal of column 0) after first increment
		for ( j = 0; j < N; j++ ) {
			jc = jj + 1; // start of column j
			jj += j + 1; // diagonal of column j

			if ( j > 0 ) {
				// Rank-1 update: AP := 1.0 * AP(jc:jc+j-1) * AP(jc:jc+j-1)^H + AP
				zhpr( 'upper', j, 1.0, AP, stride, offset + ( jc * stride ), AP, stride, offset ); // eslint-disable-line max-len
			}

			// AJJ = real part of AP(jj)
			ajj = APv[ ( offset + ( jj * stride ) ) * 2 ];

			// Scale column j by AJJ
			zdscal( j + 1, ajj, AP, stride, offset + ( jc * stride ) );
		}
	} else {
		// Form inv(L)^H * inv(L)...

		// Fortran (1-based):
		//   JJ = 1
		//   DO J = 1, N
		//     JJN = JJ + N - J + 1
		//     AP(JJ) = DBLE(ZDOTC(N-J+1, AP(JJ), 1, AP(JJ), 1))
		//     IF (J < N) CALL ZTPMV('L','C','N', N-J, AP(JJN), AP(JJ+1), 1)
		//     JJ = JJN

		// `jj`/`jjn` are pure 0-based packed linear indices; access is
		// `offset + idx*stride`.
		jj = 0;
		for ( j = 0; j < N; j++ ) {
			jjn = jj + N - j; // start of next column (diagonal of column j+1)

			// AP(jj) = sum(|AP(jj+k)|^2 for k=0..N-j-1) — always real.
			// Compute in-line to avoid zdotc allocation:
			ajj = 0.0;
			for ( k = 0; k < N - j; k++ ) {
				kk = offset + ( ( jj + k ) * stride );
				ajj += ( APv[ kk * 2 ] * APv[ kk * 2 ] ) + ( APv[ ( kk * 2 ) + 1 ] * APv[ ( kk * 2 ) + 1 ] ); // eslint-disable-line max-len
			}
			APv[ ( offset + ( jj * stride ) ) * 2 ] = ajj;
			APv[ ( ( offset + ( jj * stride ) ) * 2 ) + 1 ] = 0.0;

			if ( j < N - 1 ) {
				// X := A^H * x where A is the lower triangular submatrix
				ztpmv( 'lower', 'conjugate-transpose', 'non-unit', N - j - 1, AP, stride, offset + ( jjn * stride ), AP, stride, offset + ( ( jj + 1 ) * stride ) ); // eslint-disable-line max-len
			}
			jj = jjn;
		}
	}
	return 0;
}


// EXPORTS //

export default zpptri;
