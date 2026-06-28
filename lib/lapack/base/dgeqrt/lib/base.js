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

import dgeqrt2 from './../../dgeqrt2/lib/base.js';
import dlarfb from './../../dlarfb/lib/base.js';


// MAIN //

/**
* Computes a blocked QR factorization of a real `M`-by-`N` matrix `A` using the compact `WY` representation of `Q`.
*
* ## Notes
*
* -   On exit, the elements on and above the diagonal of `A` contain the `min(M,N)`-by-`N` upper trapezoidal matrix `R` (`R` is upper triangular if `M >= N`); the elements below the diagonal are the columns of `V`.
* -   `T` is the `nb`-by-`min(M,N)` matrix containing the upper triangular block reflector factors stored in compact form: `T = (T1 T2 ... TB)`.
* -   `WORK` is treated logically as an `nb`-by-`N` workspace; for the block reflector update, the leading dimension of `WORK` equals the column count of the trailing submatrix.
* -   `nb` is the block size; the implementation requires `1 <= nb <= min(M,N)` (when `min(M,N) > 0`).
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix `A`
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} nb - block size
* @param {Float64Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output matrix; on exit contains the block reflector factors stored as a row of upper triangular `nb`-by-`nb` blocks
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} WORK - workspace array of dimension at least `nb*N`
* @param {integer} strideWork - stride length for `WORK` (typically `1`; `WORK` is logically column-major with leading dimension equal to the trailing column count `N-i-ib`)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (`0` = success)
*/
function dgeqrt( M, N, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork ) {
	var ldwork;
	var ib;
	var K;
	var i;

	K = Math.min( M, N );

	// Quick return if possible.
	if ( K === 0 ) {
		return 0;
	}

	// Blocked loop of length K.
	for ( i = 0; i < K; i += nb ) {
		ib = Math.min( K - i, nb );

		// Compute the QR factorization of the current block A(i:M-1, i:i+ib-1) using the compact WY unblocked kernel; tau factors and the upper triangular block reflector are written to T(:, i:i+ib-1).
		dgeqrt2( M - i, ib, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( i * strideA2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ) );

		if ( i + ib < N ) {
			// Apply H**T to A(i:M-1, i+ib:N-1) from the left. WORK has leading dimension equal to the trailing column count N-i-ib.
			ldwork = N - i - ib;
			dlarfb( 'left', 'transpose', 'forward', 'columnwise', M - i, N - i - ib, ib, A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( i * strideA2 ), T, strideT1, strideT2, offsetT + ( i * strideT2 ), A, strideA1, strideA2, offsetA + ( i * strideA1 ) + ( ( i + ib ) * strideA2 ), WORK, strideWork, ldwork * strideWork, offsetWork );
		}
	}
	return 0;
}


// EXPORTS //

export default dgeqrt;
