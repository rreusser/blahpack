/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaruv from '../../dlaruv/lib/base.js';


// VARIABLES //

var LV = 128;
var TWOPI = 6.28318530717958647692528676655900576839;


// MAIN //

/**
* Returns a vector of n random real numbers from a uniform or normal distribution.
*
* @private
* @param {integer} idist - distribution type: 1=uniform(0,1), 2=uniform(-1,1), 3=normal(0,1)
* @param {Int32Array} iseed - seed array of 4 integers
* @param {integer} strideISEED - stride for iseed
* @param {NonNegativeInteger} offsetISEED - offset for iseed
* @param {NonNegativeInteger} N - number of random numbers to generate
* @param {Float64Array} x - output array
* @param {integer} stride - stride for x
* @param {NonNegativeInteger} offset - offset for x
*/
function dlarnv( idist, iseed, strideISEED, offsetISEED, N, x, stride, offset ) { // eslint-disable-line max-len, max-params
	var il2;
	var il;
	var iv;
	var ix;
	var u;
	var i;

	u = new Float64Array( LV );

	for ( iv = 0; iv < N; iv += LV / 2 ) {
		il = Math.min( LV / 2, N - iv );
		if ( idist === 3 ) {
			il2 = 2 * il;
		} else {
			il2 = il;
		}

		// Generate il2 uniform (0,1) numbers
		dlaruv( iseed, strideISEED, offsetISEED, il2, u, 1, 0 );

		ix = offset + iv * stride;

		if ( idist === 1 ) {
			// Copy uniform (0,1) numbers
			for ( i = 0; i < il; i++ ) {
				x[ ix ] = u[ i ];
				ix += stride;
			}
		} else if ( idist === 2 ) {
			// Convert to uniform (-1,1)
			for ( i = 0; i < il; i++ ) {
				x[ ix ] = 2.0 * u[ i ] - 1.0;
				ix += stride;
			}
		} else if ( idist === 3 ) {
			// Convert to normal (0,1) via Box-Muller
			for ( i = 0; i < il; i++ ) {
				x[ ix ] = Math.sqrt( -2.0 * Math.log( u[ 2 * i ] ) ) * Math.cos( TWOPI * u[ 2 * i + 1 ] );
				ix += stride;
			}
		}
	}
}


// EXPORTS //

export default dlarnv;
