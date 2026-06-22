
// MODULES //

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
* @param {integer} ifirst - ifirst
* @param {integer} ilast - ilast
* @param {number} rtol1 - rtol1
* @param {number} rtol2 - rtol2
* @param {integer} offset - offset
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
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {Int32Array} IWORK - output array
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @param {number} pivmin - pivmin
* @param {number} spdiam - spdiam
* @param {integer} twist - twist
* @returns {integer} status code (0 = success)
*/
function dlarrb( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, ifirst, ilast, rtol1, rtol2, offset, w, strideW, offsetW, WGAP, strideWGAP, offsetWGAP, WERR, strideWERR, offsetWERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, pivmin, spdiam, twist ) { // eslint-disable-line max-len, max-params
	return base( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, ifirst, ilast, rtol1, rtol2, offset, w, strideW, offsetW, WGAP, strideWGAP, offsetWGAP, WERR, strideWERR, offsetWERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, pivmin, spdiam, twist ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarrb;
