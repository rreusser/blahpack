/**
 * CABS1: sum of absolute values of real and imaginary parts.
 *
 *
 * @param {Float64Array} arr - interleaved complex array
 * @param {integer} idx - index of real part
 * @returns {number} |re| + |im|
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Balances a pair of general complex matrices (A, B).
*
* @param {string} job - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - first complex matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - second complex matrix (modified in-place)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Float64Array} LSCALE - left scaling/permutation factors (length N)
* @param {integer} strideLSCALE - stride for LSCALE
* @param {NonNegativeInteger} offsetLSCALE - starting index for LSCALE
* @param {Float64Array} RSCALE - right scaling/permutation factors (length N)
* @param {integer} strideRSCALE - stride for RSCALE
* @param {NonNegativeInteger} offsetRSCALE - starting index for RSCALE
* @param {Float64Array} WORK - workspace array (length >= 6*N)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @throws {TypeError} first argument must be a valid job type
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {Object} result with properties: info (0=success), ilo (1-based), ihi (1-based)
*/
function zggbal( job, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, WORK, strideWORK, offsetWORK ) {
	if ( job !== 'none' && job !== 'permute' && job !== 'scale' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job type. Value: `%s`.', job ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( job, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default zggbal;
