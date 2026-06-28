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

import ztplqt2 from './../../ztplqt2/lib/base.js';
import ztprfb from './../../ztprfb/lib/base.js';


// MAIN //

/**
* Computes a blocked LQ factorization of a complex triangular-pentagonal matrix `C = [A, B]` using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `M`-by-`M` lower triangular matrix.
* -   `B` is an `M`-by-`N` pentagonal matrix whose first `N-l` columns are rectangular and whose last `l` columns form a lower trapezoidal block.
* -   The block size `mb` partitions the rows of `A` into panels of size `mb` (the last panel may be smaller).
* -   `T` stores the upper triangular block reflector factors as a sequence of `mb`-by-`ib` blocks, packed side-by-side, with leading dimension at least `mb`.
* -   On exit, the lower triangular part of `A` is overwritten with the lower triangular factor `L`, `B` is overwritten with the pentagonal matrix `V` of Householder vectors, and `T` is overwritten with the block reflector factors.
* -   Strides and offsets are in **complex elements** (factor of 2 conversion is done internally by the dependencies).
* -   `WORK` is logically a 2D `(M-i-ib)`-by-`ib` column-major buffer for each panel; `strideWork` is the per-row stride (typically `1`) and the per-column stride is computed internally as `(M-i-ib)*strideWork`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `B` and the order of `A`
* @param {NonNegativeInteger} N - number of columns of `B`
* @param {NonNegativeInteger} l - number of rows of the lower trapezoidal part of `B` (`0 <= l <= min(M,N)`)
* @param {PositiveInteger} mb - block size (`1 <= mb`; if `M > 0`, also `mb <= M`)
* @param {Complex128Array} A - input/output matrix; on exit contains the lower triangular factor `L`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} B - input/output pentagonal matrix; on exit contains the Householder reflectors `V`
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @param {Complex128Array} T - output matrix of upper triangular block reflector factors (concatenation of `mb`-by-`ib` blocks)
* @param {integer} strideT1 - stride of the first dimension of `T` (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of `T` (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @param {Complex128Array} WORK - workspace array of length at least `mb*M` complex elements (treated internally as a stride-`strideWork` 1D buffer; per-panel layout is column-major with leading dimension equal to the number of trailing rows in that panel)
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} status code (`0` = success)
*/
function ztplqt( M, N, l, mb, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork ) {
	var nb;
	var lb;
	var ib;
	var i;

	// Quick return...
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// Loop over panels (Fortran: DO I = 1, M, MB; here i is 0-based)
	for ( i = 0; i < M; i += mb ) {
		// IB = MIN( M-I+1, MB )
		ib = Math.min( M - i, mb );

		// NB = MIN( N-L+I+IB-1, N )  (Fortran 1-based)

		// 0-based: nb = MIN( N - l + i + ib, N )
		nb = Math.min( N - l + i + ib, N );

		// LB:

		//   IF I >= L: LB = 0

		//   ELSE:      LB = NB - N + L - I + 1   (Fortran 1-based)

		// Translate the Fortran condition (I_f .GE. L) directly with I_f = i+1.
		if ( i + 1 >= l ) {
			lb = 0;
		} else {
			// LB = NB - N + L - I_f + 1 = NB - N + L - i (cancels +1 with the trailing +1)
			lb = nb - N + l - i;
		}

		// Compute the LQ factorization of the current panel.
		// Fortran: CALL ZTPLQT2( IB, NB, LB, A(I,I), LDA, B(I,1), LDB, T(1,I), LDT, IINFO )
		ztplqt2( ib, nb, lb, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( i * strideA2 ), B, strideB1, strideB2, offsetB + ( i * strideB1 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ) );

		// Update by applying H to B(I+IB:M-1, 0:N-1) from the right.
		if ( i + ib < M ) {
			// Fortran: CALL ZTPRFB( 'R', 'N', 'F', 'R', M-I-IB+1, NB, IB, LB,
			//                       B(I,1), LDB, T(1,I), LDT,
			//                       A(I+IB,I), LDA, B(I+IB,1), LDB,
			//                       WORK, M-I-IB+1 )
			// 0-based: M - i - ib rows, NB cols, K = IB, L = LB.
			// V is B(i, 0) (row block). T is T(0, i). A-block is A(i+ib, i). B-block is B(i+ib, 0).
			// WORK is laid out as a (M-i-ib)-by-IB column-major matrix with leading dim M-i-ib.
			ztprfb( 'right', 'no-transpose', 'forward', 'rowwise', M - i - ib, nb, ib, lb, B, strideB1, strideB2, offsetB + ( i * strideB1 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( ( i + ib ) * strideA1 ) + ( i * strideA2 ), B, strideB1, strideB2, offsetB + ( ( i + ib ) * strideB1 ), WORK, strideWork, ( M - i - ib ) * strideWork, offsetWork );
		}
	}
	return 0;
}


// EXPORTS //

export default ztplqt;
