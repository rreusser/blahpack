/* eslint-disable max-len, max-params */

// MODULES //

import ztgex2 from './../../../../lapack/base/ztgex2/lib/base.js';


// MAIN //

/**
* Reorders the generalized Schur decomposition of a complex matrix pair (A,B).
*
* The diagonal element at row index `ifst` is moved to row index `ilst`.
*
* ## Notes
*
* -   `ifst` and `ilst` are 0-based indices.
*
* -   On output, `ilst` may differ from the input value if a swap fails partway
*     through. Both are returned in the result object.
*
* @private
* @param {boolean} wantq - whether to update the left transformation matrix Q
* @param {boolean} wantz - whether to update the right transformation matrix Z
* @param {NonNegativeInteger} N - order of the matrices A and B
* @param {Complex128Array} A - upper triangular matrix A
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} B - upper triangular matrix B
* @param {integer} strideB1 - stride of the first dimension of `B` (complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (complex elements)
* @param {Complex128Array} Q - unitary matrix Q (updated if wantq is true)
* @param {integer} strideQ1 - stride of the first dimension of `Q` (complex elements)
* @param {integer} strideQ2 - stride of the second dimension of `Q` (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (complex elements)
* @param {Complex128Array} Z - unitary matrix Z (updated if wantz is true)
* @param {integer} strideZ1 - stride of the first dimension of `Z` (complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (complex elements)
* @param {integer} ifst - 0-based starting position of the diagonal element to move
* @param {integer} ilst - 0-based target position for the diagonal element
* @returns {Object} result object with fields `ifst`, `ilst`, and `info`
*/
function ztgexc( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, ifst, ilst ) {
	var here;
	var info;

	// Quick return if possible:
	if ( N <= 1 ) {
		return {
			'ifst': ifst,
			'ilst': ilst,
			'info': 0
		};
	}
	if ( ifst === ilst ) {
		return {
			'ifst': ifst,
			'ilst': ilst,
			'info': 0
		};
	}

	if ( ifst < ilst ) {
		// Move forward: swap adjacent elements from ifst toward ilst
		here = ifst;
		while ( here < ilst ) {
			info = ztgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here );
			if ( info !== 0 ) {
				ilst = here;
				return {
					'ifst': ifst,
					'ilst': ilst,
					'info': 1
				};
			}
			here += 1;
		}
		here -= 1;
	} else {
		// Move backward: swap adjacent elements from ifst toward ilst
		here = ifst - 1;
		while ( here >= ilst ) {
			info = ztgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here );
			if ( info !== 0 ) {
				ilst = here;
				return {
					'ifst': ifst,
					'ilst': ilst,
					'info': 1
				};
			}
			here -= 1;
		}
		here += 1;
	}
	ilst = here;
	return {
		'ifst': ifst,
		'ilst': ilst,
		'info': 0
	};
}


// EXPORTS //

export default ztgexc;
