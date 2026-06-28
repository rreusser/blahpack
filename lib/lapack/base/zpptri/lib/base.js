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

		// JS (0-based complex-element indices):
		jj = offset - 1; // will become offset after first increment
		for ( j = 1; j <= N; j++ ) {
			jc = jj + 1;
			jj += j;

			if ( j > 1 ) {
				// Rank-1 update: AP := 1.0 * AP(jc:jc+j-2) * AP(jc:jc+j-2)^H + AP
				zhpr( 'upper', j - 1, 1.0, AP, stride, jc, AP, stride, offset );
			}

			// AJJ = real part of AP(jj)
			ajj = APv[ jj * 2 ];

			// Scale column j by AJJ
			zdscal( j, ajj, AP, stride, jc );
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

		// JS (0-based complex-element indices):
		jj = offset;
		for ( j = 1; j <= N; j++ ) {
			jjn = jj + N - j + 1;

			// AP(jj) = sum(|AP(jj+k)|^2 for k=0..N-j) — always real

			// Compute in-line to avoid zdotc allocation:
			ajj = 0.0;
			for ( k = 0; k <= N - j; k++ ) {
				ajj += ( APv[ ( jj + k ) * 2 ] * APv[ ( jj + k ) * 2 ] ) + ( APv[ ( ( jj + k ) * 2 ) + 1 ] * APv[ ( ( jj + k ) * 2 ) + 1 ] ); // eslint-disable-line max-len
			}
			APv[ jj * 2 ] = ajj;
			APv[ ( jj * 2 ) + 1 ] = 0.0;

			if ( j < N ) {
				// X := A^H * x where A is the lower triangular submatrix
				ztpmv( 'lower', 'conjugate-transpose', 'non-unit', N - j, AP, stride, jjn, AP, stride, jj + 1 ); // eslint-disable-line max-len
			}
			jj = jjn;
		}
	}
	return 0;
}


// EXPORTS //

export default zpptri;
