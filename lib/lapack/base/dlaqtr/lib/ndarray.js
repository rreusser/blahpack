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


// MAIN //

/**
* Solves a real quasi-triangular system of equations.
*
* @param {boolean} ltran - ltran
* @param {boolean} lreal - lreal
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} T - input matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} b - input array
* @param {integer} strideB - stride length for `b`
* @param {NonNegativeInteger} offsetB - starting index for `b`
* @param {number} w - w
* @param {Float64Array} scale - output (length-1 array): sCALE is the scale factor
* @param {Float64Array} x - input array
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} WORK - output array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function dlaqtr( ltran, lreal, N, T, strideT1, strideT2, offsetT, b, strideB, offsetB, w, scale, x, strideX, offsetX, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	const minWork = Math.max( 1, N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( ltran, lreal, N, T, strideT1, strideT2, offsetT, b, strideB, offsetB, w, scale, x, strideX, offsetX, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqtr;
