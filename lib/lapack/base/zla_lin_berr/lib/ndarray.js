// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes a component-wise relative backward error.
*
* @param {NonNegativeInteger} N - number of rows of `res` and `ayb`
* @param {integer} nz - sparsity guard parameter
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} res - residual matrix, dimension `(N, nrhs)`
* @param {integer} strideRES - element stride for `res`
* @param {NonNegativeInteger} offsetRES - starting complex index for `res`
* @param {Float64Array} ayb - denominator matrix, dimension `(N, nrhs)`
* @param {integer} strideAYB - element stride for `ayb`
* @param {NonNegativeInteger} offsetAYB - starting index for `ayb`
* @param {Float64Array} berr - output array, dimension `nrhs`
* @param {integer} strideBERR - stride length for `berr`
* @param {NonNegativeInteger} offsetBERR - starting index for `berr`
* @returns {Float64Array} `berr`
*/
function zlaLinBerr( N, nz, nrhs, res, strideRES, offsetRES, ayb, strideAYB, offsetAYB, berr, strideBERR, offsetBERR ) { // eslint-disable-line max-len, max-params
	return base( N, nz, nrhs, res, strideRES, offsetRES, ayb, strideAYB, offsetAYB, berr, strideBERR, offsetBERR ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaLinBerr;
