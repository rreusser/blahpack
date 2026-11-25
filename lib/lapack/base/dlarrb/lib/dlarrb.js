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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Provides limited bisection to locate eigenvalues for more accuracy.
*
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} LLD - input array
* @param {integer} strideLLD - stride length for `LLD`
* @param {integer} ifirst - the index of the first eigenvalue to be computed.
* @param {integer} ilast - the index of the last eigenvalue to be computed.
* @param {number} rtol1 - tolerance for the convergence of the bisection intervals.
* @param {number} rtol2 - tolerance for the convergence of the bisection intervals.
* @param {integer} offset - offset for the arrays W, WGAP and WERR, i.e., the IFIRST-OFFSET through ILAST-OFFSET elements of these arrays are to be used.
* @param {Float64Array} w - input array
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} WGAP - input array
* @param {integer} strideWGAP - stride length for `WGAP`
* @param {Float64Array} WERR - input array
* @param {integer} strideWERR - stride length for `WERR`
* @param {(Float64Array|null)} WORK - input array
* @param {(Int32Array|null)} IWORK - output array
* @param {number} pivmin - the minimum pivot in the Sturm sequence.
* @param {number} spdiam - the spectral diameter of the matrix.
* @param {integer} twist - the twist index for the twisted factorization that is used for the negcount.
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dlarrb( N, d, strideD, LLD, strideLLD, ifirst, ilast, rtol1, rtol2, offset, w, strideW, WGAP, strideWGAP, WERR, strideWERR, WORK, IWORK, pivmin, spdiam, twist ) { // eslint-disable-line max-len, max-params
	const offsetIWork = 0;
	const oWGAP = stride2offset( N, strideWGAP );
	const oWERR = stride2offset( N, strideWERR );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, 2 * N );
		IWORK = new Int32Array( minIwork );
	}
	const oLLD = stride2offset( N - 1, strideLLD );
	const od = stride2offset( N, strideD );
	const ow = stride2offset( N, strideW );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, od, LLD, strideLLD, oLLD, ifirst, ilast, rtol1, rtol2, offset, w, strideW, ow, WGAP, strideWGAP, oWGAP, WERR, strideWERR, oWERR, WORK, 1, 0, IWORK, 1, offsetIWork, pivmin, spdiam, twist ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarrb;
