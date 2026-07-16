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
import base from './base.js';


// VARIABLES //

var NB = 32;


// MAIN //

/**
* Computes a QL factorization of a complex general matrix.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Complex128Array} WORK - caller-provided workspace (length `>= max(1, N*NB + NB*NB)` with `NB = 32`)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function zgeqlf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var need;
	var K;

	// Caller owns the workspace; assert it is a sufficiently large array so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN
	// from an out-of-bounds read. base unconditionally blocks when min(M,N) > NB
	// (needing N*NB + NB*NB), otherwise runs unblocked (needing N). K===0 is a
	// quick return that touches no workspace.
	K = ( M < N ) ? M : N;
	if ( K > 0 ) {
		need = ( K > NB ) ? ( ( N * NB ) + ( NB * NB ) ) : max( 1, N );
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	return base( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgeqlf;
