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

import dlarz from '../../dlarz/lib/base.js';


// MAIN //

/**
* Overwrites the general `M`-by-`N` real matrix `C` with `Q*C`, `Q**T*C`, `C*Q`, or `C*Q**T`, where `Q` is a real orthogonal matrix defined as the product of `K` elementary reflectors `Q = H(1) H(2) ... H(k)` as returned by `dtzrzf` (unblocked algorithm).
*
* ## Notes
*
* -   The reflectors are stored in the last `l` entries of the first `k` rows of `A`, in the form used by the RZ factorization: `H(i) = I - tau(i) * v(i) * v(i)**T`, where `v(i)` has an implicit leading `1` and a trailing `l`-vector stored at `A(i, nq-l+1:nq)` (Fortran indexing) with `nq = M` for `side='left'` and `nq = N` for `side='right'`.
*
* @private
* @param {string} side - `'left'` applies `Q` (or `Q**T`) from the left; `'right'` applies from the right
* @param {string} trans - `'no-transpose'` applies `Q`; `'transpose'` applies `Q**T`
* @param {NonNegativeInteger} M - number of rows of `C`
* @param {NonNegativeInteger} N - number of columns of `C`
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {NonNegativeInteger} l - number of meaningful trailing entries in each reflector
* @param {Float64Array} A - reflector vectors (`K` rows)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - scalar factors of the reflectors
* @param {integer} strideTAU - stride for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Float64Array} WORK - workspace array (length at least `N` if `side` is `'left'`, else at least `M`)
* @param {integer} strideWORK - stride for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} `info` (0 on success)
*/
function dormr3( side, trans, M, N, K, l, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	var notran;
	var left;
	var offV;
	var offC;
	var ja;
	var ic;
	var jc;
	var mi;
	var ni;
	var i1;
	var i2;
	var i3;
	var i;

	// Quick return if possible:
	if ( M === 0 || N === 0 || K === 0 ) {
		return 0;
	}

	left = ( side === 'left' );
	notran = ( trans === 'no-transpose' );

	// Determine iteration direction:

	// Q = H(1) H(2) ... H(k) — forward product.
	// left+trans or right+notran => forward (i = 0, 1, ..., K-1)
	// left+notran or right+trans => backward (i = K-1, ..., 0)
	if ( ( left && !notran ) || ( !left && notran ) ) {
		i1 = 0;
		i2 = K;
		i3 = 1;
	} else {
		i1 = K - 1;
		i2 = -1;
		i3 = -1;
	}

	// `ja` is the 0-based column of A at which the trailing z-vector begins:
	mi = 0;
	ni = 0;
	ic = 0;
	jc = 0;
	if ( left ) {
		ni = N;
		ja = M - l;
	} else {
		mi = M;
		ja = N - l;
	}

	for ( i = i1; i !== i2; i += i3 ) {
		if ( left ) {
			// H(i) or H(i)**T is applied to C(i:M-1, 0:N-1)
			mi = M - i;
			ic = i;
		} else {
			// H(i) or H(i)**T is applied to C(0:M-1, i:N-1)
			ni = N - i;
			jc = i;
		}

		// The reflector z-vector lives in row `i` of A, starting at column `ja`; its stride is `strideA2`.
		offV = offsetA + ( i * strideA1 ) + ( ja * strideA2 );
		offC = offsetC + ( ic * strideC1 ) + ( jc * strideC2 );

		// Apply H(i); for real orthogonal matrices H(i)**T = H(i), so trans is implicit in iteration order.
		dlarz( side, mi, ni, l, A, strideA2, offV, TAU[ offsetTAU + ( i * strideTAU ) ], C, strideC1, strideC2, offC, WORK, strideWORK, offsetWORK );
	}

	return 0;
}


// EXPORTS //

export default dormr3;
