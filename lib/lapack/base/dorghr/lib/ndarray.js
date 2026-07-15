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
import base from './base.js';


// VARIABLES //

var NB = 32; // Hardcoded block size (replaces ILAENV queries)


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
* @param {Float64Array} WORK - caller-owned workspace of at least `max(1,ihi-ilo)*NB` elements (`NB = 32`)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dorghr( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var minWork;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns WORK; assert it is large enough (dorgqr needs nh*NB) so an
	// under-sized buffer is a loud RangeError, not a silent NaN from an OOB read.
	// WORK is only referenced when there are reflectors to apply (ihi-ilo > 0).
	if ( ihi - ilo > 0 ) {
		minWork = ( ihi - ilo ) * NB;
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	return base( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dorghr;
