/* eslint-disable max-len, max-params, no-underscore-dangle */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Rearranges the columns of the M-by-N complex matrix X as specified by the permutation `K(0), K(1), ..., K(N-1)` of the integers `0, 1, ..., N-1`.
*
* If `forwrd` is true, forward permutation: new column I = old column `K(I)`.
*
* If `forwrd` is false, backward permutation: new column `K(I)` = old column I.
*
* ## Notes
*
* -   K is 0-based in base.js. The ndarray.js wrapper converts from 1-based.
*
* -   The permutation array K is modified during execution (negated entries as
*     markers) but restored to its original state on exit.
*
* -   Strides and offsets for X are in complex elements. Internally they are
*     converted to Float64 indices via multiplication by 2.
*
* @private
* @param {boolean} forwrd - if true, apply forward permutation; if false, backward
* @param {NonNegativeInteger} M - number of rows of X
* @param {NonNegativeInteger} N - number of columns of X
* @param {Complex128Array} X - input/output matrix (M x N)
* @param {integer} strideX1 - stride of the first dimension of `X` (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of `X` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
* @param {Int32Array} k - permutation vector (length N), 0-based indices
* @param {integer} strideK - stride length for `k`
* @param {NonNegativeInteger} offsetK - starting index for `k`
*/
function zlapmt( forwrd, M, N, X, strideX1, strideX2, offsetX, k, strideK, offsetK ) {
	var tempR;
	var tempI;
	var in_;
	var sx1;
	var sx2;
	var Xv;
	var ox;
	var ik;
	var ii;
	var ij;
	var i;
	var j;

	if ( N <= 1 ) {
		return;
	}

	// Reinterpret Complex128Array as Float64Array for direct element access:
	Xv = reinterpret( X, 0 );

	// Convert complex-element strides/offset to Float64 strides/offset:
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	ox = offsetX * 2;

	// Negate all entries in K to mark unprocessed; -(k+1) avoids -0 === 0:
	for ( i = 0; i < N; i += 1 ) {
		ik = offsetK + ( i * strideK );
		k[ ik ] = -( k[ ik ] + 1 );
	}

	if ( forwrd ) {
		// Forward permutation: follow cycles.
		for ( i = 0; i < N; i += 1 ) {
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
				// Swap columns j and in_
				for ( ii = 0; ii < M; ii += 1 ) {
					ij = ox + ( ii * sx1 );

					// Swap complex elements (real + imag)
					tempR = Xv[ ij + ( j * sx2 ) ];
					tempI = Xv[ ij + ( j * sx2 ) + 1 ];
					Xv[ ij + ( j * sx2 ) ] = Xv[ ij + ( in_ * sx2 ) ];
					Xv[ ij + ( j * sx2 ) + 1 ] = Xv[ ij + ( in_ * sx2 ) + 1 ];
					Xv[ ij + ( in_ * sx2 ) ] = tempR;
					Xv[ ij + ( in_ * sx2 ) + 1 ] = tempI;
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
		for ( i = 0; i < N; i += 1 ) {
			ik = offsetK + ( i * strideK );

			if ( k[ ik ] >= 0 ) {
				// Already processed
				continue;
			}

			// Restore K(i)
			k[ ik ] = -( k[ ik ] + 1 );
			j = k[ ik ];

			while ( j !== i ) {
				// Swap columns i and j
				for ( ii = 0; ii < M; ii += 1 ) {
					ij = ox + ( ii * sx1 );

					// Swap complex elements (real + imag)
					tempR = Xv[ ij + ( i * sx2 ) ];
					tempI = Xv[ ij + ( i * sx2 ) + 1 ];
					Xv[ ij + ( i * sx2 ) ] = Xv[ ij + ( j * sx2 ) ];
					Xv[ ij + ( i * sx2 ) + 1 ] = Xv[ ij + ( j * sx2 ) + 1 ];
					Xv[ ij + ( j * sx2 ) ] = tempR;
					Xv[ ij + ( j * sx2 ) + 1 ] = tempI;
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

export default zlapmt;
