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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarz from '../../zlarz/lib/base.js';


// MAIN //

/**
* Overwrites the general `M`-by-`N` complex matrix `C` with `Q*C`, `Q**H*C`, `C*Q`, or `C*Q**H`, where `Q` is a complex unitary matrix defined as the product of `K` elementary reflectors `Q = H(1) H(2) ... H(k)` as returned by `ztzrzf` (unblocked algorithm).
*
* ## Notes
*
* -   The reflectors are stored in the last `l` entries of the first `k` rows of `A`, in the form used by the RZ factorization: `H(i) = I - tau(i) * v(i) * v(i)**H`, where `v(i)` has an implicit leading `1` and a trailing `l`-vector.
* -   When `trans === 'conjugate-transpose'`, the scalar `tau(i)` is replaced by `conj(tau(i))` before the reflector is applied.
*
* @private
* @param {string} side - `'left'` applies `Q` (or `Q**H`) from the left; `'right'` applies from the right
* @param {string} trans - `'no-transpose'` applies `Q`; `'conjugate-transpose'` applies `Q**H`
* @param {NonNegativeInteger} M - number of rows of `C`
* @param {NonNegativeInteger} N - number of columns of `C`
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {NonNegativeInteger} l - number of meaningful trailing entries in each reflector
* @param {Complex128Array} A - reflector vectors (`K` rows)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} TAU - scalar factors of the reflectors
* @param {integer} strideTAU - stride for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of `C` (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of `C` (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWORK - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @returns {integer} `info` (0 on success)
*/
function zunmr3( side, trans, M, N, K, l, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	var notran;
	var tauiv;
	var TAUv;
	var left;
	var taui;
	var offV;
	var offC;
	var iTau;
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
	if ( ( left && !notran ) || ( !left && notran ) ) {
		i1 = 0;
		i2 = K;
		i3 = 1;
	} else {
		i1 = K - 1;
		i2 = -1;
		i3 = -1;
	}

	// Initialize the sub-block dimensions and the starting column of the trailing z-vector in `A`.
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

	// Scratch Complex128Array holding the (possibly conjugated) reflector scalar `tau(i)`:
	taui = new Complex128Array( 1 );
	tauiv = reinterpret( taui, 0 );

	// Float64 view of `TAU` for index-based reads:
	TAUv = reinterpret( TAU, 0 );

	for ( i = i1; i !== i2; i += i3 ) {
		if ( left ) {
			// H(i) or H(i)**H is applied to C(i:M-1, 0:N-1)
			mi = M - i;
			ic = i;
		} else {
			// H(i) or H(i)**H is applied to C(0:M-1, i:N-1)
			ni = N - i;
			jc = i;
		}

		// Load tau(i), conjugating for the Q**H branch:
		iTau = ( offsetTAU + ( i * strideTAU ) ) * 2;
		tauiv[ 0 ] = TAUv[ iTau ];
		if ( notran ) {
			tauiv[ 1 ] = TAUv[ iTau + 1 ];
		} else {
			tauiv[ 1 ] = -TAUv[ iTau + 1 ];
		}

		// Locate the reflector z-vector in row `i` of `A`, column `ja`; stride along z is `strideA2`.
		offV = offsetA + ( i * strideA1 ) + ( ja * strideA2 );
		offC = offsetC + ( ic * strideC1 ) + ( jc * strideC2 );

		zlarz( side, mi, ni, l, A, strideA2, offV, taui, 0, C, strideC1, strideC2, offC, WORK, strideWORK, offsetWORK );
	}

	return 0;
}


// EXPORTS //

export default zunmr3;
