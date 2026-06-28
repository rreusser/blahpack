
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
* @param {integer} ifirst - ifirst
* @param {integer} ilast - ilast
* @param {number} rtol1 - rtol1
* @param {number} rtol2 - rtol2
* @param {integer} offset - offset
* @param {Float64Array} w - input array
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} WGAP - input array
* @param {integer} strideWGAP - stride length for `WGAP`
* @param {Float64Array} WERR - input array
* @param {integer} strideWERR - stride length for `WERR`
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {Int32Array} IWORK - output array
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @param {number} pivmin - pivmin
* @param {number} spdiam - spdiam
* @param {integer} twist - twist
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dlarrb( N, d, strideD, LLD, strideLLD, ifirst, ilast, rtol1, rtol2, offset, w, strideW, WGAP, strideWGAP, WERR, strideWERR, WORK, strideWork, IWORK, strideIWork, offsetIWork, pivmin, spdiam, twist ) { // eslint-disable-line max-len, max-params
	var oWGAP = stride2offset( N, strideWGAP );
	var oWERR = stride2offset( N, strideWERR );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, 2 * N );
		IWORK = new Int32Array( minIwork );
		strideIWork = 1;
	}
	var oWORK = stride2offset( N, strideWork );
	var oLLD = stride2offset( N, strideLLD );
	var od = stride2offset( N, strideD );
	var ow = stride2offset( N, strideW );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, od, LLD, strideLLD, oLLD, ifirst, ilast, rtol1, rtol2, offset, w, strideW, ow, WGAP, strideWGAP, oWGAP, WERR, strideWERR, oWERR, WORK, strideWork, oWORK, IWORK, strideIWork, offsetIWork, pivmin, spdiam, twist ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarrb;
