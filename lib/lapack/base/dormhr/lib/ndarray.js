/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Overwrites the general real M-by-N matrix C with.
*
*   SIDE = 'left'      SIDE = 'right'
*   TRANS = 'no-transpose':    Q _ C            C _ Q
*   TRANS = 'transpose':       Q^T _ C          C _ Q^T
*
* where Q is a real orthogonal matrix of order nq, with nq = M if
* SIDE = 'left' and nq = N if SIDE = 'right'. Q is defined as the product of
* IHI-ILO elementary reflectors, as returned by dgehrd:
*
*   Q = H(ilo) H(ilo+1) ... H(ihi-1)
*
* @param {OperationSide} side - 'left' to apply Q from left, 'right' from right
* @param {('no-transpose'|'transpose')} trans - 'no-transpose' for Q, 'transpose' for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {integer} ilo - 1-based lower index from dgehrd (1 <= ILO <= IHI)
* @param {integer} ihi - 1-based upper index from dgehrd
* @param {Float64Array} A - matrix containing reflectors from dgehrd
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of the elementary reflectors
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} C - input/output M-by-N matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace of length at least `max(1,N)` if `side = 'left'` and `max(1,M)` if `side = 'right'` (`nw`); the reference's optimum is `nw*NB`, and `nw*NB + TSIZE` elements (`NB = 32`, `TSIZE = 65*64 = 4160`, the dormqr optimum) enable the full blocked path
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument is invalid (rejected when `ilo < 1 || ilo > max( 1, side === "left" ? M : N )`)
* @throws {RangeError} sixth argument is invalid (rejected when `ihi < min( ilo, side === "left" ? M : N ) || ihi > ( side === "left" ? M : N )`)
* @returns {integer} info - 0 if successful
*/
function dormhr( side, trans, M, N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( trans !== 'no-transpose' && trans !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ilo < 1 || ilo > max( 1, side === 'left' ? M : N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument is invalid (rejected when `ilo < 1 || ilo > max( 1, side === "left" ? M : N )`). Value: `%d`.', ilo ) );
	}
	if ( ihi < min( ilo, side === 'left' ? M : N ) || ihi > ( side === 'left' ? M : N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `ihi < min( ilo, side === "left" ? M : N ) || ihi > ( side === "left" ? M : N )`). Value: `%d`.', ihi ) );
	}
	// The reference's minimum (LWORK >= NW, checked whenever M > 0 and N > 0, NH = ihi-ilo = 0 included); dormqr shrinks NB, or falls back to unblocked code, to fit a shorter workspace than its optimum. M = 0 or N = 0 quick-returns in base and touches no WORK:
	if ( M > 0 && N > 0 ) {
		const minWork = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}

	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( side, trans, M, N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dormhr;
