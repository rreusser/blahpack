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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import dlarfb from '../../dlarfb/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';
import dorm2r from '../../dorm2r/lib/base.js';


// VARIABLES //

var NB = 32; // Hardcoded block size


// MAIN //

/**
* Overwrites the M-by-N real matrix C with Q_C, Q^T_C, C_Q, or C_Q^T.
* where Q is a real orthogonal matrix defined as the product of K
* elementary reflectors `Q = H(1)*H(2)*... * H(k)` as returned
* by DGEQRF. Uses a blocked algorithm with block size NB=32.
*
* The caller-provided WORK buffer must have at least `(ldwork*NB) + ((NB+1)*NB)`
* elements available starting at `offsetWORK`, where `ldwork = max(1,N)` for
* `side='left'` and `ldwork = max(1,M)` for `side='right'` (NB=32). The buffer
* is partitioned into two contiguous segments: the first `ldwork*NB` elements
* are used as dlarfb's WORK; the remaining `(NB+1)*NB` elements hold the block
* reflector T. WORK is accessed with `strideWORK=1` internally.
*
* @private
* @param {string} side - `'left'` to apply Q from left, `'right'` from right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} A - reflector vectors from DGEQRF
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of reflectors
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - caller-provided workspace (see description for size)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dormqr( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	var offsetT;
	var notran;
	var ldwork;
	var left;
	var ldt;
	var nw;
	var nb;
	var nq;
	var mi;
	var ni;
	var ic;
	var jc;
	var ib;
	var i1;
	var i2;
	var i3;
	var T;
	var i;

	left = ( side === 'left' );
	notran = ( trans === 'no-transpose' );

	if ( left ) {
		nq = M;
		nw = Math.max( 1, N );
	} else {
		nq = N;
		nw = Math.max( 1, M );
	}

	// Quick return
	if ( M === 0 || N === 0 || K === 0 ) {
		return 0;
	}

	nb = NB;
	ldwork = nw;
	ldt = nb + 1;
	T = WORK;
	offsetT = offsetWORK + (nw * nb);

	// If nb >= K, use unblocked code
	if ( nb >= K ) {
		dorm2r( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK );
		return 0;
	}

	// Determine iteration direction
	if ( ( left && !notran ) || ( !left && notran ) ) {
		i1 = 0;
		i2 = K;
		i3 = nb;
	} else {
		i1 = Math.floor( ( K - 1 ) / nb ) * nb;
		i2 = -1;
		i3 = -nb;
	}

	if ( left ) {
		ni = N;
		jc = 0;
	} else {
		mi = M;
		ic = 0;
	}

	for ( i = i1; ( i3 > 0 ) ? ( i < i2 ) : ( i > i2 ); i += i3 ) {
		ib = Math.min( nb, K - i );

		// Form the triangular factor of the block reflector

		// H = H(i) H(i+1) ... H(i+ib-1)
		dlarft('forward', 'columnwise', nq - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), T, 1, ldt, offsetT);

		if ( left ) {
			mi = M - i;
			ic = i;
		} else {
			ni = N - i;
			jc = i;
		}

		// Apply H or H^T to C(ic:ic+mi, jc:jc+ni)
		dlarfb(side, trans, 'forward', 'columnwise', mi, ni, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), T, 1, ldt, offsetT, C, strideC1, strideC2, offsetC + (ic * strideC1) + (jc * strideC2), WORK, 1, ldwork, offsetWORK);
	}

	return 0;
}


// EXPORTS //

export default dormqr;
