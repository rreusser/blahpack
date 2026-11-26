/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import zlarfb from '../../zlarfb/lib/base.js';
import zlarft from '../../zlarft/lib/base.js';
import zunm2l from '../../zunm2l/lib/base.js';


// VARIABLES //

const NB = 32; // Block size (ILAENV(1) stand-in)
const NBMAX = 64;
const LDT = NBMAX + 1;
const TSIZE = LDT * NBMAX;
const NBMIN = 2; // max( 2, ILAENV(2) )


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
* As in the reference, the blocked path partitions WORK into an `nw*NB` part
* (the block reflector application's WORK, leading dimension `nw`) followed by
* a `TSIZE = 65*64` part holding the triangular factor T (leading dimension
* 65), where `nw = max(1,N)` for `side='left'` and `nw = max(1,M)` for
* `side='right'`. A shorter workspace shrinks NB to
* `floor( ( lwork - TSIZE ) / nw )`, or falls back to the unblocked code, which
* needs only `nw` complex elements.
*
* @private
* @param {OperationSide} side - 'left' to apply Q from left, 'right' from right
* @param {('no-transpose'|'conjugate-transpose')} trans - 'no-transpose' for Q, 'conjugate-transpose' for Q^H
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
* @param {Complex128Array} WORK - workspace; length at least `max(1,N)` if `side='left'` and `max(1,M)` if `side='right'` (complex elements). For optimum performance it should hold `nw*NB + TSIZE` complex elements (NB = 32, TSIZE = 65*64 = 4160), which enables the blocked path
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @returns {integer} info - 0 if successful
*/
function zunmql( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	let nw, nq, mi = NaN, ni = NaN, ib, i1, i2, i3, i;

	const left = ( side === 'left' );
	const notran = ( trans === 'no-transpose' );

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

	// The JS LWORK is the workspace's length (CONVENTIONS W1/W6):
	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );

	// Determine the block size, and shrink it to fit LWORK:
	let nb = Math.min( NBMAX, NB );
	const ldwork = nw;
	if ( nb > 1 && nb < K && lwork < ( nw * nb ) + TSIZE ) {
		nb = Math.trunc( ( lwork - TSIZE ) / ldwork );
	}

	// Use unblocked code if the block size is too small or covers all of K:
	if ( nb < NBMIN || nb >= K ) {
		return zunm2l( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
	}

	// T is stored after the nw-by-nb panel, in the TSIZE part of WORK (reference layout):
	const T = WORK;
	const offsetT = offsetWork + ( nw * nb );
	const ldt = LDT;

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
