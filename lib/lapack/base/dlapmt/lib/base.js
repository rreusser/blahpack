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

// MAIN //

/**
* Rearranges the columns of the M-by-N matrix X as specified by the.
* permutation K(0), K(1), ..., K(N-1) of the integers 0, 1, ..., N-1.
*
* If FORWRD is true, forward permutation:
*   New column I = old column K(I).
*
* If FORWRD is false, backward permutation:
*   New column K(I) = old column I.
*
* ## Notes
*
* -   K is 0-based in base.js. The ndarray.js wrapper converts from 1-based.
* -   The permutation array K is modified during execution (negated entries as
*     markers) but restored to its original state on exit.
*
* @private
* @param {boolean} forwrd - if true, apply forward permutation; if false, backward
* @param {NonNegativeInteger} M - number of rows of X
* @param {NonNegativeInteger} N - number of columns of X
* @param {Float64Array} X - input/output matrix (M x N)
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Int32Array} k - permutation vector (length N), 0-based indices
* @param {integer} strideK - stride length for `k`
* @param {NonNegativeInteger} offsetK - starting index for `k`
*/
function dlapmt( forwrd, M, N, X, strideX1, strideX2, offsetX, k, strideK, offsetK ) {
	var temp;
	var in_;
	var ik;
	var ii;
	var ij;
	var i;
	var j;

	if ( N <= 1 ) {
		return;
	}

	// Negate all entries in K to mark them as unprocessed.
	// We use -(k+1) to handle the 0-based case (since -0 === 0).
	for ( i = 0; i < N; i++ ) {
		ik = offsetK + (i * strideK);
		k[ ik ] = -(k[ ik ] + 1);
	}

	if ( forwrd ) {
		// Forward permutation: follow cycles.
		// Mirrors the Fortran: swap X(:,J) with X(:,IN) along the cycle chain.
		for ( i = 0; i < N; i++ ) {
			ik = offsetK + (i * strideK);

			if ( k[ ik ] >= 0 ) {
				// Already processed
				continue;
			}

			// Restore K(i) and start the cycle
			k[ ik ] = -(k[ ik ] + 1);
			j = i;
			in_ = k[ ik ];

			// Follow the chain until we reach a restored (positive) entry
			while ( k[ offsetK + (in_ * strideK) ] < 0 ) {
				// Swap columns j and in_
				for ( ii = 0; ii < M; ii++ ) {
					ij = offsetX + (ii * strideX1);
					temp = X[ ij + (j * strideX2) ];
					X[ ij + (j * strideX2) ] = X[ ij + (in_ * strideX2) ];
					X[ ij + (in_ * strideX2) ] = temp;
				}

				// Restore K(in_) and advance
				ik = offsetK + (in_ * strideK);
				k[ ik ] = -(k[ ik ] + 1);
				j = in_;
				in_ = k[ ik ];
			}
		}
	} else {
		// Backward permutation: follow cycles.
		// Mirrors the Fortran: swap X(:,I) with X(:,J) along the chain.
		for ( i = 0; i < N; i++ ) {
			ik = offsetK + (i * strideK);

			if ( k[ ik ] >= 0 ) {
				// Already processed
				continue;
			}

			// Restore K(i)
			k[ ik ] = -(k[ ik ] + 1);
			j = k[ ik ];

			while ( j !== i ) {
				// Swap columns i and j
				for ( ii = 0; ii < M; ii++ ) {
					ij = offsetX + (ii * strideX1);
					temp = X[ ij + (i * strideX2) ];
					X[ ij + (i * strideX2) ] = X[ ij + (j * strideX2) ];
					X[ ij + (j * strideX2) ] = temp;
				}

				// Restore K(j) and advance
				ik = offsetK + (j * strideK);
				k[ ik ] = -(k[ ik ] + 1);
				j = k[ ik ];
			}
		}
	}
}


// EXPORTS //

export default dlapmt;
