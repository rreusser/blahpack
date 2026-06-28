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

/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlaruv from '../../dlaruv/lib/base.js';


// VARIABLES //

var LV = 128;
var TWOPI = 6.28318530717958647692528676655900576839;


// MAIN //

/**
* Returns a vector of n complex random numbers from a uniform or normal distribution.
*
* @private
* @param {integer} idist - distribution type: 1=uniform(0,1), 2=uniform(-1,1), 3=normal(0,1), 4=uniform disc, 5=uniform circle
* @param {Int32Array} iseed - seed array of 4 integers
* @param {integer} strideISEED - stride for iseed
* @param {NonNegativeInteger} offsetISEED - offset for iseed
* @param {NonNegativeInteger} N - number of complex random numbers to generate
* @param {Complex128Array} x - output array
* @param {integer} stride - stride for x (in complex elements)
* @param {NonNegativeInteger} offset - offset for x (in complex elements)
*/
function zlarnv( idist, iseed, strideISEED, offsetISEED, N, x, stride, offset ) { // eslint-disable-line max-len, max-params
	var xv;
	var sx;
	var ix;
	var il;
	var iv;
	var u;
	var i;

	xv = reinterpret( x, 0 );
	sx = stride * 2;
	u = new Float64Array( LV );

	for ( iv = 0; iv < N; iv += LV / 2 ) {
		il = Math.min( LV / 2, N - iv );

		// Always generate 2*il uniform (0,1) numbers (pairs for real/imag)
		dlaruv( iseed, strideISEED, offsetISEED, 2 * il, u, 1, 0 );

		ix = (offset + (iv * stride)) * 2;

		if ( idist === 1 ) {
			// Uniform real/imag in (0,1)
			for ( i = 0; i < il; i += 1 ) {
				xv[ ix ] = u[ 2 * i ];
				xv[ ix + 1 ] = u[ (2 * i) + 1 ];
				ix += sx;
			}
		} else if ( idist === 2 ) {
			// Uniform real/imag in (-1,1)
			for ( i = 0; i < il; i += 1 ) {
				xv[ ix ] = (2.0 * u[ 2 * i ]) - 1.0;
				xv[ ix + 1 ] = (2.0 * u[ (2 * i) + 1 ]) - 1.0;
				ix += sx;
			}
		} else if ( idist === 3 ) {
			// Normal(0,1) on real and imaginary parts (Box-Muller)
			// x = sqrt(-2*log(u1)) * exp(i * 2*pi*u2)
			for ( i = 0; i < il; i += 1 ) {
				xv[ ix ] = Math.sqrt( -2.0 * Math.log( u[ 2 * i ] ) ) * Math.cos( TWOPI * u[ (2 * i) + 1 ] ); // eslint-disable-line max-len
				xv[ ix + 1 ] = Math.sqrt( -2.0 * Math.log( u[ 2 * i ] ) ) * Math.sin( TWOPI * u[ (2 * i) + 1 ] ); // eslint-disable-line max-len
				ix += sx;
			}
		} else if ( idist === 4 ) {
			// Uniform on the unit disc: sqrt(u1) * exp(i * 2*pi*u2)
			for ( i = 0; i < il; i += 1 ) {
				xv[ ix ] = Math.sqrt( u[ 2 * i ] ) * Math.cos( TWOPI * u[ (2 * i) + 1 ] ); // eslint-disable-line max-len
				xv[ ix + 1 ] = Math.sqrt( u[ 2 * i ] ) * Math.sin( TWOPI * u[ (2 * i) + 1 ] ); // eslint-disable-line max-len
				ix += sx;
			}
		} else if ( idist === 5 ) {
			// Uniform on the unit circle: exp(i * 2*pi*u2)
			for ( i = 0; i < il; i += 1 ) {
				xv[ ix ] = Math.cos( TWOPI * u[ (2 * i) + 1 ] );
				xv[ ix + 1 ] = Math.sin( TWOPI * u[ (2 * i) + 1 ] );
				ix += sx;
			}
		}
	}
}


// EXPORTS //

export default zlarnv;
