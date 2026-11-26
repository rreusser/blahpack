/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import dlarfb from '../../dlarfb/lib/base.js';
import dlarft from '../../dlarft/lib/base.js';
import dormr2 from '../../dormr2/lib/base.js';
import ilaenv from '../../ilaenv/lib/base.js';


// VARIABLES //

const NBMAX = 64;
const LDT = NBMAX + 1;
const TSIZE = LDT * NBMAX;


// MAIN //

/**
* Overwrites the M-by-N real matrix C with Q_C, Q^T_C, C_Q, or C_Q^T.
* where Q is a real orthogonal matrix defined as the product of K
* elementary reflectors Q = H(1) H(2) ... H(k) as returned by DGERQF.
* Uses a blocked algorithm with block size NB from ILAENV
* when the workspace allows it.
*
* As in the reference, the blocked path partitions WORK into an `nw*NB` part
* (the block reflector application's WORK, leading dimension `nw`) followed by
* a `TSIZE = 65*64` part holding the triangular factor T (leading dimension
* 65), where `nw = max(1,N)` for `side='left'` and `nw = max(1,M)` for
* `side='right'`. A shorter workspace shrinks NB to
* `floor( ( lwork - TSIZE ) / nw )`, or falls back to the unblocked code, which
* needs only `nw` elements.
*
* @private
* @param {OperationSide} side - 'left' to apply Q from left, 'right' from right
* @param {('no-transpose'|'transpose')} trans - 'no-transpose' for Q, 'transpose' for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Float64Array} A - reflector vectors from DGERQF (K rows)
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
* @param {Float64Array} WORK - workspace; length at least `max(1,N)` if `side='left'` and `max(1,M)` if `side='right'` (elements). For optimum performance it should hold `nw*NB + TSIZE` elements (NB from ILAENV, TSIZE = 65*64 = 4160), which enables the blocked path
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful
*/
function dormrq( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	let nw, nb, nq, mi = NaN, ni = NaN, ib, i1, i2, i3, i;
	/** @type {TransposeOperation} */
	let transt;

	if ( M === 0 || N === 0 || K === 0 ) {
		return 0;
	}

	const left = ( side === 'left' );
	const notran = ( trans === 'no-transpose' );

	if ( left ) {
		nq = M;
		nw = Math.max( 1, N );
	} else {
		nq = N;
		nw = Math.max( 1, M );
	}

	// The JS LWORK is the workspace's length (CONVENTIONS W1/W6):
	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );

	// Determine the block size (the reference's workspace query), and shrink it to fit LWORK:
	const opts = side.charAt( 0 ).toUpperCase() + trans.charAt( 0 ).toUpperCase();
	nb = Math.min( NBMAX, ilaenv( 1, 'DORMRQ', opts, M, N, K, -1 ) );
	const lwkopt = ( nw * nb ) + TSIZE;
	let nbmin = 2;
	const ldwork = nw;
	if ( nb > 1 && nb < K && lwork < lwkopt ) {
		nb = Math.trunc( ( lwork - TSIZE ) / ldwork );
		nbmin = Math.max( 2, ilaenv( 2, 'DORMRQ', opts, M, N, K, -1 ) );
	}

	// Use unblocked code if the block size is too small or covers all of K:
	if ( nb < nbmin || nb >= K ) {
		return dormr2( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	}

	// T is stored after the nw-by-nb panel, in the TSIZE part of WORK (reference layout):
	const T = WORK;
	const offsetT = offsetWork + ( nw * nb );
	const ldt = LDT;

	// Determine iteration direction:
	// (left && trans) or (!left && notran) => forward
	// (left && notran) or (!left && trans) => backward
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

	// Dormrq flips the transpose for dlarfb
	if ( notran ) {
		transt = 'transpose';
	} else {
		transt = 'no-transpose';
	}

	for ( i = i1; ( i3 > 0 ) ? ( i < i2 ) : ( i > i2 ); i += i3 ) {
		ib = Math.min( nb, K - i );

		// Form the triangular factor of the block reflector

		// H = H(i+ib-1) ... H(i+1) H(i)
		dlarft('backward', 'rowwise', nq - K + i + ib, ib, A, strideA1, strideA2, offsetA + (i * strideA1), TAU, strideTAU, offsetTAU + (i * strideTAU), T, 1, ldt, offsetT);

		if ( left ) {
			// H or H^T is applied to C(0:m-k+i+ib-1, 0:n-1)
			mi = M - K + i + ib;
		} else {
			// H or H^T is applied to C(0:m-1, 0:n-k+i+ib-1)
			ni = N - K + i + ib;
		}

		// Apply H or H^T
		dlarfb(side, transt, 'backward', 'rowwise', mi, ni, ib, A, strideA1, strideA2, offsetA + (i * strideA1), T, 1, ldt, offsetT, C, strideC1, strideC2, offsetC, WORK, 1, ldwork, offsetWork);
	}

	return 0;
}


// EXPORTS //

export default dormrq;
