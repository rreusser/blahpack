/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes component-wise relative backward error.
*
* @param {NonNegativeInteger} N - number of rows of `res` and `ayb`
* @param {integer} nz - guard factor used in the numerator safeguard
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} res - residual matrix of dimension `(N, nrhs)`
* @param {integer} strideRES1 - stride of the first dimension of `res`
* @param {integer} strideRES2 - stride of the second dimension of `res`
* @param {NonNegativeInteger} offsetRES - starting index for `res`
* @param {Float64Array} ayb - denominator matrix of dimension `(N, nrhs)`
* @param {integer} strideAYB1 - stride of the first dimension of `ayb`
* @param {integer} strideAYB2 - stride of the second dimension of `ayb`
* @param {NonNegativeInteger} offsetAYB - starting index for `ayb`
* @param {Float64Array} berr - output vector of dimension `nrhs`
* @param {integer} strideBERR - stride of `berr`
* @param {NonNegativeInteger} offsetBERR - starting index for `berr`
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `nrhs` must be a nonnegative integer
* @returns {Float64Array} `berr`
*/
function dla_lin_berr( N, nz, nrhs, res, strideRES1, strideRES2, offsetRES, ayb, strideAYB1, strideAYB2, offsetAYB, berr, strideBERR, offsetBERR ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( N, nz, nrhs, res, strideRES1, strideRES2, offsetRES, ayb, strideAYB1, strideAYB2, offsetAYB, berr, strideBERR, offsetBERR );
}


// EXPORTS //

export default dla_lin_berr;
