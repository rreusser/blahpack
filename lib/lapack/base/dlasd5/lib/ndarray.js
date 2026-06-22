
// MODULES //

import base from './base.js';


// MAIN //

/**
* Compute the square root of the i-th eigenvalue of a positive symmetric rank-one modification of a 2-by-2 diagonal matrix.
*
* @param {integer} i - i
* @param {Float64Array} d - diagonal entries (length 2)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} z - updating vector components (length 2)
* @param {integer} strideZ - stride length for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {Float64Array} DELTA - output array for `d[j] - sigma_i` (length 2)
* @param {integer} strideDELTA - stride length for `DELTA`
* @param {NonNegativeInteger} offsetDELTA - starting index for `DELTA`
* @param {number} rho - scalar in the symmetric updating formula
* @param {Float64Array} dsigma - single-element output array; on exit, the computed sigma_i
* @param {Float64Array} WORK - output array for `d[j] + sigma_i` (length 2)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
*/
function dlasd5( i, d, strideD, offsetD, z, strideZ, offsetZ, DELTA, strideDELTA, offsetDELTA, rho, dsigma, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	return base( i, d, strideD, offsetD, z, strideZ, offsetZ, DELTA, strideDELTA, offsetDELTA, rho, dsigma, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlasd5;
