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

import dtpqrt2 from './../../dtpqrt2/lib/base.js';
import dtprfb from './../../dtprfb/lib/base.js';


// MAIN //

/**
* Computes a blocked QR factorization of a real triangular-pentagonal matrix `C = [ A; B ]` using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `N`-by-`N` upper triangular matrix.
* -   `B` is an `M`-by-`N` pentagonal matrix whose first `M-l` rows are rectangular and whose last `l` rows form an upper trapezoidal block (the first `l` rows of an `N`-by-`N` upper triangular matrix).
* -   The block size `nb` partitions the columns of `A` into panels of size `nb` (the last panel may be smaller).
* -   `T` stores the upper triangular block reflector factors as a sequence of `ib`-by-`ib` blocks, packed side-by-side with leading dimension at least `nb`; the resulting array is `nb`-by-`N`.
* -   On exit, the upper triangular part of `A` is overwritten with the upper triangular factor `R`, `B` is overwritten with the pentagonal matrix `V` of Householder vectors, and `T` is overwritten with the block reflector factors.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `B`
* @param {NonNegativeInteger} N - number of columns of `B` and the order of `A`
* @param {NonNegativeInteger} l - number of rows of the upper trapezoidal part of `B` (`0 <= l <= min(M,N)`)
* @param {PositiveInteger} nb - block size (`1 <= nb`; if `N > 0`, also `nb <= N`)
* @param {Float64Array} A - input/output matrix; on exit contains the upper triangular factor `R`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input/output pentagonal matrix; on exit contains the Householder reflectors `V`
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} T - output matrix of upper triangular block reflector factors (concatenation of `ib`-by-`ib` blocks)
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} WORK - workspace array of length at least `nb*N` (treated internally as a stride-`strideWORK` 1D buffer; per-panel layout is column-major with leading dimension `ib`)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} status code (`0` = success)
*/
function dtpqrt( M, N, l, nb, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK ) {
	var mb;
	var lb;
	var ib;
	var i;

	// Quick return...
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// Loop over column panels (Fortran: DO I = 1, N, NB; here i is 0-based).
	for ( i = 0; i < N; i += nb ) {
		// IB = MIN( N-I+1, NB )  (Fortran 1-based) -> 0-based:
		ib = Math.min( N - i, nb );

		// MB = MIN( M-L+I+IB-1, M )  (Fortran 1-based, with I_f = i+1)

		// -> mb = MIN( M - l + i + ib, M )  (the +1 of I_f cancels the -1)
		mb = Math.min( M - l + i + ib, M );

		// LB:

		//   IF I_f >= L: LB = 0

		//   ELSE:        LB = MB - M + L - I_f + 1

		// Translate condition directly with I_f = i + 1.
		if ( i + 1 >= l ) {
			lb = 0;
		} else {
			// LB = MB - M + L - I_f + 1 = MB - M + L - i  (the +1 cancels -I_f's +1)
			lb = mb - M + l - i;
		}

		// Compute the QR factorization of the current panel.
		// Fortran: CALL DTPQRT2( MB, IB, LB, A(I,I), LDA, B(1,I), LDB, T(1,I), LDT, IINFO )
		dtpqrt2( mb, ib, lb, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( i * strideA2 ), B, strideB1, strideB2, offsetB + ( i * strideB2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ) );

		// Update by applying H^T to B(:, I+IB:N) from the left.
		if ( i + ib < N ) {
			// Fortran: CALL DTPRFB( 'L', 'T', 'F', 'C', MB, N-I-IB+1, IB, LB,
			//                       B(1,I), LDB, T(1,I), LDT,
			//                       A(I,I+IB), LDA, B(1,I+IB), LDB,
			//                       WORK, IB )
			// 0-based: M = mb rows of V/B-trailing; N_trail = N - i - ib columns; K = ib; L = lb.
			// V is B(0, i) (column block). T is T(0, i). A-block is A(i, i+ib). B-block is B(0, i+ib).
			// WORK is laid out as a column-major (ib)-by-(N-i-ib) matrix with leading dim ib.
			dtprfb( 'left', 'transpose', 'forward', 'columnwise', mb, N - i - ib, ib, lb, B, strideB1, strideB2, offsetB + ( i * strideB2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( ( i + ib ) * strideA2 ), B, strideB1, strideB2, offsetB + ( ( i + ib ) * strideB2 ), WORK, strideWORK, ib * strideWORK, offsetWORK );
		}
	}
	return 0;
}


// EXPORTS //

export default dtpqrt;
