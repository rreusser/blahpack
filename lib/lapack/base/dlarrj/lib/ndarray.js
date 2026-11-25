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
* Refine eigenvalue approximations using bisection given initial intervals.
*
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} E2 - input array
* @param {integer} strideE2 - stride length for `E2`
* @param {NonNegativeInteger} offsetE2 - starting index for `E2`
* @param {integer} ifirst - the index of the first eigenvalue to be computed.
* @param {integer} ilast - the index of the last eigenvalue to be computed.
* @param {number} rtol - tolerance for the convergence of the bisection intervals.
* @param {integer} offset - offset for the arrays W and WERR, i.e., the IFIRST-OFFSET through ILAST-OFFSET elements of these arrays are to be used.
* @param {Float64Array} w - input array
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} WERR - input array
* @param {integer} strideWERR - stride length for `WERR`
* @param {NonNegativeInteger} offsetWERR - starting index for `WERR`
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - output array
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @param {number} pivmin - the minimum pivot in the Sturm sequence for T.
* @param {number} spdiam - the spectral diameter of T.
* @returns {integer} status code (0 = success)
*/
function dlarrj( N, d, strideD, offsetD, E2, strideE2, offsetE2, ifirst, ilast, rtol, offset, w, strideW, offsetW, WERR, strideWERR, offsetWERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork, pivmin, spdiam ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const minWork = Math.max( 1, 2 * N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	return base( N, d, strideD, offsetD, E2, strideE2, offsetE2, ifirst, ilast, rtol, offset, w, strideW, offsetW, WERR, strideWERR, offsetWERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork, pivmin, spdiam ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarrj;
