/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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

/* eslint-disable max-len */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// VARIABLES //

// Blue's scaling constants for IEEE 754 double precision:
var TSML = 1.4916681462400413e-154;  // 2^ceil((emin-1)/2) = 2^-511
var TBIG = 1.9979190722022350e+146;  // 2^floor((emax-digits+1)/2) = 2^486
var SSML = 4.4989137945431964e+161;  // 2^(-floor((emin-digits)/2)) = 2^537
var SBIG = 1.1113793747425387e-162;  // 2^(-ceil((emax+digits-1)/2)) = 2^-538


// MAIN //

/**
* Computes the Euclidean norm of a complex double-precision vector.
*
* Uses the "blue" algorithm for overflow/underflow-safe computation.
*
* @private
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Complex128Array} zx - complex input vector
* @param {integer} strideX - stride in complex elements
* @param {NonNegativeInteger} offsetX - starting index (in complex elements)
* @returns {number} Euclidean norm
*/
function dznrm2( N, zx, strideX, offsetX ) {
	var notbig;
	var abig;
	var amed;
	var asml;
	var xv;
	var ax;
	var ix;
	var i;

	if ( N <= 0 ) {
		return 0.0;
	}

	xv = reinterpret( zx, 0 );
	notbig = true;
	asml = 0.0;
	amed = 0.0;
	abig = 0.0;

	ix = offsetX * 2;
	for ( i = 0; i < N; i++ ) {
		// Process real part:
		ax = Math.abs( xv[ ix ] );
		if ( ax > TBIG ) {
			abig += ( ax * SBIG ) * ( ax * SBIG );
			notbig = false;
		} else if ( ax < TSML ) {
			if ( notbig ) {
				asml += ( ax * SSML ) * ( ax * SSML );
			}
		} else {
			amed += ax * ax;
		}

		// Process imaginary part:
		ax = Math.abs( xv[ ix + 1 ] );
		if ( ax > TBIG ) {
			abig += ( ax * SBIG ) * ( ax * SBIG );
			notbig = false;
		} else if ( ax < TSML ) {
			if ( notbig ) {
				asml += ( ax * SSML ) * ( ax * SSML );
			}
		} else {
			amed += ax * ax;
		}

		ix += 2 * strideX;
	}

	// Combine the partial sums:
	if ( abig > 0.0 ) {
		// Scale sumsq to avoid overflow:
		if ( amed > 0.0 || amed !== amed ) {
			abig += ( amed * SBIG ) * SBIG;
		}
		return Math.sqrt( abig ) / SBIG;
	}
	if ( asml > 0.0 ) {
		// Scale sumsq to avoid underflow:
		if ( amed > 0.0 || amed !== amed ) {
			amed = Math.sqrt( amed );
			asml = Math.sqrt( asml ) / SSML;
			if ( asml > amed ) {
				return asml * Math.sqrt( 1.0 + (( amed / asml ) * ( amed / asml )) );
			}
			return amed * Math.sqrt( 1.0 + (( asml / amed ) * ( asml / amed )) );
		}
		return Math.sqrt( asml ) / SSML;
	}
	return Math.sqrt( amed );
}


// EXPORTS //

export default dznrm2;
