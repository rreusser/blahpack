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

import dlarfb from '../../dlarfb/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';
import dorml2 from '../../dorml2/lib/base.js';


// VARIABLES //

var NB = 32; // Hardcoded block size


// MAIN //

/**
* Overwrites the M-by-N matrix C with Q_C, Q^T_C, C_Q, or C_Q^T.
* where Q is a real orthogonal matrix defined as the product of K
* elementary reflectors (from an LQ factorization):
*
* Q = H(k) ... H(2) H(1)
*
* as returned by DGELQF. Uses a blocked algorithm with block size NB=32.
*
* @private
* @param {string} side - `'left'` to apply Q from left, `'right'` from right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} A - reflector vectors from DGELQF (stored rowwise)
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
* @param {Float64Array} WORK - caller-provided workspace; size must be at least `(ldwork * nb) + (ldt * nb)` elements, where `nb = min(32, K)`, `ldt = nb + 1`, and `ldwork = max(1, N)` for `side = 'left'` or `max(1, M)` for `side = 'right'`. WORK is partitioned: `WORK[offsetWORK .. offsetWORK + ldwork*nb)` is the main scratch passed to DLARFB; `WORK[offsetWORK + ldwork*nb .. offsetWORK + ldwork*nb + ldt*nb)` holds the block-reflector triangular factor T (column-major with leading dimension `ldt`).
* @param {integer} strideWORK - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dormlq( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	var offsetT;
	var notran;
	var transt;
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

	if ( M === 0 || N === 0 || K === 0 ) {
		return 0;
	}

	left = ( side === 'left' );
	notran = ( trans === 'no-transpose' );

	if ( left ) {
		nq = M;
		nw = Math.max( 1, N );
	} else {
		nq = N;
		nw = Math.max( 1, M );
	}

	nb = NB;
	if ( nb > K ) {
		nb = K;
	}

	// If block size is too small or equals K, use unblocked algorithm
	if ( nb < 2 || nb >= K ) {
		return dorml2( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK );
	}

	ldwork = nw;
	ldt = nb + 1;

	// Partition caller-provided WORK: main scratch occupies the first `ldwork*nb` slots; the block-reflector triangular factor T occupies the next `ldt*nb` slots.
	T = WORK;
	offsetT = offsetWORK + ( ldwork * nb );

	// Determine iteration direction. Forward when (LEFT && NOTRAN) or (!LEFT && !NOTRAN).
	if ( ( left && notran ) || ( !left && !notran ) ) {
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

	// For LQ reflectors, the transpose relationship is inverted:
	// Q = H(k)...H(1), so applying Q^T uses forward H, applying Q uses H^T
	if ( notran ) {
		transt = 'transpose';
	} else {
		transt = 'no-transpose';
	}

	for ( i = i1; ( i3 > 0 ) ? ( i < i2 ) : ( i > i2 ); i += i3 ) {
		ib = Math.min( nb, K - i );

		// Form the triangular factor of the block reflector

		// H = H(i) H(i+1) ... H(i+ib-1)
		dlarft('forward', 'rowwise', nq - i, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), TAU, strideTAU, offsetTAU + (i * strideTAU), T, 1, ldt, offsetT);

		if ( left ) {
			mi = M - i;
			ic = i;
		} else {
			ni = N - i;
			jc = i;
		}

		// Apply H or H^T to C(ic:ic+mi, jc:jc+ni)
		dlarfb(side, transt, 'forward', 'rowwise', mi, ni, ib, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), T, 1, ldt, offsetT, C, strideC1, strideC2, offsetC + (ic * strideC1) + (jc * strideC2), WORK, 1, ldwork, offsetWORK);
	}

	return 0;
}


// EXPORTS //

export default dormlq;
