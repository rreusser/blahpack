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
* Provides limited bisection to locate eigenvalues for more accuracy.
*
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} LLD - input array
* @param {integer} strideLLD - stride length for `LLD`
* @param {NonNegativeInteger} offsetLLD - starting index for `LLD`
* @param {integer} ifirst - the index of the first eigenvalue to be computed.
* @param {integer} ilast - the index of the last eigenvalue to be computed.
* @param {number} rtol1 - tolerance for the convergence of the bisection intervals.
* @param {number} rtol2 - tolerance for the convergence of the bisection intervals.
* @param {integer} offset - offset for the arrays W, WGAP and WERR, i.e., the IFIRST-OFFSET through ILAST-OFFSET elements of these arrays are to be used.
* @param {Float64Array} w - input array
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} WGAP - input array
* @param {integer} strideWGAP - stride length for `WGAP`
* @param {NonNegativeInteger} offsetWGAP - starting index for `WGAP`
* @param {Float64Array} WERR - input array
* @param {integer} strideWERR - stride length for `WERR`
* @param {NonNegativeInteger} offsetWERR - starting index for `WERR`
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - output array
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @param {number} pivmin - the minimum pivot in the Sturm sequence.
* @param {number} spdiam - the spectral diameter of the matrix.
* @param {integer} twist - the twist index for the twisted factorization that is used for the negcount.
* @throws {RangeError} `IWORK` must have at least `2 * N` elements from `offsetIWork`
* @returns {integer} status code (0 = success)
*/
function dlarrb( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, ifirst, ilast, rtol1, rtol2, offset, w, strideW, offsetW, WGAP, strideWGAP, offsetWGAP, WERR, strideWERR, offsetWERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork, pivmin, spdiam, twist ) { // eslint-disable-line max-len, max-params
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
	const minIWork = 2 * N;
	if ( !IWORK || ( IWORK.length - offsetIWork ) < minIWork ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIWork, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
	}
	return base( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, ifirst, ilast, rtol1, rtol2, offset, w, strideW, offsetW, WGAP, strideWGAP, offsetWGAP, WERR, strideWERR, offsetWERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork, pivmin, spdiam, twist ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarrb;
