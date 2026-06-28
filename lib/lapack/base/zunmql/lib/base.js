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

import zlarfb from '../../zlarfb/lib/base.js';
import zlarft from '../../zlarft/lib/base.js';
import zunm2l from '../../zunm2l/lib/base.js';


// VARIABLES //

var NB = 32; // Hardcoded block size


// MAIN //

/**
* Overwrites the M-by-N matrix C with Q\*C, Q^H\*C, C\*Q, or C\*Q^H.
*
* Q is a complex unitary matrix defined as the product of K elementary
* reflectors `Q = H(K)*...*H(2)*H(1)` as returned by ZGEQLF. Uses a
* blocked algorithm with block size NB=32.
*
* A, TAU, C, WORK are Complex128Arrays. Strides and offsets are in complex elements.
*
* The caller-provided WORK buffer must have at least `(ldwork*NB) + ((NB+1)*NB)`
* complex elements available starting at `offsetWork`, where `ldwork = max(1,N)`
* for `side='left'` and `ldwork = max(1,M)` for `side='right'` (NB=32). The
* buffer is partitioned into two contiguous segments: the first `ldwork*NB`
* elements are used as zlarfb's WORK; the remaining `(NB+1)*NB` elements hold
* the block reflector T. WORK is accessed with `strideWork=1` internally.
*
* @private
* @param {string} side - 'left' to apply Q from left, 'right' from right
* @param {string} trans - 'no-transpose' for Q, 'conjugate-transpose' for Q^H
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Complex128Array} A - reflector vectors from ZGEQLF
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C (complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (complex elements)
* @param {Complex128Array} WORK - caller-provided workspace (see description for size)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @returns {integer} info - 0 if successful
*/
function zunmql( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var offsetT;
	var notran;
	var ldwork;
	var left;
	var ldt;
	var nw;
	var nq;
	var nb;
	var mi;
	var ni;
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
	offsetT = offsetWork + ( nw * nb );

	// If nb >= K, use unblocked code
	if ( nb >= K ) {
		zunm2l( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork);
		return 0;
	}

	// Determine iteration direction
	// QL: Q = H(K)*...*H(1). The blocks are applied from the last block backward.
	if ( ( left && notran ) || ( !left && !notran ) ) {
		i1 = 0;
		i2 = K;
		i3 = nb;
	} else {
		// Start from the last full block
		i1 = Math.floor( ( K - 1 ) / nb ) * nb;
		i2 = -1;
		i3 = -nb;
	}

	if ( left ) {
		ni = N;
	} else {
		mi = M;
	}

	for ( i = i1; ( i3 > 0 ) ? ( i < i2 ) : ( i > i2 ); i += i3 ) {
		ib = Math.min( nb, K - i );

		// Form the triangular factor of the block reflector

		// H = H(i+ib-1)*...*H(i+1)*H(i) (backward direction for QL)

		// nq-K+i+ib = number of rows of the block reflector
		zlarft('backward', 'columnwise', nq - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( i * strideA2 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), T, 1, ldt, offsetT);

		if ( left ) {
			mi = M - K + i + ib;
		} else {
			ni = N - K + i + ib;
		}

		// Apply H or H^H to C(0:mi, 0:ni)
		zlarfb(side, trans, 'backward', 'columnwise', mi, ni, ib, A, strideA1, strideA2, offsetA + ( i * strideA2 ), T, 1, ldt, offsetT, C, strideC1, strideC2, offsetC, WORK, 1, ldwork, offsetWork);
	}

	return 0;
}


// EXPORTS //

export default zunmql;
