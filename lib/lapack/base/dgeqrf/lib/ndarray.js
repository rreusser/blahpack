/**
 * Computes a QR factorization of a real M-by-N matrix A = Q * R.
 * using blocked Householder reflections.
 *
 *
 * @param {NonNegativeInteger} M - number of rows
 * @param {NonNegativeInteger} N - number of columns
 * @param {Float64Array} A - input matrix (column-major)
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - starting index for A
 * @param {Float64Array} TAU - output array of scalar factors
 * @param {integer} strideTAU - stride length for TAU
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU
 * @param {Float64Array} WORK - workspace array
 * @param {integer} strideWORK - stride length for WORK
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK
 * @returns {integer} status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// VARIABLES //

var NB = 32;


// MAIN //

/**
* Computes a QR factorization of a real M-by-N matrix A = Q.
*
* The caller must supply WORK as a `Float64Array` of size at least
* `N*NB + NB*NB` elements (with `NB = 32`) when the blocked path is taken
* (`min(M,N) > NB`); otherwise `N` elements suffice.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} WORK - caller-provided workspace (see size formula above)
* @param {integer} strideWORK - stride length for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dgeqrf( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) {
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	// Auto-allocate workspace when null or too small to hold T at offset N*NB.
	if ( !WORK || ( WORK.length - offsetWORK ) < ( N * NB ) + ( NB * NB ) ) {
		WORK = new Float64Array( ( N * NB ) + ( NB * NB ) );
		strideWORK = 1;
		offsetWORK = 0;
	}
	return base( M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK );
}


// EXPORTS //

export default dgeqrf;
