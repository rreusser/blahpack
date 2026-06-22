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

import abs from '@stdlib/math/base/special/abs/lib/index.js';
import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js';


// VARIABLES //

// DLAMCH( 'Safe minimum' ) — smallest positive normalized double.
var SAFMIN = FLOAT64_SMALLEST_NORMAL;


// MAIN //

/**
* Computes component-wise relative backward error.
*
* ## Notes
*
* Computes, for each right-hand side column `j`:
*
* ```tex
* \mathrm{BERR}(j) = \max_{i} \frac{|\mathrm{RES}(i,j)| + \mathrm{safe1}}{\mathrm{AYB}(i,j)}
* ```
*
* where the maximum is taken over rows `i` for which `AYB(i,j) != 0`, and
* `safe1 = (NZ+1) * DLAMCH('Safe minimum')` guards against spuriously zero
* residuals.
*
* @private
* @param {NonNegativeInteger} N - number of rows of `RES` and `AYB`
* @param {integer} nz - guard factor; `(nz+1)*safmin` is added to the numerator
* @param {NonNegativeInteger} nrhs - number of right-hand sides (columns)
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
* @returns {Float64Array} `berr`
*/
function dla_lin_berr( N, nz, nrhs, res, strideRES1, strideRES2, offsetRES, ayb, strideAYB1, strideAYB2, offsetAYB, berr, strideBERR, offsetBERR ) {
	var safe1;
	var bmax;
	var jres;
	var jayb;
	var tmp;
	var d;
	var i;
	var j;

	if ( N <= 0 || nrhs <= 0 ) {
		return berr;
	}

	// Adding safe1 to the numerator guards against spuriously zero residuals.
	safe1 = ( nz + 1 ) * SAFMIN;

	for ( j = 0; j < nrhs; j += 1 ) {
		bmax = 0.0;
		jres = offsetRES + ( j * strideRES2 );
		jayb = offsetAYB + ( j * strideAYB2 );
		for ( i = 0; i < N; i += 1 ) {
			d = ayb[ jayb + ( i * strideAYB1 ) ];
			if ( d !== 0.0 ) {
				tmp = ( safe1 + abs( res[ jres + ( i * strideRES1 ) ] ) ) / d;
				if ( tmp > bmax ) {
					bmax = tmp;
				}
			}
		}
		berr[ offsetBERR + ( j * strideBERR ) ] = bmax;
	}
	return berr;
}


// EXPORTS //

export default dla_lin_berr;
