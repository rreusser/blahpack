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

import base from './base.js';


// MAIN //

/**
* Computes a QL factorization of a real general matrix.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @param {Float64Array} WORK - caller-provided workspace (length `>= max(1, N*NB + NB*NB)` with `NB = 32`)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {RangeError} WORK array must have sufficient elements
* @returns {integer} status code (0 = success)
*/
function dgeqlf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( M > 0 && N > 0 ) {
		const K = Math.min( M, N );
		const NB = 32;
		const minWork = ( K > NB ) ? ( ( N * NB ) + ( NB * NB ) ) : Math.max( 1, N );
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( 'invalid argument. WORK array must have at least ' + minWork + ' elements from offset ' + offsetWork + '. Provided length: ' + ( ( WORK ) ? WORK.length : 0 ) + '.' );
		}
	}
	return base( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgeqlf;
