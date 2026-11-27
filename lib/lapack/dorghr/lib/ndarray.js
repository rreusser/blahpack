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

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates the real orthogonal matrix Q which is defined as the product.
* of IHI-ILO elementary reflectors of order N, as returned by DGEHRD:
*
* Q = H(ilo) H(ilo+1) ... H(ihi-1)
*
* ## Notes
*
* -   ILO and IHI are 1-based, matching the Fortran convention.
* -   On entry, A must contain the reflector vectors as returned by DGEHRD.
* -   On exit, A contains the N-by-N orthogonal matrix Q.
* -   Q is the identity matrix except in the submatrix
*     Q(ilo:ihi-1, ilo:ihi-1) (0-based).
*
* @param {NonNegativeInteger} N - order of the matrix Q (N >= 0)
* @param {integer} ilo - lower bound from DGEHRD (1-based)
* @param {integer} ihi - upper bound from DGEHRD (1-based)
* @param {Float64Array} A - input/output matrix (N x N)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of reflectors from DGEHRD (length N-1)
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - workspace of length at least `max(1,ihi-ilo)`; for optimum performance it should hold `max(1,ihi-ilo)*NB` elements (`NB = 32`, the dorgqr block size), which enables the blocked path
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`)
* @throws {RangeError} third argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`)
* @returns {integer} status code (0 = success)
*/
function dorghr( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	let minWork;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ilo < 1 || ilo > max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`). Value: `%d`.', ilo ) );
	}
	if ( ihi < min( ilo, N ) || ihi > N ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`). Value: `%d`.', ihi ) );
	}
	// The reference's minimum (LWORK >= max(1,NH), NH = ihi-ilo, checked for every N > 0, NH = 0 included); dorgqr shrinks NB, or falls back to unblocked code, to fit a shorter workspace than its optimum. N = 0 is a quick return that needs no workspace:
	if ( N > 0 ) {
		minWork = max( 1, ihi - ilo );
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dorghr;
