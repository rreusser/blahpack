/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
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
