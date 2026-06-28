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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import zlarfb from '../../zlarfb/lib/base.js';
import zlarft from '../../zlarft/lib/base.js';
import zunmr2 from '../../zunmr2/lib/base.js';


// VARIABLES //

var NB = 32; // Hardcoded block size


// MAIN //

/**
* Overwrites the M-by-N matrix C with Q_C, Q^H_C, C_Q, or C_Q^H, where Q is a complex unitary matrix defined as the product of K elementary reflectors from an RQ factorization (`Q = H(1)^H H(2)^H ... H(k)^H`) as returned by ZGERQF. Uses a blocked algorithm with block size NB=32.
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
* @param {Complex128Array} A - reflector vectors from ZGERQF (K-by-NQ)
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
function zunmrq( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
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
		zunmr2( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork);
		return 0;
	}

	// Determine iteration direction
	// Fortran: (LEFT .AND. .NOT.NOTRAN) .OR. (.NOT.LEFT .AND. NOTRAN) => forward (I1=1, I2=K)
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
	} else {
		mi = M;
	}

	// Determine transpose direction for block reflector
	if ( notran ) {
		transt = 'conjugate-transpose';
	} else {
		transt = 'no-transpose';
	}

	for ( i = i1; ( i3 > 0 ) ? ( i < i2 ) : ( i > i2 ); i += i3 ) {
		ib = Math.min( nb, K - i );

		// Form the triangular factor of the block reflector

		// H = H(i) H(i+1) ... H(i+ib-1) stored backward/rowwise

		// Fortran: ZLARFT( 'Backward', 'Rowwise', NQ-K+I+IB-1, IB, A(I,1), LDA, TAU(I), WORK(IWT), LDT )

		// NQ-K+I+IB-1 in 1-based = NQ-K+i+ib in 0-based
		zlarft('backward', 'rowwise', nq - K + i + ib, ib, A, strideA1, strideA2, offsetA + ( i * strideA1 ), TAU, strideTAU, offsetTAU + ( i * strideTAU ), T, 1, ldt, offsetT);

		if ( left ) {
			// Apply to C(0:M-K+i+ib-1, :) => mi = M-K+i+ib
			mi = M - K + i + ib;
		} else {
			// Apply to C(:, 0:N-K+i+ib-1) => ni = N-K+i+ib
			ni = N - K + i + ib;
		}

		// Apply H or H^H to C
		// Fortran: ZLARFB( SIDE, TRANST, 'Backward', 'Rowwise', MI, NI, IB, A(I,1), LDA, WORK(IWT), LDT, C, LDC, WORK, LDWORK )
		zlarfb(side, transt, 'backward', 'rowwise', mi, ni, ib, A, strideA1, strideA2, offsetA + ( i * strideA1 ), T, 1, ldt, offsetT, C, strideC1, strideC2, offsetC, WORK, 1, ldwork, offsetWork);
	}

	return 0;
}


// EXPORTS //

export default zunmrq;
