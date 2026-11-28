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

import base from './base.js';


// MAIN //

/**
* Computes a component-wise relative backward error.
*
* @param {NonNegativeInteger} N - number of rows of `res` and `ayb`
* @param {integer} nz - sparsity guard parameter
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} res - residual matrix, dimension `(N, nrhs)`
* @param {integer} strideRES1 - stride of dim 1 of `res`
* @param {integer} strideRES2 - stride of dim 2 of `res`
* @param {NonNegativeInteger} offsetRES - starting complex index for `res`
* @param {Float64Array} ayb - denominator matrix, dimension `(N, nrhs)`
* @param {integer} strideAYB1 - stride of dim 1 of `ayb`
* @param {integer} strideAYB2 - stride of dim 2 of `ayb`
* @param {NonNegativeInteger} offsetAYB - starting index for `ayb`
* @param {Float64Array} berr - output array, dimension `nrhs`
* @param {integer} strideBERR - stride length for `berr`
* @param {NonNegativeInteger} offsetBERR - starting index for `berr`
* @returns {Float64Array} `berr`
*/
function zlaLinBerr( N, nz, nrhs, res, strideRES1, strideRES2, offsetRES, ayb, strideAYB1, strideAYB2, offsetAYB, berr, strideBERR, offsetBERR ) { // eslint-disable-line max-len, max-params
	return base( N, nz, nrhs, res, strideRES1, strideRES2, offsetRES, ayb, strideAYB1, strideAYB2, offsetAYB, berr, strideBERR, offsetBERR ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaLinBerr;
