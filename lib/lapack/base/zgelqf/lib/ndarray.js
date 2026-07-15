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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// VARIABLES //

var NB = 32; // Hardcoded block size (replaces ILAENV queries)


// MAIN //

/**
* Computes an LQ factorization of a complex M-by-N matrix A = L * Q.
* using blocked Householder reflections.
*
* The caller must supply WORK as a `Complex128Array` of size at least
* `M*NB + NB*NB` complex elements (with `NB = 32`) when the blocked path
* is taken (`min(M,N) > NB`); otherwise `M` complex elements suffice.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @param {Complex128Array} WORK - caller-provided workspace (see size formula above)
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} WORK array must be large enough
* @returns {integer} status code (0 = success)
*/
function zgelqf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	var minWork;
	var K;

	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Quick return: an empty matrix must NOT require a valid workspace buffer,
	// so the zero-dimension exit precedes the WORK-size assertion.
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	// Caller owns WORK; assert it is large enough so an under-sized buffer is a
	// loud RangeError, not a silent NaN from an out-of-bounds read. The blocked
	// path (min(M,N) > NB) needs M*NB scratch plus the NB-by-NB T factor; the
	// unblocked path needs only M complex elements.
	K = Math.min( M, N );
	minWork = ( K > NB ) ? ( ( M * NB ) + ( NB * NB ) ) : Math.max( 1, M );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zgelqf;
