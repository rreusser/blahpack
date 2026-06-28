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

/* eslint-disable max-len, max-params, no-underscore-dangle */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Rearranges the rows of an M-by-N complex matrix X as specified by a permutation vector.
*
* If `forwrd` is true, forward permutation: `X(K[i],*) is moved to X(i,*)`.
*
* If `forwrd` is false, backward permutation: `X(i,*) is moved to X(K[i],*)`.
*
* ## Notes
*
* -   K is 0-based in base.js. The ndarray.js wrapper converts from 1-based.
*
* -   The permutation array K is modified during execution (negated entries as
*     markers) but restored to its original state on exit.
*
* -   Strides and offsets for X are in complex elements. Internally, they are
*     multiplied by 2 for Float64Array indexing.
*
* @private
* @param {boolean} forwrd - if true, apply forward permutation; if false, backward
* @param {NonNegativeInteger} M - number of rows of X
* @param {NonNegativeInteger} N - number of columns of X
* @param {Complex128Array} X - input/output matrix (M x N)
* @param {integer} strideX1 - stride of the first dimension of `X` (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of `X` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
* @param {Int32Array} k - permutation vector (length M), 0-based indices
* @param {integer} strideK - stride length for `k`
* @param {NonNegativeInteger} offsetK - starting index for `k`
*/
function zlapmr( forwrd, M, N, X, strideX1, strideX2, offsetX, k, strideK, offsetK ) {
	var tempR;
	var tempI;
	var in_;
	var sx1;
	var sx2;
	var Xv;
	var oX;
	var ik;
	var jj;
	var ij;
	var ii;
	var i;
	var j;

	if ( M <= 1 ) {
		return;
	}

	// Get Float64Array view for efficient element access
	Xv = reinterpret( X, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	oX = offsetX * 2;

	// Negate all K entries to mark unprocessed; use -(k+1) since -0 === 0:
	for ( i = 0; i < M; i += 1 ) {
		ik = offsetK + ( i * strideK );
		k[ ik ] = -( k[ ik ] + 1 );
	}

	if ( forwrd ) {
		// Forward permutation: follow cycles.
		for ( i = 0; i < M; i += 1 ) {
			ik = offsetK + ( i * strideK );

			if ( k[ ik ] >= 0 ) {
				// Already processed
				continue;
			}

			// Restore K(i) and start the cycle
			k[ ik ] = -( k[ ik ] + 1 );
			j = i;
			in_ = k[ ik ];

			// Follow the chain until we reach a restored (positive) entry
			while ( k[ offsetK + ( in_ * strideK ) ] < 0 ) {
				// Swap rows j and in_
				for ( jj = 0; jj < N; jj += 1 ) {
					ij = oX + ( j * sx1 ) + ( jj * sx2 );
					ii = oX + ( in_ * sx1 ) + ( jj * sx2 );

					// Swap complex element: both real and imaginary parts
					tempR = Xv[ ij ];
					tempI = Xv[ ij + 1 ];
					Xv[ ij ] = Xv[ ii ];
					Xv[ ij + 1 ] = Xv[ ii + 1 ];
					Xv[ ii ] = tempR;
					Xv[ ii + 1 ] = tempI;
				}

				// Restore K(in_) and advance
				ik = offsetK + ( in_ * strideK );
				k[ ik ] = -( k[ ik ] + 1 );
				j = in_;
				in_ = k[ ik ];
			}
		}
	} else {
		// Backward permutation: follow cycles.
		for ( i = 0; i < M; i += 1 ) {
			ik = offsetK + ( i * strideK );

			if ( k[ ik ] >= 0 ) {
				// Already processed
				continue;
			}

			// Restore K(i)
			k[ ik ] = -( k[ ik ] + 1 );
			j = k[ ik ];

			while ( j !== i ) {
				// Swap rows i and j
				for ( jj = 0; jj < N; jj += 1 ) {
					ij = oX + ( i * sx1 ) + ( jj * sx2 );
					ii = oX + ( j * sx1 ) + ( jj * sx2 );

					// Swap complex element: both real and imaginary parts
					tempR = Xv[ ij ];
					tempI = Xv[ ij + 1 ];
					Xv[ ij ] = Xv[ ii ];
					Xv[ ij + 1 ] = Xv[ ii + 1 ];
					Xv[ ii ] = tempR;
					Xv[ ii + 1 ] = tempI;
				}

				// Restore K(j) and advance
				ik = offsetK + ( j * strideK );
				k[ ik ] = -( k[ ik ] + 1 );
				j = k[ ik ];
			}
		}
	}
}


// EXPORTS //

export default zlapmr;
